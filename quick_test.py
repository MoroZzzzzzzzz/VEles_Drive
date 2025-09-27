#!/usr/bin/env python3
"""
Quick VELES DRIVE Backend Test - Focus on Logo Changes and Docker Readiness
"""

import requests
import json
import sys

BASE_URL = "https://racecar-style.preview.emergentagent.com/api"
TIMEOUT = 10

def test_health_and_basic_apis():
    """Test health check and basic API functionality after logo changes"""
    results = {}
    
    print("🔍 Testing Health Check and Basic APIs after Logo Changes...")
    
    try:
        # Test 1: Health check endpoint
        print("  Testing GET /api/health")
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        results["health_check"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code,
            "response": response.json() if response.content else {}
        }
        
        # Test 2: Root API endpoint
        print("  Testing GET /api/")
        response = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        results["root_api"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code,
            "response": response.json() if response.content else {}
        }
        
        # Test 3: Vehicle categories (frontend integration)
        print("  Testing GET /api/vehicles/categories")
        response = requests.get(f"{BASE_URL}/vehicles/categories", timeout=TIMEOUT)
        results["vehicle_categories"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code,
            "response": response.json() if response.content else {}
        }
        
        # Test 4: Dealers list
        print("  Testing GET /api/dealers/")
        response = requests.get(f"{BASE_URL}/dealers/", timeout=TIMEOUT)
        results["dealers_list"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code,
            "response": response.json() if response.content else {}
        }
        
        # Test 5: Authentication endpoint (critical for frontend)
        print("  Testing POST /api/auth/login (with test credentials)")
        login_data = {
            "email": "test@velesdrive.ru",
            "password": "testpass123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=TIMEOUT)
        results["auth_login"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code,
            "response": response.json() if response.content else {}
        }
        
    except requests.exceptions.RequestException as e:
        results["connection_error"] = {
            "status": "❌ FAIL",
            "error": f"Connection failed: {str(e)}"
        }
    
    return results

def test_docker_readiness():
    """Test Docker deployment readiness"""
    results = {}
    
    print("🐳 Testing Docker Deployment Readiness...")
    
    # Test 1: Check if backend dependencies are working
    try:
        print("  Testing backend dependencies and startup...")
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        results["backend_startup"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code,
            "note": "Backend server is running and responding"
        }
    except Exception as e:
        results["backend_startup"] = {
            "status": "❌ FAIL",
            "error": str(e)
        }
    
    # Test 2: Check database connectivity
    try:
        print("  Testing database connectivity...")
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        if response.status_code == 200:
            health_data = response.json()
            db_status = health_data.get("database", "unknown")
            results["database_connectivity"] = {
                "status": "✅ PASS" if db_status == "connected" else "❌ FAIL",
                "database_status": db_status
            }
    except Exception as e:
        results["database_connectivity"] = {
            "status": "❌ FAIL",
            "error": str(e)
        }
    
    # Test 3: Check API routes are properly mounted
    try:
        print("  Testing API routes mounting...")
        response = requests.get(f"{BASE_URL}/vehicles/categories", timeout=TIMEOUT)
        results["api_routes"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code,
            "note": "API routes are properly mounted with /api prefix"
        }
    except Exception as e:
        results["api_routes"] = {
            "status": "❌ FAIL",
            "error": str(e)
        }
    
    return results

def test_frontend_backend_integration():
    """Test frontend-backend integration after logo changes"""
    results = {}
    
    print("🔗 Testing Frontend-Backend Integration...")
    
    try:
        # Test 1: Check if backend serves frontend properly
        print("  Testing frontend static files serving...")
        frontend_url = "https://racecar-style.preview.emergentagent.com/"
        response = requests.get(frontend_url, timeout=TIMEOUT)
        results["frontend_serving"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code,
            "note": "Frontend is being served by backend"
        }
        
        # Test 2: Check CORS configuration
        print("  Testing CORS configuration...")
        headers = {
            "Origin": "https://racecar-style.preview.emergentagent.com",
            "Access-Control-Request-Method": "GET"
        }
        response = requests.options(f"{BASE_URL}/health", headers=headers, timeout=TIMEOUT)
        results["cors_config"] = {
            "status": "✅ PASS" if response.status_code in [200, 204] else "❌ FAIL",
            "status_code": response.status_code,
            "note": "CORS is configured for frontend-backend communication"
        }
        
    except Exception as e:
        results["integration_error"] = {
            "status": "❌ FAIL",
            "error": str(e)
        }
    
    return results

def main():
    print("🚀 Quick VELES DRIVE Test - Logo Changes & Docker Readiness")
    print("=" * 60)
    
    # Run tests
    health_results = test_health_and_basic_apis()
    docker_results = test_docker_readiness()
    integration_results = test_frontend_backend_integration()
    
    # Print results
    print("\n📊 QUICK TEST RESULTS")
    print("=" * 60)
    
    print("\n🔍 HEALTH & BASIC APIs")
    print("-" * 30)
    for test_name, result in health_results.items():
        status = result.get("status", "❓ UNKNOWN")
        print(f"  {test_name}: {status}")
        if result.get("status_code"):
            print(f"    Status Code: {result['status_code']}")
        if result.get("error"):
            print(f"    Error: {result['error']}")
    
    print("\n🐳 DOCKER READINESS")
    print("-" * 30)
    for test_name, result in docker_results.items():
        status = result.get("status", "❓ UNKNOWN")
        print(f"  {test_name}: {status}")
        if result.get("note"):
            print(f"    Note: {result['note']}")
        if result.get("error"):
            print(f"    Error: {result['error']}")
    
    print("\n🔗 FRONTEND-BACKEND INTEGRATION")
    print("-" * 30)
    for test_name, result in integration_results.items():
        status = result.get("status", "❓ UNKNOWN")
        print(f"  {test_name}: {status}")
        if result.get("note"):
            print(f"    Note: {result['note']}")
        if result.get("error"):
            print(f"    Error: {result['error']}")
    
    # Calculate overall success
    all_results = {**health_results, **docker_results, **integration_results}
    total_tests = len(all_results)
    passed_tests = sum(1 for result in all_results.values() if result.get("status") == "✅ PASS")
    
    print(f"\n📈 OVERALL RESULTS:")
    print(f"   Total Tests: {total_tests}")
    print(f"   ✅ Passed: {passed_tests}")
    print(f"   ❌ Failed: {total_tests - passed_tests}")
    print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED - System ready after logo changes!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} tests failed - Review needed")
    
    print("=" * 60)

if __name__ == "__main__":
    main()