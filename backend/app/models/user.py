from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None


class OnboardingData(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    goals: Optional[List[str]] = []
    skinType: Optional[str] = None
    hairType: Optional[str] = None
    fitnessLevel: Optional[str] = None
    concerns: Optional[List[str]] = []


class SubscriptionStatus(str, Enum):
    NONE = "none"
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class UserInDB(UserBase):
    id: str = Field(alias="_id")
    role: UserRole = UserRole.USER
    isVerified: bool = False
    isPremium: bool = False
    onboarding: Optional[OnboardingData] = None
    # Google OAuth fields
    googleId: Optional[str] = None
    avatar: Optional[str] = None
    # User journey state tracking
    hasSeenFeatureHighlights: bool = False
    hasCompletedFirstScan: bool = False
    # Subscription fields
    subscriptionStatus: SubscriptionStatus = SubscriptionStatus.NONE
    stripeCustomerId: Optional[str] = None
    subscriptionId: Optional[str] = None
    subscriptionEndDate: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    isVerified: bool
    isPremium: bool
    onboarding: Optional[OnboardingData] = None
    googleId: Optional[str] = None
    avatar: Optional[str] = None
    hasSeenFeatureHighlights: bool = False
    hasCompletedFirstScan: bool = False
    subscriptionStatus: str = "none"
    subscriptionEndDate: Optional[datetime] = None
    createdAt: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
