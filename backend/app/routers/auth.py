from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional
import httpx

from ..database import get_users_collection
from ..models import UserCreate, UserLogin, UserResponse, Token
from ..utils import hash_password, verify_password, create_access_token, get_current_user
from ..config import settings

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    idToken: str


class UserStateUpdate(BaseModel):
    hasSeenFeatureHighlights: Optional[bool] = None
    hasCompletedFirstScan: Optional[bool] = None


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user."""
    users = get_users_collection()
    
    # Check if user already exists
    existing_user = await users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with all state fields
    new_user = {
        "email": user_data.email,
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "role": "user",
        "isVerified": False,
        "isPremium": False,
        "onboarding": None,
        "googleId": None,
        "avatar": None,
        "hasSeenFeatureHighlights": False,
        "hasCompletedFirstScan": False,
        "subscriptionStatus": "none",
        "stripeCustomerId": None,
        "subscriptionId": None,
        "subscriptionEndDate": None,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await users.insert_one(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(result.inserted_id)})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login an existing user."""
    users = get_users_collection()
    
    # Find user by email
    user = await users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google", response_model=Token)
async def google_auth(auth_data: GoogleAuthRequest):
    """Authenticate with Google OAuth."""
    users = get_users_collection()
    
    # Verify Google ID token
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={auth_data.idToken}"
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            
            google_user = response.json()
            
            # Validate audience (client ID)
            if settings.GOOGLE_CLIENT_ID and google_user.get("aud") != settings.GOOGLE_CLIENT_ID:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token audience"
                )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify Google token"
        )
    
    email = google_user.get("email")
    name = google_user.get("name", email.split("@")[0])
    google_id = google_user.get("sub")
    avatar = google_user.get("picture")
    
    # Check if user exists by Google ID or email
    existing_user = await users.find_one({
        "$or": [
            {"googleId": google_id},
            {"email": email}
        ]
    })
    
    if existing_user:
        # Update Google ID if not set (linking existing email account)
        if not existing_user.get("googleId"):
            await users.update_one(
                {"_id": existing_user["_id"]},
                {
                    "$set": {
                        "googleId": google_id,
                        "avatar": avatar or existing_user.get("avatar"),
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
        user_id = str(existing_user["_id"])
        is_new_user = False
    else:
        # Create new user
        new_user = {
            "email": email,
            "name": name,
            "password": None,  # No password for OAuth users
            "role": "user",
            "isVerified": True,  # Google verified email
            "isPremium": False,
            "onboarding": None,
            "googleId": google_id,
            "avatar": avatar,
            "hasSeenFeatureHighlights": False,
            "hasCompletedFirstScan": False,
            "subscriptionStatus": "none",
            "stripeCustomerId": None,
            "subscriptionId": None,
            "subscriptionEndDate": None,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await users.insert_one(new_user)
        user_id = str(result.inserted_id)
        is_new_user = True
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": is_new_user
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    return {
        "id": current_user["_id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user.get("role", "user"),
        "isVerified": current_user.get("isVerified", False),
        "isPremium": current_user.get("isPremium", False),
        "onboarding": current_user.get("onboarding"),
        "googleId": current_user.get("googleId"),
        "avatar": current_user.get("avatar"),
        "hasSeenFeatureHighlights": current_user.get("hasSeenFeatureHighlights", False),
        "hasCompletedFirstScan": current_user.get("hasCompletedFirstScan", False),
        "subscriptionStatus": current_user.get("subscriptionStatus", "none"),
        "subscriptionEndDate": current_user.get("subscriptionEndDate"),
        "createdAt": current_user.get("createdAt")
    }


@router.put("/update-state")
async def update_user_state(
    state_data: UserStateUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user journey state fields."""
    users = get_users_collection()
    
    update_fields = {"updatedAt": datetime.utcnow()}
    
    if state_data.hasSeenFeatureHighlights is not None:
        update_fields["hasSeenFeatureHighlights"] = state_data.hasSeenFeatureHighlights
    
    if state_data.hasCompletedFirstScan is not None:
        update_fields["hasCompletedFirstScan"] = state_data.hasCompletedFirstScan
    
    await users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_fields}
    )
    
    return {"message": "User state updated successfully"}
