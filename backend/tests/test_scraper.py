#!/usr/bin/env python3
# Test script to verify web scraper functionality

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.web_scraper import scrape_ecommerce_site
import json

def test_scraper():
    print("🔍 Testing Amazon and Flipkart scraper...")
    
    try:
        # Test with a simple product search
        keyword = "gaming mouse"
        print(f"Searching for: {keyword}")
        
        # Test both sources
        results = scrape_ecommerce_site(keyword, num_results=3, source="both")
        
        print(f"✅ Found {len(results)} products total")
        
        # Group by source
        amazon_count = len([r for r in results if r.get('source') == 'Amazon'])
        flipkart_count = len([r for r in results if r.get('source') == 'Flipkart'])
        
        print(f"📦 Amazon: {amazon_count} products")
        print(f"🛒 Flipkart: {flipkart_count} products")
        
        # Show sample results
        for i, product in enumerate(results[:2]):
            print(f"\n📱 Product {i+1}:")
            print(f"   Name: {product.get('name', 'N/A')}")
            print(f"   Price: {product.get('current_price', 'N/A')}")
            print(f"   Source: {product.get('source', 'N/A')}")
            print(f"   URL: {product.get('product_url', 'N/A')[:50]}...")
            
        return True
        
    except Exception as e:
        print(f"❌ Scraper test failed: {e}")
        return False

if __name__ == "__main__":
    test_scraper()