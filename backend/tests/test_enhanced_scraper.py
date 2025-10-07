# test_enhanced_scraper.py - Test enhanced scraper with detailed debugging
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from tools.enhanced_web_scraper import EnhancedWebScraper
import requests
from bs4 import BeautifulSoup

def test_enhanced_scraper_with_debug():
    """Test enhanced scraper with detailed debugging for URL extraction"""
    print("🔍 Testing Enhanced Amazon Scraper with Debug Info")
    print("=" * 60)
    
    # Create scraper instance for Amazon India
    scraper = EnhancedWebScraper(amazon_domain='amazon.in')
    
    # Test with a simple search
    query = "laptop"
    print(f"🔍 Searching for: {query}")
    
    try:
        # Let's manually test the search URL construction
        from urllib.parse import quote_plus
        import re
        
        clean_query = re.sub(r'[^\w\s-]', '', query).strip()
        encoded_query = quote_plus(clean_query)
        search_url = f"https://www.{scraper.amazon_domain}/s?k={encoded_query}&ref=sr_pg_1"
        
        print(f"🌐 Search URL: {search_url}")
        
        # Test the request
        response = scraper.session.get(search_url, timeout=15)
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find product containers with debug info
            print("\n🔍 Looking for product containers...")
            
            containers_1 = soup.find_all('div', {'data-component-type': 's-search-result'})
            containers_2 = soup.find_all('div', class_=re.compile(r's-result-item'))
            containers_3 = soup.find_all('div', {'data-asin': True})
            
            print(f"📦 Found containers:")
            print(f"   - data-component-type: {len(containers_1)}")
            print(f"   - s-result-item class: {len(containers_2)}")
            print(f"   - data-asin: {len(containers_3)}")
            
            # Use the first available container type
            product_containers = containers_1 or containers_2 or containers_3
            print(f"📦 Using {len(product_containers)} containers for extraction")
            
            if product_containers:
                # Test URL extraction on first few products
                for i, container in enumerate(product_containers[:3]):
                    print(f"\n📱 Product {i+1} Debug:")
                    
                    # Test all URL selectors
                    url_selectors = [
                        'h2 a',
                        'a[href*="/dp/"]',
                        'a[href*="/gp/product/"]',
                        '.s-link-style'
                    ]
                    
                    found_url = False
                    for selector in url_selectors:
                        url_elem = container.select_one(selector)
                        if url_elem and url_elem.get('href'):
                            href = url_elem.get('href')
                            print(f"   ✅ Selector '{selector}' found href: {href[:100]}...")
                            
                            # Construct full URL
                            if href.startswith('/'):
                                full_url = f"https://www.{scraper.amazon_domain}{href}"
                            elif href.startswith('http'):
                                full_url = href
                            else:
                                full_url = f"https://www.{scraper.amazon_domain}/{href}"
                            
                            # Clean URL
                            if '?' in full_url:
                                clean_url = full_url.split('?')[0]
                            else:
                                clean_url = full_url
                            
                            print(f"   🔗 Full URL: {clean_url}")
                            found_url = True
                            break
                    
                    if not found_url:
                        print(f"   ❌ No URL found for product {i+1}")
                        # Debug: print container HTML snippet
                        container_html = str(container)[:500]
                        print(f"   📄 Container HTML (first 500 chars): {container_html}...")
                
                # Now test the actual scraper function
                print(f"\n🚀 Testing actual scraper function:")
                products = scraper.search_amazon(query, max_results=3)
                
                print(f"✅ Scraper returned {len(products)} products")
                
                for i, product in enumerate(products, 1):
                    print(f"\n📱 Product {i}:")
                    print(f"   Name: {product.get('product_name', 'N/A')}")
                    print(f"   Price: {product.get('current_price', 'N/A')}")
                    print(f"   URL: {product.get('product_url', 'N/A')}")
                    print(f"   Image: {product.get('image_url', 'N/A')}")
                    print(f"   Source: {product.get('source', 'N/A')}")
                    
                    # Validate URL format
                    url = product.get('product_url', '')
                    if url and 'amazon.in' in url and '/dp/' in url:
                        print(f"   ✅ URL format is correct")
                    elif url:
                        print(f"   ⚠️  URL format might be incorrect")
                    else:
                        print(f"   ❌ No URL found")
            
            else:
                print("❌ No product containers found")
                # Debug: save page content for inspection
                with open('debug_amazon_page.html', 'w', encoding='utf-8') as f:
                    f.write(response.text)
                print("💾 Saved page content to debug_amazon_page.html for inspection")
        
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            print(f"📄 Response headers: {dict(response.headers)}")
    
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_enhanced_scraper_with_debug()