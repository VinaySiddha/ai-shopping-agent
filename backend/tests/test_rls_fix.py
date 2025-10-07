#!/usr/bin/env python3
"""
Test script to verify the demo user RLS fix
"""

import requests
import json

def test_demo_user_search():
    """Test that demo user searches work without RLS errors"""
    print("🧪 Testing Demo User RLS Fix")
    print("=" * 40)
    
    # Backend URL
    base_url = "http://localhost:8000"  # Adjust if different
    
    # Test data
    search_data = {
        "query": "laptop under 50000",
        "max_results": 3,
        "filters": {
            "min_price": 30000,
            "max_price": 50000
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer demo-token"  # Demo user token
    }
    
    try:
        print("🔍 Testing search endpoint...")
        print(f"   Query: {search_data['query']}")
        print(f"   Token: demo-token (demo user)")
        
        # Test search endpoint
        response = requests.post(
            f"{base_url}/search", 
            json=search_data,
            headers=headers,
            timeout=30
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS: Demo user search completed without RLS errors!")
            print(f"   Query ID: {result.get('query_id', 'N/A')}")
            print(f"   Message: {result.get('message', 'N/A')}")
        else:
            print(f"❌ ERROR: Status {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("   Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_search_status():
    """Test search status endpoint for demo user"""
    print("\n🔍 Testing search status endpoint...")
    
    base_url = "http://localhost:8000"
    headers = {"Authorization": "Bearer demo-token"}
    
    try:
        response = requests.get(
            f"{base_url}/search/recent",
            headers=headers,
            timeout=10
        )
        
        print(f"📊 Status Response: {response.status_code}")
        
        if response.status_code == 200:
            searches = response.json()
            print(f"✅ SUCCESS: Found {len(searches)} recent searches")
            if searches:
                print(f"   Latest search: {searches[0].get('query_text', 'N/A')}")
        else:
            print(f"❌ ERROR: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    print("🔧 RLS Demo User Fix Test")
    print("=" * 50)
    print("This test verifies that demo users can:")
    print("• Create search queries without RLS violations")
    print("• Store product results in the database")
    print("• Retrieve their search history")
    print("\n" + "=" * 50)
    
    test_demo_user_search()
    test_search_status()
    
    print("\n" + "=" * 50)
    print("📋 SUMMARY:")
    print("✅ If tests pass: RLS fix is working correctly")
    print("❌ If tests fail: Check backend logs for errors")
    print("🛠️  If connection fails: Start backend with 'uvicorn main:app --reload'")