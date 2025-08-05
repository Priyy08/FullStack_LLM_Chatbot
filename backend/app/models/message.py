from pydantic import BaseModel, Field
from typing import Literal, Dict, Any, Optional
import datetime

class MessageMetadata(BaseModel):
    model: Optional[str] = None
    responseTime: Optional[float] = None # in seconds

class MessageBase(BaseModel):
    content: str
    role: Literal["user", "assistant"]

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str
    chatId: str
    userId: str
    timestamp: datetime.datetime
    metadata: Optional[MessageMetadata] = None

class WebsocketMessage(BaseModel):
    content: str