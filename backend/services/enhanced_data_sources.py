# services/enhanced_data_sources.py
import asyncio
import aiohttp
import json
import re
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import hashlib

class ProductDataCache:
    """Simple in-memory cache with TTL for product data."""
    
    def __init__(self, ttl_minutes: int = 30):
        self.cache = {}
        self.ttl = timedelta(minutes=ttl_minutes)
    
    def _generate_key(self, search_term: str, source: str) -> str:
        """Generate cache key from search parameters."""
        return hashlib.md5(f"{search_term}:{source}".encode()).hexdigest()
    
    def get(self, search_term: str, source: str) -> Optional[List[Dict]]:
        """Retrieve cached data if not expired."""
        key = self._generate_key(search_term, source)
        if key in self.cache:
            data, timestamp = self.cache[key]
            if datetime.now() - timestamp < self.ttl:
                return data
            else:
                del self.cache[key]
        return None
    
    def set(self, search_term: str, source: str, data: List[Dict]):
        """Cache data with current timestamp."""
        key = self._generate_key(search_term, source)
        self.cache[key] = (data, datetime.now())
    
    def clear_expired(self):
        """Remove expired cache entries."""
        now = datetime.now()
        expired_keys = [
            key for key, (_, timestamp) in self.cache.items() 
            if now - timestamp >= self.ttl
        ]
        for key in expired_keys:
            del self.cache[key]

