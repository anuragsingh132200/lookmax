from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from bson import ObjectId

from ..database import get_users_collection
from ..models import UserCreate, UserLogin, UserResponse, Token
from ..utils import hash_password, verify_password, create_access_token

router = APIRouter()


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
    
    # Create new user
    new_user = {
        "email": user_data.email,
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "role": "user",
        "isVerified": False,
        "isPremium": False,
        "onboarding": None,
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


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = None):
    """Get current user information."""
    from ..utils import get_current_user
    from fastapi import Depends
    
    # This is a workaround - the actual dependency injection happens in the route
    pass


# Re-define with proper dependency
from ..utils import get_current_user
from fastapi import Depends


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
        "createdAt": current_user.get("createdAt")
    }
