from pydantic import BaseModel, Field
from typing import Optional
import datetime

class ChatBase(BaseModel):
    title: str = Field(..., max_length=100)

class ChatCreate(ChatBase):
    pass

class ChatUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)

class Chat(ChatBase):
    id: str
    userId: str
    createdAt: datetime.datetime
    messageCount: int = 0
    isActive: bool = True

    class Config:
        orm_mode = True # For older Pydantic versions, use from_attributes = True