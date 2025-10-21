#!/usr/bin/env python3

"""
Test script for Alpha-VLLM/Lumina-DiM00 model integration
"""

import os
import sys
import json
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_lumina_model():
    """Test the Lumina model with a simple product search"""
    
    # Load environment variables
    load_dotenv()
    
    # Check if Hugging Face API key is set
    hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
    if not hf_api_key:
        print("❌ ERROR: HUGGINGFACE_API_KEY not found in environment variables")
        print("Please add HUGGINGFACE_API_KEY to your .env file")
        print("You can get one from: https://huggingface.co/settings/tokens")
        return False
    
    print(f"✅ Hugging Face API key found: {hf_api_key[:10]}...")
    
    try:
        from agents.crew_setup import create_shopping_crew
        print("✅ Successfully imported crew setup")
        
        # Test with a simple search
        test_query = "samsung phone under 20000"
        print(f"\n🔍 Testing search: '{test_query}'")
        
        # Create crew with new model
        crew = create_shopping_crew(test_query, num_products=3)
        print("✅ Crew created successfully")
        
        # Test crew execution
        print("\n🚀 Starting crew execution...")
        result = crew.kickoff()
        
        print(f"\n📊 Result type: {type(result)}")
        print(f"📊 Result length: {len(str(result))}")
        print(f"📊 Result preview: {str(result)[:200]}...")
        
        # Try to parse as JSON
        try:
            if hasattr(result, 'raw'):
                result_text = result.raw
            else:
                result_text = str(result)
                
            # Clean the result text
            result_text = result_text.strip()
            
            # Try to find JSON in the result
            if result_text.startswith('[') and result_text.endswith(']'):
                products = json.loads(result_text)
                print(f"\n✅ Successfully parsed {len(products)} products")
                
                for i, product in enumerate(products, 1):
                    print(f"\n📱 Product {i}:")
                    print(f"   Name: {product.get('name', 'N/A')}")
                    print(f"   Price: {product.get('price', 'N/A')}")
                    print(f"   Source: {product.get('source_url', 'N/A')}")
                    
                return True
            else:
                print(f"❌ Result is not valid JSON format")
                print(f"Raw result: {result_text}")
                return False
                
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
            print(f"Raw result: {result_text}")
            return False
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_model_availability():
    """Check if the Lumina model is accessible"""
    
    try:
        from crewai import LLM
        import os
        
        hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
        if not hf_api_key:
            return False
            
        # Test model initialization
        llm = LLM(
            model="Alpha-VLLM/Lumina-DiM00",
            temperature=0.3,
            base_url="https://api.huggingface.co/v1",
            api_key=hf_api_key
        )
        
        print("✅ Model initialized successfully")
        return True
        
    except Exception as e:
        print(f"❌ Model initialization failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Testing Alpha-VLLM/Lumina-DiM00 Model Integration")
    print("=" * 60)
    
    # Check model availability
    print("\n1. Checking model availability...")
    if not check_model_availability():
        print("❌ Model check failed")
        sys.exit(1)
    
    # Test crew execution
    print("\n2. Testing crew execution...")
    success = test_lumina_model()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED! Lumina model is working correctly.")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ TESTS FAILED! Please check the configuration.")
        print("=" * 60)
        sys.exit(1)