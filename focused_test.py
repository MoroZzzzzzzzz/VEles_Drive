#!/usr/bin/env python3
"""
Focused test for Messages and Reviews API endpoints after fixes
Testing specific endpoints as requested by user
"""

import requests
import json
import uuid
from typing import Dict, Any

# Configuration
BASE_URL = "https://hello-analyzer.preview.emergentagent.com/api"
TIMEOUT = 30

class FocusedAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        
        # Test users data
        self.buyer_data = {
            "email": f"buyer_{uuid.uuid4().hex[:8]}@velestest.com",
            "phone": "+7-999-111-2222",
            "first_name": "Иван",
            "last_name": "Покупатель",
            "password": "BuyerPass123",
            "role": "buyer"
        }
        
        self.dealer_data = {
            "email": f"dealer_{uuid.uuid4().hex[:8]}@velestest.com",
            "phone": "+7-999-333-4444",
            "first_name": "Петр",
            "last_name": "Дилеров",
            "password": "DealerPass123",
            "role": "dealer"
        }
        
        # Tokens and IDs
        self.buyer_token = None
        self.dealer_token = None
        self.buyer_id = None
        self.dealer_id = None
        self.dealer_profile_id = None

    def make_request(self, method: str, endpoint: str, data=None, headers=None, params=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, params=params)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, params=params)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, params=params)
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

    def setup_users(self):
        """Step 1 & 2: Create buyer and dealer users"""
        print("🔧 Setting up test users...")
        
        # Register buyer
        print("  Creating buyer user...")
        result = self.make_request("POST", "/auth/register", data=self.buyer_data)
        if result.get("status_code") != 200:
            print(f"  ❌ Buyer registration failed: {result}")
            return False
        
        self.buyer_id = result.get("data", {}).get("id")
        print(f"  ✅ Buyer created: {self.buyer_id}")
        
        # Register dealer
        print("  Creating dealer user...")
        result = self.make_request("POST", "/auth/register", data=self.dealer_data)
        if result.get("status_code") != 200:
            print(f"  ❌ Dealer registration failed: {result}")
            return False
        
        self.dealer_id = result.get("data", {}).get("id")
        print(f"  ✅ Dealer created: {self.dealer_id}")
        
        # Login buyer
        print("  Logging in buyer...")
        login_data = {"email": self.buyer_data["email"], "password": self.buyer_data["password"]}
        result = self.make_request("POST", "/auth/login", data=login_data)
        if result.get("status_code") != 200:
            print(f"  ❌ Buyer login failed: {result}")
            return False
        
        self.buyer_token = result.get("data", {}).get("access_token")
        print("  ✅ Buyer logged in")
        
        # Login dealer
        print("  Logging in dealer...")
        login_data = {"email": self.dealer_data["email"], "password": self.dealer_data["password"]}
        result = self.make_request("POST", "/auth/login", data=login_data)
        if result.get("status_code") != 200:
            print(f"  ❌ Dealer login failed: {result}")
            return False
        
        self.dealer_token = result.get("data", {}).get("access_token")
        print("  ✅ Dealer logged in")
        
        return True

    def create_dealer_profile(self):
        """Step 3: Create dealer profile"""
        print("🏢 Creating dealer profile...")
        
        dealer_profile_data = {
            "company_name": "Тест Авто Центр",
            "description": "Тестовый автосалон для проверки API",
            "specialization": "BMW, Mercedes-Benz",
            "address": "ул. Тестовая, 123",
            "city": "Москва",
            "phone": "+7-495-123-4567",
            "email": "info@testauto.ru",
            "website": "https://testauto.ru",
            "working_hours": "Пн-Пт: 9:00-20:00",
            "established_year": 2020
        }
        
        headers = {"Authorization": f"Bearer {self.dealer_token}"}
        result = self.make_request("POST", "/dealers/", data=dealer_profile_data, headers=headers)
        
        if result.get("status_code") != 200:
            print(f"  ❌ Dealer profile creation failed: {result}")
            return False
        
        self.dealer_profile_id = result.get("data", {}).get("id")
        print(f"  ✅ Dealer profile created: {self.dealer_profile_id}")
        return True

    def test_send_message(self):
        """Step 4: Test POST /api/messages/ - sending message from buyer to dealer"""
        print("💬 Testing POST /api/messages/ (buyer to dealer)...")
        
        message_data = {
            "recipient_id": self.dealer_id,
            "content": "Здравствуйте! Интересует BMW X5. Есть ли в наличии?",
            "message_type": "text"
        }
        
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        result = self.make_request("POST", "/messages/", data=message_data, headers=headers)
        
        success = result.get("status_code") == 200
        print(f"  {'✅' if success else '❌'} Send message: {result.get('status_code')} - {result.get('data', {}).get('message', result.get('error', 'Unknown error'))}")
        
        return success, result

    def test_unread_count(self):
        """Step 5: Test GET /api/messages/unread/count - check unread messages for dealer"""
        print("📊 Testing GET /api/messages/unread/count (dealer)...")
        
        headers = {"Authorization": f"Bearer {self.dealer_token}"}
        result = self.make_request("GET", "/messages/unread/count", headers=headers)
        
        success = result.get("status_code") == 200
        unread_count = result.get("data", {}).get("unread_count", 0) if success else 0
        
        print(f"  {'✅' if success else '❌'} Unread count: {result.get('status_code')} - Count: {unread_count}")
        
        return success, result

    def test_create_review(self):
        """Step 6: Test POST /api/reviews/ - create review about dealer from buyer"""
        print("⭐ Testing POST /api/reviews/ (buyer reviews dealer)...")
        
        review_data = {
            "dealer_id": self.dealer_profile_id,
            "rating": 4,
            "title": "Хороший сервис",
            "comment": "Быстро ответили на вопросы, профессиональная консультация. Рекомендую!",
            "pros": ["Быстрый ответ", "Профессиональная консультация"],
            "cons": ["Немного дорого"]
        }
        
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        result = self.make_request("POST", "/reviews/", data=review_data, headers=headers)
        
        success = result.get("status_code") == 200
        review_id = result.get("data", {}).get("review_id") if success else None
        
        print(f"  {'✅' if success else '❌'} Create review: {result.get('status_code')} - {result.get('data', {}).get('message', result.get('error', 'Unknown error'))}")
        
        return success, result, review_id

    def test_get_user_reviews(self):
        """Step 7: Test GET /api/reviews/user - get buyer's reviews"""
        print("📝 Testing GET /api/reviews/user (buyer's reviews)...")
        
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        result = self.make_request("GET", "/reviews/user", headers=headers)
        
        success = result.get("status_code") == 200
        reviews_count = len(result.get("data", [])) if success else 0
        
        print(f"  {'✅' if success else '❌'} Get user reviews: {result.get('status_code')} - Reviews count: {reviews_count}")
        
        return success, result

    def run_focused_test(self):
        """Run the focused test as requested"""
        print("🚀 Starting Focused Messages & Reviews API Test")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        results = {}
        
        # Step 1-2: Setup users
        if not self.setup_users():
            print("❌ Failed to setup users. Aborting test.")
            return results
        
        # Step 3: Create dealer profile
        if not self.create_dealer_profile():
            print("❌ Failed to create dealer profile. Aborting test.")
            return results
        
        # Step 4: Test message sending
        success, result = self.test_send_message()
        results["send_message"] = {"success": success, "result": result}
        
        # Step 5: Test unread count
        success, result = self.test_unread_count()
        results["unread_count"] = {"success": success, "result": result}
        
        # Step 6: Test review creation
        success, result, review_id = self.test_create_review()
        results["create_review"] = {"success": success, "result": result, "review_id": review_id}
        
        # Step 7: Test get user reviews
        success, result = self.test_get_user_reviews()
        results["get_user_reviews"] = {"success": success, "result": result}
        
        return results

    def print_summary(self, results):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 FOCUSED TEST RESULTS SUMMARY")
        print("=" * 60)
        
        total_tests = len(results)
        passed_tests = sum(1 for r in results.values() if r.get("success", False))
        
        print(f"\n🎯 PRIORITY ENDPOINTS TESTED:")
        print(f"  1. POST /api/messages/ - {'✅ PASS' if results.get('send_message', {}).get('success') else '❌ FAIL'}")
        print(f"  2. GET /api/messages/unread/count - {'✅ PASS' if results.get('unread_count', {}).get('success') else '❌ FAIL'}")
        print(f"  3. POST /api/reviews/ - {'✅ PASS' if results.get('create_review', {}).get('success') else '❌ FAIL'}")
        print(f"  4. GET /api/reviews/user - {'✅ PASS' if results.get('get_user_reviews', {}).get('success') else '❌ FAIL'}")
        
        print(f"\n📈 OVERALL RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed_tests}")
        print(f"   ❌ Failed: {total_tests - passed_tests}")
        print(f"   Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%")
        
        # Show any errors
        for test_name, test_result in results.items():
            if not test_result.get("success", False):
                error_info = test_result.get("result", {})
                if error_info.get("error"):
                    print(f"\n❌ {test_name.upper()} ERROR: {error_info['error']}")
                elif error_info.get("data"):
                    print(f"\n❌ {test_name.upper()} RESPONSE: {error_info['data']}")
        
        print("=" * 60)

def main():
    """Main test execution"""
    tester = FocusedAPITester()
    
    try:
        results = tester.run_focused_test()
        tester.print_summary(results)
        
        # Return success if all priority tests passed
        priority_tests = ["send_message", "unread_count", "create_review", "get_user_reviews"]
        all_passed = all(results.get(test, {}).get("success", False) for test in priority_tests)
        
        return 0 if all_passed else 1
        
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)