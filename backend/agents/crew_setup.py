# agents/crew_setup.py

import os
import json
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
from crewai import LLM
from tools.enhanced_web_scraper import search_both_platforms

# --- Load environment variables ---
load_dotenv()
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")

# # Set environment variables for LiteLLM
# os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

# # Debug print
# print(f"Using model: {GEMINI_MODEL_NAME}")
# print(f"API key exists: {bool(GEMINI_API_KEY)}")

# --- Initialize LLM using CrewAI's LLM class ---
# Try Alpha-VLLM/Lumina-DiM00 model first, fallback to gpt-3.5-turbo if needed
# hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
model = os.getenv("MODEL")
llm = LLM(
            model=model,
            temperature=0.3,
        )
# if hf_api_key:
#     try:
#         # Try using the Lumina model via Hugging Face
        
#     except Exception as e:
#         print(f"⚠️  Lumina model failed, falling back to GPT-3.5: {e}")
#         llm = LLM(
#             model="gpt-3.5-turbo",
#             temperature=0.3
#         )
# else:
#     print("⚠️  No Hugging Face API key found, using GPT-3.5-turbo")
#     llm = LLM(
#         model="gpt-3.5-turbo",
#         temperature=0.3
#     )

# --- Tool: Enhanced Web Scraper ---
@tool("EnhancedWebScraper")
def web_scraper_tool(product_keyword: str, session_id: str = None) -> str:
    """
    Scrape product data from Amazon India and Flipkart using the enhanced scraper.

    Returns:
        JSON string: List of products with 'product_name', 'current_price', 'image_url', 'product_url', and 'source'.
    """
    try:
        # Import here to avoid circular imports
        from services.scraping_tracker import ScrapingTracker
        from supabase import create_client
        import os
        
        # Create tracker instance
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        if supabase_url and supabase_key:
            supabase_client = create_client(supabase_url, supabase_key)
            tracker = ScrapingTracker(supabase_client)
        else:
            tracker = None
            
        # Update status if tracker is available
        if tracker and session_id:
            tracker.update_status(session_id, "scraping_amazon", "amazon")
            
        # Use enhanced scraper to get products from both platforms
        results = search_both_platforms(product_keyword, max_results=8)
        
        # Store results if tracker is available
        if tracker and session_id:
            amazon_results = [p for p in results if p.get('source') == 'amazon']
            flipkart_results = [p for p in results if p.get('source') == 'flipkart']
            
            if amazon_results:
                tracker.store_products(session_id, amazon_results, "amazon")
            if flipkart_results:
                tracker.store_products(session_id, flipkart_results, "flipkart")
                
            tracker.update_product_count(session_id, 
                                       amazon_count=len(amazon_results), 
                                       flipkart_count=len(flipkart_results))
            tracker.update_status(session_id, "processing", "processing")
            
        return json.dumps(results)
    except Exception as e:
        return json.dumps({"error": str(e), "results": []})


