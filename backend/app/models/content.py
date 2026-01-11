from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Module(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    videoUrl: Optional[str] = None
    content: Optional[str] = None
    order: int = 0


class ContentBase(BaseModel):
    title: str
    category: str  # skin, hair, gym, mental, facial
    description: Optional[str] = None
    isPremium: bool = False
    order: int = 0


class ContentCreate(ContentBase):
    modules: List[Module] = []


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    isPremium: Optional[bool] = None
    order: Optional[int] = None
    modules: Optional[List[Module]] = None


class ContentInDB(ContentBase):
    id: str = Field(alias="_id")
    modules: List[Module] = []
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True


class ContentResponse(BaseModel):
    id: str
    title: str
    category: str
    description: Optional[str] = None
    isPremium: bool
    order: int
    modules: List[Module] = []
    createdAt: datetime


# Forum Posts
class PostBase(BaseModel):
    title: str
    content: str
    category: Optional[str] = "general"


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None


class PostInDB(PostBase):
    id: str = Field(alias="_id")
    userId: str
    userName: str
    userAvatar: Optional[str] = None
    likes: List[str] = []
    commentsCount: int = 0
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True


class PostResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    userId: str
    userName: str
    userAvatar: Optional[str] = None
    likes: List[str] = []
    likesCount: int = 0
    commentsCount: int = 0
    createdAt: datetime


# Chat Messages
class MessageCreate(BaseModel):
    chatId: str
    content: str


class MessageInDB(BaseModel):
    id: str = Field(alias="_id")
    chatId: str
    userId: str
    userName: str
    content: str
    createdAt: datetime

    class Config:
        populate_by_name = True


class MessageResponse(BaseModel):
    id: str
    chatId: str
    userId: str
    userName: str
    content: str
    createdAt: datetime
