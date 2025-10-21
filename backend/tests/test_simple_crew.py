#!/usr/bin/env python3

"""
Simple test to debug crew agent behavior
"""

import os
import sys
import json
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

def test_simple_crew():
    """Test with very explicit instructions"""
    
    try:
        from crewai import Agent, Task, Crew, Process, LLM
        
        # Use OpenAI GPT-3.5 (most reliable)
        llm = LLM(
            model="gpt-3.5-turbo",
            temperature=0.1
        )
        
        # Create a simple agent
        formatter = Agent(
            role="JSON Product Formatter",
            goal="Format product data as JSON array. NEVER create web tutorials or documentation.",
            backstory="You only format product data as JSON. You do not write tutorials about web scraping or programming.",
            llm=llm,
            verbose=True
        )
        
        # Simple task
        task = Task(
            description="""
            CRITICAL INSTRUCTION: You are formatting PRODUCT DATA, not writing programming tutorials.
            
            Given this sample product:
            - Name: Samsung Galaxy M36 5G
            - Price: ₹17,499
            - URL: https://amazon.in/dp/B0FDB8V6PS
            
            Return ONLY this JSON structure (no extra text):
            [
              {
                "name": "Samsung Galaxy M36 5G",
                "price": "₹17,499",
                "price_numeric": 17499.0,
                "rating": "N/A",
                "rating_numeric": null,
                "source_url": "https://amazon.in/dp/B0FDB8V6PS",
                "brand": "Samsung",
                "features": ["5G", "50MP Camera"],
                "availability": "In Stock",
                "image_url": ""
              }
            ]
            
            DO NOT write about:
            - Web scraping
            - Java programming  
            - Jsoup or HtmlUnit
            - Programming tutorials
            - Web crawlers
            
            Return ONLY the JSON array above.
            """,
            agent=formatter,
            expected_output="JSON array with one product object"
        )
        
        crew = Crew(
            agents=[formatter],
            tasks=[task],
            process=Process.sequential,
            verbose=True
        )
        
        print("🚀 Starting simple crew test...")
        result = crew.kickoff()
        
        print(f"\n📊 Result type: {type(result)}")
        print(f"📊 Raw result: {result}")
        
        # Check if it's valid JSON
        result_str = str(result).strip()
        if result_str.startswith('[') and result_str.endswith(']'):
            try:
                products = json.loads(result_str)
                print(f"✅ Valid JSON with {len(products)} products")
                return True
            except json.JSONDecodeError:
                print("❌ Invalid JSON format")
                return False
        else:
            print("❌ Result is not a JSON array")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Testing Simple Crew Agent Behavior")
    print("=" * 50)
    
    success = test_simple_crew()
    
    if success:
        print("\n✅ Simple test passed!")
    else:
        print("\n❌ Simple test failed!")