#!/usr/bin/env python3
"""
Test the enhanced web scraper integration with crew setup
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.crew_setup import web_scraper_tool
import json

def test_enhanced_integration():
    """Test the enhanced web scraper through crew setup"""
    print("🧪 Testing Enhanced Web Scraper Integration")
    print("=" * 50)
    
    # Test the web scraper tool
    test_query = "laptop"
    print(f"🔍 Testing query: '{test_query}'")
    
    try:
        # Call the enhanced web scraper function directly
        from tools.enhanced_web_scraper import search_both_platforms
        
        print(f"🔍 Testing query: '{test_query}' with enhanced scraper...")
        products = search_both_platforms(test_query, max_results=8)
        
        print(f"✅ Tool executed successfully!")
        print(f"📊 Found {len(products)} products")
        print("-" * 40)
        
        # Display first few products
        for i, product in enumerate(products[:3], 1):
            print(f"🛍️  Product {i}:")
            print(f"   Name: {product.get('product_name', 'N/A')[:60]}...")
            print(f"   Price: {product.get('current_price', 'N/A')}")
            print(f"   Source: {product.get('source', 'N/A')}")
            print(f"   URL: {product.get('product_url', 'N/A')}")
            
            # Check URL format for Amazon India
            url = product.get('product_url', '')
            if 'amazon.in' in url and '/dp/' in url:
                print(f"   ✅ Valid Amazon India URL format")
            elif 'amazon.in' in url:
                print(f"   ⚠️  Amazon India but not /dp/ format")
            elif 'flipkart.com' in url:
                print(f"   ✅ Valid Flipkart URL")
            else:
                print(f"   ❌ Unknown URL format")
            print()
        
        # Summary by source
        amazon_products = [p for p in products if p.get('source') == 'amazon']
        flipkart_products = [p for p in products if p.get('source') == 'flipkart']
        
        print("📈 SUMMARY:")
        print(f"   Amazon products: {len(amazon_products)}")
        print(f"   Flipkart products: {len(flipkart_products)}")
        print(f"   Total products: {len(products)}")
        
        # Check Amazon India URLs
        amazon_valid_urls = sum(1 for p in amazon_products if 'amazon.in' in p.get('product_url', '') and '/dp/' in p.get('product_url', ''))
        print(f"   Valid Amazon India URLs: {amazon_valid_urls}/{len(amazon_products)}")
        
        if amazon_valid_urls > 0:
            print("🎉 SUCCESS: Enhanced scraper is working with Amazon India URLs!")
        else:
            print("⚠️  Enhanced scraper working but check URL formats")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_enhanced_integration()