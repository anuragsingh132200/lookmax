from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from ..models.user import UserResponse, UserUpdate, OnboardingData
from ..database import get_database
from ..utils.auth import get_current_active_user, get_admin_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_active_user)):
    """Get current user's profile."""
    return UserResponse(
        id=current_user["_id"],
        email=current_user["email"],
        name=current_user["name"],
        onboarding=current_user.get("onboarding"),
        subscription=current_user.get("subscription"),
        isOnboarded=current_user.get("isOnboarded", False),
        hasCompletedFirstScan=current_user.get("hasCompletedFirstScan", False),
        createdAt=current_user.get("createdAt")
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update current user's profile."""
    db = get_database()
    
    update_data = {}
    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.onboarding is not None:
        update_data["onboarding"] = user_update.onboarding.dict()
    if user_update.isOnboarded is not None:
        update_data["isOnboarded"] = user_update.isOnboarded
    if user_update.hasCompletedFirstScan is not None:
        update_data["hasCompletedFirstScan"] = user_update.hasCompletedFirstScan
    
    if update_data:
        update_data["updatedAt"] = datetime.utcnow()
        await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": update_data}
        )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    updated_user["_id"] = str(updated_user["_id"])
    
    return UserResponse(
        id=updated_user["_id"],
        email=updated_user["email"],
        name=updated_user["name"],
        onboarding=updated_user.get("onboarding"),
        subscription=updated_user.get("subscription"),
        isOnboarded=updated_user.get("isOnboarded", False),
        hasCompletedFirstScan=updated_user.get("hasCompletedFirstScan", False),
        createdAt=updated_user.get("createdAt")
    )


@router.post("/onboarding")
async def save_onboarding(
    onboarding_data: OnboardingData,
    current_user: dict = Depends(get_current_active_user)
):
    """Save user's onboarding data."""
    db = get_database()
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {
            "$set": {
                "onboarding": onboarding_data.dict(),
                "isOnboarded": True,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Onboarding data saved successfully"}


# Admin endpoints
@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    admin_user: dict = Depends(get_admin_user)
):
    """List all users (admin only)."""
    db = get_database()
    
    users = await db.users.find().skip(skip).limit(limit).to_list(limit)
    
    return [
        UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user["name"],
            onboarding=user.get("onboarding"),
            subscription=user.get("subscription"),
            isOnboarded=user.get("isOnboarded", False),
            hasCompletedFirstScan=user.get("hasCompletedFirstScan", False),
            createdAt=user.get("createdAt")
        )
        for user in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    admin_user: dict = Depends(get_admin_user)
):
    """Get a specific user (admin only)."""
    db = get_database()
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        onboarding=user.get("onboarding"),
        subscription=user.get("subscription"),
        isOnboarded=user.get("isOnboarded", False),
        hasCompletedFirstScan=user.get("hasCompletedFirstScan", False),
        createdAt=user.get("createdAt")
    )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    admin_user: dict = Depends(get_admin_user)
):
    """Delete a user (admin only)."""
    db = get_database()
    
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=404, detail="User not found")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Also delete user's data
    await db.scans.delete_many({"userId": user_id})
    await db.progress.delete_many({"userId": user_id})
    
    return {"message": "User deleted successfully"}
