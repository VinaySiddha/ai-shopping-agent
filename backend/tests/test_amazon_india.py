# test_amazon_india.py - Test Amazon India URL scraping
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from tools.enhanced_web_scraper import search_amazon_india, search_both_platforms

def test_amazon_india():
    """Test Amazon India URL scraping"""
    print("🇮🇳 Testing Amazon India scraping...")
    
    # Test search term
    query = "gaming keyboard"
    
    try:
        # Test Amazon India specifically
        print(f"\n🔍 Searching Amazon India for: {query}")
        results = search_amazon_india(query, max_results=3)
        
        print(f"✅ Found {len(results)} products from Amazon India")
        
        for i, product in enumerate(results, 1):
            print(f"\n📱 Product {i}:")
            print(f"   Name: {product.get('product_name', 'N/A')}")
            print(f"   Price: {product.get('current_price', 'N/A')}")
            print(f"   URL: {product.get('product_url', 'N/A')}")
            print(f"   Source: {product.get('source', 'N/A')}")
            
            # Verify URL format
            url = product.get('product_url', '')
            if 'amazon.in' in url and '/dp/' in url:
                print(f"   ✅ Correct Amazon India URL format")
            else:
                print(f"   ❌ Incorrect URL format")
        
        # Test both platforms with Amazon India
        print(f"\n🔍 Testing both platforms (Amazon India + Flipkart)...")
        combined_results = search_both_platforms(query, max_results=4, amazon_domain='amazon.in')
        
        amazon_count = len([r for r in combined_results if r.get('source') == 'amazon'])
        flipkart_count = len([r for r in combined_results if r.get('source') == 'flipkart'])
        
        print(f"📦 Amazon India: {amazon_count} products")
        print(f"🛒 Flipkart: {flipkart_count} products")
        print(f"📊 Total: {len(combined_results)} products")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")

if __name__ == "__main__":
    test_amazon_india()