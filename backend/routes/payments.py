from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from typing import Dict
from ..services.payment_service import payment_service
from ..auth import get_current_active_user, get_dealer_user
from ..models import User

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/plans", response_model=Dict)
async def get_pricing_plans():
    """Get available pricing plans"""
    return payment_service.get_pricing_plans()

@router.post("/create-intent", response_model=Dict)
async def create_payment_intent(
    plan_id: str,
    vehicle_id: str = None,
    current_user: User = Depends(get_current_active_user)
):
    """Create payment intent for a plan"""
    try:
        metadata = {}
        if vehicle_id:
            metadata["vehicle_id"] = vehicle_id
        
        intent_data = await payment_service.create_payment_intent(
            plan_id=plan_id,
            user_id=current_user.id,
            metadata=metadata
        )
        
        return intent_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/confirm/{payment_intent_id}")
async def confirm_payment(
    payment_intent_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Confirm payment completion"""
    try:
        result = await payment_service.confirm_payment(payment_intent_id)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        signature = request.headers.get("stripe-signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing stripe signature")
        
        result = await payment_service.process_webhook(payload, signature)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/premium-placement/{vehicle_id}")
async def purchase_premium_placement(
    vehicle_id: str,
    current_user: User = Depends(get_dealer_user)
):
    """Purchase premium placement for vehicle"""
    try:
        intent_data = await payment_service.create_payment_intent(
            plan_id="premium_placement",
            user_id=current_user.id,
            metadata={"vehicle_id": vehicle_id}
        )
        
        return intent_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upgrade-dealer-plan")
async def upgrade_dealer_plan(
    plan_id: str,
    current_user: User = Depends(get_dealer_user)
):
    """Upgrade dealer subscription plan"""
    try:
        # Validate plan
        plans = payment_service.get_pricing_plans()
        if plan_id not in plans:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        intent_data = await payment_service.create_payment_intent(
            plan_id=plan_id,
            user_id=current_user.id
        )
        
        return intent_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))