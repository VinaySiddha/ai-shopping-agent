# services/filter_processor.py
from typing import Dict, List, Optional, Any
import re
from dataclasses import dataclass
from models import SearchFilters

@dataclass
class EnhancedQuery:
    original_query: str
    enhanced_query: str
    search_terms: List[str]
    category_specific_terms: List[str]
    brand_filters: List[str]
    price_context: Optional[str]
    use_case_context: Optional[str]

class FilterProcessor:
    """Process and enhance search queries based on user filters"""
    
    CATEGORY_KEYWORDS = {
        'laptop': ['notebook', 'ultrabook', 'gaming laptop', 'business laptop', 'macbook'],
        'smartphone': ['phone', 'mobile', 'android', 'iphone', 'cell phone'],
        'headphones': ['earphones', 'earbuds', 'headset', 'audio', 'wireless headphones'],
        'keyboard': ['mechanical keyboard', 'gaming keyboard', 'wireless keyboard', 'ergonomic'],
        'monitor': ['display', 'screen', 'gaming monitor', '4K monitor', 'ultrawide'],
        'mouse': ['gaming mouse', 'wireless mouse', 'ergonomic mouse', 'optical mouse'],
        'speaker': ['bluetooth speaker', 'bookshelf speakers', 'soundbar', 'portable speaker'],
        'tablet': ['ipad', 'android tablet', 'drawing tablet', 'e-reader']
    }
    
    USE_CASE_KEYWORDS = {
        'gaming': ['gaming', 'esports', 'high performance', 'rgb', 'mechanical'],
        'work': ['business', 'professional', 'productivity', 'office', 'enterprise'],
        'student': ['budget', 'portable', 'lightweight', 'affordable', 'basic'],
        'creative': ['design', 'color accurate', 'high resolution', 'professional'],
        'programming': ['coding', 'development', 'multiple monitors', 'mechanical'],
        'music': ['audio quality', 'studio', 'professional audio', 'hi-fi'],
        'travel': ['portable', 'lightweight', 'compact', 'wireless', 'battery life'],
        'exercise': ['sports', 'sweat resistant', 'wireless', 'secure fit']
    }
    
    BRAND_ALIASES = {
        'apple': ['mac', 'macbook', 'iphone', 'ipad'],
        'microsoft': ['surface', 'xbox'],
        'google': ['pixel', 'chromebook'],
        'samsung': ['galaxy'],
        'sony': ['playstation', 'xperia']
    }

    def process_filters(self, query: str, filters: SearchFilters) -> EnhancedQuery:
        """Convert filters into enhanced search query"""
        
        enhanced_parts = []
        search_terms = [query.lower()]
        category_terms = []
        brand_filters = []
        price_context = None
        use_case_context = None
        
        # Process category
        if filters.category:
            category_terms = self.CATEGORY_KEYWORDS.get(filters.category, [filters.category])
            enhanced_parts.append(f"best {filters.category}")
            search_terms.extend(category_terms)
        
        # Process use case
        if filters.use_case:
            use_case_lower = filters.use_case.lower()
            use_case_keywords = self.USE_CASE_KEYWORDS.get(use_case_lower, [use_case_lower])
            enhanced_parts.append(f"for {filters.use_case.lower()}")
            search_terms.extend(use_case_keywords)
            use_case_context = filters.use_case
        
        # Process brands
        if filters.brands:
            brand_filters = filters.brands
            if len(filters.brands) == 1:
                enhanced_parts.append(f"from {filters.brands[0]}")
            else:
                enhanced_parts.append(f"from {' or '.join(filters.brands[:2])}")
            
            # Add brand aliases
            for brand in filters.brands:
                brand_lower = brand.lower()
                if brand_lower in self.BRAND_ALIASES:
                    search_terms.extend(self.BRAND_ALIASES[brand_lower])
        
        # Process price range
        if filters.min_price is not None or filters.max_price is not None:
            if filters.min_price and filters.max_price:
                if filters.max_price >= 10000:
                    price_context = f"premium range over ${filters.min_price:,.0f}"
                    enhanced_parts.append(f"under ${filters.min_price:,.0f}")
                else:
                    price_context = f"${filters.min_price:,.0f} to ${filters.max_price:,.0f} range"
                    enhanced_parts.append(f"between ${filters.min_price:,.0f} and ${filters.max_price:,.0f}")
            elif filters.max_price:
                price_context = f"budget under ${filters.max_price:,.0f}"
                enhanced_parts.append(f"under ${filters.max_price:,.0f}")
            elif filters.min_price:
                price_context = f"premium over ${filters.min_price:,.0f}"
                enhanced_parts.append(f"over ${filters.min_price:,.0f}")
        
        # Combine into enhanced query
        if enhanced_parts:
            enhanced_query = " ".join(enhanced_parts)
        else:
            enhanced_query = query
        
        return EnhancedQuery(
            original_query=query,
            enhanced_query=enhanced_query,
            search_terms=list(set(search_terms)),  # Remove duplicates
            category_specific_terms=category_terms,
            brand_filters=brand_filters,
            price_context=price_context,
            use_case_context=use_case_context
        )
    
    def calculate_match_score(self, product: Dict[str, Any], filters: SearchFilters, enhanced_query: EnhancedQuery) -> float:
        """Calculate how well a product matches the search criteria"""
        score = 0.0
        max_score = 0.0
        
        # Category match (25% weight)
        max_score += 25
        if filters.category:
            product_name = product.get('name', '').lower()
            product_category = product.get('category', '').lower()
            
            if filters.category.lower() in product_name or filters.category.lower() in product_category:
                score += 25
            elif any(term in product_name for term in enhanced_query.category_specific_terms):
                score += 20
        
        # Brand match (20% weight)
        max_score += 20
        if filters.brands:
            product_name = product.get('name', '').lower()
            product_brand = product.get('brand', '').lower()
            
            for brand in filters.brands:
                if brand.lower() in product_name or brand.lower() in product_brand:
                    score += 20
                    break
        
        # Price match (20% weight)
        max_score += 20
        if filters.min_price is not None or filters.max_price is not None:
            product_price = product.get('price_numeric')
            if product_price is not None:
                in_range = True
                if filters.min_price is not None and product_price < filters.min_price:
                    in_range = False
                if filters.max_price is not None and product_price > filters.max_price:
                    in_range = False
                
                if in_range:
                    score += 20
                else:
                    # Partial score for close prices
                    if filters.min_price and product_price < filters.min_price:
                        ratio = product_price / filters.min_price
                        score += 10 * ratio
                    elif filters.max_price and product_price > filters.max_price:
                        ratio = filters.max_price / product_price
                        score += 10 * ratio
        
        # Use case match (15% weight)
        max_score += 15
        if filters.use_case:
            product_name = product.get('name', '').lower()
            product_features = ' '.join(product.get('features', [])).lower()
            
            use_case_keywords = self.USE_CASE_KEYWORDS.get(filters.use_case.lower(), [])
            if any(keyword in product_name or keyword in product_features for keyword in use_case_keywords):
                score += 15
        
        # Rating boost (10% weight)
        max_score += 10
        rating = product.get('rating_numeric')
        if rating is not None:
            # Boost score based on rating (4.0+ gets full points)
            if rating >= 4.0:
                score += 10
            elif rating >= 3.5:
                score += 7
            elif rating >= 3.0:
                score += 5
        
        # Features match (10% weight)
        max_score += 10
        if filters.features:
            product_features = ' '.join(product.get('features', [])).lower()
            matched_features = sum(1 for feature in filters.features 
                                 if feature.lower() in product_features)
            if matched_features > 0:
                score += 10 * (matched_features / len(filters.features))
        
        # Normalize score to 0-1 range
        return min(score / max_score, 1.0) if max_score > 0 else 0.0
    
    def generate_search_strategy(self, filters: SearchFilters, enhanced_query: EnhancedQuery) -> str:
        """Generate a description of the search strategy being used"""
        strategies = []
        
        if filters.category:
            strategies.append(f"Focusing on {filters.category} products")
        
        if filters.brands:
            if len(filters.brands) == 1:
                strategies.append(f"Filtering by {filters.brands[0]} brand")
            else:
                strategies.append(f"Considering {len(filters.brands)} preferred brands")
        
        if filters.min_price or filters.max_price:
            strategies.append("Applying price range filters")
        
        if filters.use_case:
            strategies.append(f"Optimizing for {filters.use_case} use case")
        
        if not strategies:
            strategies.append("Using broad search across all products")
        
        return "; ".join(strategies)