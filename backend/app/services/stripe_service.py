import stripe
from ..config import settings
from ..database import get_database
from datetime import datetime, timedelta
from bson import ObjectId

# Configure Stripe
stripe.api_key = settings.stripe_secret_key


async def create_customer(email: str, name: str, user_id: str) -> str:
    """Create a Stripe customer for a user."""
    try:
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"user_id": user_id}
        )
        return customer.id
    except stripe.error.StripeError as e:
        raise Exception(f"Failed to create Stripe customer: {str(e)}")


async def create_checkout_session(user_id: str, customer_id: str) -> dict:
    """Create a Stripe checkout session for subscription."""
    try:
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": settings.stripe_price_id,
                "quantity": 1
            }],
            mode="subscription",
            success_url=f"{settings.frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.frontend_url}/payment/cancel",
            metadata={"user_id": user_id}
        )
        return {
            "session_id": session.id,
            "url": session.url
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Failed to create checkout session: {str(e)}")


async def create_payment_intent(user_id: str, customer_id: str, amount: int = 999) -> dict:
    """Create a payment intent for one-time payment (mobile flow)."""
    try:
        # Create a payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount,  # Amount in cents ($9.99)
            currency="usd",
            customer=customer_id,
            metadata={"user_id": user_id},
            automatic_payment_methods={"enabled": True}
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Failed to create payment intent: {str(e)}")


async def handle_successful_payment(user_id: str, subscription_id: str = None):
    """Update user subscription status after successful payment."""
    db = get_database()
    
    # Calculate expiration (1 month from now for subscription)
    expires_at = datetime.utcnow() + timedelta(days=30)
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "subscription.status": "active",
                "subscription.stripeSubscriptionId": subscription_id,
                "subscription.expiresAt": expires_at,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    # Unblur all scans for this user
    await db.scans.update_many(
        {"userId": user_id},
        {"$set": {"isBlurred": False}}
    )


async def handle_webhook_event(payload: bytes, sig_header: str) -> dict:
    """Handle Stripe webhook events."""
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        raise Exception("Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise Exception("Invalid signature")
    
    # Handle the event
    if event.type == "checkout.session.completed":
        session = event.data.object
        user_id = session.metadata.get("user_id")
        subscription_id = session.subscription
        
        if user_id:
            await handle_successful_payment(user_id, subscription_id)
            
    elif event.type == "payment_intent.succeeded":
        intent = event.data.object
        user_id = intent.metadata.get("user_id")
        
        if user_id:
            await handle_successful_payment(user_id)
            
    elif event.type == "customer.subscription.deleted":
        subscription = event.data.object
        customer_id = subscription.customer
        
        db = get_database()
        await db.users.update_one(
            {"subscription.stripeCustomerId": customer_id},
            {
                "$set": {
                    "subscription.status": "cancelled",
                    "updatedAt": datetime.utcnow()
                }
            }
        )
    
    return {"status": "success", "event_type": event.type}


async def verify_payment(payment_intent_id: str) -> dict:
    """Verify a payment intent status."""
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return {
            "status": intent.status,
            "succeeded": intent.status == "succeeded"
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Failed to verify payment: {str(e)}")