class EnhancedDataSources:
    """Enhanced product data sources with multiple APIs and intelligent fallbacks."""
    
    def __init__(self):
        self.cache = ProductDataCache()
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def search_amazon_api(self, search_term: str, num_results: int = 10) -> List[Dict]:
        """Enhanced Amazon search with improved parsing using enhanced_web_scraper."""
        # Check cache first
        cached = self.cache.get(search_term, "amazon")
        if cached:
            return cached[:num_results]
        
        # Import enhanced scraper
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from tools.enhanced_web_scraper import search_amazon
        
        try:
            # Use enhanced Amazon scraper with better URL and data extraction
            results = search_amazon(search_term, max_results=num_results)
            
            # Enhanced data processing
            enhanced_results = []
            for item in results:
                enhanced_item = {
                    **item,
                    "source": "amazon",
                    "confidence_score": self._calculate_confidence_score(item),
                    "extracted_specs": self._extract_specifications(item.get("name", "")),
                    "price_per_rating": self._calculate_price_per_rating(item),
                    "search_relevance": self._calculate_search_relevance(item.get("name", ""), search_term)
                }
                enhanced_results.append(enhanced_item)
            
            # Cache results
            self.cache.set(search_term, "amazon", enhanced_results)
            return enhanced_results
            
        except Exception as e:
            print(f"Enhanced Amazon search failed, falling back to basic scraper: {e}")
            # Fallback to existing scraper
            from tools.web_scraper import scrape_ecommerce_site
            try:
                results = await scrape_ecommerce_site(search_term, num_results, "amazon")
                enhanced_results = []
                for item in results:
                    enhanced_item = {
                        **item,
                        "source": "amazon",
                        "confidence_score": self._calculate_confidence_score(item),
                        "extracted_specs": self._extract_specifications(item.get("name", "")),
                        "price_per_rating": self._calculate_price_per_rating(item),
                        "search_relevance": self._calculate_search_relevance(item.get("name", ""), search_term)
                    }
                    enhanced_results.append(enhanced_item)
                self.cache.set(search_term, "amazon", enhanced_results)
                return enhanced_results
            except Exception as fallback_e:
                print(f"Fallback Amazon search also failed: {fallback_e}")
                return []
    
    async def search_flipkart_api(self, search_term: str, num_results: int = 10) -> List[Dict]:
        """Enhanced Flipkart search with improved parsing using enhanced_web_scraper."""
        cached = self.cache.get(search_term, "flipkart")
        if cached:
            return cached[:num_results]
        
        # Import enhanced scraper
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from tools.enhanced_web_scraper import search_flipkart
        
        try:
            # Use enhanced Flipkart scraper with better URL and data extraction
            results = search_flipkart(search_term, max_results=num_results)
            
            enhanced_results = []
            for item in results:
                enhanced_item = {
                    **item,
                    "source": "flipkart",
                    "confidence_score": self._calculate_confidence_score(item),
                    "extracted_specs": self._extract_specifications(item.get("name", "")),
                    "price_per_rating": self._calculate_price_per_rating(item),
                    "search_relevance": self._calculate_search_relevance(item.get("name", ""), search_term)
                }
                enhanced_results.append(enhanced_item)
            
            # Cache results
            self.cache.set(search_term, "flipkart", enhanced_results)
            return enhanced_results
            
        except Exception as e:
            print(f"Enhanced Flipkart search failed, falling back to basic scraper: {e}")
            # Fallback to existing scraper
            from tools.web_scraper import scrape_ecommerce_site
            try:
                results = await scrape_ecommerce_site(search_term, num_results, "flipkart")
                enhanced_results = []
                for item in results:
                    enhanced_item = {
                        **item,
                        "source": "flipkart",
                        "confidence_score": self._calculate_confidence_score(item),
                        "extracted_specs": self._extract_specifications(item.get("name", "")),
                        "price_per_rating": self._calculate_price_per_rating(item),
                        "search_relevance": self._calculate_search_relevance(item.get("name", ""), search_term)
                    }
                    enhanced_results.append(enhanced_item)
                self.cache.set(search_term, "flipkart", enhanced_results)
                return enhanced_results
            except Exception as fallback_e:
                print(f"Fallback Flipkart search also failed: {fallback_e}")
                return []
            
            self.cache.set(search_term, "flipkart", enhanced_results)
            return enhanced_results
            
        except Exception as e:
            print(f"Flipkart search failed: {e}")
            return []
    
    async def search_multiple_sources(self, search_terms: List[str], category: str, num_results: int = 5) -> List[Dict]:
        """Search multiple sources in parallel with intelligent aggregation."""
        all_results = []
        
        # Search all terms across sources in parallel
        tasks = []
        for term in search_terms:
            tasks.append(self.search_amazon_api(term, num_results))
            tasks.append(self.search_flipkart_api(term, num_results))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Aggregate and deduplicate results
        seen_products = set()
        for result_list in results:
            if isinstance(result_list, list):
                for item in result_list:
                    # Simple deduplication based on product name similarity
                    product_key = self._normalize_product_name(item.get("name", ""))
                    if product_key not in seen_products and len(product_key) > 3:
                        seen_products.add(product_key)
                        all_results.append(item)
        
        # Sort by confidence and relevance
        all_results.sort(key=lambda x: (
            x.get("confidence_score", 0) * 0.6 + 
            x.get("search_relevance", 0) * 0.4
        ), reverse=True)
        
        return all_results[:num_results * 2]  # Return more for better comparison
    
    def _calculate_confidence_score(self, item: Dict) -> float:
        """Calculate confidence score for a product listing."""
        score = 0.5  # Base score
        
        # Boost for having image
        if item.get("image_url") and item["image_url"] != "N/A":
            score += 0.2
        
        # Boost for having valid price
        if item.get("current_price") and isinstance(item["current_price"], (int, float)) and item["current_price"] > 0:
            score += 0.2
        
        # Boost for having product URL
        if item.get("product_url") and item["product_url"] != "N/A":
            score += 0.1
        
        return min(score, 1.0)
    
    def _extract_specifications(self, product_name: str) -> Dict[str, str]:
        """Extract technical specifications from product name."""
        specs = {}
        name_lower = product_name.lower()
        
        # Extract RAM
        ram_match = re.search(r'(\d+)\s*gb\s*ram|(\d+)\s*gb\s*memory', name_lower)
        if ram_match:
            specs["ram"] = f"{ram_match.group(1) or ram_match.group(2)}GB"
        
        # Extract storage
        storage_match = re.search(r'(\d+)\s*gb\s*ssd|(\d+)\s*tb\s*ssd|(\d+)\s*gb\s*hdd', name_lower)
        if storage_match:
            specs["storage"] = storage_match.group(0).upper()
        
        # Extract processor info
        if "intel" in name_lower:
            intel_match = re.search(r'intel\s+core\s+i\d+|intel\s+i\d+', name_lower)
            if intel_match:
                specs["processor"] = intel_match.group(0).title()
        
        if "amd" in name_lower:
            amd_match = re.search(r'amd\s+ryzen\s+\d+', name_lower)
            if amd_match:
                specs["processor"] = amd_match.group(0).title()
        
        # Extract screen size
        screen_match = re.search(r'(\d+\.?\d*)\s*inch|\d+"\s*display', name_lower)
        if screen_match:
            specs["screen_size"] = screen_match.group(0)
        
        return specs
    
    def _calculate_price_per_rating(self, item: Dict) -> float:
        """Calculate value metric (price per rating point)."""
        price = item.get("current_price", 0)
        # Mock rating - in real implementation, extract from reviews
        mock_rating = 4.0  # Default decent rating
        return price / mock_rating if price > 0 else float('inf')
    
    def _calculate_search_relevance(self, product_name: str, search_term: str) -> float:
        """Calculate how relevant the product is to the search term."""
        if not product_name or not search_term:
            return 0.0
        
        name_lower = product_name.lower()
        term_lower = search_term.lower()
        
        # Exact match gets highest score
        if term_lower in name_lower:
            return 1.0
        
        # Word overlap scoring
        search_words = set(term_lower.split())
        name_words = set(name_lower.split())
        overlap = len(search_words.intersection(name_words))
        
        return overlap / len(search_words) if search_words else 0.0
    
    def _normalize_product_name(self, name: str) -> str:
        """Normalize product name for deduplication."""
        import re
        # Remove common variations and normalize
        normalized = re.sub(r'[^\w\s]', '', name.lower())
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        return normalized