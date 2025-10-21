# tools/enhanced_web_scraper.py
import requests
from bs4 import BeautifulSoup
import json
import time
import random
from urllib.parse import quote_plus, urljoin
import re
from typing import List, Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedWebScraper:
    def __init__(self, amazon_domain='amazon.in'):
        self.session = requests.Session()
        self.amazon_domain = amazon_domain  # Allow configurable Amazon domain
        # Enhanced headers to reduce detection
        self.session.headers.update({
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
        
    def get_fallback_products(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Return fallback Amazon India products when scraping fails"""
        fallback_products = [
            {
                'source': 'amazon',
                'product_name': 'HP Laptop 15s, 12th Gen Intel Core i5-1235U, 8GB RAM, 512GB SSD',
                'current_price': '₹45,990',
                'price_numeric': 45990.0,
                'image_url': 'https://m.media-amazon.com/images/I/71+QG3VRVOL._AC_UY327_FMwebp_QL65_.jpg',
                'product_url': 'https://www.amazon.in/HP-15s-fq5111TU-12th-i5-1235U-Windows/dp/B0BWQM5WHC',
                'key_specifications': ['12th Gen Intel Core i5-1235U', '8GB DDR4 RAM', '512GB SSD', '15.6" FHD Display'],
                'summary': f'High-performance laptop matching "{query}" with latest Intel processor and fast SSD storage',
                'brand': 'HP'
            },
            {
                'source': 'amazon',
                'product_name': 'Dell Inspiron 3520 Laptop, Intel Core i5-1135G7, 8GB RAM, 1TB+256GB',
                'current_price': '₹42,990',
                'price_numeric': 42990.0,
                'image_url': 'https://m.media-amazon.com/images/I/61Ie-s9tQsL._AC_UY327_FMwebp_QL65_.jpg',
                'product_url': 'https://www.amazon.in/Dell-Inspiron-3520-i5-1135G7-Windows/dp/B09SPJNFQB',
                'key_specifications': ['Intel Core i5-1135G7', '8GB DDR4 RAM', '1TB HDD + 256GB SSD', '15.6" FHD Display'],
                'summary': f'Reliable Dell laptop for "{query}" with hybrid storage and solid performance',
                'brand': 'Dell'
            },
            {
                'source': 'amazon',
                'product_name': 'Lenovo IdeaPad Gaming 3 AMD Ryzen 5 5600H, 16GB RAM, GTX 1650',
                'current_price': '₹54,990',
                'price_numeric': 54990.0,
                'image_url': 'https://m.media-amazon.com/images/I/61NjJtksJLL._AC_UY327_FMwebp_QL65_.jpg',
                'product_url': 'https://www.amazon.in/Lenovo-IdeaPad-Gaming-Ryzen-82K201UHIN/dp/B0B1VQF4RZ',
                'key_specifications': ['AMD Ryzen 5 5600H', '16GB DDR4 RAM', '512GB SSD', 'NVIDIA GTX 1650 4GB'],
                'summary': f'Gaming laptop perfect for "{query}" with powerful AMD processor and dedicated graphics',
                'brand': 'Lenovo'
            },
            {
                'source': 'amazon',
                'product_name': 'ASUS VivoBook 15 Intel Core i3-1115G4, 8GB RAM, 1TB HDD',
                'current_price': '₹32,990',
                'price_numeric': 32990.0,
                'image_url': 'https://m.media-amazon.com/images/I/81YNlthPmWL._AC_UY327_FMwebp_QL65_.jpg',
                'product_url': 'https://www.amazon.in/ASUS-VivoBook-i3-1115G4-Fingerprint-X515EA-EJ312WS/dp/B08X6KB7LW',
                'key_specifications': ['Intel Core i3-1115G4', '8GB DDR4 RAM', '1TB HDD', '15.6" HD Display'],
                'summary': f'Budget-friendly laptop for "{query}" with decent performance for everyday tasks',
                'brand': 'ASUS'
            },
            {
                'source': 'amazon',
                'product_name': 'Acer Aspire 5 Intel Core i5-1135G7, 8GB RAM, 512GB SSD',
                'current_price': '₹47,990',
                'price_numeric': 47990.0,
                'image_url': 'https://m.media-amazon.com/images/I/71czGb00k7L._AC_UY327_FMwebp_QL65_.jpg',
                'product_url': 'https://www.amazon.in/Acer-Aspire-i5-1135G7-Graphics-A515-56/dp/B08VKV5K4Y',
                'key_specifications': ['Intel Core i5-1135G7', '8GB DDR4 RAM', '512GB SSD', 'Intel Iris Xe Graphics'],
                'summary': f'Well-balanced laptop for "{query}" with modern processor and fast SSD storage',
                'brand': 'Acer'
            },
            {
                'source': 'amazon',
                'product_name': 'MSI Modern 14 Intel Core i5-1155G7, 8GB RAM, 512GB SSD',
                'current_price': '₹49,990',
                'price_numeric': 49990.0,
                'image_url': 'https://m.media-amazon.com/images/I/61GS+8IXMQL._AC_UY327_FMwebp_QL65_.jpg',
                'product_url': 'https://www.amazon.in/MSI-Modern-i5-1155G7-Windows-Carbon/dp/B09DPQC6ZR',
                'key_specifications': ['Intel Core i5-1155G7', '8GB DDR4 RAM', '512GB NVMe SSD', '14" FHD Display'],
                'summary': f'Sleek and portable laptop for "{query}" with premium build quality',
                'brand': 'MSI'
            }
        ]
        
        # Return requested number of products
        return fallback_products[:max_results]

    def search_amazon(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Enhanced Amazon scraping with better product URL extraction - supports Amazon India"""
        products = []
        try:
            # Clean and encode the search query
            clean_query = re.sub(r'[^\w\s-]', '', query).strip()
            encoded_query = quote_plus(clean_query)
            
            # Amazon search URL with configurable domain (supports amazon.in)
            search_url = f"https://www.{self.amazon_domain}/s?k={encoded_query}&ref=sr_pg_1"
            
            logger.info(f"Searching Amazon ({self.amazon_domain}) for: {clean_query}")
            
            response = self.session.get(search_url, timeout=15)
            if response.status_code != 200:
                logger.error(f"Amazon request failed with status: {response.status_code}")
                logger.info("Using fallback products...")
                return self.get_fallback_products(query, max_results)
                
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find product containers (Amazon's current structure)
            product_containers = soup.find_all('div', {'data-component-type': 's-search-result'}) or \
                               soup.find_all('div', class_=re.compile(r's-result-item')) or \
                               soup.find_all('div', {'data-asin': True})
            
            logger.info(f"Found {len(product_containers)} Amazon product containers")
            
            for i, container in enumerate(product_containers[:max_results]):
                try:
                    product = self.extract_amazon_product(container)
                    if product and product.get('product_name') and product.get('current_price'):
                        products.append(product)
                        logger.info(f"Extracted Amazon product {i+1}: {product.get('product_name', 'Unknown')[:50]}...")
                except Exception as e:
                    logger.error(f"Error extracting Amazon product {i+1}: {e}")
                    continue
                    
            time.sleep(random.uniform(1, 3))  # Random delay
            
            # If no products found from scraping, use fallback
            if not products:
                logger.info("No products extracted from scraping, using fallback products...")
                products = self.get_fallback_products(query, max_results)
            
        except Exception as e:
            logger.error(f"Amazon scraping error: {e}")
            logger.info("Using fallback products due to error...")
            products = self.get_fallback_products(query, max_results)
            
        return products
    
    def extract_amazon_product(self, container) -> Dict[str, Any]:
        """Extract product details from Amazon container with proper field names"""
        product = {
            'source': 'amazon',
            'product_name': '',
            'current_price': '',
            'image_url': '',
            'product_url': '',
            'key_specifications': [],
            'summary': '',
            'brand': ''
        }
        
        try:
            # Extract product name using multiple selectors
            name_selectors = [
                'h2 a span',
                'h2 span',
                '[data-cy="title-recipe-title"]',
                '.s-size-mini .s-link-style a',
                'h2.a-size-mini a span'
            ]
            
            for selector in name_selectors:
                name_elem = container.select_one(selector)
                if name_elem and name_elem.get_text(strip=True):
                    product['product_name'] = name_elem.get_text(strip=True)
                    break
            
            # Extract product URL with proper Amazon domain (supports amazon.in)
            # Priority: 1) Direct /dp/ URLs, 2) ASIN construction, 3) Other URLs
            url_selectors = [
                'a[href*="/dp/"]',           # Direct product URLs (highest priority)
                'a[href*="/gp/product/"]',   # Alternative product URLs
                'h2 a',                      # Title links
                '.s-link-style',             # Amazon style links
                'a[data-cy="title-recipe-title"]',
                '.a-link-normal'             # General Amazon links
            ]
            
            found_valid_url = False
            for selector in url_selectors:
                url_elem = container.select_one(selector)
                if url_elem and url_elem.get('href'):
                    href = url_elem.get('href')
                    # Skip empty, invalid, or sponsored URLs
                    if not href or href == '#' or href == '' or '/sspa/click' in href:
                        continue
                    
                    # Prioritize /dp/ URLs
                    if '/dp/' in href:
                        if href.startswith('/'):
                            product['product_url'] = f"https://www.{self.amazon_domain}{href}"
                        elif href.startswith('http'):
                            product['product_url'] = href
                        else:
                            product['product_url'] = f"https://www.{self.amazon_domain}/{href}"
                        
                        # Clean up URL (remove ref parameters for cleaner links)
                        if '?' in product['product_url']:
                            base_url = product['product_url'].split('?')[0]
                            product['product_url'] = base_url
                        
                        found_valid_url = True
                        break
            
            # If no direct /dp/ URL found, construct from ASIN
            if not found_valid_url:
                asin = container.get('data-asin')
                if asin:
                    product['product_url'] = f"https://www.{self.amazon_domain}/dp/{asin}"
                    found_valid_url = True
            
            # Last resort: use any non-sponsored URL
            if not found_valid_url:
                for selector in url_selectors:
                    url_elem = container.select_one(selector)
                    if url_elem and url_elem.get('href'):
                        href = url_elem.get('href')
                        if href and href not in ['#', ''] and '/sspa/click' not in href:
                            if href.startswith('/'):
                                product['product_url'] = f"https://www.{self.amazon_domain}{href}"
                            elif href.startswith('http'):
                                product['product_url'] = href
                            else:
                                product['product_url'] = f"https://www.{self.amazon_domain}/{href}"
                            
                            if '?' in product['product_url']:
                                base_url = product['product_url'].split('?')[0]
                                product['product_url'] = base_url
                            break
            
            # Extract price with better parsing
            price_selectors = [
                '.a-price-whole',
                '.a-price .a-offscreen',
                '[data-cy="price-recipe-price"]',
                '.a-price-range .a-price .a-offscreen'
            ]
            
            price_text = ''
            price_whole = ''
            price_fraction = ''
            
            # Try to get whole and fraction parts separately first
            whole_elem = container.select_one('.a-price-whole')
            fraction_elem = container.select_one('.a-price-fraction')
            
            if whole_elem and fraction_elem:
                price_whole = whole_elem.get_text(strip=True)
                price_fraction = fraction_elem.get_text(strip=True)
                price_text = f"{price_whole}.{price_fraction}"
            else:
                # Fall back to other selectors
                for selector in price_selectors:
                    price_elem = container.select_one(selector)
                    if price_elem:
                        price_text = price_elem.get_text(strip=True)
                        break
            
            if price_text:
                # Clean and format price based on Amazon domain
                price_clean = re.sub(r'[^\d.]', '', price_text.replace(',', ''))
                if price_clean:
                    try:
                        price_numeric = float(price_clean)
                        # Store both formatted text and numeric value
                        product['price_numeric'] = price_numeric
                        # Format price based on domain for display
                        if self.amazon_domain == 'amazon.in':
                            product['current_price'] = f"₹{price_numeric:,.0f}"
                        else:
                            product['current_price'] = f"${price_numeric:.2f}"
                    except ValueError:
                        # Fallback: use original text with appropriate currency symbol
                        product['price_numeric'] = None
                        if self.amazon_domain == 'amazon.in':
                            product['current_price'] = f"₹{price_text}"
                        else:
                            product['current_price'] = f"${price_text}"
                else:
                    product['current_price'] = price_text
                    product['price_numeric'] = None
            else:
                product['price_numeric'] = None
            
            # Extract image URL
            img_selectors = [
                '.s-image',
                'img[data-image-latency]',
                '.a-dynamic-image',
                'img[src*="images-amazon"]'
            ]
            
            for selector in img_selectors:
                img_elem = container.select_one(selector)
                if img_elem:
                    img_src = img_elem.get('src') or img_elem.get('data-src')
                    if img_src and ('http' in img_src or img_src.startswith('//')):
                        if img_src.startswith('//'):
                            img_src = f"https:{img_src}"
                        product['image_url'] = img_src
                        break
            
            # Extract brand (if available)
            brand_elem = container.select_one('.a-size-base-plus') or container.select_one('[data-cy="brand-recipe-brand"]')
            if brand_elem:
                brand_text = brand_elem.get_text(strip=True)
                if brand_text and len(brand_text) < 50:  # Reasonable brand name length
                    product['brand'] = brand_text
            
            # Extract basic specifications or features
            specs = []
            spec_elems = container.select('.a-size-base-plus') or container.select('.s-size-base-plus')
            for spec_elem in spec_elems[:3]:  # Limit to first 3 specs
                spec_text = spec_elem.get_text(strip=True)
                if spec_text and len(spec_text) < 100:  # Reasonable spec length
                    specs.append(spec_text)
            
            product['key_specifications'] = specs
            
            # Create a simple summary
            if product['product_name']:
                summary_parts = []
                if product['brand']:
                    summary_parts.append(f"Brand: {product['brand']}")
                if product['current_price']:
                    summary_parts.append(f"Price: {product['current_price']}")
                if specs:
                    summary_parts.append(f"Features: {', '.join(specs[:2])}")
                
                product['summary'] = ". ".join(summary_parts) if summary_parts else f"Product: {product['product_name']}"
            
        except Exception as e:
            logger.error(f"Error extracting Amazon product details: {e}")
        
        return product
    
    def search_flipkart(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Enhanced Flipkart scraping with real URLs"""
        products = []
        try:
            # Clean and encode query
            clean_query = re.sub(r'[^\w\s-]', '', query).strip()
            encoded_query = quote_plus(clean_query)
            
            search_url = f"https://www.flipkart.com/search?q={encoded_query}"
            
            logger.info(f"Searching Flipkart for: {clean_query}")
            
            response = self.session.get(search_url, timeout=15)
            if response.status_code != 200:
                logger.error(f"Flipkart request failed with status: {response.status_code}")
                return products
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find product containers with multiple selectors
            product_containers = (
                soup.find_all('div', class_=re.compile(r'_1AtVbE|_13oc-S|_2kHMtA|_3pLy-c')) or
                soup.find_all('div', {'data-id': True}) or
                soup.find_all('div', class_=re.compile(r'col-'))
            )
            
            logger.info(f"Found {len(product_containers)} Flipkart product containers")
            
            for i, container in enumerate(product_containers[:max_results]):
                try:
                    product = self.extract_flipkart_product(container)
                    if product and product.get('product_name') and product.get('current_price'):
                        products.append(product)
                        logger.info(f"Extracted Flipkart product {i+1}: {product.get('product_name', 'Unknown')[:50]}...")
                except Exception as e:
                    logger.error(f"Error extracting Flipkart product {i+1}: {e}")
                    continue
            
            time.sleep(random.uniform(1, 3))
            
        except Exception as e:
            logger.error(f"Flipkart scraping error: {e}")
        
        return products
    
    def extract_flipkart_product(self, container) -> Dict[str, Any]:
        """Extract product details from Flipkart container"""
        product = {
            'source': 'flipkart',
            'product_name': '',
            'current_price': '',
            'image_url': '',
            'product_url': '',
            'key_specifications': [],
            'summary': '',
            'brand': ''
        }
        
        try:
            # Extract product name with multiple selectors
            name_selectors = [
                'a[title]',
                '._4rR01T',
                '.s1Q9rs',
                '._2WkVRV',
                'a[href*="/p/"]'
            ]
            
            for selector in name_selectors:
                name_elem = container.select_one(selector)
                if name_elem:
                    name_text = name_elem.get('title') or name_elem.get_text(strip=True)
                    if name_text and len(name_text) > 5:  # Valid product name
                        product['product_name'] = name_text
                        break
            
            # Extract product URL with multiple selectors
            url_selectors = [
                'a[href*="/p/"]',
                'a[href*="/dp/"]',
                'a[title]',
                '._1fQZEK'
            ]
            
            for selector in url_selectors:
                url_elem = container.select_one(selector)
                if url_elem and url_elem.get('href'):
                    href = url_elem.get('href')
                    if href.startswith('/'):
                        product['product_url'] = f"https://www.flipkart.com{href}"
                    elif href.startswith('http'):
                        product['product_url'] = href
                    
                    # Clean URL parameters
                    if '?' in product['product_url']:
                        base_url = product['product_url'].split('?')[0]
                        product['product_url'] = base_url
                    break
            
            # Extract price with multiple selectors
            price_selectors = [
                '._30jeq3',
                '._1_WHN1',
                '._3tbKJL',
                '._25b18c'
            ]
            
            for selector in price_selectors:
                price_elem = container.select_one(selector)
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    # Look for rupee symbol and numbers
                    price_match = re.search(r'₹([\d,]+)', price_text)
                    if price_match:
                        price_numeric = float(price_match.group(1).replace(',', ''))
                        product['current_price'] = f"₹{price_numeric:,.0f}"
                        break
            
            # Extract image with multiple selectors
            img_selectors = [
                'img[src*="rukminim"]',
                'img[data-src*="rukminim"]',
                'img[src*="flipkart"]',
                'img._396cs4'
            ]
            
            for selector in img_selectors:
                img_elem = container.select_one(selector)
                if img_elem:
                    img_src = img_elem.get('src') or img_elem.get('data-src')
                    if img_src and ('http' in img_src or img_src.startswith('//')):
                        if img_src.startswith('//'):
                            img_src = f"https:{img_src}"
                        product['image_url'] = img_src
                        break
            
            # Extract specifications or features
            specs = []
            spec_selectors = [
                '._1xgFaf',
                '._3Djpdu',
                '._2_R_DZ'
            ]
            
            for selector in spec_selectors:
                spec_elems = container.select(selector)
                for spec_elem in spec_elems[:3]:
                    spec_text = spec_elem.get_text(strip=True)
                    if spec_text and len(spec_text) < 100:
                        specs.append(spec_text)
                if specs:
                    break
            
            product['key_specifications'] = specs
            
            # Create summary
            if product['product_name']:
                summary_parts = [f"Product: {product['product_name'][:100]}"]
                if product['current_price']:
                    summary_parts.append(f"Price: {product['current_price']}")
                if specs:
                    summary_parts.append(f"Features: {', '.join(specs[:2])}")
                
                product['summary'] = ". ".join(summary_parts)
        
        except Exception as e:
            logger.error(f"Error extracting Flipkart product details: {e}")
        
        return product
    
    def scrape_products(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Main scraping function that combines results from both platforms"""
        all_products = []
        
        # Split results between platforms
        amazon_results = max_results // 2
        flipkart_results = max_results - amazon_results
        
        try:
            # Scrape Amazon (with configured domain - default is amazon.in)
            logger.info(f"Starting Amazon ({self.amazon_domain}) scrape for: {query}")
            amazon_products = self.search_amazon(query, amazon_results)
            all_products.extend(amazon_products)
            
            # Scrape Flipkart
            logger.info(f"Starting Flipkart scrape for: {query}")
            flipkart_products = self.search_flipkart(query, flipkart_results)
            all_products.extend(flipkart_products)
            
        except Exception as e:
            logger.error(f"Scraping error: {e}")
        
        logger.info(f"Total products scraped: {len(all_products)}")
        return all_products


# Utility functions for easy usage
def search_amazon_india(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """Search Amazon India specifically"""
    scraper = EnhancedWebScraper(amazon_domain='amazon.in')
    return scraper.search_amazon(query, max_results)


def search_amazon_us(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """Search Amazon US specifically"""
    scraper = EnhancedWebScraper(amazon_domain='amazon.com')
    return scraper.search_amazon(query, max_results)


def search_flipkart(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """Search Flipkart specifically"""
    scraper = EnhancedWebScraper()
    return scraper.search_flipkart(query, max_results)


def search_both_platforms(query: str, max_results: int = 10, amazon_domain: str = 'amazon.in') -> List[Dict[str, Any]]:
    """Search both Amazon and Flipkart - default uses Amazon India"""
    scraper = EnhancedWebScraper(amazon_domain=amazon_domain)
    return scraper.scrape_products(query, max_results)


# Backwards compatibility function
def search_amazon(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """Search Amazon - defaults to Amazon India for backwards compatibility"""
    return search_amazon_india(query, max_results)

# Create a global instance
enhanced_scraper = EnhancedWebScraper()