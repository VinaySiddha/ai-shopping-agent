#!/usr/bin/env python3
"""
Test script to verify that the price validation fix works correctly.
This tests the transform_product_fields function without running the full server.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the function to test
from main import transform_product_fields
from models import ProductResult

def test_price_conversion():
    """Test that numeric prices are properly converted to strings"""
    
    # Test case 1: Numeric price from Amazon
    test_product_amazon = {
        "name": "Test Product",
        "price": 1149,  # This was causing the validation error
        "source": "amazon",
        "source_url": "https://amazon.com/test"
    }
    
    # Transform the product data
    transformed = transform_product_fields(test_product_amazon)
    print(f"Amazon Test - Transformed price: {transformed['price']}")
    print(f"Amazon Test - Price numeric: {transformed.get('price_numeric')}")
    
    # Test that it can be validated by Pydantic
    try:
        product = ProductResult(**transformed)
        print("✅ Amazon test PASSED - ProductResult validation successful")
        print(f"   Product name: {product.name}")
        print(f"   Product price: {product.price}")
        print(f"   Product price_numeric: {product.price_numeric}")
    except Exception as e:
        print(f"❌ Amazon test FAILED - ProductResult validation error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test case 2: Numeric price from Flipkart
    test_product_flipkart = {
        "name": "Test Product Flipkart",
        "price": 2499,  
        "source": "flipkart",
        "source_url": "https://flipkart.com/test"
    }
    
    # Transform the product data
    transformed_flipkart = transform_product_fields(test_product_flipkart)
    print(f"Flipkart Test - Transformed price: {transformed_flipkart['price']}")
    print(f"Flipkart Test - Price numeric: {transformed_flipkart.get('price_numeric')}")
    
    # Test that it can be validated by Pydantic
    try:
        product = ProductResult(**transformed_flipkart)
        print("✅ Flipkart test PASSED - ProductResult validation successful")
        print(f"   Product name: {product.name}")
        print(f"   Product price: {product.price}")
        print(f"   Product price_numeric: {product.price_numeric}")
    except Exception as e:
        print(f"❌ Flipkart test FAILED - ProductResult validation error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test case 3: String price (should work too)
    test_product_string = {
        "name": "Test Product String Price",
        "price": "$99.99",  
        "source": "amazon",
        "source_url": "https://amazon.com/test2"
    }
    
    # Transform the product data
    transformed_string = transform_product_fields(test_product_string)
    print(f"String Price Test - Transformed price: {transformed_string['price']}")
    print(f"String Price Test - Price numeric: {transformed_string.get('price_numeric')}")
    
    # Test that it can be validated by Pydantic
    try:
        product = ProductResult(**transformed_string)
        print("✅ String price test PASSED - ProductResult validation successful")
        print(f"   Product name: {product.name}")
        print(f"   Product price: {product.price}")
        print(f"   Product price_numeric: {product.price_numeric}")
    except Exception as e:
        print(f"❌ String price test FAILED - ProductResult validation error: {e}")

if __name__ == "__main__":
    print("Testing Price Validation Fix")
    print("="*50)
    test_price_conversion()
    print("\nTest completed!")