# --- Agent 1: Product Request Parser ---
parser_agent = Agent(
    role="Product Request Parser",
    goal=(
        "Extract product type, key specifications (RAM, processor, screen size, storage), "
        "budget, and brand preferences from natural language input."
    ),
    backstory=(
        "Expert in natural language processing. Converts complex user requests "
        "into structured, actionable JSON data. Ensures numeric values and brand names are correctly identified."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False
)

# --- Agent 2: Web Search & Scraper Orchestrator ---
scraper_orchestrator_agent = Agent(
    role="Web Search & Scraping Orchestrator",
    goal="Use the WebScraper tool ONCE to gather product data. Accept any number of results without re-scraping.",
    backstory=(
        "Efficient data collector who uses tools exactly once per task. "
        "Never calls the same tool multiple times or tries to get more results. "
        "Always satisfied with the first scraping result, whether it's 3 products or 10 products."
    ),
    llm=llm,
    tools=[web_scraper_tool],
    verbose=True,
    allow_delegation=False
)

# --- Agent 3: Product Comparison & Ranking ---
comparator_agent = Agent(
    role="Product Comparison & Ranking Specialist",
    goal="Compare products against user specifications and budget, rank them by overall fit, price, and reviews.",
    backstory=(
        "Analytical expert who compares specs, prices, and reviews to find the best value. "
        "Generates concise summaries highlighting matching features and key advantages."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False
)

# --- Agent 4: Result Formatter ---
formatter_agent = Agent(
    role="Result Formatter",
    goal="Format top-ranked products into a clean, concise, frontend-ready JSON structure.",
    backstory=(
        "Ensures complex data is distilled into user-friendly JSON. Strictly follows the required schema "
        "to guarantee consistency and compatibility with frontend displays."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False
)


# --- Function: Create Shopping Crew ---
def create_shopping_crew(user_prompt: str, num_products: int) -> Crew:
    """
    Assemble a sequential CrewAI workflow to:
        1. Parse product requests
        2. Scrape enhanced product data
        3. Compare and rank products
        4. Format results for frontend display

    Args:
        user_prompt (str): The user's product request.
        num_products (int): Number of top products to return.

    Returns:
        Crew: Configured CrewAI instance ready for execution.
    """

    # --- Task 1: Parse Product Request ---
    parse_task = Task(
        description=f"""
        Parse the following product request: '{user_prompt}'.
        Extract:
            - Product type (e.g., laptop, smartphone)
            - Key specifications (RAM, processor, screen size, storage)
            - Maximum budget (numeric)
            - Preferred brands (list)
            - Primary search keyword for scraping
        Example output:
        {{
            'product_type': 'laptop',
            'search_keyword': '15-inch laptop i7 16GB',
            'specs': {{'ram_gb': 16, 'processor': 'Intel i7', 'screen_size_inches': 15.6}},
            'budget': 1500,
            'brands': ['Dell', 'HP'],
            'num_results': {num_products}
        }}
        """,
        agent=parser_agent,
        expected_output="JSON object with parsed product requirements."
    )

    # --- Task 2: Scrape Products ---
    scrape_task = Task(
        description=f"""
        CRITICAL: This is a PRODUCT SEARCH task, NOT web crawler documentation.
        
        TASK: Use the EnhancedWebScraper tool EXACTLY ONCE to find real products.
        
        IMPORTANT: 
        - Use the tool ONE TIME ONLY with the search keyword
        - Accept ANY number of results (3, 5, 8, etc.) - do not try to get exactly {num_products}
        - Return whatever the tool gives you - do NOT call the tool multiple times
        - If you get 3 products, that's fine. If you get 10 products, that's also fine.
        
        Steps:
        1. Take the 'search_keyword' from the previous parser task
        2. Call EnhancedWebScraper ONCE with product_keyword=<search_keyword>
        3. Return the complete JSON result from that single call
        4. DO NOT call the tool again even if you get fewer than {num_products} results
        
        The scraper returns REAL PRODUCT DATA from Amazon India and Flipkart:
        - product_name, current_price, image_url, product_url, source, price_numeric
        
        STRICT RULE: Use the EnhancedWebScraper tool exactly once and return its output.
        """,
        agent=scraper_orchestrator_agent,
        context=[parse_task],
        expected_output="Complete JSON array from single EnhancedWebScraper call (any number of products is acceptable)"
    )

    # --- Task 3: Compare & Rank Products ---
    compare_and_rank_task = Task(
        description=f"""
        CRITICAL: Analyze REAL PRODUCT DATA for e-commerce comparison - NOT programming tutorials.
        
        TASK: Compare and rank ALL products from the scraper (whether 3, 5, 8, or more products).
        
        Input: JSON array of REAL PRODUCTS from scraper (accept ANY quantity)
        
        Processing steps:
        1. Take ALL products from the scraper task (don't try to get more)
        2. Compare against user requirements (budget, specs, brand)
        3. Rank by value, features, and price match
        4. Return ALL products ranked (up to {num_products} max if more available)
        5. Add helpful product summaries
        
        IMPORTANT: Work with whatever products the scraper provided. If scraper gave 4 products, 
        rank those 4 products. Do NOT request more products or complain about quantity.
        
        Output: JSON array of ALL available products, ranked:
        [
          {{
            "product_name": "Samsung Galaxy M36 5G (Velvet Black, 8GB RAM)",
            "current_price": "₹17,499",
            "price_numeric": 17499.0,
            "image_url": "https://m.media-amazon.com/images/...",
            "product_url": "https://www.amazon.in/dp/...", 
            "source": "amazon",
            "summary": "Great 5G phone with 50MP camera",
            "key_specifications": ["8GB RAM", "5G", "50MP Camera"],
            "ranking_score": 85
          }}
        ]
        """,
        agent=comparator_agent,
        context=[parse_task, scrape_task],
        expected_output="JSON array of ALL scraped products, ranked by relevance (accept any quantity from scraper)"
    )

    # --- Task 4: Format Final Results ---
    format_task = Task(
        description=f"""
        FINAL FORMATTING: Transform the ranked products into the required JSON schema.
        
        INPUT: JSON array from the comparator with product objects
        OUTPUT: Clean JSON array with renamed fields for frontend compatibility
        
        Field transformations required:
        - product_name → name  
        - current_price → price (keep ₹ format)
        - product_url → source_url
        - key_specifications → features
        - Add missing fields with defaults:
          - rating: "N/A" if not present
          - rating_numeric: null if not present  
          - brand: extract from name or set to ""
          - availability: "In Stock"
        
        STRICT REQUIREMENT: Return ONLY a valid JSON array, NO additional text or explanations.
        
        Example output format:
        [
          {{
            "name": "Samsung Galaxy M36 5G",
            "price": "₹17,499", 
            "price_numeric": 17499.0,
            "rating": "N/A",
            "rating_numeric": null,
            "source_url": "https://www.amazon.in/dp/B0FDB8V6PS",
            "brand": "Samsung",
            "features": ["5G", "50MP Camera", "8GB RAM"],
            "availability": "In Stock",
            "image_url": "https://m.media-amazon.com/images/I/61FcXMhjr8L._AC_UY218_.jpg"
          }}
        ]
        """,
        agent=formatter_agent,
        context=[compare_and_rank_task],
        expected_output="Pure JSON array with no surrounding text - ready for frontend parsing."
    )

    # --- Assemble Crew ---
    product_crew = Crew(
        agents=[parser_agent, scraper_orchestrator_agent, comparator_agent, formatter_agent],
        tasks=[parse_task, scrape_task, compare_and_rank_task, format_task],
        verbose=True,
        process=Process.sequential
    )

    return product_crew
