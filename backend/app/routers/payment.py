from fastapi import APIRouter, HTTPException, Depends, Request, status
from ..database import get_database
from ..utils.auth import get_current_active_user
from ..services.stripe_service import (
    create_customer,
    create_checkout_session,
    create_payment_intent,
    handle_webhook_event,
    verify_payment,
    handle_successful_payment
)
from ..config import settings
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/payments", tags=["Payments"])


class CreateCheckoutRequest(BaseModel):
    pass


class VerifyPaymentRequest(BaseModel):
    payment_intent_id: str


@router.post("/create-checkout")
async def create_checkout(
    current_user: dict = Depends(get_current_active_user)
):
    """Create a Stripe checkout session for subscription."""
    db = get_database()
    user_id = current_user["_id"]
    
    # Get or create Stripe customer
    subscription = current_user.get("subscription", {})
    customer_id = subscription.get("stripeCustomerId")
    
    if not customer_id:
        customer_id = await create_customer(
            email=current_user["email"],
            name=current_user["name"],
            user_id=user_id
        )
        
        # Save customer ID
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"subscription.stripeCustomerId": customer_id}}
        )
    
    # Create checkout session
    session = await create_checkout_session(user_id, customer_id)
    
    return session


@router.post("/create-payment-intent")
async def create_mobile_payment_intent(
    current_user: dict = Depends(get_current_active_user)
):
    """Create a payment intent for mobile app payment."""
    db = get_database()
    user_id = current_user["_id"]
    
    # Get or create Stripe customer
    subscription = current_user.get("subscription", {})
    customer_id = subscription.get("stripeCustomerId")
    
    if not customer_id:
        customer_id = await create_customer(
            email=current_user["email"],
            name=current_user["name"],
            user_id=user_id
        )
        
        # Save customer ID
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"subscription.stripeCustomerId": customer_id}}
        )
    
    # Create payment intent
    intent = await create_payment_intent(user_id, customer_id)
    
    return {
        "clientSecret": intent["client_secret"],
        "paymentIntentId": intent["payment_intent_id"],
        "publishableKey": settings.stripe_publishable_key
    }


@router.post("/verify")
async def verify_payment_status(
    request: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Verify a payment intent status after payment."""
    result = await verify_payment(request.payment_intent_id)
    
    if result["succeeded"]:
        # Update subscription
        await handle_successful_payment(current_user["_id"])
        
        return {
            "success": True,
            "message": "Payment successful! Your subscription is now active."
        }
    
    return {
        "success": False,
        "status": result["status"],
        "message": "Payment not completed"
    }


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        result = await handle_webhook_event(payload, sig_header)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/status")
async def get_subscription_status(
    current_user: dict = Depends(get_current_active_user)
):
    """Get current subscription status."""
    subscription = current_user.get("subscription", {})
    
    return {
        "status": subscription.get("status", "free"),
        "expiresAt": subscription.get("expiresAt"),
        "isActive": subscription.get("status") == "active"
    }
