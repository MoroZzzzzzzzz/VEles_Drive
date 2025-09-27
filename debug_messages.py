#!/usr/bin/env python3
"""
Debug script for message system issues
"""

import requests
import json
import uuid

BASE_URL = "https://racecar-style.preview.emergentagent.com/api"

def debug_message_issue():
    """Debug the message sending issue"""
    
    # Step 1: Register a buyer
    buyer_data = {
        "email": f"debug_buyer_{uuid.uuid4().hex[:8]}@test.com",
        "phone": "+7-999-111-2222",
        "first_name": "Тест",
        "last_name": "Покупатель",
        "password": "TestPass123",
        "role": "buyer"
    }
    
    print("1. Registering buyer...")
    response = requests.post(f"{BASE_URL}/auth/register", json=buyer_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        buyer_result = response.json()
        buyer_id = buyer_result.get("id")
        print(f"   Buyer ID: {buyer_id}")
    else:
        print(f"   Error: {response.text}")
        return
    
    # Step 2: Register a dealer
    dealer_data = {
        "email": f"debug_dealer_{uuid.uuid4().hex[:8]}@test.com",
        "phone": "+7-999-333-4444",
        "first_name": "Тест",
        "last_name": "Дилер",
        "password": "DealerPass123",
        "role": "dealer"
    }
    
    print("2. Registering dealer...")
    response = requests.post(f"{BASE_URL}/auth/register", json=dealer_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        dealer_result = response.json()
        dealer_id = dealer_result.get("id")
        print(f"   Dealer ID: {dealer_id}")
    else:
        print(f"   Error: {response.text}")
        return
    
    # Step 3: Login as buyer
    print("3. Logging in as buyer...")
    login_data = {
        "email": buyer_data["email"],
        "password": buyer_data["password"]
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        login_result = response.json()
        buyer_token = login_result.get("access_token")
        print(f"   Token obtained: {buyer_token[:20]}...")
    else:
        print(f"   Error: {response.text}")
        return
    
    # Step 4: Try to send message from buyer to dealer
    print("4. Sending message from buyer to dealer...")
    message_data = {
        "recipient_id": dealer_id,
        "content": "Тестовое сообщение для отладки",
        "message_type": "text"
    }
    
    headers = {"Authorization": f"Bearer {buyer_token}"}
    response = requests.post(f"{BASE_URL}/messages/", json=message_data, headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text}")
    
    # Step 5: Check if dealer exists in users collection by trying to get profile
    print("5. Checking dealer profile...")
    dealer_login_data = {
        "email": dealer_data["email"],
        "password": dealer_data["password"]
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=dealer_login_data)
    if response.status_code == 200:
        dealer_token = response.json().get("access_token")
        headers = {"Authorization": f"Bearer {dealer_token}"}
        response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
        print(f"   Dealer profile status: {response.status_code}")
        if response.status_code == 200:
            profile = response.json()
            print(f"   Dealer profile ID: {profile.get('id')}")
            print(f"   Dealer profile role: {profile.get('role')}")
        else:
            print(f"   Dealer profile error: {response.text}")

if __name__ == "__main__":
    debug_message_issue()