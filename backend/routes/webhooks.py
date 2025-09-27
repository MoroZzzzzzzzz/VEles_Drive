from fastapi import APIRouter, Request, HTTPException
# Mock Stripe integration for testing
class StripeCheckout:
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def verify_webhook_signature(self, payload: bytes, signature: str, secret: str) -> bool:
        # Mock implementation - always return True for testing
        return True
import os
from dotenv import load_dotenv
from database import db
from datetime import datetime

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/webhook", tags=["webhooks"])

# Initialize Stripe
STRIPE_API_KEY = os.getenv('STRIPE_API_KEY')
if not STRIPE_API_KEY:
    raise ValueError("STRIPE_API_KEY environment variable is required")

@router.post("/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        # Get raw body and signature
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        # Initialize Stripe checkout
        webhook_url = f"https://hello-analyzer.preview.emergentagent.com/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Process webhook event
        if webhook_response.event_type == "checkout.session.completed":
            await handle_payment_success(webhook_response)
        elif webhook_response.event_type == "checkout.session.expired":
            await handle_payment_expired(webhook_response)
        
        return {"status": "success"}
        
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

async def handle_payment_success(webhook_response):
    """Handle successful payment webhook"""
    try:
        session_id = webhook_response.session_id
        
        # Find and update transaction
        transaction = await db.db.payment_transactions.find_one({"session_id": session_id})
        if not transaction:
            print(f"Transaction not found for session {session_id}")
            return
        
        # Update transaction status
        await db.db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "payment_status": "paid",
                    "status": "completed",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Handle post-payment processing
        if transaction.get("vehicle_id"):
            await handle_vehicle_payment_success(transaction)
        
        print(f"Payment successful for session {session_id}")
        
    except Exception as e:
        print(f"Error handling payment success: {e}")

async def handle_payment_expired(webhook_response):
    """Handle expired payment webhook"""
    try:
        session_id = webhook_response.session_id
        
        # Update transaction status
        await db.db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "payment_status": "expired",
                    "status": "expired",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        print(f"Payment expired for session {session_id}")
        
    except Exception as e:
        print(f"Error handling payment expiration: {e}")

async def handle_vehicle_payment_success(transaction):
    """Handle vehicle-specific payment success"""
    try:
        vehicle_id = transaction["vehicle_id"]
        payment_type = transaction["payment_type"]
        user_id = transaction["user_id"]
        
        if payment_type == "full":
            # Full payment - mark vehicle as sold
            await db.db.vehicles.update_one(
                {"id": vehicle_id},
                {
                    "$set": {
                        "status": "sold",
                        "buyer_id": user_id,
                        "sold_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            print(f"Vehicle {vehicle_id} marked as sold to user {user_id}")
            
        elif payment_type == "booking":
            # Booking payment - mark vehicle as booked
            await db.db.vehicles.update_one(
                {"id": vehicle_id},
                {
                    "$set": {
                        "status": "booked",
                        "booked_by": user_id,
                        "booked_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            print(f"Vehicle {vehicle_id} marked as booked by user {user_id}")
            
    except Exception as e:
        print(f"Error handling vehicle payment success: {e}")