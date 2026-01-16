from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from ..models.course import (
    CourseCreate, CourseResponse, CourseUpdate,
    Module, ModuleCreate, Chapter, ChapterCreate
)
from ..database import get_database
from ..utils.auth import get_current_active_user, get_admin_user
from bson import ObjectId
from datetime import datetime
import uuid

router = APIRouter(prefix="/courses", tags=["Courses"])


def generate_id():
    return str(uuid.uuid4())


@router.get("/", response_model=List[CourseResponse])
async def list_courses(
    current_user: dict = Depends(get_current_active_user)
):
    """List all active courses."""
    db = get_database()
    
    courses = await db.courses.find({"isActive": True}).to_list(100)
    
    return [
        CourseResponse(
            id=str(course["_id"]),
            title=course["title"],
            description=course["description"],
            thumbnail=course.get("thumbnail"),
            modules=course.get("modules", []),
            isActive=course.get("isActive", True),
            totalDuration=course.get("totalDuration", 0),
            totalChapters=course.get("totalChapters", 0),
            createdAt=course.get("createdAt")
        )
        for course in courses
    ]


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific course with all modules and chapters."""
    db = get_database()
    
    try:
        course = await db.courses.find_one({"_id": ObjectId(course_id)})
    except:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return CourseResponse(
        id=str(course["_id"]),
        title=course["title"],
        description=course["description"],
        thumbnail=course.get("thumbnail"),
        modules=course.get("modules", []),
        isActive=course.get("isActive", True),
        totalDuration=course.get("totalDuration", 0),
        totalChapters=course.get("totalChapters", 0),
        createdAt=course.get("createdAt")
    )


# Admin endpoints
@router.get("/admin/all", response_model=List[CourseResponse])
async def list_all_courses(
    admin_user: dict = Depends(get_admin_user)
):
    """List all courses including inactive (admin only)."""
    db = get_database()
    
    courses = await db.courses.find().to_list(100)
    
    return [
        CourseResponse(
            id=str(course["_id"]),
            title=course["title"],
            description=course["description"],
            thumbnail=course.get("thumbnail"),
            modules=course.get("modules", []),
            isActive=course.get("isActive", True),
            totalDuration=course.get("totalDuration", 0),
            totalChapters=course.get("totalChapters", 0),
            createdAt=course.get("createdAt")
        )
        for course in courses
    ]


@router.post("/", response_model=CourseResponse)
async def create_course(
    course_data: CourseCreate,
    admin_user: dict = Depends(get_admin_user)
):
    """Create a new course (admin only)."""
    db = get_database()
    
    course_doc = {
        "title": course_data.title,
        "description": course_data.description,
        "thumbnail": course_data.thumbnail,
        "modules": [],
        "isActive": True,
        "totalDuration": 0,
        "totalChapters": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.courses.insert_one(course_doc)
    course_doc["_id"] = result.inserted_id
    
    return CourseResponse(
        id=str(course_doc["_id"]),
        title=course_doc["title"],
        description=course_doc["description"],
        thumbnail=course_doc.get("thumbnail"),
        modules=[],
        isActive=True,
        totalDuration=0,
        totalChapters=0,
        createdAt=course_doc["createdAt"]
    )


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    course_update: CourseUpdate,
    admin_user: dict = Depends(get_admin_user)
):
    """Update a course (admin only)."""
    db = get_database()
    
    update_data = {}
    if course_update.title is not None:
        update_data["title"] = course_update.title
    if course_update.description is not None:
        update_data["description"] = course_update.description
    if course_update.thumbnail is not None:
        update_data["thumbnail"] = course_update.thumbnail
    if course_update.isActive is not None:
        update_data["isActive"] = course_update.isActive
    
    if update_data:
        update_data["updatedAt"] = datetime.utcnow()
        await db.courses.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": update_data}
        )
    
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    
    return CourseResponse(
        id=str(course["_id"]),
        title=course["title"],
        description=course["description"],
        thumbnail=course.get("thumbnail"),
        modules=course.get("modules", []),
        isActive=course.get("isActive", True),
        totalDuration=course.get("totalDuration", 0),
        totalChapters=course.get("totalChapters", 0),
        createdAt=course.get("createdAt")
    )


@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    admin_user: dict = Depends(get_admin_user)
):
    """Delete a course (admin only)."""
    db = get_database()
    
    result = await db.courses.delete_one({"_id": ObjectId(course_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Delete related progress
    await db.progress.delete_many({"courseId": course_id})
    
    return {"message": "Course deleted successfully"}


# Module endpoints
@router.post("/{course_id}/modules", response_model=CourseResponse)
async def add_module(
    course_id: str,
    module_data: ModuleCreate,
    admin_user: dict = Depends(get_admin_user)
):
    """Add a module to a course (admin only)."""
    db = get_database()
    
    module = {
        "_id": generate_id(),
        "title": module_data.title,
        "description": module_data.description,
        "order": module_data.order,
        "thumbnail": module_data.thumbnail,
        "chapters": []
    }
    
    await db.courses.update_one(
        {"_id": ObjectId(course_id)},
        {
            "$push": {"modules": module},
            "$set": {"updatedAt": datetime.utcnow()}
        }
    )
    
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    
    return CourseResponse(
        id=str(course["_id"]),
        title=course["title"],
        description=course["description"],
        thumbnail=course.get("thumbnail"),
        modules=course.get("modules", []),
        isActive=course.get("isActive", True),
        totalDuration=course.get("totalDuration", 0),
        totalChapters=course.get("totalChapters", 0),
        createdAt=course.get("createdAt")
    )


@router.delete("/{course_id}/modules/{module_id}")
async def delete_module(
    course_id: str,
    module_id: str,
    admin_user: dict = Depends(get_admin_user)
):
    """Delete a module from a course (admin only)."""
    db = get_database()
    
    await db.courses.update_one(
        {"_id": ObjectId(course_id)},
        {
            "$pull": {"modules": {"_id": module_id}},
            "$set": {"updatedAt": datetime.utcnow()}
        }
    )
    
    return {"message": "Module deleted successfully"}


# Chapter endpoints
@router.post("/{course_id}/modules/{module_id}/chapters", response_model=CourseResponse)
async def add_chapter(
    course_id: str,
    module_id: str,
    chapter_data: ChapterCreate,
    admin_user: dict = Depends(get_admin_user)
):
    """Add a chapter to a module (admin only)."""
    db = get_database()
    
    chapter = {
        "_id": generate_id(),
        "title": chapter_data.title,
        "type": chapter_data.type,
        "content": chapter_data.content,
        "duration": chapter_data.duration,
        "order": chapter_data.order,
        "thumbnail": chapter_data.thumbnail
    }
    
    # Update the specific module's chapters array
    await db.courses.update_one(
        {"_id": ObjectId(course_id), "modules._id": module_id},
        {
            "$push": {"modules.$.chapters": chapter},
            "$set": {"updatedAt": datetime.utcnow()}
        }
    )
    
    # Update total chapters count
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    total_chapters = sum(len(m.get("chapters", [])) for m in course.get("modules", []))
    total_duration = sum(
        c.get("duration", 0) 
        for m in course.get("modules", []) 
        for c in m.get("chapters", [])
    )
    
    await db.courses.update_one(
        {"_id": ObjectId(course_id)},
        {"$set": {"totalChapters": total_chapters, "totalDuration": total_duration}}
    )
    
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    
    return CourseResponse(
        id=str(course["_id"]),
        title=course["title"],
        description=course["description"],
        thumbnail=course.get("thumbnail"),
        modules=course.get("modules", []),
        isActive=course.get("isActive", True),
        totalDuration=course.get("totalDuration", 0),
        totalChapters=course.get("totalChapters", 0),
        createdAt=course.get("createdAt")
    )
