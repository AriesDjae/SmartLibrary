#!/usr/bin/env python3
"""
Script untuk testing SmartLibrary AI Services
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Tambahkan direktori AI ke path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_health_check(base_url):
    """Test health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")

def test_chat_ai(base_url):
    """Test chat AI endpoint"""
    print("\nTesting chat AI...")
    try:
        data = {
            "message": "Saya suka novel fiksi ilmiah dengan tema perjalanan waktu",
            "user_id": "test_user_123"
        }
        response = requests.post(f"{base_url}/ai/chat", json=data)
        if response.status_code == 200:
            print("✅ Chat AI passed")
            result = response.json()
            print(f"Response: {result.get('response', '')[:200]}...")
        else:
            print(f"❌ Chat AI failed: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Chat AI error: {str(e)}")

def test_recommendations(base_url):
    """Test recommendation endpoints"""
    print("\nTesting recommendations...")
    
    # Test content-based recommendations
    print("Testing content-based recommendations...")
    try:
        data = {
            "book_id": "test_book_123",
            "n_recommendations": 3
        }
        response = requests.post(f"{base_url}/recommendations/content-based", json=data)
        if response.status_code == 200:
            print("✅ Content-based recommendations passed")
            result = response.json()
            print(f"Found {len(result.get('recommendations', []))} recommendations")
        else:
            print(f"❌ Content-based recommendations failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Content-based recommendations error: {str(e)}")
    
    # Test collaborative recommendations
    print("Testing collaborative recommendations...")
    try:
        data = {
            "user_id": "test_user_123",
            "n_recommendations": 3
        }
        response = requests.post(f"{base_url}/recommendations/collaborative", json=data)
        if response.status_code == 200:
            print("✅ Collaborative recommendations passed")
            result = response.json()
            print(f"Found {len(result.get('recommendations', []))} recommendations")
        else:
            print(f"❌ Collaborative recommendations failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Collaborative recommendations error: {str(e)}")
    
    # Test AI-enhanced recommendations
    print("Testing AI-enhanced recommendations...")
    try:
        data = {
            "user_preferences": "Saya suka novel fiksi ilmiah dengan tema perjalanan waktu dan teknologi futuristik",
            "n_recommendations": 3
        }
        response = requests.post(f"{base_url}/recommendations/ai-enhanced", json=data)
        if response.status_code == 200:
            print("✅ AI-enhanced recommendations passed")
            result = response.json()
            print(f"Found {len(result.get('recommendations', []))} recommendations")
        else:
            print(f"❌ AI-enhanced recommendations failed: {response.status_code}")
    except Exception as e:
        print(f"❌ AI-enhanced recommendations error: {str(e)}")
    
    # Test hybrid recommendations
    print("Testing hybrid recommendations...")
    try:
        data = {
            "user_id": "test_user_123",
            "user_preferences": "Saya suka novel fiksi ilmiah",
            "n_recommendations": 3
        }
        response = requests.post(f"{base_url}/recommendations/hybrid", json=data)
        if response.status_code == 200:
            print("✅ Hybrid recommendations passed")
            result = response.json()
            recommendations = result.get('recommendations', {})
            total_recs = sum(len(recs) for recs in recommendations.values())
            print(f"Found {total_recs} total recommendations across all methods")
        else:
            print(f"❌ Hybrid recommendations failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Hybrid recommendations error: {str(e)}")

def test_user_preferences(base_url):
    """Test user preference endpoints"""
    print("\nTesting user preferences...")
    
    # Test get user preferences
    print("Testing get user preferences...")
    try:
        response = requests.get(f"{base_url}/user/preferences?user_id=test_user_123")
        if response.status_code == 200:
            print("✅ Get user preferences passed")
            result = response.json()
            preferences = result.get('preferences', {})
            print(f"User has {preferences.get('total_books_read', 0)} books read")
        else:
            print(f"❌ Get user preferences failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Get user preferences error: {str(e)}")
    
    # Test similar users
    print("Testing similar users...")
    try:
        response = requests.get(f"{base_url}/user/similar-users?user_id=test_user_123&n_similar_users=3")
        if response.status_code == 200:
            print("✅ Similar users passed")
            result = response.json()
            similar_users = result.get('similar_users', [])
            print(f"Found {len(similar_users)} similar users")
        else:
            print(f"❌ Similar users failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Similar users error: {str(e)}")

def main():
    """Main function untuk testing"""
    base_url = os.getenv('AI_SERVICE_URL', 'http://localhost:5001')
    
    print("🧪 SmartLibrary AI Services Testing")
    print("=" * 50)
    print(f"Testing against: {base_url}")
    print()
    
    # Test semua endpoint
    test_health_check(base_url)
    test_chat_ai(base_url)
    test_recommendations(base_url)
    test_user_preferences(base_url)
    
    print("\n" + "=" * 50)
    print("✅ Testing completed!")

if __name__ == '__main__':
    main() 