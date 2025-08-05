from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import datetime

class UserBase(BaseModel):
    email: EmailStr
    displayName: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    uid: str
    createdAt: datetime.datetime
    lastLoginAt: Optional[datetime.datetime] = None

class Token(BaseModel):
    token: str
    user: UserInDB