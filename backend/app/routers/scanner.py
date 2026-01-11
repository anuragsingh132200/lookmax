from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId

from ..database import get_scans_collection
from ..models import ScanCreate, ScanAnalysis
from ..utils import get_current_user, analyze_face

router = APIRouter()


@router.post("/analyze")
async def analyze_face_photo(
    scan_data: ScanCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze a face photo using AI.
    
    Accepts a base64 encoded image and returns facial analysis results.
    """
    scans = get_scans_collection()
    
    # Analyze the face using Gemini
    analysis_result = await analyze_face(scan_data.imageBase64)
    
    # Create scan record
    new_scan = {
        "userId": current_user["_id"],
        "analysis": analysis_result,
        "createdAt": datetime.utcnow()
    }
    
    result = await scans.insert_one(new_scan)
    
    return {
        "id": str(result.inserted_id),
        "userId": current_user["_id"],
        "analysis": analysis_result,
        "createdAt": new_scan["createdAt"]
    }


@router.get("/history")
async def get_scan_history(current_user: dict = Depends(get_current_user)):
    """Get user's scan history."""
    scans = get_scans_collection()
    
    cursor = scans.find(
        {"userId": current_user["_id"]}
    ).sort("createdAt", -1).limit(20)
    
    history = []
    async for scan in cursor:
        history.append({
            "id": str(scan["_id"]),
            "analysis": scan.get("analysis", {}),
            "createdAt": scan["createdAt"]
        })
    
    return history


@router.get("/{scan_id}")
async def get_scan_detail(
    scan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific scan by ID."""
    scans = get_scans_collection()
    
    try:
        scan = await scans.find_one({
            "_id": ObjectId(scan_id),
            "userId": current_user["_id"]
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    return {
        "id": str(scan["_id"]),
        "userId": scan["userId"],
        "analysis": scan.get("analysis", {}),
        "createdAt": scan["createdAt"]
    }


@router.get("/compare/{scan_id_1}/{scan_id_2}")
async def compare_scans(
    scan_id_1: str,
    scan_id_2: str,
    current_user: dict = Depends(get_current_user)
):
    """Compare two scans to show progress."""
    scans = get_scans_collection()
    
    try:
        scan1 = await scans.find_one({
            "_id": ObjectId(scan_id_1),
            "userId": current_user["_id"]
        })
        scan2 = await scans.find_one({
            "_id": ObjectId(scan_id_2),
            "userId": current_user["_id"]
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both scans not found"
        )
    
    if not scan1 or not scan2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both scans not found"
        )
    
    # Calculate score difference
    score1 = scan1.get("analysis", {}).get("overallScore", 0)
    score2 = scan2.get("analysis", {}).get("overallScore", 0)
    score_diff = score2 - score1
    
    return {
        "scan1": {
            "id": str(scan1["_id"]),
            "analysis": scan1.get("analysis", {}),
            "createdAt": scan1["createdAt"]
        },
        "scan2": {
            "id": str(scan2["_id"]),
            "analysis": scan2.get("analysis", {}),
            "createdAt": scan2["createdAt"]
        },
        "comparison": {
            "scoreDifference": score_diff,
            "improved": score_diff > 0,
            "message": f"Your score has {'improved' if score_diff > 0 else 'decreased'} by {abs(score_diff)} points!"
        }
    }
