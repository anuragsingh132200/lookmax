from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProgressBase(BaseModel):
    courseId: str
    currentModuleId: Optional[str] = None
    currentChapterId: Optional[str] = None


class ProgressCreate(ProgressBase):
    pass


class ProgressInDB(ProgressBase):
    id: Optional[str] = Field(None, alias="_id")
    userId: str
    completedChapters: List[str] = []
    percentComplete: float = 0.0
    lastAccessedAt: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class ProgressResponse(BaseModel):
    id: str
    userId: str
    courseId: str
    currentModuleId: Optional[str] = None
    currentChapterId: Optional[str] = None
    completedChapters: List[str] = []
    percentComplete: float = 0.0
    lastAccessedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True


class ProgressUpdate(BaseModel):
    currentModuleId: Optional[str] = None
    currentChapterId: Optional[str] = None
    completedChapterId: Optional[str] = None  # Add to completed list
