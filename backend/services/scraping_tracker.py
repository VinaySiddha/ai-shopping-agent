# services/scraping_tracker.py
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from supabase import Client

class ScrapingTracker:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        
    def create_session(self, search_query: str) -> str:
        """Create a new scraping session and return session_id"""
        session_id = str(uuid.uuid4())
        
        try:
            self.supabase.table("scraping_sessions").insert({
                "session_id": session_id,
                "search_query": search_query,
                "status": "initiated",
                "current_source": None,
                "products_found": 0,
                "amazon_products": 0,
                "flipkart_products": 0
            }).execute()
            
            return session_id
        except Exception as e:
            print(f"Error creating scraping session: {e}")
            return session_id
    
    def update_status(self, session_id: str, status: str, current_source: str = None, error_message: str = None):
        """Update the scraping session status"""
        update_data = {
            "status": status,
            "updated_at": datetime.now().isoformat()
        }
        
        if current_source:
            update_data["current_source"] = current_source
            
        if error_message:
            update_data["error_message"] = error_message
            
        if status == "completed":
            update_data["completed_at"] = datetime.now().isoformat()
        
        try:
            self.supabase.table("scraping_sessions").update(update_data).eq("session_id", session_id).execute()
        except Exception as e:
            print(f"Error updating scraping session: {e}")
    
    def update_product_count(self, session_id: str, amazon_count: int = 0, flipkart_count: int = 0):
        """Update product counts for the session"""
        total_products = amazon_count + flipkart_count
        
        try:
            self.supabase.table("scraping_sessions").update({
                "products_found": total_products,
                "amazon_products": amazon_count,
                "flipkart_products": flipkart_count,
                "updated_at": datetime.now().isoformat()
            }).eq("session_id", session_id).execute()
        except Exception as e:
            print(f"Error updating product counts: {e}")
    
    def store_products(self, session_id: str, products: List[Dict], source: str):
        """Store scraped products in the database"""
        try:
            products_to_insert = []
            for product in products:
                products_to_insert.append({
                    "session_id": session_id,
                    "product_name": product.get("name", "Unknown"),
                    "product_url": product.get("product_url"),
                    "image_url": product.get("image_url"),
                    "current_price": product.get("current_price"),
                    "price_text": str(product.get("current_price", "")),
                    "source": source.lower(),
                    "specifications": product.get("key_specifications", {}),
                    "summary": product.get("summary", "")
                })
            
            if products_to_insert:
                self.supabase.table("scraped_products").insert(products_to_insert).execute()
                
        except Exception as e:
            print(f"Error storing products: {e}")
    
    def get_session_status(self, session_id: str) -> Optional[Dict]:
        """Get current status of a scraping session"""
        try:
            result = self.supabase.table("scraping_sessions").select("*").eq("session_id", session_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            print(f"Error getting session status: {e}")
            return None
    
    def get_session_products(self, session_id: str) -> List[Dict]:
        """Get all products for a scraping session"""
        try:
            result = self.supabase.table("scraped_products").select("*").eq("session_id", session_id).order("scraped_at").execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting session products: {e}")
            return []