from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional

from ..database import (
    get_users_collection, 
    get_content_collection, 
    get_scans_collection,
    get_posts_collection,
    get_events_collection
)
from ..models import ContentCreate, ContentUpdate
from ..utils import get_current_admin, hash_password

router = APIRouter()


# ============== USER MANAGEMENT ==============

@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 50,
    role: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all users (admin only)."""
    users = get_users_collection()
    
    query = {}
    if role:
        query["role"] = role
    
    cursor = users.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    
    result = []
    async for user in cursor:
        result.append({
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "user"),
            "isVerified": user.get("isVerified", False),
            "isPremium": user.get("isPremium", False),
            "createdAt": user.get("createdAt")
        })
    
    return result


@router.get("/users/{user_id}")
async def get_user_by_id(
    user_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Get a specific user by ID (admin only)."""
    users = get_users_collection()
    
    try:
        user = await users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "user"),
        "isVerified": user.get("isVerified", False),
        "isPremium": user.get("isPremium", False),
        "onboarding": user.get("onboarding"),
        "createdAt": user.get("createdAt"),
        "updatedAt": user.get("updatedAt")
    }


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    role: Optional[str] = None,
    isPremium: Optional[bool] = None,
    isVerified: Optional[bool] = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Update a user (admin only)."""
    users = get_users_collection()
    
    update_data = {"updatedAt": datetime.utcnow()}
    if role is not None:
        update_data["role"] = role
    if isPremium is not None:
        update_data["isPremium"] = isPremium
    if isVerified is not None:
        update_data["isVerified"] = isVerified
    
    try:
        result = await users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or no changes made"
        )
    
    return {"message": "User updated successfully"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete a user (admin only)."""
    users = get_users_collection()
    
    # Prevent deleting yourself
    if user_id == current_admin["_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    try:
        result = await users.delete_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted successfully"}


# ============== CONTENT MANAGEMENT ==============

@router.post("/content")
async def create_content(
    content_data: ContentCreate,
    current_admin: dict = Depends(get_current_admin)
):
    """Create new content (admin only)."""
    content = get_content_collection()
    
    new_content = {
        "title": content_data.title,
        "category": content_data.category,
        "description": content_data.description,
        "isPremium": content_data.isPremium,
        "order": content_data.order,
        "modules": [m.model_dump() for m in content_data.modules],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await content.insert_one(new_content)
    
    return {
        "id": str(result.inserted_id),
        "message": "Content created successfully"
    }


@router.put("/content/{content_id}")
async def update_content(
    content_id: str,
    content_data: ContentUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    """Update content (admin only)."""
    content = get_content_collection()
    
    update_data = {k: v for k, v in content_data.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    if "modules" in update_data:
        update_data["modules"] = [m.model_dump() if hasattr(m, 'model_dump') else m for m in update_data["modules"]]
    
    try:
        result = await content.update_one(
            {"_id": ObjectId(content_id)},
            {"$set": update_data}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found or no changes made"
        )
    
    return {"message": "Content updated successfully"}


@router.delete("/content/{content_id}")
async def delete_content(
    content_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete content (admin only)."""
    content = get_content_collection()
    
    try:
        result = await content.delete_one({"_id": ObjectId(content_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    return {"message": "Content deleted successfully"}


# ============== EVENT MANAGEMENT ==============

@router.post("/events")
async def create_event(
    title: str,
    description: str,
    event_type: str,
    date: datetime,
    duration: int = 60,
    host: str = None,
    maxParticipants: int = None,
    isPremium: bool = False,
    current_admin: dict = Depends(get_current_admin)
):
    """Create a new event (admin only)."""
    events = get_events_collection()
    
    new_event = {
        "title": title,
        "description": description,
        "type": event_type,
        "date": date,
        "duration": duration,
        "host": host,
        "maxParticipants": maxParticipants,
        "participants": [],
        "isPremium": isPremium,
        "createdAt": datetime.utcnow()
    }
    
    result = await events.insert_one(new_event)
    
    return {
        "id": str(result.inserted_id),
        "message": "Event created successfully"
    }


@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete an event (admin only)."""
    events = get_events_collection()
    
    try:
        result = await events.delete_one({"_id": ObjectId(event_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return {"message": "Event deleted successfully"}


# ============== ANALYTICS ==============

@router.get("/analytics")
async def get_analytics(current_admin: dict = Depends(get_current_admin)):
    """Get app analytics (admin only)."""
    users = get_users_collection()
    scans = get_scans_collection()
    posts = get_posts_collection()
    
    # Get counts
    total_users = await users.count_documents({})
    premium_users = await users.count_documents({"isPremium": True})
    total_scans = await scans.count_documents({})
    total_posts = await posts.count_documents({})
    
    # Get users registered in last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_week = await users.count_documents({"createdAt": {"$gte": week_ago}})
    
    # Get scans in last 7 days
    scans_week = await scans.count_documents({"createdAt": {"$gte": week_ago}})
    
    return {
        "totalUsers": total_users,
        "premiumUsers": premium_users,
        "premiumRate": round(premium_users / total_users * 100, 1) if total_users > 0 else 0,
        "totalScans": total_scans,
        "totalPosts": total_posts,
        "newUsersThisWeek": new_users_week,
        "scansThisWeek": scans_week
    }
