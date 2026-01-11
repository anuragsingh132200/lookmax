from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from typing import Optional

from ..database import get_content_collection
from ..models import ContentCreate, ContentUpdate, ContentResponse
from ..utils import get_current_user

router = APIRouter()


@router.get("/courses")
async def get_courses(
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all courses/content."""
    content = get_content_collection()
    
    query = {}
    if category:
        query["category"] = category
    
    # If user is not premium, filter out premium content details
    is_premium = current_user.get("isPremium", False)
    
    cursor = content.find(query).sort("order", 1)
    
    courses = []
    async for course in cursor:
        course_data = {
            "id": str(course["_id"]),
            "title": course["title"],
            "category": course["category"],
            "description": course.get("description"),
            "isPremium": course.get("isPremium", False),
            "order": course.get("order", 0),
            "moduleCount": len(course.get("modules", [])),
            "createdAt": course.get("createdAt")
        }
        
        # Include full modules only if user is premium or content is free
        if is_premium or not course.get("isPremium", False):
            course_data["modules"] = course.get("modules", [])
        else:
            # Show locked preview
            course_data["modules"] = []
            course_data["locked"] = True
        
        courses.append(course_data)
    
    return courses


@router.get("/courses/{course_id}")
async def get_course_detail(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific course by ID."""
    content = get_content_collection()
    
    try:
        course = await content.find_one({"_id": ObjectId(course_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    is_premium = current_user.get("isPremium", False)
    
    course_data = {
        "id": str(course["_id"]),
        "title": course["title"],
        "category": course["category"],
        "description": course.get("description"),
        "isPremium": course.get("isPremium", False),
        "order": course.get("order", 0),
        "createdAt": course.get("createdAt")
    }
    
    # Check access
    if course.get("isPremium", False) and not is_premium:
        course_data["locked"] = True
        course_data["modules"] = []
        course_data["message"] = "Upgrade to Premium to access this content"
    else:
        course_data["modules"] = course.get("modules", [])
    
    return course_data


@router.get("/categories")
async def get_categories():
    """Get all content categories."""
    return [
        {"id": "skin", "name": "Skin Care", "icon": "💆"},
        {"id": "hair", "name": "Hair", "icon": "💇"},
        {"id": "gym", "name": "Gym & Fitness", "icon": "💪"},
        {"id": "mental", "name": "Mental Health", "icon": "🧠"},
        {"id": "facial", "name": "Facial Analysis", "icon": "👁️"}
    ]


@router.get("/glow-up-plan")
async def get_glow_up_plan(current_user: dict = Depends(get_current_user)):
    """Get personalized glow-up plan based on user's latest scan."""
    from ..database import get_scans_collection
    
    scans = get_scans_collection()
    
    # Get latest scan
    latest_scan = await scans.find_one(
        {"userId": current_user["_id"]},
        sort=[("createdAt", -1)]
    )
    
    if not latest_scan:
        return {
            "hasData": False,
            "message": "Complete a face scan to get your personalized glow-up plan!"
        }
    
    analysis = latest_scan.get("analysis", {})
    
    return {
        "hasData": True,
        "lastScanDate": latest_scan["createdAt"],
        "overallScore": analysis.get("overallScore"),
        "recommendations": analysis.get("recommendations", []),
        "protocols": analysis.get("protocols", []),
        "focusAreas": [
            {
                "area": "Skin Care",
                "status": analysis.get("skinQuality", "unknown"),
                "priority": "high" if analysis.get("skinQuality") in ["needs_improvement", "average"] else "low"
            },
            {
                "area": "Jawline",
                "status": analysis.get("jawlineDefinition", "unknown"),
                "priority": "high" if analysis.get("jawlineDefinition") in ["needs_work", "moderate"] else "low"
            },
            {
                "area": "Facial Harmony",
                "status": analysis.get("facialSymmetry", "unknown"),
                "priority": "medium"
            }
        ]
    }
