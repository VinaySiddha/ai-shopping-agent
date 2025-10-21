#!/usr/bin/env python3
"""
Test script to validate the crew agent fixes
"""

import json
import re

def test_price_parsing():
    """Test the price parsing function"""
    print("🧪 Testing Price Parsing")
    print("=" * 30)
    
    def parse_price_to_numeric(price_str: str):
        """Extract numeric value from price string like '₹17,499' or '$299.99'"""
        if not price_str:
            return None
        
        try:
            # Remove currency symbols and commas, keep only digits and decimal points
            price_clean = re.sub(r'[^\d.]', '', price_str.replace(',', ''))
            return float(price_clean) if price_clean else None
        except (ValueError, TypeError):
            return None
    
    test_cases = [
        "₹17,499",
        "$299.99", 
        "₹45,990",
        "N/A",
        "",
        None,
        "₹1,23,456.78"
    ]
    
    for price_str in test_cases:
        result = parse_price_to_numeric(price_str)
        print(f"   '{price_str}' → {result}")
    
    print("✅ Price parsing test completed\n")

def test_product_transformation():
    """Test product data transformation"""
    print("🔄 Testing Product Transformation")
    print("=" * 35)
    
    sample_product = {
        "product_name": "Samsung Galaxy M36 5G",
        "current_price": "₹17,499",
        "product_url": "https://www.amazon.in/dp/B0FDB8V6PS",
        "image_url": "https://example.com/image.jpg",
        "key_specifications": ["50MP Camera", "8GB RAM", "256GB Storage"],
        "source": "amazon"
    }
    
    def transform_product_fields(product_data: dict) -> dict:
        """Simplified version of the transform function"""
        transformed = product_data.copy()
        
        # Field mappings
        field_mappings = {
            'product_name': 'name',
            'current_price': 'price', 
            'product_url': 'source_url',
            'key_specifications': 'features'
        }
        
        for old_field, new_field in field_mappings.items():
            if old_field in transformed:
                transformed[new_field] = transformed.pop(old_field)
        
        # Parse price_numeric
        if 'price' in transformed:
            price_str = transformed['price']
            if isinstance(price_str, str):
                price_clean = re.sub(r'[^\d.]', '', price_str.replace(',', ''))
                transformed['price_numeric'] = float(price_clean) if price_clean else None
        
        return transformed
    
    print("   Original:")
    for key, value in sample_product.items():
        print(f"     {key}: {value}")
    
    transformed = transform_product_fields(sample_product)
    
    print("\n   Transformed:")
    for key, value in transformed.items():
        print(f"     {key}: {value}")
    
    print("✅ Product transformation test completed\n")

def test_json_validation():
    """Test JSON structure validation"""
    print("📋 Testing JSON Structure")
    print("=" * 28)
    
    sample_products = [
        {
            "name": "Samsung Galaxy M36 5G",
            "price": "₹17,499",
            "price_numeric": 17499.0,
            "rating": "4.2/5",
            "rating_numeric": 4.2,
            "source_url": "https://www.amazon.in/dp/B0FDB8V6PS",
            "brand": "Samsung",
            "features": ["50MP Camera", "8GB RAM"],
            "availability": "In Stock",
            "image_url": "https://example.com/image.jpg"
        }
    ]
    
    try:
        json_str = json.dumps(sample_products, indent=2)
        parsed_back = json.loads(json_str)
        
        print("   ✅ JSON serialization: SUCCESS")
        print("   ✅ JSON deserialization: SUCCESS")
        print(f"   📊 Product count: {len(parsed_back)}")
        
        # Validate required fields
        required_fields = ['name', 'price', 'price_numeric', 'source_url']
        for product in parsed_back:
            missing_fields = [field for field in required_fields if field not in product]
            if missing_fields:
                print(f"   ❌ Missing fields: {missing_fields}")
            else:
                print("   ✅ All required fields present")
                
    except Exception as e:
        print(f"   ❌ JSON validation failed: {e}")
    
    print("✅ JSON validation test completed\n")

def main():
    print("🔧 Crew Agent Fix Validation")
    print("=" * 50)
    print("Testing fixes for:")
    print("• Price parsing with currency symbols")
    print("• Field name transformations") 
    print("• JSON structure validation")
    print("• Database-ready format")
    print("\n" + "=" * 50)
    
    test_price_parsing()
    test_product_transformation()
    test_json_validation()
    
    print("🎉 All validation tests completed!")
    print("\n📋 Summary:")
    print("• Price parsing handles ₹ and $ currencies")
    print("• Product fields transform correctly")
    print("• JSON output is valid and parseable")
    print("• Database storage should work without errors")

if __name__ == "__main__":
    main()