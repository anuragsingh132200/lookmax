from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List

from ..database import db
from ..utils import get_current_user

router = APIRouter()


class ChapterComplete(BaseModel):
    moduleId: str
    chapterId: str


class ProgressResponse(BaseModel):
    moduleId: str
    chapterId: str
    completedAt: datetime


def get_progress_collection():
    return db.get_collection("progress")


@router.post("/complete-chapter")
async def complete_chapter(
    data: ChapterComplete,
    current_user: dict = Depends(get_current_user)
):
    """Mark a chapter as complete."""
    progress = get_progress_collection()
    user_id = current_user["_id"]
    
    # Check if already completed
    existing = await progress.find_one({
        "userId": str(user_id),
        "moduleId": data.moduleId,
        "chapterId": data.chapterId
    })
    
    if existing:
        return {"message": "Chapter already completed", "completedAt": existing["completedAt"]}
    
    # Create progress record
    new_progress = {
        "userId": str(user_id),
        "moduleId": data.moduleId,
        "chapterId": data.chapterId,
        "completedAt": datetime.utcnow()
    }
    
    await progress.insert_one(new_progress)
    
    return {"message": "Chapter marked as complete", "completedAt": new_progress["completedAt"]}


@router.get("/user")
async def get_user_progress(current_user: dict = Depends(get_current_user)):
    """Get all progress for the current user."""
    progress = get_progress_collection()
    user_id = current_user["_id"]
    
    cursor = progress.find({"userId": str(user_id)})
    completed_chapters = []
    
    async for doc in cursor:
        completed_chapters.append({
            "moduleId": doc["moduleId"],
            "chapterId": doc["chapterId"],
            "completedAt": doc["completedAt"]
        })
    
    # Get total modules/chapters from content
    content = db.get_collection("content")
    total_chapters = 0
    module_progress = {}
    
    async for course in content.find({}):
        course_id = str(course["_id"])
        modules = course.get("modules", [])
        for module in modules:
            module_id = module.get("id", "")
            chapters = module.get("chapters", [])
            total_chapters += len(chapters) if chapters else 1
            
            # Calculate module progress
            completed_in_module = len([c for c in completed_chapters if c["moduleId"] == module_id])
            total_in_module = len(chapters) if chapters else 1
            module_progress[module_id] = {
                "completed": completed_in_module,
                "total": total_in_module,
                "percentage": round((completed_in_module / total_in_module) * 100) if total_in_module > 0 else 0
            }
    
    overall_completed = len(completed_chapters)
    overall_percentage = round((overall_completed / total_chapters) * 100) if total_chapters > 0 else 0
    
    return {
        "completedChapters": completed_chapters,
        "totalCompleted": overall_completed,
        "totalChapters": total_chapters,
        "overallPercentage": overall_percentage,
        "moduleProgress": module_progress
    }


@router.get("/module/{module_id}")
async def get_module_progress(
    module_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get progress for a specific module."""
    progress = get_progress_collection()
    user_id = current_user["_id"]
    
    cursor = progress.find({
        "userId": str(user_id),
        "moduleId": module_id
    })
    
    completed_chapters = []
    async for doc in cursor:
        completed_chapters.append({
            "chapterId": doc["chapterId"],
            "completedAt": doc["completedAt"]
        })
    
    return {
        "moduleId": module_id,
        "completedChapters": completed_chapters,
        "totalCompleted": len(completed_chapters)
    }


@router.delete("/reset")
async def reset_progress(current_user: dict = Depends(get_current_user)):
    """Reset all progress for the current user (for testing)."""
    progress = get_progress_collection()
    user_id = current_user["_id"]
    
    result = await progress.delete_many({"userId": str(user_id)})
    
    return {"message": f"Deleted {result.deleted_count} progress records"}
