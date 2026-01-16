from fastapi import APIRouter, HTTPException, status, Depends, Request
from datetime import datetime
from bson import ObjectId
from typing import Optional
import stripe

from ..database import get_users_collection
from ..config import settings
from ..utils import get_current_user

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

PRICE_IDS = {
    "weekly": settings.STRIPE_PRICE_WEEKLY,
    "monthly": settings.STRIPE_PRICE_MONTHLY,
    "yearly": settings.STRIPE_PRICE_YEARLY,
}


@router.post("/create-checkout-session")
async def create_checkout_session(
    plan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe checkout session for subscription."""
    if plan_id not in PRICE_IDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan selected"
        )
    
    users = get_users_collection()
    user_id = current_user["_id"]
    
    try:
        # Create or get Stripe customer
        if current_user.get("stripeCustomerId"):
            customer_id = current_user["stripeCustomerId"]
        else:
            customer = stripe.Customer.create(
                email=current_user["email"],
                name=current_user["name"],
                metadata={"user_id": str(user_id)}
            )
            customer_id = customer.id
            
            # Save customer ID to user
            await users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"stripeCustomerId": customer_id, "updatedAt": datetime.utcnow()}}
            )
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": PRICE_IDS[plan_id],
                "quantity": 1,
            }],
            mode="subscription",
            success_url=f"{settings.APP_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.APP_URL}/payment-cancel",
            metadata={
                "user_id": str(user_id),
                "plan_id": plan_id
            }
        )
        
        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    users = get_users_collection()
    
    # Handle subscription events
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"].get("user_id")
        
        if user_id:
            subscription = stripe.Subscription.retrieve(session["subscription"])
            await users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "isPremium": True,
                        "subscriptionStatus": "active",
                        "subscriptionId": session["subscription"],
                        "subscriptionEndDate": datetime.fromtimestamp(subscription["current_period_end"]),
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription["customer"]
        
        user = await users.find_one({"stripeCustomerId": customer_id})
        if user:
            await users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "isPremium": False,
                        "subscriptionStatus": "cancelled",
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
    
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        customer_id = subscription["customer"]
        
        user = await users.find_one({"stripeCustomerId": customer_id})
        if user:
            status_map = {
                "active": "active",
                "past_due": "active",
                "canceled": "cancelled",
                "unpaid": "expired"
            }
            await users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "isPremium": subscription["status"] == "active",
                        "subscriptionStatus": status_map.get(subscription["status"], "none"),
                        "subscriptionEndDate": datetime.fromtimestamp(subscription["current_period_end"]),
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
    
    return {"status": "success"}


@router.get("/subscription-status")
async def get_subscription_status(current_user: dict = Depends(get_current_user)):
    """Get current user's subscription status."""
    return {
        "isPremium": current_user.get("isPremium", False),
        "subscriptionStatus": current_user.get("subscriptionStatus", "none"),
        "subscriptionId": current_user.get("subscriptionId"),
        "subscriptionEndDate": current_user.get("subscriptionEndDate")
    }


@router.post("/cancel-subscription")
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    """Cancel the current user's subscription."""
    subscription_id = current_user.get("subscriptionId")
    
    if not subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription found"
        )
    
    try:
        # Cancel at period end
        stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
        
        return {"message": "Subscription will be cancelled at the end of the billing period"}
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
