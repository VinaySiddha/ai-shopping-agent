# debug_url_extraction.py - Deep debugging of URL extraction
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import quote_plus

def debug_amazon_url_extraction():
    """Debug Amazon URL extraction step by step"""
    print("🔍 DEEP DEBUG: Amazon URL Extraction")
    print("=" * 60)
    
    # Create session with better headers
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate', 
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'max-age=0'
    })
    
    query = "laptop"
    clean_query = re.sub(r'[^\w\s-]', '', query).strip()
    encoded_query = quote_plus(clean_query)
    search_url = f"https://www.amazon.in/s?k={encoded_query}&ref=sr_pg_1"
    
    print(f"🌐 URL: {search_url}")
    
    try:
        response = session.get(search_url, timeout=15)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find all possible product containers
            print(f"\n🔍 Looking for product containers...")
            
            containers_1 = soup.find_all('div', {'data-component-type': 's-search-result'})
            containers_2 = soup.find_all('div', class_=re.compile(r's-result-item'))
            containers_3 = soup.find_all('div', {'data-asin': True})
            
            print(f"📦 Container counts:")
            print(f"   - data-component-type='s-search-result': {len(containers_1)}")
            print(f"   - class contains 's-result-item': {len(containers_2)}")
            print(f"   - has data-asin: {len(containers_3)}")
            
            # Use the first available type
            product_containers = containers_1 or containers_2 or containers_3
            
            if product_containers:
                print(f"\n📱 Analyzing first 3 containers for URL extraction...")
                
                for i, container in enumerate(product_containers[:3]):
                    print(f"\n--- Container {i+1} ---")
                    
                    # Check for ASIN first
                    asin = container.get('data-asin')
                    print(f"ASIN: {asin}")
                    
                    # Test all possible URL selectors
                    url_selectors = [
                        'h2 a',
                        'a[href*="/dp/"]',
                        'a[href*="/gp/product/"]',
                        '.s-link-style',
                        'a[data-cy="title-recipe-title"]',
                        '.a-link-normal',
                        'a.a-link-normal',
                        '[data-cy="title-recipe-title"] a'
                    ]
                    
                    found_urls = []
                    
                    for selector in url_selectors:
                        elements = container.select(selector)
                        for elem in elements[:2]:  # Check first 2 matches
                            href = elem.get('href', '')
                            if href and href not in ['#', '', '/']:
                                found_urls.append((selector, href))
                    
                    print(f"Found URLs:")
                    for selector, href in found_urls:
                        if len(href) > 100:
                            href_display = href[:100] + "..."
                        else:
                            href_display = href
                        print(f"   {selector}: {href_display}")
                        
                        # Construct full URL
                        if href.startswith('/'):
                            full_url = f"https://www.amazon.in{href}"
                        elif href.startswith('http'):
                            full_url = href
                        else:
                            full_url = f"https://www.amazon.in/{href}"
                        
                        # Clean URL
                        if '?' in full_url:
                            clean_url = full_url.split('?')[0]
                        else:
                            clean_url = full_url
                        
                        print(f"      → Full URL: {clean_url}")
                        
                        # Check if it's a valid product URL
                        if '/dp/' in clean_url:
                            print(f"      ✅ Valid product URL with /dp/")
                        elif '/sspa/' in clean_url:
                            print(f"      ⚠️  Sponsored product URL")
                        else:
                            print(f"      ❌ Not a direct product URL")
                    
                    # If no good URLs found, try ASIN construction
                    if not any('/dp/' in url[1] for url in found_urls) and asin:
                        constructed_url = f"https://www.amazon.in/dp/{asin}"
                        print(f"   ASIN construction: {constructed_url}")
                        print(f"      ✅ Valid product URL constructed from ASIN")
                    
                    if not found_urls and not asin:
                        print(f"   ❌ No URLs or ASIN found")
                        # Debug: show a snippet of the container HTML
                        container_snippet = str(container)[:500]
                        print(f"   Container HTML snippet: {container_snippet}...")
            
            else:
                print("❌ No product containers found")
                
                # Save full page for manual inspection
                with open('debug_amazon_full_page.html', 'w', encoding='utf-8') as f:
                    f.write(str(soup))
                print("💾 Saved full page to debug_amazon_full_page.html")
                
                # Show page title and any error messages
                title = soup.find('title')
                if title:
                    print(f"📄 Page title: {title.get_text()}")
                
                # Look for any obvious containers we might have missed
                all_divs = soup.find_all('div', limit=10)
                print(f"📦 Found {len(all_divs)} div elements (showing first 10 classes):")
                for div in all_divs[:10]:
                    classes = div.get('class', [])
                    if classes:
                        print(f"   - {' '.join(classes[:3])}")
        
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_amazon_url_extraction()