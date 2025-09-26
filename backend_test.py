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
BASE_URL = "https://luxury-cars-4.preview.emergentagent.com/api"
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
            "password": "SecurePass123!",
            "role": "buyer"
        }
        
        self.test_dealer_data = {
            "email": f"dealer_{uuid.uuid4().hex[:8]}@velestest.com",
            "phone": "+7-999-987-6543",
            "first_name": "Михаил",
            "last_name": "Дилеров",
            "password": "DealerPass123!",
            "role": "dealer"
        }
        
        self.test_vehicle_data = {
            "category": "car",
            "make": "BMW",
            "model": "X7",
            "year": 2023,
            "price": 8500000.0,
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
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {}
        if self.auth_token:
            headers = headers or {}
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
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

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all test suites"""
        print("🚀 Starting VELES DRIVE Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        all_results = {}
        
        # Run test suites
        all_results["health_checks"] = self.test_health_endpoints()
        all_results["vehicle_endpoints"] = self.test_vehicle_endpoints()
        all_results["dealer_endpoints"] = self.test_dealers_endpoints()
        all_results["authentication"] = self.test_auth_endpoints()
        all_results["authenticated_operations"] = self.test_authenticated_vehicle_creation()
        
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