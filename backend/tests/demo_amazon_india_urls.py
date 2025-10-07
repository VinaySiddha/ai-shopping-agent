# demo_amazon_india_urls.py - Demonstrate Amazon India URL format
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from tools.enhanced_web_scraper import EnhancedWebScraper

def demo_url_format():
    """Demonstrate the Amazon India URL format"""
    print("🇮🇳 Amazon India URL Format Demo")
    print("=" * 50)
    
    # Create scraper instances
    india_scraper = EnhancedWebScraper(amazon_domain='amazon.in')
    us_scraper = EnhancedWebScraper(amazon_domain='amazon.com')
    
    # Mock product data to show URL format
    sample_href = "/Razer-Cynosa-Gaming-Keyboard-Spill-Resistant/dp/B086PBD1BV"
    
    # Simulate URL construction
    india_url = f"https://www.{india_scraper.amazon_domain}{sample_href}"
    us_url = f"https://www.{us_scraper.amazon_domain}{sample_href}"
    
    print("\n📝 URL Construction Examples:")
    print(f"Input href: {sample_href}")
    print(f"Amazon India URL: {india_url}")
    print(f"Amazon US URL: {us_url}")
    
    print("\n✅ Features implemented:")
    print("• Configurable Amazon domain (amazon.in or amazon.com)")
    print("• Indian Rupee (₹) price formatting for Amazon India")
    print("• US Dollar ($) price formatting for Amazon US")
    print("• Clean URL construction without ref parameters")
    print("• Backwards compatibility with existing code")
    
    print("\n🔧 Usage Examples:")
    print("from tools.enhanced_web_scraper import search_amazon_india, search_amazon_us")
    print("# Search Amazon India")
    print("india_results = search_amazon_india('gaming keyboard', max_results=5)")
    print("# Search Amazon US")
    print("us_results = search_amazon_us('gaming keyboard', max_results=5)")
    
    print("\n📋 Expected URL format for your requirement:")
    print("✅ https://www.amazon.in/Razer-Cynosa-Gaming-Keyboard-Spill-Resistant/dp/B086PBD1BV")
    
    # Mock a sample product result to show the format
    sample_product = {
        'source': 'amazon',
        'product_name': 'Razer Cynosa Gaming Keyboard',
        'current_price': '₹3,999',
        'image_url': 'https://example.com/image.jpg',
        'product_url': 'https://www.amazon.in/Razer-Cynosa-Gaming-Keyboard-Spill-Resistant/dp/B086PBD1BV',
        'key_specifications': ['RGB Backlight', 'Spill Resistant', 'Gaming Grade'],
        'summary': 'Gaming keyboard with RGB lighting and spill resistance',
        'brand': 'Razer'
    }
    
    print("\n📱 Sample Product Result Format:")
    for key, value in sample_product.items():
        print(f"   {key}: {value}")

if __name__ == "__main__":
    demo_url_format()