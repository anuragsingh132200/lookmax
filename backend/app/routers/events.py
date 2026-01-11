from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from typing import Optional

from ..database import get_events_collection
from ..utils import get_current_user

router = APIRouter()


@router.get("/")
async def get_events(
    upcoming: bool = True,
    limit: int = 20
):
    """Get events (calendar items)."""
    events = get_events_collection()
    
    query = {}
    if upcoming:
        query["date"] = {"$gte": datetime.utcnow()}
    
    cursor = events.find(query).sort("date", 1).limit(limit)
    
    result = []
    async for event in cursor:
        result.append({
            "id": str(event["_id"]),
            "title": event["title"],
            "description": event.get("description"),
            "type": event.get("type", "general"),  # coaching, talk, workshop
            "date": event["date"],
            "duration": event.get("duration", 60),  # minutes
            "host": event.get("host"),
            "maxParticipants": event.get("maxParticipants"),
            "participants": event.get("participants", []),
            "participantCount": len(event.get("participants", [])),
            "isPremium": event.get("isPremium", False),
            "createdAt": event.get("createdAt")
        })
    
    return result


@router.post("/{event_id}/register")
async def register_for_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Register for an event."""
    events = get_events_collection()
    
    try:
        event = await events.find_one({"_id": ObjectId(event_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if premium event requires premium user
    if event.get("isPremium") and not current_user.get("isPremium"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This event requires Premium membership"
        )
    
    # Check capacity
    participants = event.get("participants", [])
    max_participants = event.get("maxParticipants")
    
    if max_participants and len(participants) >= max_participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is full"
        )
    
    user_id = current_user["_id"]
    
    # Check if already registered
    if user_id in participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this event"
        )
    
    # Register
    participants.append(user_id)
    await events.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": {"participants": participants}}
    )
    
    return {"message": "Successfully registered for event"}


@router.post("/{event_id}/unregister")
async def unregister_from_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Unregister from an event."""
    events = get_events_collection()
    
    try:
        event = await events.find_one({"_id": ObjectId(event_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    user_id = current_user["_id"]
    participants = event.get("participants", [])
    
    if user_id not in participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not registered for this event"
        )
    
    participants.remove(user_id)
    await events.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": {"participants": participants}}
    )
    
    return {"message": "Successfully unregistered from event"}


@router.get("/my")
async def get_my_events(current_user: dict = Depends(get_current_user)):
    """Get events the user is registered for."""
    events = get_events_collection()
    
    user_id = current_user["_id"]
    
    cursor = events.find({
        "participants": user_id,
        "date": {"$gte": datetime.utcnow()}
    }).sort("date", 1)
    
    result = []
    async for event in cursor:
        result.append({
            "id": str(event["_id"]),
            "title": event["title"],
            "description": event.get("description"),
            "type": event.get("type", "general"),
            "date": event["date"],
            "duration": event.get("duration", 60),
            "host": event.get("host")
        })
    
    return result
