# File: chatbot/backend/services/chat_service.py

from typing import List, Tuple

from ..services.firebase_service import FirebaseService
from ..services.langchain_service import LangChainService
from ..models.chat import Chat, ChatCreate
from ..models.message import Message
from ..models.user import UserInDB

class ChatService:
    """
    Service layer for handling chat-related business logic.
    """
    def __init__(self, firebase_service: FirebaseService, langchain_service: LangChainService):
        self.firebase = firebase_service
        self.langchain = langchain_service

    def create_chat(self, user: UserInDB, chat_create: ChatCreate) -> Chat:
        """Creates a new chat for a user."""
        return self.firebase.create_chat(user_id=user.uid, title=chat_create.title)

    def get_chats_for_user(self, user: UserInDB) -> List[Chat]:
        """Retrieves all chats for a specific user."""
        return self.firebase.get_chats_for_user(user_id=user.uid)

    def get_chat_if_user_has_access(self, chat_id: str, user: UserInDB) -> Chat | None:
        """
        Retrieves a single chat only if the requesting user is the owner.
        """
        return self.firebase.get_chat(chat_id=chat_id, user_id=user.uid)
        
    def get_messages(self, chat_id: str, user_id: str) -> List[Message]:
        """Gets all messages for a given chat."""
        return self.firebase.get_messages_for_chat(chat_id, user_id)

    def process_user_message(self, chat_id: str, user_id: str, user_message_content: str) -> Tuple[Message, Message]:
        """
        Handles the full logic of processing a user's message.
        1. Saves the user message to the database.
        2. Fetches the conversation history for context.
        3. Generates a response from the AI model via LangChain.
        4. Saves the AI's response to the database.
        Returns a tuple containing the saved user message and the saved AI message.
        """
        # 1. Save user's message
        user_message_data = {"content": user_message_content, "role": "user"}
        saved_user_message = self.firebase.add_message_to_chat(chat_id, user_id, user_message_data)

        # 2. Get chat history for context
        chat_history = self.firebase.get_messages_for_chat(chat_id, user_id)

        # 3. Generate AI response
        ai_response_data = self.langchain.generate_response(chat_history, user_message_content)

        # 4. Save AI's message
        ai_message_data = {
            "content": ai_response_data.get("content", "Sorry, an error occurred."),
            "role": "assistant",
            "metadata": ai_response_data.get("metadata")
        }
        saved_ai_message = self.firebase.add_message_to_chat(chat_id, user_id, ai_message_data)
        
        return saved_user_message, saved_ai_message