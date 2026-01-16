from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from ..models.scan import ScanCreate, ScanResponse, ScanAnalysis
from ..database import get_database
from ..utils.auth import get_current_active_user
from ..services.gemini import analyze_face
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/scans", tags=["Face Scans"])


@router.post("/analyze", response_model=ScanResponse)
async def analyze_face_scan(
    scan_data: ScanCreate,
    current_user: dict = Depends(get_current_active_user)
):
    """Analyze a face image and save the scan results."""
    db = get_database()
    user_id = current_user["_id"]
    
    if not scan_data.imageBase64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image data is required"
        )
    
    # Analyze face using Gemini
    result = await analyze_face(scan_data.imageBase64)
    
    if not result["success"]:
        # Still save the scan even if analysis failed
        analysis = result["analysis"]
    else:
        analysis = result["analysis"]
    
    # Check if user is subscribed
    subscription = current_user.get("subscription", {})
    is_subscribed = subscription.get("status") == "active"
    
    # Save scan to database
    scan_doc = {
        "userId": user_id,
        "imageUrl": scan_data.imageUrl,
        "analysis": analysis,
        "isBlurred": not is_subscribed,
        "createdAt": datetime.utcnow()
    }
    
    result = await db.scans.insert_one(scan_doc)
    scan_id = str(result.inserted_id)
    
    # Update user's hasCompletedFirstScan flag
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "hasCompletedFirstScan": True,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return ScanResponse(
        id=scan_id,
        userId=user_id,
        imageUrl=scan_data.imageUrl,
        analysis=analysis,
        isBlurred=not is_subscribed,
        createdAt=scan_doc["createdAt"]
    )


@router.get("/", response_model=List[ScanResponse])
async def list_user_scans(
    current_user: dict = Depends(get_current_active_user)
):
    """List all scans for the current user."""
    db = get_database()
    user_id = current_user["_id"]
    
    scans = await db.scans.find({"userId": user_id}).sort("createdAt", -1).to_list(100)
    
    return [
        ScanResponse(
            id=str(scan["_id"]),
            userId=scan["userId"],
            imageUrl=scan.get("imageUrl"),
            analysis=scan.get("analysis"),
            isBlurred=scan.get("isBlurred", True),
            createdAt=scan.get("createdAt")
        )
        for scan in scans
    ]


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific scan."""
    db = get_database()
    user_id = current_user["_id"]
    
    try:
        scan = await db.scans.find_one({
            "_id": ObjectId(scan_id),
            "userId": user_id
        })
    except:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return ScanResponse(
        id=str(scan["_id"]),
        userId=scan["userId"],
        imageUrl=scan.get("imageUrl"),
        analysis=scan.get("analysis"),
        isBlurred=scan.get("isBlurred", True),
        createdAt=scan.get("createdAt")
    )


@router.get("/latest/result", response_model=ScanResponse)
async def get_latest_scan(
    current_user: dict = Depends(get_current_active_user)
):
    """Get the most recent scan for the current user."""
    db = get_database()
    user_id = current_user["_id"]
    
    scan = await db.scans.find_one(
        {"userId": user_id},
        sort=[("createdAt", -1)]
    )
    
    if not scan:
        raise HTTPException(status_code=404, detail="No scans found")
    
    return ScanResponse(
        id=str(scan["_id"]),
        userId=scan["userId"],
        imageUrl=scan.get("imageUrl"),
        analysis=scan.get("analysis"),
        isBlurred=scan.get("isBlurred", True),
        createdAt=scan.get("createdAt")
    )
