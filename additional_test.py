#!/usr/bin/env python3
"""
Additional verification tests for Messages and Reviews API
"""

import requests
import json
import uuid

BASE_URL = "https://racecar-style.preview.emergentagent.com/api"

class AdditionalTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = 30

    def make_request(self, method: str, endpoint: str, data=None, headers=None, params=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, params=params)
            else:
                return {"error": f"Unsupported method: {method}"}
            
            return {
                "status_code": response.status_code,
                "data": response.json() if response.content else {},
                "headers": dict(response.headers)
            }
        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}
        except json.JSONDecodeError:
            return {
                "status_code": response.status_code,
                "data": response.text,
                "headers": dict(response.headers)
            }

    def test_message_conversations(self):
        """Test GET /api/messages/conversations endpoint"""
        print("💬 Testing GET /api/messages/conversations...")
        
        # Create test users first
        buyer_data = {
            "email": f"conv_buyer_{uuid.uuid4().hex[:8]}@test.com",
            "phone": "+7-999-555-6666",
            "first_name": "Тест",
            "last_name": "Покупатель",
            "password": "TestPass123",
            "role": "buyer"
        }
        
        # Register and login buyer
        result = self.make_request("POST", "/auth/register", data=buyer_data)
        if result.get("status_code") != 200:
            print(f"  ❌ Setup failed: {result}")
            return False
        
        login_result = self.make_request("POST", "/auth/login", data={
            "email": buyer_data["email"], 
            "password": buyer_data["password"]
        })
        
        if login_result.get("status_code") != 200:
            print(f"  ❌ Login failed: {login_result}")
            return False
        
        token = login_result.get("data", {}).get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test conversations endpoint
        result = self.make_request("GET", "/messages/conversations", headers=headers)
        success = result.get("status_code") == 200
        
        print(f"  {'✅' if success else '❌'} Conversations: {result.get('status_code')}")
        return success

    def test_dealer_reviews_endpoint(self):
        """Test GET /api/reviews/dealer/{dealer_id} endpoint"""
        print("⭐ Testing GET /api/reviews/dealer/{dealer_id}...")
        
        # Use a fake dealer ID to test the endpoint structure
        fake_dealer_id = str(uuid.uuid4())
        result = self.make_request("GET", f"/reviews/dealer/{fake_dealer_id}")
        
        # Should return 200 with empty list for non-existent dealer
        success = result.get("status_code") == 200
        reviews = result.get("data", [])
        
        print(f"  {'✅' if success else '❌'} Dealer reviews: {result.get('status_code')} - Reviews: {len(reviews)}")
        return success

    def test_dealer_stats_endpoint(self):
        """Test GET /api/reviews/dealer/{dealer_id}/stats endpoint"""
        print("📊 Testing GET /api/reviews/dealer/{dealer_id}/stats...")
        
        # Use a fake dealer ID to test the endpoint structure
        fake_dealer_id = str(uuid.uuid4())
        result = self.make_request("GET", f"/reviews/dealer/{fake_dealer_id}/stats")
        
        # Should return 200 with zero stats for non-existent dealer
        success = result.get("status_code") == 200
        stats = result.get("data", {})
        
        print(f"  {'✅' if success else '❌'} Dealer stats: {result.get('status_code')} - Stats: {stats}")
        return success

    def run_additional_tests(self):
        """Run additional verification tests"""
        print("🔍 Running Additional API Verification Tests")
        print("=" * 50)
        
        results = []
        
        # Test conversations endpoint
        results.append(self.test_message_conversations())
        
        # Test dealer reviews endpoint
        results.append(self.test_dealer_reviews_endpoint())
        
        # Test dealer stats endpoint
        results.append(self.test_dealer_stats_endpoint())
        
        passed = sum(results)
        total = len(results)
        
        print(f"\n📈 Additional Tests: {passed}/{total} passed ({passed/total*100:.1f}%)")
        
        return passed == total

def main():
    tester = AdditionalTester()
    success = tester.run_additional_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())