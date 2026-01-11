from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from typing import Optional

from ..database import get_posts_collection, get_messages_collection, get_users_collection
from ..models import PostCreate, PostUpdate, MessageCreate
from ..utils import get_current_user

router = APIRouter()


# ============== FORUM POSTS ==============

@router.get("/posts")
async def get_posts(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    """Get forum posts."""
    posts = get_posts_collection()
    
    query = {}
    if category:
        query["category"] = category
    
    cursor = posts.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    
    result = []
    async for post in cursor:
        result.append({
            "id": str(post["_id"]),
            "title": post["title"],
            "content": post["content"],
            "category": post.get("category", "general"),
            "userId": post["userId"],
            "userName": post["userName"],
            "userAvatar": post.get("userAvatar"),
            "likes": post.get("likes", []),
            "likesCount": len(post.get("likes", [])),
            "commentsCount": post.get("commentsCount", 0),
            "createdAt": post["createdAt"]
        })
    
    return result


@router.post("/posts")
async def create_post(
    post_data: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new forum post."""
    posts = get_posts_collection()
    
    new_post = {
        "title": post_data.title,
        "content": post_data.content,
        "category": post_data.category or "general",
        "userId": current_user["_id"],
        "userName": current_user["name"],
        "userAvatar": current_user.get("avatar"),
        "likes": [],
        "commentsCount": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await posts.insert_one(new_post)
    
    return {
        "id": str(result.inserted_id),
        "message": "Post created successfully"
    }


@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Like or unlike a post."""
    posts = get_posts_collection()
    
    try:
        post = await posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    user_id = current_user["_id"]
    likes = post.get("likes", [])
    
    if user_id in likes:
        # Unlike
        likes.remove(user_id)
        action = "unliked"
    else:
        # Like
        likes.append(user_id)
        action = "liked"
    
    await posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"likes": likes}}
    )
    
    return {
        "action": action,
        "likesCount": len(likes)
    }


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a post (only owner or admin)."""
    posts = get_posts_collection()
    
    try:
        post = await posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check ownership
    if post["userId"] != current_user["_id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )
    
    await posts.delete_one({"_id": ObjectId(post_id)})
    
    return {"message": "Post deleted successfully"}


# ============== CHAT MESSAGES ==============

@router.get("/chat/{chat_id}/messages")
async def get_chat_messages(
    chat_id: str,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get messages from a chat."""
    messages = get_messages_collection()
    
    cursor = messages.find(
        {"chatId": chat_id}
    ).sort("createdAt", 1).skip(skip).limit(limit)
    
    result = []
    async for message in cursor:
        result.append({
            "id": str(message["_id"]),
            "chatId": message["chatId"],
            "userId": message["userId"],
            "userName": message["userName"],
            "content": message["content"],
            "createdAt": message["createdAt"]
        })
    
    return result


@router.post("/chat/messages")
async def send_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a chat message."""
    messages = get_messages_collection()
    
    new_message = {
        "chatId": message_data.chatId,
        "userId": current_user["_id"],
        "userName": current_user["name"],
        "content": message_data.content,
        "createdAt": datetime.utcnow()
    }
    
    result = await messages.insert_one(new_message)
    
    return {
        "id": str(result.inserted_id),
        "chatId": message_data.chatId,
        "userId": current_user["_id"],
        "userName": current_user["name"],
        "content": message_data.content,
        "createdAt": new_message["createdAt"]
    }


@router.get("/chats")
async def get_user_chats(current_user: dict = Depends(get_current_user)):
    """Get list of available chat rooms."""
    # For now, return predefined chat rooms
    # In a full implementation, this would be dynamic
    return [
        {
            "id": "general",
            "name": "General Chat",
            "description": "General discussion for all members",
            "icon": "💬"
        },
        {
            "id": "skincare",
            "name": "Skincare Talk",
            "description": "Discuss skincare routines and products",
            "icon": "🧴"
        },
        {
            "id": "fitness",
            "name": "Fitness & Gym",
            "description": "Share workout tips and progress",
            "icon": "💪"
        },
        {
            "id": "results",
            "name": "Results & Progress",
            "description": "Share your transformation journey",
            "icon": "📈"
        }
    ]
