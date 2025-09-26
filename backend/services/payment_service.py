import os
import stripe
from typing import Dict, Optional
import logging
from ..models import User, Dealer

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class PaymentService:
    def __init__(self):
        self.stripe_public_key = os.getenv("STRIPE_PUBLIC_KEY")
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        
        # Pricing plans (in kopecks for Stripe)
        self.pricing_plans = {
            "premium_placement": {
                "name": "Премиум размещение",
                "price": 500000,  # 5000 рублей в копейках
                "currency": "rub",
                "description": "Премиум размещение автомобиля на 30 дней"
            },
            "dealer_basic": {
                "name": "Базовый план дилера",
                "price": 0,  # Бесплатно
                "currency": "rub", 
                "description": "До 10 автомобилей, базовые функции"
            },
            "dealer_pro": {
                "name": "Про план дилера",
                "price": 2500000,  # 25000 рублей в копейках
                "currency": "rub",
                "description": "До 50 автомобилей, расширенная аналитика"
            },
            "dealer_enterprise": {
                "name": "Корпоративный план",
                "price": 5000000,  # 50000 рублей в копейках  
                "currency": "rub",
                "description": "Безлимитные автомобили, полная ERP система"
            }
        }
    
    async def create_payment_intent(self, plan_id: str, user_id: str, metadata: Dict = None) -> Dict:
        """Create Stripe payment intent"""
        try:
            if plan_id not in self.pricing_plans:
                raise ValueError(f"Invalid plan: {plan_id}")
            
            plan = self.pricing_plans[plan_id]
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=plan["price"],
                currency=plan["currency"],
                metadata={
                    "user_id": user_id,
                    "plan_id": plan_id,
                    **(metadata or {})
                },
                description=plan["description"]
            )
            
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "amount": plan["price"],
                "currency": plan["currency"],
                "description": plan["description"]
            }
            
        except Exception as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            raise Exception(f"Payment creation failed: {str(e)}")
    
    async def confirm_payment(self, payment_intent_id: str) -> Dict:
        """Confirm and process payment"""
        try:
            # Retrieve payment intent
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == "succeeded":
                return {
                    "status": "success",
                    "payment_id": intent.id,
                    "amount": intent.amount,
                    "currency": intent.currency,
                    "metadata": intent.metadata
                }
            else:
                return {
                    "status": "pending",
                    "payment_id": intent.id,
                    "current_status": intent.status
                }
                
        except Exception as e:
            logger.error(f"Error confirming payment: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def process_webhook(self, payload: bytes, signature: str) -> Dict:
        """Process Stripe webhook"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            
            if event["type"] == "payment_intent.succeeded":
                intent = event["data"]["object"]
                
                # Process successful payment
                await self._handle_successful_payment(intent)
                
                return {"status": "success", "event_type": event["type"]}
                
            elif event["type"] == "payment_intent.payment_failed":
                intent = event["data"]["object"]
                
                # Handle failed payment
                logger.warning(f"Payment failed for intent {intent['id']}")
                
                return {"status": "failed", "event_type": event["type"]}
            
            return {"status": "ignored", "event_type": event["type"]}
            
        except Exception as e:
            logger.error(f"Webhook processing error: {str(e)}")
            raise Exception(f"Webhook processing failed: {str(e)}")
    
    async def _handle_successful_payment(self, intent: Dict):
        """Handle successful payment processing"""
        try:
            metadata = intent.get("metadata", {})
            user_id = metadata.get("user_id")
            plan_id = metadata.get("plan_id")
            
            if not user_id or not plan_id:
                logger.error(f"Missing metadata in payment intent {intent['id']}")
                return
            
            # Process based on plan type
            if plan_id == "premium_placement":
                vehicle_id = metadata.get("vehicle_id")
                if vehicle_id:
                    await self._activate_premium_placement(vehicle_id)
            
            elif plan_id.startswith("dealer_"):
                await self._upgrade_dealer_plan(user_id, plan_id)
            
            logger.info(f"Successfully processed payment {intent['id']} for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error handling successful payment: {str(e)}")
    
    async def _activate_premium_placement(self, vehicle_id: str):
        """Activate premium placement for vehicle"""
        # This would update the vehicle in database
        # For now, just log
        logger.info(f"Activated premium placement for vehicle {vehicle_id}")
    
    async def _upgrade_dealer_plan(self, user_id: str, plan_id: str):
        """Upgrade dealer subscription plan"""
        # This would update dealer subscription in database
        # For now, just log  
        logger.info(f"Upgraded dealer {user_id} to plan {plan_id}")
    
    def get_pricing_plans(self) -> Dict:
        """Get available pricing plans"""
        return {
            plan_id: {
                "name": plan["name"],
                "price": plan["price"] / 100,  # Convert kopecks to rubles
                "currency": plan["currency"],
                "description": plan["description"]
            }
            for plan_id, plan in self.pricing_plans.items()
        }

# Global service instance  
payment_service = PaymentService()