# services/product_categorizer.py
import re
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class ProductCategory:
    name: str
    keywords: List[str]
    specs_to_extract: List[str]
    price_range: Tuple[int, int]  # (min, max) typical price range
    search_sources: List[str]
    comparison_weights: Dict[str, float]  # Weight different attributes for ranking

# services/product_categorizer.py
import re
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class ProductCategory:
    name: str
    keywords: List[str]
    specs_to_extract: List[str]
    price_range: Tuple[int, int]  # (min, max) typical price range
    search_sources: List[str]
    comparison_weights: Dict[str, float]  # Weight different attributes for ranking

class ProductCategorizer:
    """Intelligent product categorization with specialized search logic for ALL product types."""
    
    CATEGORIES = {
        # ============ ELECTRONICS ============
        "laptop": ProductCategory(
            name="laptop",
            keywords=["laptop", "notebook", "ultrabook", "gaming laptop", "macbook", "chromebook", "workstation"],
            specs_to_extract=["processor", "ram", "storage", "display_size", "graphics", "battery_life", "weight"],
            price_range=(300, 3000),
            search_sources=["amazon", "flipkart", "best_buy", "newegg"],
            comparison_weights={"processor": 0.25, "ram": 0.20, "price": 0.20, "storage": 0.15, "brand": 0.10, "reviews": 0.10}
        ),
        "smartphone": ProductCategory(
            name="smartphone", 
            keywords=["smartphone", "phone", "mobile", "iphone", "android", "samsung galaxy", "pixel", "oneplus"],
            specs_to_extract=["display_size", "camera", "battery", "storage", "processor", "ram", "5g"],
            price_range=(100, 1500),
            search_sources=["amazon", "flipkart", "gsmarena"],
            comparison_weights={"camera": 0.25, "battery": 0.20, "price": 0.20, "processor": 0.15, "display": 0.10, "brand": 0.10}
        ),
        "headphones": ProductCategory(
            name="headphones",
            keywords=["headphones", "earphones", "earbuds", "airpods", "wireless headphones", "noise cancelling", "bluetooth headphones"],
            specs_to_extract=["driver_size", "frequency_response", "impedance", "wireless", "noise_cancellation", "battery_life"],
            price_range=(20, 500),
            search_sources=["amazon", "flipkart", "audio_stores"],
            comparison_weights={"sound_quality": 0.30, "price": 0.25, "comfort": 0.20, "features": 0.15, "brand": 0.10}
        ),
        "keyboard": ProductCategory(
            name="keyboard",
            keywords=["keyboard", "mechanical keyboard", "gaming keyboard", "wireless keyboard", "bluetooth keyboard"],
            specs_to_extract=["switch_type", "layout", "wireless", "rgb", "build_material"],
            price_range=(25, 300),
            search_sources=["amazon", "flipkart", "mechanical_keyboards"],
            comparison_weights={"switch_type": 0.25, "build_quality": 0.25, "price": 0.20, "features": 0.15, "brand": 0.15}
        ),
        "tablet": ProductCategory(
            name="tablet",
            keywords=["tablet", "ipad", "android tablet", "surface", "kindle", "e-reader"],
            specs_to_extract=["display_size", "storage", "ram", "processor", "battery_life", "camera"],
            price_range=(100, 1000),
            search_sources=["amazon", "flipkart", "best_buy"],
            comparison_weights={"display": 0.25, "performance": 0.20, "price": 0.20, "battery": 0.15, "storage": 0.10, "brand": 0.10}
        ),
        "smartwatch": ProductCategory(
            name="smartwatch",
            keywords=["smartwatch", "apple watch", "fitness tracker", "smart band", "wearable", "garmin watch"],
            specs_to_extract=["display_size", "battery_life", "fitness_features", "connectivity", "water_resistance"],
            price_range=(50, 800),
            search_sources=["amazon", "flipkart", "wearable_stores"],
            comparison_weights={"features": 0.30, "battery": 0.25, "price": 0.20, "design": 0.15, "brand": 0.10}
        ),
        "camera": ProductCategory(
            name="camera",
            keywords=["camera", "dslr", "mirrorless", "digital camera", "canon", "nikon", "sony camera"],
            specs_to_extract=["megapixels", "lens_mount", "video_quality", "iso_range", "autofocus"],
            price_range=(200, 3000),
            search_sources=["amazon", "flipkart", "camera_stores"],
            comparison_weights={"image_quality": 0.30, "features": 0.25, "price": 0.20, "brand": 0.15, "lens_compatibility": 0.10}
        ),
        
        # ============ HOME & KITCHEN ============
        "refrigerator": ProductCategory(
            name="refrigerator",
            keywords=["refrigerator", "fridge", "double door", "single door", "side by side", "french door"],
            specs_to_extract=["capacity", "energy_rating", "door_type", "cooling_technology", "warranty"],
            price_range=(200, 2000),
            search_sources=["amazon", "flipkart", "appliance_stores"],
            comparison_weights={"capacity": 0.25, "energy_efficiency": 0.25, "price": 0.20, "features": 0.15, "brand": 0.15}
        ),
        "washing_machine": ProductCategory(
            name="washing_machine",
            keywords=["washing machine", "washer", "front load", "top load", "automatic", "semi automatic"],
            specs_to_extract=["capacity", "load_type", "energy_rating", "wash_programs", "rpm"],
            price_range=(200, 1500),
            search_sources=["amazon", "flipkart", "appliance_stores"],
            comparison_weights={"capacity": 0.25, "efficiency": 0.25, "price": 0.20, "features": 0.15, "brand": 0.15}
        ),
        "microwave": ProductCategory(
            name="microwave",
            keywords=["microwave", "microwave oven", "convection", "grill", "solo microwave"],
            specs_to_extract=["capacity", "power", "type", "features", "warranty"],
            price_range=(80, 500),
            search_sources=["amazon", "flipkart", "appliance_stores"],
            comparison_weights={"capacity": 0.25, "power": 0.25, "price": 0.20, "features": 0.15, "brand": 0.15}
        ),
        "air_conditioner": ProductCategory(
            name="air_conditioner",
            keywords=["air conditioner", "ac", "split ac", "window ac", "inverter ac", "cooling"],
            specs_to_extract=["capacity", "energy_rating", "type", "cooling_technology", "installation"],
            price_range=(300, 1500),
            search_sources=["amazon", "flipkart", "appliance_stores"],
            comparison_weights={"cooling_capacity": 0.30, "energy_efficiency": 0.25, "price": 0.20, "features": 0.15, "brand": 0.10}
        ),
        
        # ============ CLOTHING & FASHION ============
        "shoes": ProductCategory(
            name="shoes",
            keywords=["shoes", "sneakers", "boots", "sandals", "formal shoes", "running shoes", "athletic shoes"],
            specs_to_extract=["size", "material", "brand", "type", "color", "closure"],
            price_range=(20, 300),
            search_sources=["amazon", "flipkart", "shoe_stores"],
            comparison_weights={"comfort": 0.30, "durability": 0.25, "price": 0.20, "style": 0.15, "brand": 0.10}
        ),
        "clothing": ProductCategory(
            name="clothing",
            keywords=["shirt", "t-shirt", "jeans", "dress", "jacket", "sweater", "pants", "clothing", "apparel"],
            specs_to_extract=["size", "material", "fit", "brand", "color", "style"],
            price_range=(10, 200),
            search_sources=["amazon", "flipkart", "fashion_stores"],
            comparison_weights={"quality": 0.30, "fit": 0.25, "price": 0.20, "style": 0.15, "brand": 0.10}
        ),
        "watch": ProductCategory(
            name="watch",
            keywords=["watch", "wristwatch", "analog watch", "digital watch", "luxury watch", "sports watch"],
            specs_to_extract=["movement", "material", "water_resistance", "features", "warranty"],
            price_range=(20, 1000),
            search_sources=["amazon", "flipkart", "watch_stores"],
            comparison_weights={"quality": 0.30, "features": 0.25, "price": 0.20, "design": 0.15, "brand": 0.10}
        ),
        
        # ============ BEAUTY & PERSONAL CARE ============
        "skincare": ProductCategory(
            name="skincare",
            keywords=["skincare", "face cream", "moisturizer", "serum", "face wash", "sunscreen", "anti-aging"],
            specs_to_extract=["skin_type", "ingredients", "spf", "volume", "brand"],
            price_range=(5, 100),
            search_sources=["amazon", "flipkart", "beauty_stores"],
            comparison_weights={"effectiveness": 0.30, "ingredients": 0.25, "price": 0.20, "reviews": 0.15, "brand": 0.10}
        ),
        "makeup": ProductCategory(
            name="makeup",
            keywords=["makeup", "lipstick", "foundation", "mascara", "eyeshadow", "concealer", "blush"],
            specs_to_extract=["shade", "finish", "longevity", "skin_type", "ingredients"],
            price_range=(5, 80),
            search_sources=["amazon", "flipkart", "beauty_stores"],
            comparison_weights={"quality": 0.30, "shade_range": 0.25, "price": 0.20, "longevity": 0.15, "brand": 0.10}
        ),
        "perfume": ProductCategory(
            name="perfume",
            keywords=["perfume", "cologne", "fragrance", "eau de toilette", "eau de parfum", "deodorant"],
            specs_to_extract=["volume", "fragrance_family", "longevity", "sillage", "concentration"],
            price_range=(10, 200),
            search_sources=["amazon", "flipkart", "fragrance_stores"],
            comparison_weights={"scent": 0.35, "longevity": 0.25, "price": 0.20, "brand": 0.10, "packaging": 0.10}
        ),
        
        # ============ BOOKS & MEDIA ============
        "books": ProductCategory(
            name="books",
            keywords=["book", "novel", "textbook", "ebook", "kindle book", "paperback", "hardcover"],
            specs_to_extract=["author", "genre", "pages", "publisher", "language", "format"],
            price_range=(5, 50),
            search_sources=["amazon", "flipkart", "book_stores"],
            comparison_weights={"content": 0.40, "price": 0.25, "reviews": 0.20, "author": 0.10, "format": 0.05}
        ),
        "music": ProductCategory(
            name="music",
            keywords=["cd", "vinyl", "music album", "soundtrack", "classical music", "digital music"],
            specs_to_extract=["artist", "genre", "duration", "format", "label"],
            price_range=(5, 30),
            search_sources=["amazon", "flipkart", "music_stores"],
            comparison_weights={"artist": 0.35, "quality": 0.25, "price": 0.20, "genre": 0.15, "format": 0.05}
        ),
        
        # ============ SPORTS & FITNESS ============
        "fitness_equipment": ProductCategory(
            name="fitness_equipment",
            keywords=["treadmill", "dumbbells", "yoga mat", "resistance bands", "gym equipment", "exercise bike"],
            specs_to_extract=["weight_capacity", "dimensions", "material", "resistance_levels", "warranty"],
            price_range=(20, 2000),
            search_sources=["amazon", "flipkart", "fitness_stores"],
            comparison_weights={"durability": 0.30, "functionality": 0.25, "price": 0.20, "space_efficiency": 0.15, "brand": 0.10}
        ),
        "sports_gear": ProductCategory(
            name="sports_gear",
            keywords=["football", "basketball", "tennis racket", "cricket bat", "sports equipment", "athletic gear"],
            specs_to_extract=["material", "size", "weight", "brand", "sport_type"],
            price_range=(15, 300),
            search_sources=["amazon", "flipkart", "sports_stores"],
            comparison_weights={"quality": 0.30, "performance": 0.25, "price": 0.20, "durability": 0.15, "brand": 0.10}
        ),
        
        # ============ TOYS & GAMES ============
        "toys": ProductCategory(
            name="toys",
            keywords=["toy", "kids toy", "educational toy", "action figure", "doll", "puzzle", "board game"],
            specs_to_extract=["age_range", "material", "safety_features", "educational_value", "brand"],
            price_range=(5, 100),
            search_sources=["amazon", "flipkart", "toy_stores"],
            comparison_weights={"safety": 0.35, "educational_value": 0.25, "price": 0.20, "durability": 0.15, "brand": 0.05}
        ),
        "video_games": ProductCategory(
            name="video_games",
            keywords=["video game", "ps5 game", "xbox game", "nintendo game", "pc game", "gaming"],
            specs_to_extract=["platform", "genre", "rating", "multiplayer", "developer"],
            price_range=(10, 70),
            search_sources=["amazon", "flipkart", "gaming_stores"],
            comparison_weights={"reviews": 0.30, "gameplay": 0.25, "price": 0.20, "genre": 0.15, "platform": 0.10}
        ),
        
        # ============ AUTOMOTIVE ============
        "car_accessories": ProductCategory(
            name="car_accessories",
            keywords=["car accessory", "car charger", "dash cam", "car mount", "seat covers", "car mats"],
            specs_to_extract=["compatibility", "material", "installation", "features", "warranty"],
            price_range=(10, 200),
            search_sources=["amazon", "flipkart", "auto_stores"],
            comparison_weights={"compatibility": 0.30, "quality": 0.25, "price": 0.20, "features": 0.15, "brand": 0.10}
        ),
        
        # ============ PET SUPPLIES ============
        "pet_supplies": ProductCategory(
            name="pet_supplies",
            keywords=["pet food", "dog toy", "cat litter", "pet bed", "leash", "pet accessories"],
            specs_to_extract=["pet_type", "size", "material", "age_range", "brand"],
            price_range=(5, 100),
            search_sources=["amazon", "flipkart", "pet_stores"],
            comparison_weights={"safety": 0.35, "quality": 0.25, "price": 0.20, "suitability": 0.15, "brand": 0.05}
        ),
        
        # ============ OFFICE SUPPLIES ============
        "office_supplies": ProductCategory(
            name="office_supplies",
            keywords=["office chair", "desk", "printer", "stationery", "notebook", "pen", "office equipment"],
            specs_to_extract=["material", "dimensions", "features", "compatibility", "warranty"],
            price_range=(5, 500),
            search_sources=["amazon", "flipkart", "office_stores"],
            comparison_weights={"functionality": 0.30, "durability": 0.25, "price": 0.20, "ergonomics": 0.15, "brand": 0.10}
        ),
        
        # ============ GARDEN & OUTDOOR ============
        "garden_supplies": ProductCategory(
            name="garden_supplies",
            keywords=["plants", "seeds", "fertilizer", "garden tools", "pots", "outdoor furniture"],
            specs_to_extract=["material", "size", "weather_resistance", "maintenance", "season"],
            price_range=(5, 300),
            search_sources=["amazon", "flipkart", "garden_stores"],
            comparison_weights={"quality": 0.30, "durability": 0.25, "price": 0.20, "suitability": 0.15, "brand": 0.10}
        ),
        
        # ============ FOOD & BEVERAGES ============
        "food": ProductCategory(
            name="food",
            keywords=["snacks", "beverages", "organic food", "health food", "spices", "coffee", "tea"],
            specs_to_extract=["ingredients", "nutrition", "expiry", "organic", "brand"],
            price_range=(2, 50),
            search_sources=["amazon", "flipkart", "grocery_stores"],
            comparison_weights={"quality": 0.35, "nutrition": 0.25, "price": 0.20, "taste": 0.15, "brand": 0.05}
        ),
        
        # ============ GENERAL CATEGORY ============
        "general": ProductCategory(
            name="general",
            keywords=["product", "item", "buy", "shopping", "purchase"],
            specs_to_extract=["brand", "price", "rating", "features", "warranty"],
            price_range=(1, 5000),
            search_sources=["amazon", "flipkart"],
            comparison_weights={"price": 0.30, "reviews": 0.25, "brand": 0.20, "features": 0.15, "availability": 0.10}
        )
    }
    
    @classmethod
    def categorize_product(cls, prompt: str) -> Tuple[str, ProductCategory]:
        """Analyze prompt and return best matching category."""
        prompt_lower = prompt.lower()
        
        # Score each category based on keyword matches
        category_scores = {}
        for cat_name, category in cls.CATEGORIES.items():
            score = 0
            for keyword in category.keywords:
                if keyword in prompt_lower:
                    # Exact match gets higher score than partial
                    if keyword == prompt_lower.strip():
                        score += 10
                    else:
                        score += prompt_lower.count(keyword) * 2
            category_scores[cat_name] = score
        
        # Return category with highest score, fallback to 'general'
        if category_scores and max(category_scores.values()) > 0:
            best_category = max(category_scores, key=category_scores.get)
            return best_category, cls.CATEGORIES[best_category]
        
        # Default general category
        return "general", ProductCategory(
            name="general",
            keywords=[],
            specs_to_extract=["price", "brand", "features"],
            price_range=(0, 10000),
            search_sources=["amazon", "flipkart"],
            comparison_weights={"price": 0.40, "reviews": 0.30, "brand": 0.20, "features": 0.10}
        )
    
    @classmethod
    def extract_budget_from_prompt(cls, prompt: str) -> int:
        """Extract budget/price limit from natural language."""
        # Look for patterns like "under $500", "budget of 1000", "max $250"
        budget_patterns = [
            r'under\s*\$?(\d+)', r'below\s*\$?(\d+)', r'less than\s*\$?(\d+)',
            r'budget.*?\$?(\d+)', r'max.*?\$?(\d+)', r'maximum.*?\$?(\d+)',
            r'\$(\d+)\s*budget', r'\$(\d+)\s*max'
        ]
        
        for pattern in budget_patterns:
            match = re.search(pattern, prompt.lower())
            if match:
                return int(match.group(1))
        
        return 0  # No budget specified
    
    @classmethod
    def get_enhanced_search_keywords(cls, prompt: str, category: ProductCategory) -> List[str]:
        """Generate optimized search keywords based on category."""
        base_keywords = [prompt]
        
        # Add category-specific enhancements
        if category.name == "laptop":
            if "gaming" in prompt.lower():
                base_keywords.extend(["gaming laptop RTX", "high performance laptop"])
            if "work" in prompt.lower() or "office" in prompt.lower():
                base_keywords.extend(["business laptop", "productivity laptop"])
        
        elif category.name == "smartphone":
            if "camera" in prompt.lower():
                base_keywords.extend(["camera phone", "photography smartphone"])
            if "gaming" in prompt.lower():
                base_keywords.extend(["gaming phone", "high refresh rate phone"])
        
        # Add fallback generic searches
        base_keywords.extend([
            f"best {category.name} 2024",
            f"top rated {category.name}",
            f"{category.name} reviews"
        ])
        
        return base_keywords[:5]  # Limit to avoid too many searches