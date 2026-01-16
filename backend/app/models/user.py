from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info=None):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")


class OnboardingData(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    goals: Optional[List[str]] = []
    skinType: Optional[str] = None
    concerns: Optional[List[str]] = []
    currentRoutine: Optional[str] = None


class SubscriptionData(BaseModel):
    status: str = "free"  # free, active, cancelled
    stripeCustomerId: Optional[str] = None
    stripeSubscriptionId: Optional[str] = None
    expiresAt: Optional[datetime] = None


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    password: str
    onboarding: Optional[OnboardingData] = OnboardingData()
    subscription: Optional[SubscriptionData] = SubscriptionData()
    isOnboarded: bool = False
    hasCompletedFirstScan: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    onboarding: Optional[OnboardingData] = None
    subscription: Optional[SubscriptionData] = None
    isOnboarded: bool = False
    hasCompletedFirstScan: bool = False
    createdAt: Optional[datetime] = None

    class Config:
        populate_by_name = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    onboarding: Optional[OnboardingData] = None
    isOnboarded: Optional[bool] = None
    hasCompletedFirstScan: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
