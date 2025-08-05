# File: chatbot/backend/core/dependencies.py (Updated)

from fastapi import Depends
from google.cloud.firestore_v1.client import Client

from ..core.database import get_db
from ..services.firebase_service import FirebaseService
from ..services.langchain_service import LangChainService
from ..services.chat_service import ChatService # <-- Add this import

def get_firebase_service(db: Client = Depends(get_db)) -> FirebaseService:
    return FirebaseService(db)

def get_langchain_service() -> LangChainService:
    return LangChainService()

def get_chat_service( # <-- Add this new dependency provider
    firebase_service: FirebaseService = Depends(get_firebase_service),
    langchain_service: LangChainService = Depends(get_langchain_service)
) -> ChatService:
    """Dependency provider for the ChatService."""
    return ChatService(firebase_service, langchain_service)