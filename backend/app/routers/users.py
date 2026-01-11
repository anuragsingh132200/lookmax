from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from typing import List

from ..database import get_users_collection, get_progress_collection
from ..models import UserUpdate, OnboardingData, ProgressCreate
from ..utils import get_current_user

router = APIRouter()


@router.put("/onboarding")
async def save_onboarding(
    onboarding_data: OnboardingData,
    current_user: dict = Depends(get_current_user)
):
    """Save user onboarding data."""
    users = get_users_collection()
    
    await users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {
            "$set": {
                "onboarding": onboarding_data.model_dump(),
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Onboarding data saved successfully"}


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile."""
    return {
        "id": current_user["_id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "bio": current_user.get("bio", ""),
        "avatar": current_user.get("avatar"),
        "role": current_user.get("role", "user"),
        "isVerified": current_user.get("isVerified", False),
        "isPremium": current_user.get("isPremium", False),
        "onboarding": current_user.get("onboarding"),
        "createdAt": current_user.get("createdAt")
    }


@router.put("/profile")
async def update_profile(
    profile_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile."""
    users = get_users_collection()
    
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    await users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated successfully"}


@router.post("/progress")
async def add_progress_photo(
    progress_data: ProgressCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a progress photo."""
    progress = get_progress_collection()
    
    new_progress = {
        "userId": current_user["_id"],
        "imageBase64": progress_data.imageBase64,
        "notes": progress_data.notes,
        "createdAt": datetime.utcnow()
    }
    
    result = await progress.insert_one(new_progress)
    
    return {
        "id": str(result.inserted_id),
        "message": "Progress photo saved successfully"
    }


@router.get("/progress")
async def get_progress_photos(current_user: dict = Depends(get_current_user)):
    """Get user's progress photos."""
    progress = get_progress_collection()
    
    cursor = progress.find(
        {"userId": current_user["_id"]}
    ).sort("createdAt", -1).limit(50)
    
    photos = []
    async for photo in cursor:
        photos.append({
            "id": str(photo["_id"]),
            "notes": photo.get("notes"),
            "createdAt": photo["createdAt"]
        })
    
    return photos


@router.get("/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """Get user statistics for the profile page."""
    from ..database import get_scans_collection, get_posts_collection
    
    scans = get_scans_collection()
    progress = get_progress_collection()
    posts = get_posts_collection()
    
    # Count user's data
    scan_count = await scans.count_documents({"userId": current_user["_id"]})
    progress_count = await progress.count_documents({"userId": current_user["_id"]})
    post_count = await posts.count_documents({"userId": current_user["_id"]})
    
    # Get latest scan score
    latest_scan = await scans.find_one(
        {"userId": current_user["_id"]},
        sort=[("createdAt", -1)]
    )
    
    latest_score = None
    if latest_scan and latest_scan.get("analysis"):
        latest_score = latest_scan["analysis"].get("overallScore")
    
    return {
        "scanCount": scan_count,
        "progressCount": progress_count,
        "postCount": post_count,
        "latestScore": latest_score,
        "memberSince": current_user.get("createdAt")
    }


@router.get("/leaderboard")
async def get_leaderboard():
    """Get the leaderboard of top users."""
    from ..database import get_scans_collection
    
    scans = get_scans_collection()
    users_coll = get_users_collection()
    
    # Aggregate to find users with highest scores
    pipeline = [
        {"$sort": {"createdAt": -1}},
        {"$group": {
            "_id": "$userId",
            "latestScore": {"$first": "$analysis.overallScore"},
            "scanCount": {"$sum": 1}
        }},
        {"$match": {"latestScore": {"$ne": None}}},
        {"$sort": {"latestScore": -1}},
        {"$limit": 50}
    ]
    
    cursor = scans.aggregate(pipeline)
    
    leaderboard = []
    rank = 1
    async for entry in cursor:
        user = await users_coll.find_one({"_id": ObjectId(entry["_id"])})
        if user:
            leaderboard.append({
                "rank": rank,
                "userId": entry["_id"],
                "userName": user.get("name", "Anonymous"),
                "avatar": user.get("avatar"),
                "score": entry["latestScore"],
                "scanCount": entry["scanCount"]
            })
            rank += 1
    
    return leaderboard
