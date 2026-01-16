from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Chapter(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    type: str  # video, image, text
    content: str  # URL or text content
    duration: Optional[int] = None  # in seconds for video
    order: int = 0
    thumbnail: Optional[str] = None

    class Config:
        populate_by_name = True


class Module(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    description: Optional[str] = None
    order: int = 0
    chapters: List[Chapter] = []
    thumbnail: Optional[str] = None

    class Config:
        populate_by_name = True


class CourseBase(BaseModel):
    title: str
    description: str
    thumbnail: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseInDB(CourseBase):
    id: Optional[str] = Field(None, alias="_id")
    modules: List[Module] = []
    isActive: bool = True
    totalDuration: int = 0  # in seconds
    totalChapters: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    thumbnail: Optional[str] = None
    modules: List[Module] = []
    isActive: bool = True
    totalDuration: int = 0
    totalChapters: int = 0
    createdAt: Optional[datetime] = None

    class Config:
        populate_by_name = True


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    isActive: Optional[bool] = None


class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0
    thumbnail: Optional[str] = None


class ChapterCreate(BaseModel):
    title: str
    type: str
    content: str
    duration: Optional[int] = None
    order: int = 0
    thumbnail: Optional[str] = None
