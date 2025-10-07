#!/usr/bin/env python3
"""
Final test for Amazon India URL extraction with prioritized logic
"""

from tools.enhanced_web_scraper import EnhancedWebScraper

def test_amazon_india_final():
    """Test Amazon India URL extraction with the fixed prioritization logic"""
    print("🔍 Testing Amazon India URL extraction (FINAL TEST)")
    print("=" * 50)
    
    scraper = EnhancedWebScraper()
    
    # Test with a real search query
    search_query = "laptop"
    results = scraper.search_amazon(search_query, max_results=5)
    
    print(f"✅ Search results for '{search_query}' on Amazon India:")
    print(f"📊 Found {len(results)} products")
    print("-" * 50)
    
    for i, product in enumerate(results[:5], 1):
        print(f"🛍️  Product {i}:")
        print(f"   Title: {product.get('title', 'N/A')[:60]}...")
        print(f"   Price: {product.get('price', 'N/A')}")
        print(f"   URL: {product.get('product_url', 'N/A')}")
        
        # Verify URL format
        url = product.get('product_url', '')
        if url:
            if 'amazon.in' in url and '/dp/' in url:
                print(f"   ✅ Valid Amazon India URL format")
            elif 'amazon.in' in url:
                print(f"   ⚠️  Amazon India but not /dp/ format")
            else:
                print(f"   ❌ Invalid URL format")
        else:
            print(f"   ❌ No URL found")
        print()
    
    # Summary
    valid_urls = sum(1 for p in results if p.get('product_url', '').startswith('https://www.amazon.in/') and '/dp/' in p.get('product_url', ''))
    total_urls = sum(1 for p in results if p.get('product_url'))
    
    print("📈 SUMMARY:")
    print(f"   Total products with URLs: {total_urls}/{len(results)}")
    print(f"   Valid Amazon India /dp/ URLs: {valid_urls}/{len(results)}")
    print(f"   Success rate: {(valid_urls/len(results)*100):.1f}%" if results else "0%")
    
    if valid_urls > 0:
        print("🎉 SUCCESS: Amazon India URLs are working!")
    else:
        print("❌ ISSUE: No valid Amazon India URLs found")

if __name__ == "__main__":
    test_amazon_india_final()