# File: chatbot/backend/api/chat.py (Updated)

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ..models.chat import Chat, ChatCreate
from ..models.message import Message
from ..models.user import UserInDB
from ..core.security import get_current_user
from ..core.dependencies import get_chat_service
from ..services.chat_service import ChatService

router = APIRouter()

@router.post("/", response_model=Chat, status_code=status.HTTP_201_CREATED)
def create_new_chat(
    chat_create: ChatCreate,
    current_user: UserInDB = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Creates a new chat session for the authenticated user."""
    chat = chat_service.create_chat(user=current_user, chat_create=chat_create)
    return chat

@router.get("/", response_model=List[Chat])
def get_user_chats(
    current_user: UserInDB = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Retrieves all chat sessions for the authenticated user."""
    chats = chat_service.get_chats_for_user(user=current_user)
    return chats

@router.get("/{chat_id}", response_model=Chat)
def get_single_chat(
    chat_id: str,
    current_user: UserInDB = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Retrieves a single chat session if the user has access."""
    chat = chat_service.get_chat_if_user_has_access(chat_id=chat_id, user=current_user)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found or access denied")
    return chat

@router.get("/{chat_id}/messages", response_model=List[Message])
def get_chat_messages(
    chat_id: str,
    current_user: UserInDB = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Retrieves all messages for a specific chat, validating user access first."""
    chat = chat_service.get_chat_if_user_has_access(chat_id=chat_id, user=current_user)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found or access denied")
    
    messages = chat_service.get_messages(chat_id=chat_id, user_id=current_user.uid)
    return messages