from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from typing import Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from auth import get_current_user  
from database import db

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/payments", tags=["payments"])

# Initialize Stripe
STRIPE_API_KEY = os.getenv('STRIPE_API_KEY')
if not STRIPE_API_KEY:
    raise ValueError("STRIPE_API_KEY environment variable is required")

class PaymentRequest(BaseModel):
    vehicle_id: str
    payment_type: str = "full"  # full, booking
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, str]] = {}

class BookingPaymentRequest(BaseModel):
    vehicle_id: str
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, str]] = {}

@router.post("/vehicle/checkout", response_model=CheckoutSessionResponse)
async def create_vehicle_payment_session(
    payment_request: PaymentRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Create payment session for vehicle purchase"""
    try:
        # Get vehicle details
        vehicle = await db.db.vehicles.find_one({"id": payment_request.vehicle_id})
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if vehicle is available
        if not vehicle.get("is_available", False):
            raise HTTPException(status_code=400, detail="Vehicle is not available for purchase")
        
        # Calculate amount based on payment type
        if payment_request.payment_type == "full":
            amount = float(vehicle["price"])
            description = f"Full payment for {vehicle.get('make', '')} {vehicle.get('model', '')} {vehicle.get('year', '')}"
        elif payment_request.payment_type == "booking":
            # Booking fee is 10% of vehicle price, minimum $1000, maximum $50000
            booking_fee = max(1000, min(50000, float(vehicle["price"]) * 0.1))
            amount = booking_fee
            description = f"Booking fee for {vehicle.get('make', '')} {vehicle.get('model', '')} {vehicle.get('year', '')}"
        else:
            raise HTTPException(status_code=400, detail="Invalid payment type")
        
        # Initialize Stripe checkout
        base_url = payment_request.success_url.split('/')[0:3]  # Extract protocol and domain
        webhook_url = f"{'://'.join(base_url[0:2])}//{base_url[2]}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Prepare metadata
        metadata = {
            "vehicle_id": payment_request.vehicle_id,
            "user_id": current_user.id,
            "payment_type": payment_request.payment_type,
            "description": description,
            **payment_request.metadata
        }
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="rub",  # Russian rubles for car sales
            success_url=payment_request.success_url,
            cancel_url=payment_request.cancel_url,
            metadata=metadata
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction_id = str(uuid.uuid4())
        transaction_doc = {
            "id": transaction_id,
            "session_id": session.session_id,
            "user_id": current_user.id,
            "vehicle_id": payment_request.vehicle_id,
            "amount": amount,
            "currency": "rub",
            "payment_type": payment_request.payment_type,
            "payment_status": "pending",
            "status": "initiated",
            "description": description,
            "metadata": metadata,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.db.payment_transactions.insert_one(transaction_doc)
        
        return session
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error creating payment session: {str(e)}")

@router.post("/booking/checkout", response_model=CheckoutSessionResponse) 
async def create_booking_payment_session(
    booking_request: BookingPaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create booking payment session (10% of vehicle price)"""
    payment_request = PaymentRequest(
        vehicle_id=booking_request.vehicle_id,
        payment_type="booking",
        success_url=booking_request.success_url,
        cancel_url=booking_request.cancel_url,
        metadata=booking_request.metadata
    )
    
    return await create_vehicle_payment_session(payment_request, BackgroundTasks(), current_user)

@router.get("/status/{session_id}", response_model=CheckoutStatusResponse)
async def get_payment_status(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get payment status and update transaction"""
    try:
        # Initialize Stripe checkout  
        webhook_url = f"https://auto-dealership-5.preview.emergentagent.com/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Get status from Stripe
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Find transaction in database
        transaction = await db.db.payment_transactions.find_one({"session_id": session_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Check if user has access to this transaction
        if transaction["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Update transaction status if changed
        if transaction["payment_status"] != checkout_status.payment_status:
            await db.db.payment_transactions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "payment_status": checkout_status.payment_status,
                        "status": checkout_status.status,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # If payment successful, update vehicle status
            if checkout_status.payment_status == "paid":
                await handle_successful_payment(transaction)
        
        return checkout_status
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error checking payment status: {str(e)}")

@router.get("/transactions", response_model=list)
async def get_user_transactions(current_user: dict = Depends(get_current_user)):
    """Get user's payment transactions"""
    try:
        transactions = []
        async for transaction in db.db.payment_transactions.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1):
            # Get vehicle details
            vehicle = await db.db.vehicles.find_one({"id": transaction["vehicle_id"]})
            vehicle_info = {}
            if vehicle:
                vehicle_info = {
                    "make": vehicle.get("make", ""),
                    "model": vehicle.get("model", ""),
                    "year": vehicle.get("year", ""),
                    "images": vehicle.get("images", [])
                }
            
            transactions.append({
                "id": transaction["id"],
                "session_id": transaction["session_id"],
                "vehicle_id": transaction["vehicle_id"],
                "vehicle_info": vehicle_info,
                "amount": transaction["amount"],
                "currency": transaction["currency"],
                "payment_type": transaction["payment_type"],
                "payment_status": transaction["payment_status"],
                "status": transaction["status"],
                "description": transaction["description"],
                "created_at": transaction["created_at"],
                "updated_at": transaction["updated_at"]
            })
        
        return transactions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")

async def handle_successful_payment(transaction: dict):
    """Handle successful payment processing"""
    try:
        if transaction["payment_type"] == "full":
            # Full payment - mark vehicle as sold
            await db.db.vehicles.update_one(
                {"id": transaction["vehicle_id"]},
                {
                    "$set": {
                        "status": "sold",
                        "buyer_id": transaction["user_id"],
                        "sold_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        elif transaction["payment_type"] == "booking":
            # Booking payment - mark vehicle as booked
            await db.db.vehicles.update_one(
                {"id": transaction["vehicle_id"]},
                {
                    "$set": {
                        "status": "booked",
                        "booked_by": transaction["user_id"],
                        "booked_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
        print(f"Successfully processed payment for transaction {transaction['id']}")
        
    except Exception as e:
        print(f"Error handling successful payment: {e}")

# Fixed vehicle packages for security
VEHICLE_PACKAGES = {
    "test_small": 5000.0,  # Test package for small cars
    "test_medium": 15000.0,  # Test package for medium cars  
    "test_luxury": 50000.0,  # Test package for luxury cars
    "booking_fee": 1000.0   # Standard booking fee
}

@router.post("/packages/checkout", response_model=CheckoutSessionResponse)
async def create_package_payment_session(
    package_id: str,
    success_url: str,
    cancel_url: str,
    metadata: Optional[Dict[str, str]] = {},
    current_user: dict = Depends(get_current_user)
):
    """Create payment session for fixed packages (for testing and demos)"""
    try:
        # Validate package exists
        if package_id not in VEHICLE_PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid package")
        
        # Get amount from server-defined packages only
        amount = VEHICLE_PACKAGES[package_id]
        
        # Initialize Stripe checkout
        base_url = success_url.split('/')[0:3]  # Extract protocol and domain
        webhook_url = f"{'://'.join(base_url[0:2])}//{base_url[2]}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Prepare metadata
        payment_metadata = {
            "package_id": package_id,
            "user_id": current_user.id,
            "payment_type": "package",
            **metadata
        }
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="rub",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=payment_metadata
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction_id = str(uuid.uuid4())
        transaction_doc = {
            "id": transaction_id,
            "session_id": session.session_id,
            "user_id": current_user.id,
            "vehicle_id": None,  # No specific vehicle for package payments
            "package_id": package_id,
            "amount": amount,
            "currency": "rub", 
            "payment_type": "package",
            "payment_status": "pending",
            "status": "initiated",
            "description": f"Package payment: {package_id}",
            "metadata": payment_metadata,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.db.payment_transactions.insert_one(transaction_doc)
        
        return session
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error creating package payment: {str(e)}")

@router.get("/packages", response_model=Dict[str, Any])
async def get_payment_packages():
    """Get available payment packages"""
    return {
        "packages": {
            package_id: {
                "amount": amount,
                "currency": "rub",
                "description": f"Test package: {package_id.replace('_', ' ').title()}"
            }
            for package_id, amount in VEHICLE_PACKAGES.items()
        }
    }