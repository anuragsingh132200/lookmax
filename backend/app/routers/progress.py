from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from ..models.progress import ProgressCreate, ProgressResponse, ProgressUpdate
from ..database import get_database
from ..utils.auth import get_current_active_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/", response_model=List[ProgressResponse])
async def list_user_progress(
    current_user: dict = Depends(get_current_active_user)
):
    """List all course progress for the current user."""
    db = get_database()
    user_id = current_user["_id"]
    
    progress_list = await db.progress.find({"userId": user_id}).to_list(100)
    
    return [
        ProgressResponse(
            id=str(p["_id"]),
            userId=p["userId"],
            courseId=p["courseId"],
            currentModuleId=p.get("currentModuleId"),
            currentChapterId=p.get("currentChapterId"),
            completedChapters=p.get("completedChapters", []),
            percentComplete=p.get("percentComplete", 0.0),
            lastAccessedAt=p.get("lastAccessedAt")
        )
        for p in progress_list
    ]


@router.get("/{course_id}", response_model=ProgressResponse)
async def get_course_progress(
    course_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get progress for a specific course."""
    db = get_database()
    user_id = current_user["_id"]
    
    progress = await db.progress.find_one({
        "userId": user_id,
        "courseId": course_id
    })
    
    if not progress:
        # Create new progress entry
        progress = {
            "userId": user_id,
            "courseId": course_id,
            "currentModuleId": None,
            "currentChapterId": None,
            "completedChapters": [],
            "percentComplete": 0.0,
            "lastAccessedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        result = await db.progress.insert_one(progress)
        progress["_id"] = result.inserted_id
    
    return ProgressResponse(
        id=str(progress["_id"]),
        userId=progress["userId"],
        courseId=progress["courseId"],
        currentModuleId=progress.get("currentModuleId"),
        currentChapterId=progress.get("currentChapterId"),
        completedChapters=progress.get("completedChapters", []),
        percentComplete=progress.get("percentComplete", 0.0),
        lastAccessedAt=progress.get("lastAccessedAt")
    )


@router.put("/{course_id}", response_model=ProgressResponse)
async def update_progress(
    course_id: str,
    progress_update: ProgressUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update progress for a course."""
    db = get_database()
    user_id = current_user["_id"]
    
    # Get the course to calculate percentage
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    total_chapters = course.get("totalChapters", 0)
    
    # Get or create progress
    progress = await db.progress.find_one({
        "userId": user_id,
        "courseId": course_id
    })
    
    if not progress:
        progress = {
            "userId": user_id,
            "courseId": course_id,
            "currentModuleId": None,
            "currentChapterId": None,
            "completedChapters": [],
            "percentComplete": 0.0,
            "lastAccessedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        result = await db.progress.insert_one(progress)
        progress["_id"] = result.inserted_id
    
    # Update fields
    update_data = {
        "lastAccessedAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    if progress_update.currentModuleId is not None:
        update_data["currentModuleId"] = progress_update.currentModuleId
    if progress_update.currentChapterId is not None:
        update_data["currentChapterId"] = progress_update.currentChapterId
    
    # Handle completed chapter
    completed_chapters = progress.get("completedChapters", [])
    if progress_update.completedChapterId:
        if progress_update.completedChapterId not in completed_chapters:
            completed_chapters.append(progress_update.completedChapterId)
            update_data["completedChapters"] = completed_chapters
    
    # Calculate percentage
    if total_chapters > 0:
        update_data["percentComplete"] = (len(completed_chapters) / total_chapters) * 100
    
    await db.progress.update_one(
        {"_id": progress["_id"]},
        {"$set": update_data}
    )
    
    # Get updated progress
    progress = await db.progress.find_one({"_id": progress["_id"]})
    
    return ProgressResponse(
        id=str(progress["_id"]),
        userId=progress["userId"],
        courseId=progress["courseId"],
        currentModuleId=progress.get("currentModuleId"),
        currentChapterId=progress.get("currentChapterId"),
        completedChapters=progress.get("completedChapters", []),
        percentComplete=progress.get("percentComplete", 0.0),
        lastAccessedAt=progress.get("lastAccessedAt")
    )


@router.post("/{course_id}/complete-chapter/{chapter_id}")
async def mark_chapter_complete(
    course_id: str,
    chapter_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Mark a chapter as complete."""
    progress_update = ProgressUpdate(completedChapterId=chapter_id)
    return await update_progress(course_id, progress_update, current_user)
