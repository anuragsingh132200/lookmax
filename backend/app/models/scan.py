from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class FacialMeasurement(BaseModel):
    name: str
    value: str
    description: Optional[str] = None
    rating: Optional[str] = None  # "good", "average", "needs_improvement"


class ScanAnalysis(BaseModel):
    canthalTilt: Optional[str] = None
    facialSymmetry: Optional[str] = None
    jawlineDefinition: Optional[str] = None
    skinQuality: Optional[str] = None
    overallScore: Optional[int] = None
    measurements: List[FacialMeasurement] = []
    recommendations: List[str] = []
    protocols: List[str] = []


class ScanCreate(BaseModel):
    imageBase64: str


class ScanInDB(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    imageUrl: Optional[str] = None
    analysis: ScanAnalysis
    createdAt: datetime

    class Config:
        populate_by_name = True


class ScanResponse(BaseModel):
    id: str
    userId: str
    analysis: ScanAnalysis
    createdAt: datetime


class ProgressPhoto(BaseModel):
    id: str
    userId: str
    imageUrl: str
    notes: Optional[str] = None
    createdAt: datetime


class ProgressCreate(BaseModel):
    imageBase64: str
    notes: Optional[str] = None
