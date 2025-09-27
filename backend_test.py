#!/usr/bin/env python3
"""
VELES DRIVE Backend API Test Suite
Comprehensive testing for all backend endpoints
"""

import requests
import json
import sys
from typing import Dict, Any, Optional
import uuid

# Configuration
BASE_URL = "https://auto-dealership-5.preview.emergentagent.com/api"
TIMEOUT = 30

class VelesDriveAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.auth_token = None
        self.test_user_id = None
        self.test_dealer_id = None
        self.test_vehicle_id = None
        
        # Test data
        self.test_user_data = {
            "email": f"testuser_{uuid.uuid4().hex[:8]}@velestest.com",
            "phone": "+7-999-123-4567",
            "first_name": "Александр",
            "last_name": "Петров",
            "password": "SecurePass123",
            "role": "buyer"
        }
        
        self.test_dealer_data = {
            "email": f"dealer_{uuid.uuid4().hex[:8]}@velestest.com",
            "phone": "+7-999-987-6543",
            "first_name": "Михаил",
            "last_name": "Дилеров",
            "password": "DealerPass123",
            "role": "dealer"
        }
        
        self.test_vehicle_data = {
            "category": "car",
            "make": "BMW",
            "model": "X7",
            "year": 2023,
            "price": 850000.0,  # Reduced price to stay within Stripe limits
            "condition": "new",
            "mileage": 0,
            "color": "Черный",
            "engine": "4.4L V8 Twin Turbo",
            "transmission": "Автоматическая",
            "fuel_type": "Бензин",
            "power": 530,
            "body_type": "Внедорожник",
            "drive_type": "Полный привод",
            "description": "Роскошный внедорожник BMW X7 в максимальной комплектации",
            "features": ["Панорамная крыша", "Массаж сидений", "Harman Kardon", "Адаптивный круиз-контроль"],
            "location": "Москва",
            "is_featured": True
        }

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists and headers is None
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif headers is None:
            headers = {}
        
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

    def test_health_endpoints(self) -> Dict[str, Any]:
        """Test health check endpoints"""
        results = {}
        
        print("🔍 Testing Health Check Endpoints...")
        
        # Test root endpoint
        print("  Testing GET /api/")
        result = self.make_request("GET", "/")
        results["root_endpoint"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test health endpoint
        print("  Testing GET /api/health")
        result = self.make_request("GET", "/health")
        results["health_endpoint"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        return results

    def test_vehicle_endpoints(self) -> Dict[str, Any]:
        """Test vehicle-related endpoints"""
        results = {}
        
        print("🚗 Testing Vehicle Endpoints...")
        
        # Test categories endpoint
        print("  Testing GET /api/vehicles/categories")
        result = self.make_request("GET", "/vehicles/categories")
        results["categories"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test vehicles list (should be empty initially)
        print("  Testing GET /api/vehicles/")
        result = self.make_request("GET", "/vehicles/")
        results["vehicles_list"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test search suggestions
        print("  Testing GET /api/vehicles/search/suggestions?q=BMW")
        result = self.make_request("GET", "/vehicles/search/suggestions", params={"q": "BMW"})
        results["search_suggestions"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        return results

    def test_dealers_endpoints(self) -> Dict[str, Any]:
        """Test dealer-related endpoints"""
        results = {}
        
        print("🏢 Testing Dealers Endpoints...")
        
        # Test dealers list (should be empty initially)
        print("  Testing GET /api/dealers/")
        result = self.make_request("GET", "/dealers/")
        results["dealers_list"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        return results

    def test_auth_endpoints(self) -> Dict[str, Any]:
        """Test authentication endpoints"""
        results = {}
        
        print("🔐 Testing Authentication Endpoints...")
        
        # Test user registration
        print("  Testing POST /api/auth/register (buyer)")
        result = self.make_request("POST", "/auth/register", data=self.test_user_data)
        results["user_registration"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        if result.get("status_code") == 200:
            self.test_user_id = result.get("data", {}).get("id")
        
        # Test dealer registration
        print("  Testing POST /api/auth/register (dealer)")
        result = self.make_request("POST", "/auth/register", data=self.test_dealer_data)
        results["dealer_registration"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        if result.get("status_code") == 200:
            self.test_dealer_id = result.get("data", {}).get("id")
        
        # Test user login
        print("  Testing POST /api/auth/login (buyer)")
        login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=login_data)
        results["user_login"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        if result.get("status_code") == 200:
            self.auth_token = result.get("data", {}).get("access_token")
        
        # Test profile endpoint with token
        print("  Testing GET /api/auth/profile (with token)")
        result = self.make_request("GET", "/auth/profile")
        results["user_profile"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        return results
    def test_authenticated_vehicle_creation(self) -> Dict[str, Any]:
        """Test vehicle creation with dealer authentication"""
        results = {}
        
        print("🚗 Testing Authenticated Vehicle Operations...")
        
        # First login as dealer
        print("  Logging in as dealer...")
        dealer_login_data = {
            "email": self.test_dealer_data["email"],
            "password": self.test_dealer_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=dealer_login_data)
        
        if result.get("status_code") == 200:
            self.auth_token = result.get("data", {}).get("access_token")
            
            # Test vehicle creation (should fail - no dealer profile)
            print("  Testing POST /api/vehicles/ (without dealer profile)")
            result = self.make_request("POST", "/vehicles/", data=self.test_vehicle_data)
            results["vehicle_creation_no_profile"] = {
                "status": "✅ PASS" if result.get("status_code") == 400 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error"),
                "expected": "Should fail with 400 - no dealer profile"
            }
        else:
            results["dealer_login_failed"] = {
                "status": "❌ FAIL",
                "error": "Could not login as dealer for vehicle creation test"
            }
        
        return results

    def test_erp_dealer_workflow(self) -> Dict[str, Any]:
        """Test complete ERP dealer workflow"""
        results = {}
        
        print("🏢 Testing ERP Dealer Workflow...")
        
        # Step 1: Login as dealer
        print("  Step 1: Logging in as dealer...")
        dealer_login_data = {
            "email": self.test_dealer_data["email"],
            "password": self.test_dealer_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=dealer_login_data)
        results["dealer_login"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        if result.get("status_code") != 200:
            return results
            
        self.auth_token = result.get("data", {}).get("access_token")
        
        # Step 2: Create dealer profile
        print("  Step 2: Creating dealer profile...")
        dealer_profile_data = {
            "company_name": "Премиум Авто Москва",
            "description": "Официальный дилер премиум автомобилей в Москве",
            "specialization": "BMW, Mercedes-Benz, Audi",
            "address": "ул. Тверская, 15",
            "city": "Москва",
            "phone": "+7-495-123-4567",
            "email": "info@premiumauto.ru",
            "website": "https://premiumauto.ru",
            "working_hours": "Пн-Пт: 9:00-20:00, Сб-Вс: 10:00-18:00",
            "established_year": 2015
        }
        
        result = self.make_request("POST", "/dealers/", data=dealer_profile_data)
        results["dealer_profile_creation"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        if result.get("status_code") == 200:
            self.test_dealer_id = result.get("data", {}).get("id")
        
        # Step 3: Create vehicle (should work now)
        print("  Step 3: Creating vehicle with dealer profile...")
        result = self.make_request("POST", "/vehicles/", data=self.test_vehicle_data)
        results["vehicle_creation_with_profile"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        if result.get("status_code") == 200:
            self.test_vehicle_id = result.get("data", {}).get("id")
        
        # Step 4: Get dealer's vehicles
        if self.test_dealer_id:
            print("  Step 4: Getting dealer's vehicles...")
            result = self.make_request("GET", f"/dealers/{self.test_dealer_id}/vehicles")
            results["dealer_vehicles_list"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
            
            # Verify vehicle appears in dealer's list
            if result.get("status_code") == 200:
                vehicles = result.get("data", {}).get("vehicles", [])
                vehicle_found = any(v.get("id") == self.test_vehicle_id for v in vehicles)
                results["vehicle_in_dealer_list"] = {
                    "status": "✅ PASS" if vehicle_found else "❌ FAIL",
                    "found": vehicle_found,
                    "total_vehicles": len(vehicles)
                }
        
        # Step 5: Test pagination on dealer vehicles
        if self.test_dealer_id:
            print("  Step 5: Testing dealer vehicles pagination...")
            result = self.make_request("GET", f"/dealers/{self.test_dealer_id}/vehicles", params={"page": 1, "limit": 5})
            results["dealer_vehicles_pagination"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
        
        return results

    def test_erp_access_control(self) -> Dict[str, Any]:
        """Test ERP access control and permissions"""
        results = {}
        
        print("🔐 Testing ERP Access Control...")
        
        # Test 1: Buyer trying to create dealer profile
        print("  Test 1: Buyer attempting to create dealer profile...")
        buyer_login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=buyer_login_data)
        
        if result.get("status_code") == 200:
            self.auth_token = result.get("data", {}).get("access_token")
            
            dealer_profile_data = {
                "company_name": "Тест Компания",
                "description": "Тестовое описание",
                "specialization": "BMW",
                "address": "Тестовый адрес",
                "city": "Москва",
                "phone": "+7-999-999-9999",
                "email": "test@test.com"
            }
            
            result = self.make_request("POST", "/dealers/", data=dealer_profile_data)
            results["buyer_create_dealer_profile"] = {
                "status": "✅ PASS" if result.get("status_code") == 403 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error"),
                "expected": "Should return 403 - buyers cannot create dealer profiles"
            }
        
        # Test 2: Buyer trying to create vehicle
        print("  Test 2: Buyer attempting to create vehicle...")
        result = self.make_request("POST", "/vehicles/", data=self.test_vehicle_data)
        results["buyer_create_vehicle"] = {
            "status": "✅ PASS" if result.get("status_code") == 403 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 403 - buyers cannot create vehicles"
        }
        
        # Test 3: Unauthenticated access to dealer creation
        print("  Test 3: Unauthenticated dealer profile creation...")
        result = self.make_request("POST", "/dealers/", data={}, headers={})
        results["unauth_create_dealer"] = {
            "status": "✅ PASS" if result.get("status_code") == 403 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 403 without authentication"
        }
        
        return results

    def test_erp_integration(self) -> Dict[str, Any]:
        """Test ERP integration and data relationships"""
        results = {}
        
        print("🔗 Testing ERP Integration...")
        
        # Test 1: Verify dealer-vehicle relationship
        if self.test_dealer_id and self.test_vehicle_id:
            print("  Test 1: Verifying dealer-vehicle relationship...")
            result = self.make_request("GET", f"/vehicles/{self.test_vehicle_id}")
            results["vehicle_dealer_relationship"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
            
            if result.get("status_code") == 200:
                vehicle_data = result.get("data", {})
                dealer_id_match = vehicle_data.get("dealer_id") == self.test_dealer_id
                results["dealer_id_match"] = {
                    "status": "✅ PASS" if dealer_id_match else "❌ FAIL",
                    "match": dealer_id_match,
                    "vehicle_dealer_id": vehicle_data.get("dealer_id"),
                    "expected_dealer_id": self.test_dealer_id
                }
        
        # Test 2: Test dealer profile retrieval
        if self.test_dealer_id:
            print("  Test 2: Retrieving dealer profile...")
            result = self.make_request("GET", f"/dealers/{self.test_dealer_id}")
            results["dealer_profile_retrieval"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
        
        # Test 3: Test non-existent dealer vehicles
        print("  Test 3: Getting vehicles for non-existent dealer...")
        fake_dealer_id = str(uuid.uuid4())
        result = self.make_request("GET", f"/dealers/{fake_dealer_id}/vehicles")
        results["nonexistent_dealer_vehicles"] = {
            "status": "✅ PASS" if result.get("status_code") == 404 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 404 for non-existent dealer"
        }
        
        return results

    def test_additional_scenarios(self) -> Dict[str, Any]:
        """Test additional scenarios and edge cases"""
        results = {}
        
        print("🔧 Testing Additional Scenarios...")
        
        # Test invalid login
        print("  Testing invalid login credentials")
        invalid_login = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        result = self.make_request("POST", "/auth/login", data=invalid_login)
        results["invalid_login"] = {
            "status": "✅ PASS" if result.get("status_code") == 401 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 401 for invalid credentials"
        }
        
        # Test profile without token
        print("  Testing profile access without token")
        result = self.make_request("GET", "/auth/profile", headers={})
        results["profile_no_token"] = {
            "status": "✅ PASS" if result.get("status_code") == 403 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 403 without token"
        }
        
        # Test vehicle creation without authentication
        print("  Testing vehicle creation without authentication")
        result = self.make_request("POST", "/vehicles/", data=self.test_vehicle_data, headers={})
        results["vehicle_creation_no_auth"] = {
            "status": "✅ PASS" if result.get("status_code") == 403 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 403 without authentication"
        }
        
        # Test search with empty query
        print("  Testing search suggestions with short query")
        result = self.make_request("GET", "/vehicles/search/suggestions", params={"q": "B"})
        results["search_short_query"] = {
            "status": "✅ PASS" if result.get("status_code") == 422 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 422 for query too short"
        }
        
        return results

    def test_messages_system(self) -> Dict[str, Any]:
        """Test message system endpoints"""
        results = {}
        
        print("💬 Testing Messages System...")
        
        # First ensure we have both users registered and logged in
        if not self.test_user_id or not self.test_dealer_id:
            results["setup_error"] = {
                "status": "❌ FAIL",
                "error": "Users not properly set up for message testing"
            }
            return results
        
        # Login as buyer first
        buyer_login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=buyer_login_data)
        
        if result.get("status_code") != 200:
            results["buyer_login_failed"] = {
                "status": "❌ FAIL",
                "error": "Could not login as buyer for message testing"
            }
            return results
        
        buyer_token = result.get("data", {}).get("access_token")
        
        # Test 1: Send message from buyer to dealer
        print("  Testing POST /api/messages/ (buyer to dealer)")
        message_data = {
            "recipient_id": self.test_dealer_id,
            "content": "Здравствуйте! Интересует BMW X7. Можете рассказать подробнее?",
            "message_type": "text"
        }
        
        self.auth_token = buyer_token
        result = self.make_request("POST", "/messages/", data=message_data)
        results["send_message_buyer_to_dealer"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 2: Get unread count for dealer
        print("  Testing GET /api/messages/unread/count (dealer)")
        dealer_login_data = {
            "email": self.test_dealer_data["email"],
            "password": self.test_dealer_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=dealer_login_data)
        
        if result.get("status_code") == 200:
            dealer_token = result.get("data", {}).get("access_token")
            self.auth_token = dealer_token
            
            result = self.make_request("GET", "/messages/unread/count")
            results["unread_count_dealer"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
            
            # Test 3: Get conversations for dealer
            print("  Testing GET /api/messages/conversations (dealer)")
            result = self.make_request("GET", "/messages/conversations")
            results["conversations_dealer"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
            
            # Test 4: Get messages with specific user
            print("  Testing GET /api/messages/{user_id} (dealer reading buyer messages)")
            result = self.make_request("GET", f"/messages/{self.test_user_id}")
            results["messages_with_user"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
            
            # Test 5: Send reply from dealer to buyer
            print("  Testing POST /api/messages/ (dealer reply)")
            reply_data = {
                "recipient_id": self.test_user_id,
                "content": "Добро пожаловать! BMW X7 - отличный выбор. Цена 8.5 млн руб. Хотите записаться на тест-драйв?",
                "message_type": "text"
            }
            
            result = self.make_request("POST", "/messages/", data=reply_data)
            results["send_reply_dealer_to_buyer"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
        
        return results

    def test_reviews_system(self) -> Dict[str, Any]:
        """Test review system endpoints"""
        results = {}
        
        print("⭐ Testing Reviews System...")
        
        # Ensure we have dealer profile created
        if not self.test_dealer_id:
            results["setup_error"] = {
                "status": "❌ FAIL",
                "error": "Dealer profile not set up for review testing"
            }
            return results
        
        # Login as buyer to create review
        buyer_login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=buyer_login_data)
        
        if result.get("status_code") != 200:
            results["buyer_login_failed"] = {
                "status": "❌ FAIL",
                "error": "Could not login as buyer for review testing"
            }
            return results
        
        buyer_token = result.get("data", {}).get("access_token")
        self.auth_token = buyer_token
        
        # Test 1: Create review about dealer
        print("  Testing POST /api/reviews/ (create review)")
        review_data = {
            "dealer_id": self.test_dealer_id,
            "rating": 5,
            "title": "Отличный сервис и качество!",
            "comment": "Покупал BMW X7 у этого дилера. Очень доволен обслуживанием, профессиональный подход, быстрое оформление документов. Рекомендую!",
            "pros": ["Профессиональная консультация", "Быстрое оформление", "Качественный сервис"],
            "cons": ["Немного высокие цены", "Долгое ожидание тест-драйва"]
        }
        
        result = self.make_request("POST", "/reviews/", data=review_data)
        results["create_review"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        review_id = None
        if result.get("status_code") == 200:
            review_id = result.get("data", {}).get("review_id")
        
        # Test 2: Get dealer reviews
        print("  Testing GET /api/reviews/dealer/{dealer_id}")
        result = self.make_request("GET", f"/reviews/dealer/{self.test_dealer_id}")
        results["get_dealer_reviews"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 3: Get dealer rating stats
        print("  Testing GET /api/reviews/dealer/{dealer_id}/stats")
        result = self.make_request("GET", f"/reviews/dealer/{self.test_dealer_id}/stats")
        results["get_dealer_stats"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 4: Get user's own reviews
        print("  Testing GET /api/reviews/user")
        result = self.make_request("GET", "/reviews/user")
        results["get_user_reviews"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 5: Try to create duplicate review (should fail)
        print("  Testing POST /api/reviews/ (duplicate review - should fail)")
        result = self.make_request("POST", "/reviews/", data=review_data)
        results["duplicate_review"] = {
            "status": "✅ PASS" if result.get("status_code") == 400 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 400 - duplicate review not allowed"
        }
        
        # Test 6: Delete review
        if review_id:
            print("  Testing DELETE /api/reviews/{review_id}")
            result = self.make_request("DELETE", f"/reviews/{review_id}")
            results["delete_review"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
        
        # Test 7: Dealer trying to review themselves (should fail)
        print("  Testing dealer self-review (should fail)")
        dealer_login_data = {
            "email": self.test_dealer_data["email"],
            "password": self.test_dealer_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=dealer_login_data)
        
        if result.get("status_code") == 200:
            dealer_token = result.get("data", {}).get("access_token")
            self.auth_token = dealer_token
            
            self_review_data = {
                "dealer_id": self.test_dealer_id,
                "rating": 5,
                "title": "Отличная работа!",
                "comment": "Мы работаем отлично!"
            }
            
            result = self.make_request("POST", "/reviews/", data=self_review_data)
            results["dealer_self_review"] = {
                "status": "✅ PASS" if result.get("status_code") == 400 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error"),
                "expected": "Should return 400 - dealers cannot review themselves"
            }
        
        return results

    def test_complete_workflow(self) -> Dict[str, Any]:
        """Test complete workflow: users, dealer profile, messages, reviews"""
        results = {}
        
        print("🔄 Testing Complete Workflow...")
        
        # This test combines all the functionality in a realistic scenario
        # Step 1: Buyer sends message about vehicle interest
        # Step 2: Dealer responds
        # Step 3: After interaction, buyer leaves review
        # Step 4: Check all stats and lists
        
        # Login as buyer
        buyer_login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=buyer_login_data)
        
        if result.get("status_code") != 200:
            results["workflow_setup_failed"] = {
                "status": "❌ FAIL",
                "error": "Could not setup workflow test"
            }
            return results
        
        buyer_token = result.get("data", {}).get("access_token")
        
        # Step 1: Send inquiry message with vehicle reference
        print("  Step 1: Buyer sends vehicle inquiry...")
        self.auth_token = buyer_token
        inquiry_data = {
            "recipient_id": self.test_dealer_id,
            "vehicle_id": self.test_vehicle_id,
            "content": "Добрый день! Интересует BMW X7 из вашего каталога. Возможна ли скидка? Какие есть варианты финансирования?",
            "message_type": "text"
        }
        
        result = self.make_request("POST", "/messages/", data=inquiry_data)
        results["workflow_inquiry"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Step 2: Dealer responds with offer
        print("  Step 2: Dealer responds with offer...")
        dealer_login_data = {
            "email": self.test_dealer_data["email"],
            "password": self.test_dealer_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=dealer_login_data)
        
        if result.get("status_code") == 200:
            dealer_token = result.get("data", {}).get("access_token")
            self.auth_token = dealer_token
            
            offer_data = {
                "recipient_id": self.test_user_id,
                "vehicle_id": self.test_vehicle_id,
                "content": "Здравствуйте! По BMW X7 могу предложить скидку 200 тыс. руб. Есть программы кредитования от 3.9%. Приезжайте на тест-драйв!",
                "message_type": "offer"
            }
            
            result = self.make_request("POST", "/messages/", data=offer_data)
            results["workflow_offer"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
        
        # Step 3: Check conversation from buyer side
        print("  Step 3: Buyer checks conversation...")
        self.auth_token = buyer_token
        result = self.make_request("GET", "/messages/conversations")
        results["workflow_buyer_conversations"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Step 4: Buyer leaves positive review after good interaction
        print("  Step 4: Buyer leaves review after interaction...")
        final_review_data = {
            "dealer_id": self.test_dealer_id,
            "rating": 4,
            "title": "Хорошее обслуживание и адекватные цены",
            "comment": "Дилер быстро ответил на вопросы, предложил хорошие условия. Планирую покупку.",
            "pros": ["Быстрый ответ", "Хорошие условия кредитования", "Профессиональная консультация"],
            "cons": ["Хотелось бы больше скидку"]
        }
        
        result = self.make_request("POST", "/reviews/", data=final_review_data)
        results["workflow_final_review"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Step 5: Check updated dealer stats
        print("  Step 5: Check updated dealer statistics...")
        result = self.make_request("GET", f"/reviews/dealer/{self.test_dealer_id}/stats")
        results["workflow_updated_stats"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        return results

    def test_payments_system(self) -> Dict[str, Any]:
        """Test payment system endpoints"""
        results = {}
        
        print("💳 Testing Payments System...")
        
        # Ensure we have a vehicle and dealer set up for payment testing
        if not self.test_vehicle_id or not self.test_dealer_id:
            results["setup_error"] = {
                "status": "❌ FAIL",
                "error": "Vehicle and dealer not properly set up for payment testing"
            }
            return results
        
        # Login as buyer for payment testing
        buyer_login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=buyer_login_data)
        
        if result.get("status_code") != 200:
            results["buyer_login_failed"] = {
                "status": "❌ FAIL",
                "error": "Could not login as buyer for payment testing"
            }
            return results
        
        buyer_token = result.get("data", {}).get("access_token")
        self.auth_token = buyer_token
        
        # Test 1: Get payment packages
        print("  Testing GET /api/payments/packages")
        result = self.make_request("GET", "/payments/packages")
        results["get_payment_packages"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 2: Create vehicle payment session (full payment)
        print("  Testing POST /api/payments/vehicle/checkout (full payment)")
        payment_data = {
            "vehicle_id": self.test_vehicle_id,
            "payment_type": "full",
            "success_url": "https://auto-dealership-5.preview.emergentagent.com/payment/success",
            "cancel_url": "https://auto-dealership-5.preview.emergentagent.com/payment/cancel",
            "metadata": {"test": "full_payment"}
        }
        
        result = self.make_request("POST", "/payments/vehicle/checkout", data=payment_data)
        results["create_vehicle_payment_full"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        session_id_full = None
        if result.get("status_code") == 200:
            session_id_full = result.get("data", {}).get("session_id")
        
        # Test 3: Create booking payment session
        print("  Testing POST /api/payments/booking/checkout")
        booking_data = {
            "vehicle_id": self.test_vehicle_id,
            "success_url": "https://auto-dealership-5.preview.emergentagent.com/payment/success",
            "cancel_url": "https://auto-dealership-5.preview.emergentagent.com/payment/cancel",
            "metadata": {"test": "booking_payment"}
        }
        
        result = self.make_request("POST", "/payments/booking/checkout", data=booking_data)
        results["create_booking_payment"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        session_id_booking = None
        if result.get("status_code") == 200:
            session_id_booking = result.get("data", {}).get("session_id")
        
        # Test 4: Get payment status
        if session_id_full:
            print("  Testing GET /api/payments/status/{session_id}")
            result = self.make_request("GET", f"/payments/status/{session_id_full}")
            results["get_payment_status"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
        
        # Test 5: Get user transactions
        print("  Testing GET /api/payments/transactions")
        result = self.make_request("GET", "/payments/transactions")
        results["get_user_transactions"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 6: Create package payment
        print("  Testing POST /api/payments/packages/checkout")
        # This endpoint expects form data or query parameters, not JSON
        result = self.make_request("POST", "/payments/packages/checkout", 
                                 params={
                                     "package_id": "test_small",
                                     "success_url": "https://auto-dealership-5.preview.emergentagent.com/payment/success",
                                     "cancel_url": "https://auto-dealership-5.preview.emergentagent.com/payment/cancel"
                                 })
        results["create_package_payment"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 7: Test invalid vehicle payment
        print("  Testing POST /api/payments/vehicle/checkout (invalid vehicle)")
        invalid_payment_data = {
            "vehicle_id": str(uuid.uuid4()),
            "payment_type": "full",
            "success_url": "https://auto-dealership-5.preview.emergentagent.com/payment/success",
            "cancel_url": "https://auto-dealership-5.preview.emergentagent.com/payment/cancel"
        }
        
        result = self.make_request("POST", "/payments/vehicle/checkout", data=invalid_payment_data)
        results["invalid_vehicle_payment"] = {
            "status": "✅ PASS" if result.get("status_code") == 404 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 404 for non-existent vehicle"
        }
        
        return results

    def test_leads_system(self) -> Dict[str, Any]:
        """Test leads system endpoints"""
        results = {}
        
        print("📋 Testing Leads System...")
        
        # Ensure we have a vehicle and dealer set up for leads testing
        if not self.test_vehicle_id or not self.test_dealer_id:
            results["setup_error"] = {
                "status": "❌ FAIL",
                "error": "Vehicle and dealer not properly set up for leads testing"
            }
            return results
        
        # Login as buyer for leads testing
        buyer_login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=buyer_login_data)
        
        if result.get("status_code") != 200:
            results["buyer_login_failed"] = {
                "status": "❌ FAIL",
                "error": "Could not login as buyer for leads testing"
            }
            return results
        
        buyer_token = result.get("data", {}).get("access_token")
        self.auth_token = buyer_token
        
        # Test 1: Create test drive request
        print("  Testing POST /api/leads/test-drive")
        test_drive_data = {
            "vehicle_id": self.test_vehicle_id,
            "preferred_date": "2024-02-15",
            "preferred_time": "14:00",
            "message": "Хочу протестировать BMW X7. Интересует полная комплектация.",
            "phone": "+7-999-123-4567"
        }
        
        result = self.make_request("POST", "/leads/test-drive", data=test_drive_data)
        results["create_test_drive_request"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 2: Create price inquiry
        print("  Testing POST /api/leads/price-inquiry")
        price_inquiry_data = {
            "vehicle_id": self.test_vehicle_id,
            "message": "Интересует финальная цена с учетом всех скидок и программ кредитования.",
            "phone": "+7-999-123-4567"
        }
        
        result = self.make_request("POST", "/leads/price-inquiry", data=price_inquiry_data)
        results["create_price_inquiry"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 3: Create callback request
        print("  Testing POST /api/leads/callback")
        callback_data = {
            "dealer_id": self.test_dealer_id,
            "vehicle_id": self.test_vehicle_id,
            "message": "Прошу перезвонить для обсуждения условий покупки BMW X7.",
            "phone": "+7-999-123-4567",
            "preferred_time": "10:00-18:00"
        }
        
        result = self.make_request("POST", "/leads/callback", data=callback_data)
        results["create_callback_request"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Test 4: Get user leads
        print("  Testing GET /api/leads/user")
        result = self.make_request("GET", "/leads/user")
        results["get_user_leads"] = {
            "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error")
        }
        
        # Switch to dealer for dealer-specific tests
        dealer_login_data = {
            "email": self.test_dealer_data["email"],
            "password": self.test_dealer_data["password"]
        }
        result = self.make_request("POST", "/auth/login", data=dealer_login_data)
        
        if result.get("status_code") == 200:
            dealer_token = result.get("data", {}).get("access_token")
            self.auth_token = dealer_token
            
            # Test 5: Get dealer leads
            print("  Testing GET /api/leads/dealer/{dealer_id}")
            result = self.make_request("GET", f"/leads/dealer/{self.test_dealer_id}")
            results["get_dealer_leads"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
            
            # Test 6: Get dealer lead statistics
            print("  Testing GET /api/leads/stats/{dealer_id}")
            result = self.make_request("GET", f"/leads/stats/{self.test_dealer_id}")
            results["get_dealer_lead_stats"] = {
                "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                "status_code": result.get("status_code"),
                "response": result.get("data", {}),
                "error": result.get("error")
            }
            
            # Test 7: Update lead status (if we have leads)
            leads_response = results.get("get_dealer_leads", {}).get("response", [])
            if leads_response and len(leads_response) > 0:
                lead_id = leads_response[0].get("id")
                if lead_id:
                    print("  Testing PUT /api/leads/{lead_id}/status")
                    result = self.make_request("PUT", f"/leads/{lead_id}/status", 
                                             params={"status": "contacted"})
                    results["update_lead_status"] = {
                        "status": "✅ PASS" if result.get("status_code") == 200 else "❌ FAIL",
                        "status_code": result.get("status_code"),
                        "response": result.get("data", {}),
                        "error": result.get("error")
                    }
        
        # Test 8: Test invalid vehicle lead request
        print("  Testing POST /api/leads/test-drive (invalid vehicle)")
        self.auth_token = buyer_token  # Switch back to buyer
        invalid_test_drive_data = {
            "vehicle_id": str(uuid.uuid4()),
            "preferred_date": "2024-02-15",
            "preferred_time": "14:00",
            "message": "Test with invalid vehicle",
            "phone": "+7-999-123-4567"
        }
        
        result = self.make_request("POST", "/leads/test-drive", data=invalid_test_drive_data)
        results["invalid_vehicle_lead"] = {
            "status": "✅ PASS" if result.get("status_code") == 404 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 404 for non-existent vehicle"
        }
        
        return results

    def test_webhook_system(self) -> Dict[str, Any]:
        """Test webhook system endpoints"""
        results = {}
        
        print("🔗 Testing Webhook System...")
        
        # Test 1: Test Stripe webhook endpoint (without signature - should fail)
        print("  Testing POST /api/webhook/stripe (no signature)")
        webhook_data = {
            "id": "evt_test_webhook",
            "object": "event",
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_session",
                    "payment_status": "paid"
                }
            }
        }
        
        result = self.make_request("POST", "/webhook/stripe", data=webhook_data, headers={})
        results["webhook_no_signature"] = {
            "status": "✅ PASS" if result.get("status_code") == 400 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 400 - missing Stripe signature"
        }
        
        # Test 2: Test webhook with invalid signature
        print("  Testing POST /api/webhook/stripe (invalid signature)")
        result = self.make_request("POST", "/webhook/stripe", data=webhook_data, 
                                 headers={"Stripe-Signature": "invalid_signature"})
        results["webhook_invalid_signature"] = {
            "status": "✅ PASS" if result.get("status_code") == 400 else "❌ FAIL",
            "status_code": result.get("status_code"),
            "response": result.get("data", {}),
            "error": result.get("error"),
            "expected": "Should return 400 - invalid Stripe signature"
        }
        
        return results

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all test suites"""
        print("🚀 Starting VELES DRIVE Backend API Tests - Payments & Leads Edition")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        all_results = {}
        
        # Run existing test suites
        all_results["health_checks"] = self.test_health_endpoints()
        all_results["vehicle_endpoints"] = self.test_vehicle_endpoints()
        all_results["dealer_endpoints"] = self.test_dealers_endpoints()
        all_results["authentication"] = self.test_auth_endpoints()
        all_results["authenticated_operations"] = self.test_authenticated_vehicle_creation()
        
        # ERP TESTS
        all_results["erp_dealer_workflow"] = self.test_erp_dealer_workflow()
        all_results["erp_access_control"] = self.test_erp_access_control()
        all_results["erp_integration"] = self.test_erp_integration()
        
        # EXISTING TESTS - Messages and Reviews
        all_results["messages_system"] = self.test_messages_system()
        all_results["reviews_system"] = self.test_reviews_system()
        all_results["complete_workflow"] = self.test_complete_workflow()
        
        # NEW TESTS - Payments, Leads, and Webhooks
        all_results["payments_system"] = self.test_payments_system()
        all_results["leads_system"] = self.test_leads_system()
        all_results["webhook_system"] = self.test_webhook_system()
        
        all_results["additional_scenarios"] = self.test_additional_scenarios()
        
        return all_results

    def print_summary(self, results: Dict[str, Any]):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for suite_name, suite_results in results.items():
            print(f"\n🔍 {suite_name.upper().replace('_', ' ')}")
            print("-" * 40)
            
            for test_name, test_result in suite_results.items():
                total_tests += 1
                status = test_result.get("status", "❌ FAIL")
                
                if "✅ PASS" in status:
                    passed_tests += 1
                else:
                    failed_tests += 1
                
                print(f"  {test_name}: {status}")
                
                if test_result.get("error"):
                    print(f"    Error: {test_result['error']}")
                elif test_result.get("status_code"):
                    print(f"    Status Code: {test_result['status_code']}")
                
                if "expected" in test_result:
                    print(f"    Expected: {test_result['expected']}")
        
        print("\n" + "=" * 60)
        print(f"📈 OVERALL RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed_tests}")
        print(f"   ❌ Failed: {failed_tests}")
        print(f"   Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%")
        print("=" * 60)

def main():
    """Main test execution"""
    tester = VelesDriveAPITester()
    
    try:
        results = tester.run_all_tests()
        tester.print_summary(results)
        
        # Return appropriate exit code
        failed_count = sum(
            1 for suite in results.values() 
            for test in suite.values() 
            if "❌ FAIL" in test.get("status", "")
        )
        
        return 0 if failed_count == 0 else 1
        
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)