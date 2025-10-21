# main.py
import os
import json
import uuid
import asyncio
from datetime import datetime
from typing import Dict, Optional

from fastapi import FastAPI, Request, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv       # Store search query in database env
from supabase import create_client, Client

from agents.crew_orchestrator import create_shopping_crew
from models import SearchRequest, SearchResponse, ProductResult, SearchStatus, FilterSuggestion
from services.filter_processor import FilterProcessor
from services.scraping_tracker import ScrapingTracker

# Load environment variables
load_dotenv()

# FastAPI app initialization
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL and Key must be set.")

# Global Supabase client
supabase: Client = create_client(supabase_url, supabase_key)

# Global instances
filter_processor = FilterProcessor()
scraping_tracker = ScrapingTracker(supabase)

# In-memory search status store (for production, use Redis or similar)
search_status_store: Dict[str, SearchStatus] = {}


# ------------------- Utility Functions -------------------

def get_current_user(request: Request):
    """
    Get the current user from Authorization header or fallback to demo mode.
    Returns:
        Tuple of (user_dict, token_str)
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        # Demo user for development/testing
        return {
            "id": "demo-user",
            "email": "demo@example.com",
            "user_metadata": {"app_role": "demo"}
        }, "demo-token"

    try:
        token = auth_header.split(" ")[1]
        user_response = supabase.auth.get_user(token)
        user = getattr(user_response, "user", None) or user_response.get("user")
        if user:
            return user, token
    except Exception:
        pass

    # Fallback to demo user
    return {
        "id": "demo-user",
        "email": "demo@example.com",
        "user_metadata": {"app_role": "demo"}
    }, "demo-token"


def get_supabase_client_for_user(token: str):
    """
    Return a Supabase client, optionally attaching the user's JWT for RLS.
    """
    client = create_client(supabase_url, supabase_key)
    if token != "demo-token":
        try:
            client.postgrest.auth(token)
        except Exception as e:
            print(f"Warning: Failed to attach auth token: {e}")
    return client


def get_db_client_for_user(token: str, user_id: str):
    """
    Get the appropriate database client based on user type.
    Uses service role client for demo users to bypass RLS.
    """
    if user_id == "demo-user":
        # Use service role client for demo users to bypass RLS
        return supabase
    else:
        # Use authenticated client for real users
        return get_supabase_client_for_user(token)


def parse_price_to_numeric(price_str: str) -> Optional[float]:
    """Extract numeric value from price string like '₹17,499' or '$299.99'"""
    if not price_str:
        return None
    
    try:
        # Remove currency symbols and commas, keep only digits and decimal points
        import re
        price_clean = re.sub(r'[^\d.]', '', price_str.replace(',', ''))
        return float(price_clean) if price_clean else None
    except (ValueError, TypeError):
        return None


def transform_product_fields(product_data: dict) -> dict:
    """
    Transform product field names to match ProductResult model requirements.
    Maps common field variations to the expected field names.
    """
    # Create a copy to avoid modifying the original
    transformed = product_data.copy()
    
    # Field name mappings
    field_mappings = {
        'product_name': 'name',
        'current_price': 'price', 
        'product_url': 'source_url',
        'key_specifications': 'features'  # Keep as backup, but features is optional
    }
    
    # Apply transformations
    for old_field, new_field in field_mappings.items():
        if old_field in transformed:
            transformed[new_field] = transformed.pop(old_field)
    
    # Handle price conversion - ensure both price and price_numeric are available
    if 'price' in transformed:
        price_value = transformed['price']
        if isinstance(price_value, (int, float)) and price_value is not None:
            # Store numeric value for calculations
            transformed['price_numeric'] = float(price_value)
            # Convert to string format based on source
            source = transformed.get('source', '').lower()
            if 'amazon.in' in str(transformed.get('source_url', '')) or source == 'amazon':
                transformed['price'] = f"₹{price_value:,.0f}"
            else:  # Flipkart or other
                transformed['price'] = f"₹{price_value:,.0f}"
        elif isinstance(price_value, str):
            # Already a string, try to extract numeric value
            transformed['price_numeric'] = parse_price_to_numeric(price_value)
            # Keep the original formatted string
    
    # Ensure price_numeric exists even if not provided
    if 'price_numeric' not in transformed or transformed['price_numeric'] is None:
        if 'price' in transformed:
            transformed['price_numeric'] = parse_price_to_numeric(transformed['price'])
    
    # Handle rating conversion
    if 'rating' in transformed and 'rating_numeric' not in transformed:
        rating_str = transformed.get('rating', '')
        if rating_str and isinstance(rating_str, str):
            try:
                # Extract number from rating like "4.2/5" or "4.2"
                import re
                rating_match = re.search(r'(\d+\.?\d*)', rating_str)
                if rating_match:
                    transformed['rating_numeric'] = float(rating_match.group(1))
                else:
                    transformed['rating_numeric'] = None
            except (ValueError, TypeError):
                transformed['rating_numeric'] = None
            numeric_match = re.search(r'[\d,]+\.?\d*', price_value.replace(',', ''))
            if numeric_match:
                try:
                    transformed['price_numeric'] = float(numeric_match.group().replace(',', ''))
                except ValueError:
                    transformed['price_numeric'] = None
    
    # Ensure required fields exist with defaults if missing
    if 'name' not in transformed:
        transformed['name'] = transformed.get('title', 'Unknown Product')
    
    if 'price' not in transformed:
        transformed['price'] = '$0.00'
        transformed['price_numeric'] = 0.0
    
    return transformed


async def process_search_async(query_id: str, request_data: SearchRequest, token: str):
    """
    Asynchronous processing of a product search using CrewAI.
    Updates `search_status_store` as the search progresses.
    """
    current_user = None
    user_id = "demo-user"
    
    try:
        # Get current user info
        try:
            if token != "demo-token":
                user_response = supabase.auth.get_user(token)
                current_user = getattr(user_response, "user", None) or user_response.get("user")
                user_id = current_user.get("id") if current_user else "demo-user"
            else:
                current_user = {
                    "id": "demo-user",
                    "email": "demo@example.com",
                    "user_metadata": {"app_role": "demo"}
                }
                user_id = "demo-user"
        except Exception as auth_error:
            print(f"Auth error, using demo user: {auth_error}")
            current_user = {
                "id": "demo-user",
                "email": "demo@example.com",
                "user_metadata": {"app_role": "demo"}
            }
            user_id = "demo-user"
        
        # Initialize status
        search_status_store[query_id] = SearchStatus(
            query_id=query_id,
            status="processing",
            current_stage="Analyzing search parameters",
            progress=10
        )

        supabase_user = get_supabase_client_for_user(token)
        # Get the appropriate database client for this user
        db_client = get_db_client_for_user(token, user_id)

        # Create scraping session for tracking
        session_tracker = ScrapingTracker(supabase_user)
        scraping_session_id = session_tracker.create_session(request_data.query)
        
        # Store session ID in search status for frontend access
        search_status_store[query_id].scraping_session_id = scraping_session_id

        # Process filters and enhance query
        enhanced_query = filter_processor.process_filters(request_data.query, request_data.filters)
        search_status_store[query_id].current_stage = "Initializing AI agents"
        search_status_store[query_id].progress = 25

        # Kick off CrewAI with scraping session ID
        shopping_crew = create_shopping_crew(enhanced_query.enhanced_query, request_data.max_results, scraping_session_id)
        search_status_store[query_id].current_stage = "Searching and analyzing products"
        search_status_store[query_id].progress = 50

        crew_result = shopping_crew.kickoff()
        crew_result_str = getattr(crew_result, "raw", getattr(crew_result, "output", str(crew_result)))

        # Debug: Print what we got from the crew
        print(f"DEBUG: Crew result type: {type(crew_result)}")
        print(f"DEBUG: Crew result string length: {len(crew_result_str) if crew_result_str else 0}")
        print(f"DEBUG: Crew result preview: {crew_result_str[:500] if crew_result_str else 'EMPTY'}")

        search_status_store[query_id].current_stage = "Processing results"
        search_status_store[query_id].progress = 75

        # Parse products and enhance with filter scoring
        if not crew_result_str or crew_result_str.strip() == "":
            raise ValueError("CrewAI returned empty result")
        
        try:
            raw_products = json.loads(crew_result_str)
        except json.JSONDecodeError as e:
            print(f"DEBUG: JSON decode error: {e}")
            print(f"DEBUG: Raw string: '{crew_result_str}'")
            # Try to extract JSON from the string if it's embedded in other text
            import re
            json_match = re.search(r'\[.*\]', crew_result_str, re.DOTALL)
            if json_match:
                try:
                    raw_products = json.loads(json_match.group())
                    print("DEBUG: Successfully extracted JSON from embedded text")
                except:
                    raise ValueError(f"Could not parse JSON from crew result: {str(e)}")
            else:
                raise ValueError(f"No valid JSON found in crew result: {str(e)}")
        enhanced_products = []
        for product_data in raw_products:
            # Transform field names to match ProductResult model
            transformed_data = transform_product_fields(product_data)
            product = ProductResult(**transformed_data)
            if request_data.filters:
                product.match_score = filter_processor.calculate_match_score(
                    product_data, request_data.filters, enhanced_query
                )
            enhanced_products.append(product)

        # Sort by match score if filters applied
        if request_data.filters:
            enhanced_products.sort(key=lambda x: x.match_score or 0, reverse=True)

        search_status_store[query_id].current_stage = "Finalizing results"
        search_status_store[query_id].progress = 90

        # Store in Supabase
        try:
            print(f"DEBUG: Storing search for user_id: {user_id}")
            
            query_response = supabase_user.table("search_queries").insert({
                "user_id": user_id if user_id != "demo-user" else None,
                "query_text": enhanced_query.enhanced_query,
                "original_query": request_data.query,
                "num_products_requested": request_data.max_results,
                "status": "completed",
                "applied_filters": request_data.filters.dict() if request_data.filters else None
            }).execute()

            print(f"DEBUG: Query stored successfully: {len(query_response.data) if query_response.data else 0} records")
            
            if query_response.data and len(query_response.data) > 0:
                db_query_id = query_response.data[0]["id"]
                print(f"DEBUG: Database query ID: {db_query_id}")
                
                if enhanced_products:
                    products_to_insert = []
                    for i, p in enumerate(enhanced_products):
                        try:
                            product_data = {
                                "search_query_id": db_query_id,
                                "product_name": p.name,
                                "image_url": p.image_url,
                                "current_price": p.price,
                                "price_numeric": p.price_numeric,
                                "brand": p.brand,
                                "rating": p.rating,
                                "rating_numeric": p.rating_numeric,
                                "summary": getattr(p, 'summary', None),
                                "key_specifications": p.specifications or {},
                                "product_url": p.source_url,
                                "position_in_results": i + 1,
                                "match_score": p.match_score,
                                "category": p.category,
                                "source": getattr(p, 'source', 'unknown')
                            }
                            products_to_insert.append(product_data)
                        except Exception as product_error:
                            print(f"Error preparing product {i}: {product_error}")
                            continue
                    
                    if products_to_insert:
                        # Use service role client for demo users to bypass RLS
                        products_response = db_client.table("product_results").insert(products_to_insert).execute()
                        print(f"DEBUG: Products stored successfully: {len(products_to_insert)} products")
                    else:
                        print("WARNING: No valid products to store")
            else:
                print("WARNING: Query was not stored properly - no data returned")
                
        except Exception as e:
            print(f"Database storage error: {e}")
            print(f"DEBUG: Error details - User ID: {user_id}, Enhanced query: {enhanced_query.enhanced_query if 'enhanced_query' in locals() else 'N/A'}")
            # Continue execution even if database storage fails

        # Final response
        response = SearchResponse(
            query_id=query_id,
            results=enhanced_products,
            total_found=len(enhanced_products),
            search_timestamp=datetime.now(),
            applied_filters=request_data.filters,
            search_strategy=filter_processor.generate_search_strategy(request_data.filters, enhanced_query)
        )

        search_status_store[query_id] = SearchStatus(
            query_id=query_id,
            status="completed",
            current_stage="Search completed",
            progress=100
        )
        search_status_store[f"{query_id}_result"] = response

    except Exception as e:
        search_status_store[query_id] = SearchStatus(
            query_id=query_id,
            status="failed",
            error_message=str(e)
        )
        print(f"Search processing error: {e}")
        print(f"DEBUG: Error occurred for user_id: {user_id if 'user_id' in locals() else 'undefined'}")


# ------------------- API Endpoints -------------------

@app.get("/")
async def root():
    """Root endpoint showing API status and frontend URL"""
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return {
        "message": "Shopping Agent Backend API is running!",
        "status": "healthy",
        "frontend_url": frontend_url,
        "docs_url": "/docs",
        "endpoints": {
            "search": "/api/search",
            "search_status": "/api/search/{query_id}/status",
            "search_results": "/api/search/{query_id}/results",
            "legacy_search": "/api/search/legacy"
        },
        "demo_mode": "Add Authorization: Bearer demo-token to use demo mode"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        supabase.table("search_queries").select("id").limit(1).execute()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@app.post("/api/search", response_model=dict)
async def search_products(
    request_data: SearchRequest,
    background_tasks: BackgroundTasks,
    user_and_token=Depends(get_current_user)
):
    """
    Start a new product search asynchronously.
    """
    current_user, token = user_and_token

    if not request_data.query.strip():
        raise HTTPException(status_code=400, detail="Search query is required.")

    query_id = str(uuid.uuid4())
    search_status_store[query_id] = SearchStatus(
        query_id=query_id,
        status="pending",
        current_stage="Initializing search",
        progress=0
    )

    background_tasks.add_task(process_search_async, query_id, request_data, token)

    return {
        "query_id": query_id,
        "status": "initiated",
        "message": "Search started. Use the query_id to check status."
    }


@app.get("/api/search/{query_id}/status", response_model=SearchStatus)
async def get_search_status(query_id: str):
    """Get current status of a search"""
    if query_id not in search_status_store:
        raise HTTPException(status_code=404, detail="Search query not found")
    return search_status_store[query_id]


@app.get("/api/search/{query_id}/results", response_model=SearchResponse)
async def get_search_results(query_id: str):
    """Get results of a completed search"""
    result_key = f"{query_id}_result"
    if result_key not in search_status_store:
        status = search_status_store.get(query_id)
        if not status:
            raise HTTPException(status_code=404, detail="Search query not found")
        if status.status == "completed":
            raise HTTPException(status_code=500, detail="Search completed but results missing")
        elif status.status == "failed":
            raise HTTPException(status_code=500, detail=f"Search failed: {status.error_message}")
        else:
            raise HTTPException(status_code=202, detail="Search in progress")
    return search_status_store[result_key]


@app.get("/api/user/search-history")
async def get_user_search_history(
    user_and_token=Depends(get_current_user),
    limit: int = 10,
    offset: int = 0
):
    """Get user's search history"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        user_id = current_user.get("id")
        
        # Get search queries with their results
        query_filter = supabase_user.table("search_queries").select("""
            id,
            query_text,
            original_query,
            status,
            created_at,
            applied_filters,
            product_results (
                id,
                product_name,
                current_price,
                price_numeric,
                brand,
                rating,
                image_url,
                product_url,
                match_score
            )
        """)
        
        if user_id != "demo-user":
            query_filter = query_filter.eq("user_id", user_id)
        
        response = query_filter.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return {
            "searches": response.data,
            "total": len(response.data),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch search history: {str(e)}")


@app.get("/api/user/recommendations")
async def get_user_recommendations(user_and_token=Depends(get_current_user)):
    """Get personalized recommendations based on user's search history"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        user_id = current_user.get("id")
        
        # Get user's recent searches to analyze preferences
        query_filter = supabase_user.table("search_queries").select("""
            query_text,
            applied_filters,
            product_results (
                category,
                brand,
                price_numeric
            )
        """)
        
        if user_id != "demo-user":
            query_filter = query_filter.eq("user_id", user_id)
            
        response = query_filter.order("created_at", desc=True).limit(20).execute()
        
        # Analyze user preferences
        preferences = {
            "categories": {},
            "brands": {},
            "price_ranges": [],
            "search_patterns": []
        }
        
        for search in response.data:
            # Count category preferences
            for result in search.get("product_results", []):
                category = result.get("category")
                brand = result.get("brand")
                price = result.get("price_numeric")
                
                if category:
                    preferences["categories"][category] = preferences["categories"].get(category, 0) + 1
                if brand:
                    preferences["brands"][brand] = preferences["brands"].get(brand, 0) + 1
                if price:
                    preferences["price_ranges"].append(price)
            
            preferences["search_patterns"].append(search.get("query_text", ""))
        
        # Generate recommendations
        recommendations = {
            "preferred_categories": sorted(preferences["categories"].items(), key=lambda x: x[1], reverse=True)[:5],
            "preferred_brands": sorted(preferences["brands"].items(), key=lambda x: x[1], reverse=True)[:5],
            "average_price_range": {
                "min": min(preferences["price_ranges"]) if preferences["price_ranges"] else 0,
                "max": max(preferences["price_ranges"]) if preferences["price_ranges"] else 1000,
                "avg": sum(preferences["price_ranges"]) / len(preferences["price_ranges"]) if preferences["price_ranges"] else 100
            },
            "suggested_searches": [
                "Latest deals in your favorite categories",
                "New arrivals from your preferred brands",
                "Products similar to your recent purchases"
            ]
        }
        
        return recommendations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


@app.post("/api/auth/register")
async def register_user(user_data: dict):
    """Register a new user"""
    try:
        email = user_data.get("email")
        password = user_data.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        # Register with Supabase Auth
        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        if response.user:
            return {
                "message": "User registered successfully",
                "user": response.user,
                "session": response.session
            }
        else:
            raise HTTPException(status_code=400, detail="Registration failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")


@app.post("/api/auth/login")
async def login_user(user_data: dict):
    """Login user"""
    try:
        email = user_data.get("email")
        password = user_data.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        # Login with Supabase Auth
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if response.user:
            return {
                "message": "Login successful",
                "user": response.user,
                "session": response.session
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@app.post("/api/auth/logout")
async def logout_user(user_and_token=Depends(get_current_user)):
    """Logout user"""
    try:
        current_user, token = user_and_token
        
        if token != "demo-token":
            supabase.auth.sign_out()
        
        return {"message": "Logout successful"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout error: {str(e)}")


@app.post("/api/search/legacy")
async def search_products_legacy(request_data: dict, user_and_token=Depends(get_current_user)):
    """Legacy search endpoint for backward compatibility"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)

    prompt = request_data.get("prompt")
    num_products = request_data.get("num_products", 3)
    if not prompt:
        raise HTTPException(status_code=400, detail="Product prompt is required.")

    try:
        response = supabase_user.table("search_queries").insert({
            "query_text": prompt,
            "num_products_requested": num_products,
            "status": "pending"
        }).execute()
        query_id = response.data[0]["id"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store query: {e}")

    final_products, status, crew_error_detail = [], "failed", "Unknown error"
    try:
        shopping_crew = create_shopping_crew(prompt, num_products)
        crew_result = shopping_crew.kickoff()
        crew_result_str = getattr(crew_result, "raw", getattr(crew_result, "output", str(crew_result)))
        final_products = json.loads(crew_result_str)
        status = "completed"
    except json.JSONDecodeError as e:
        crew_error_detail = f"Agent output not valid JSON: {e}"
    except Exception as e:
        crew_error_detail = f"CrewAI workflow failed: {e}"

    try:
        supabase_user.table("search_queries").update({"status": status}).eq("id", query_id).execute()
        if status == "completed" and final_products:
            supabase_user.table("product_results").insert([
                {
                    "search_query_id": query_id,
                    "product_name": p.get("product_name"),
                    "image_url": p.get("image_url"),
                    "current_price": p.get("current_price"),
                    "summary": p.get("summary"),
                    "key_specifications": p.get("key_specifications", []),
                    "product_url": p.get("product_url"),
                    "position_in_results": i + 1
                } for i, p in enumerate(final_products)
            ]).execute()
    except Exception as e:
        print(f"Supabase error storing results: {e}")

    if status == "completed":
        return {"results": final_products}
    else:
        raise HTTPException(status_code=500, detail=f"Product search failed: {crew_error_detail}")


@app.get("/api/filter-suggestions/{category}", response_model=FilterSuggestion)
async def get_filter_suggestions(category: str):
    """Return suggested filters for a product category"""
    sample_suggestions = {
        "laptop": FilterSuggestion(
            category=category,
            suggested_brands=["Apple", "Dell", "HP", "Lenovo", "ASUS"],
            suggested_price_ranges=[
                {"label": "Budget", "min": 300, "max": 800},
                {"label": "Mid-range", "min": 800, "max": 1500},
                {"label": "Premium", "min": 1500, "max": 3000}
            ],
            suggested_use_cases=["Gaming", "Work", "Student", "Creative"],
            popular_features=["SSD Storage", "16GB RAM", "Dedicated Graphics", "Long Battery Life"]
        ),
        "smartphone": FilterSuggestion(
            category=category,
            suggested_brands=["Apple", "Samsung", "Google", "OnePlus"],
            suggested_price_ranges=[
                {"label": "Budget", "min": 200, "max": 400},
                {"label": "Mid-range", "min": 400, "max": 800},
                {"label": "Premium", "min": 800, "max": 1500}
            ],
            suggested_use_cases=["Photography", "Gaming", "Business", "General Use"],
            popular_features=["Multiple Cameras", "5G", "Wireless Charging", "Large Screen"]
        )
    }
    if category not in sample_suggestions:
        raise HTTPException(status_code=404, detail="Category not found")
    return sample_suggestions[category]


@app.post("/api/track-click")
async def track_product_click(request: Request, user_and_token=Depends(get_current_user)):
    """Track when users click on product URLs"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        data = await request.json()
        
        # Store click tracking data
        supabase_user.table("product_clicks").insert({
            "user_id": current_user["id"],
            "product_name": data.get("product_name"),
            "source": data.get("source"),
            "clicked_url": data.get("url"),
            "clicked_at": datetime.now().isoformat()
        }).execute()
        
        return {"success": True, "message": "Click tracked successfully"}
    except Exception as e:
        print(f"Error tracking click: {e}")
        return {"success": False, "message": "Click tracking failed"}


@app.get("/api/scraping/{session_id}/status")
async def get_scraping_status(session_id: str, user_and_token=Depends(get_current_user)):
    """Get the current status of a scraping session"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        session_tracker = ScrapingTracker(supabase_user)
        status = session_tracker.get_session_status(session_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="Scraping session not found")
            
        return {
            "session_id": session_id,
            "status": status.get("status"),
            "current_source": status.get("current_source"),
            "products_found": status.get("products_found", 0),
            "amazon_products": status.get("amazon_products", 0),
            "flipkart_products": status.get("flipkart_products", 0),
            "error_message": status.get("error_message"),
            "started_at": status.get("started_at"),
            "completed_at": status.get("completed_at")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting scraping status: {str(e)}")


@app.get("/api/scraping/{session_id}/products")
async def get_scraping_products(session_id: str, user_and_token=Depends(get_current_user)):
    """Get all scraped products for a session"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        session_tracker = ScrapingTracker(supabase_user)
        products = session_tracker.get_session_products(session_id)
        
        return {
            "session_id": session_id,
            "products": products,
            "total_count": len(products)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting scraped products: {str(e)}")


@app.get("/api/history")
async def get_history(user_and_token=Depends(get_current_user)):
    """Return search history for the current user"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    try:
        response = supabase_user.table("search_queries").select("*, product_results(*)") \
            .order("created_at", desc=True).execute()
        return {"history": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {e}")


# ==================== WISHLIST ENDPOINTS ====================

@app.get("/api/wishlist")
async def get_wishlist(user_and_token=Depends(get_current_user)):
    """Get user's wishlist items"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        user_id = current_user.id if hasattr(current_user, 'id') else current_user.get('id', 'demo_user')
        
        response = supabase_user.table("user_wishlist").select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True).execute()
            
        return {"items": response.data}
    except Exception as e:
        print(f"Error fetching wishlist: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch wishlist: {e}")


@app.post("/api/wishlist")
async def add_to_wishlist(request: Request, user_and_token=Depends(get_current_user)):
    """Add item to user's wishlist"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        data = await request.json()
        user_id = current_user.id if hasattr(current_user, 'id') else current_user.get('id', 'demo_user')
        
        # Check if item already exists in wishlist
        existing = supabase_user.table("user_wishlist").select("id") \
            .eq("user_id", user_id) \
            .eq("name", data["name"]).execute()
            
        if existing.data:
            raise HTTPException(status_code=400, detail="Item already in wishlist")
        
        wishlist_item = {
            "user_id": user_id,
            "name": data["name"],
            "current_price": data.get("current_price"),
            "original_price": data.get("original_price"),
            "image_url": data.get("image_url"),
            "product_url": data.get("product_url"),
            "source": data.get("source"),
            "rating": data.get("rating"),
            "product_data": data.get("product_data", {}),
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase_user.table("user_wishlist").insert(wishlist_item).execute()
        return {"message": "Added to wishlist", "item": response.data[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding to wishlist: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add to wishlist: {e}")


@app.delete("/api/wishlist/{item_id}")
async def remove_from_wishlist(item_id: str, user_and_token=Depends(get_current_user)):
    """Remove item from user's wishlist"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        user_id = current_user.id if hasattr(current_user, 'id') else current_user.get('id', 'demo_user')
        
        response = supabase_user.table("user_wishlist") \
            .delete() \
            .eq("id", item_id) \
            .eq("user_id", user_id).execute()
            
        if not response.data:
            raise HTTPException(status_code=404, detail="Wishlist item not found")
            
        return {"message": "Removed from wishlist"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing from wishlist: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to remove from wishlist: {e}")


@app.get("/api/wishlist/check")
async def check_wishlist_item(name: str, user_and_token=Depends(get_current_user)):
    """Check if item exists in user's wishlist"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        user_id = current_user.id if hasattr(current_user, 'id') else current_user.get('id', 'demo_user')
        
        response = supabase_user.table("user_wishlist").select("id") \
            .eq("user_id", user_id) \
            .eq("name", name).execute()
            
        return {"exists": bool(response.data)}
        
    except Exception as e:
        print(f"Error checking wishlist: {e}")
        return {"exists": False}


# ==================== FEEDBACK ENDPOINTS ====================

@app.post("/api/feedback")
async def submit_feedback(request: Request, user_and_token=Depends(get_current_user)):
    """Submit user feedback for search results"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        data = await request.json()
        user_id = current_user.id if hasattr(current_user, 'id') else current_user.get('id', 'demo_user')
        
        feedback_item = {
            "user_id": user_id,
            "search_id": data.get("searchId"),
            "search_query": data.get("searchQuery"),
            "overall_rating": data.get("overallRating"),
            "purchase_status": data.get("purchaseStatus", {}),
            "detailed_feedback": data.get("detailedFeedback"),
            "helpful_results": data.get("helpfulResults", []),
            "result_count": data.get("resultCount", 0),
            "feedback_timestamp": data.get("timestamp"),
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase_user.table("user_feedback").insert(feedback_item).execute()
        return {"message": "Feedback submitted successfully", "feedback_id": response.data[0]["id"]}
        
    except Exception as e:
        print(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {e}")


@app.get("/api/feedback/analytics")
async def get_feedback_analytics(user_and_token=Depends(get_current_user)):
    """Get feedback analytics for admin/analytics purposes"""
    current_user, token = user_and_token
    supabase_user = get_supabase_client_for_user(token)
    
    try:
        # Get overall feedback statistics
        response = supabase_user.table("user_feedback").select("overall_rating, result_count, created_at").execute()
        
        analytics = {
            "total_feedback": len(response.data),
            "average_rating": sum(item["overall_rating"] for item in response.data) / len(response.data) if response.data else 0,
            "average_result_count": sum(item["result_count"] for item in response.data) / len(response.data) if response.data else 0,
            "feedback_data": response.data
        }
        
        return analytics
        
    except Exception as e:
        print(f"Error getting feedback analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {e}")


@app.post("/api/track-click")
async def track_product_click(request: Request):
    """Track when users click on product links"""
    try:
        data = await request.json()
        
        click_data = {
            "product_name": data.get("product_name"),
            "source": data.get("source"),
            "url": data.get("url"),
            "clicked_at": datetime.utcnow().isoformat()
        }
        
        # For demo purposes, just return success
        # In production, you'd want to store this in a database
        print(f"Product click tracked: {click_data}")
        return {"message": "Click tracked successfully"}
        
    except Exception as e:
        print(f"Error tracking click: {e}")
        return {"message": "Click tracking failed"}
# ------------------- End of File -------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)