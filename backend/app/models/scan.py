from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CategoryAnalysis(BaseModel):
    name: str
    score: float
    observation: str
    recommendations: List[str] = []


class ScanAnalysis(BaseModel):
    overallScore: float
    summary: str
    categories: List[CategoryAnalysis] = []
    topPriorities: List[str] = []


class ScanBase(BaseModel):
    imageUrl: Optional[str] = None


class ScanCreate(ScanBase):
    imageBase64: Optional[str] = None


class ScanInDB(ScanBase):
    id: Optional[str] = Field(None, alias="_id")
    userId: str
    analysis: Optional[ScanAnalysis] = None
    isBlurred: bool = True  # Blurred until subscribed
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class ScanResponse(BaseModel):
    id: str
    userId: str
    imageUrl: Optional[str] = None
    analysis: Optional[ScanAnalysis] = None
    isBlurred: bool = True
    createdAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
