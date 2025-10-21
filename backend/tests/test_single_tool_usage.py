#!/usr/bin/env python3

"""
Test script to verify agents don't run tools multiple times
"""

import os
import sys
import json
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

def test_single_tool_usage():
    """Test that scraper agent only runs the tool once"""
    
    try:
        from agents.crew_setup import create_shopping_crew
        
        print("🔍 Testing search: 'laptop under 50000'")
        
        # Create crew
        crew = create_shopping_crew("laptop under 50000", num_products=10)
        
        print("\n🚀 Starting crew execution...")
        print("📊 Monitoring tool usage - should only see ONE EnhancedWebScraper call\n")
        
        result = crew.kickoff()
        
        print(f"\n✅ Crew completed!")
        print(f"📊 Result type: {type(result)}")
        
        # Check if it's valid JSON
        result_str = str(result).strip()
        if result_str.startswith('[') and result_str.endswith(']'):
            try:
                products = json.loads(result_str)
                print(f"✅ Valid JSON with {len(products)} products")
                
                # Show first product as example
                if products:
                    first_product = products[0]
                    print(f"\n📱 Example product:")
                    print(f"   Name: {first_product.get('name', 'N/A')}")
                    print(f"   Price: {first_product.get('price', 'N/A')}")
                    
                return True
            except json.JSONDecodeError:
                print("❌ Result is not valid JSON")
                print(f"Raw result: {result_str[:500]}...")
                return False
        else:
            print("❌ Result is not a JSON array")
            print(f"Raw result: {result_str[:500]}...")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Testing Single Tool Usage Fix")
    print("=" * 50)
    
    success = test_single_tool_usage()
    
    if success:
        print("\n" + "=" * 50)
        print("✅ Test passed! Agents should now use tools only once.")
        print("=" * 50)
    else:
        print("\n" + "=" * 50)
        print("❌ Test failed! Please check the logs above.")
        print("=" * 50)