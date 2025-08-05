from google.cloud.firestore_v1.client import Client
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud.firestore_v1.transforms import Increment
import datetime
from ..models.user import UserInDB
from ..models.chat import Chat
from ..models.message import Message

class FirebaseService:
    def __init__(self, db: Client):
        self.db = db

    def get_user(self, user_id: str) -> UserInDB | None:
        user_ref = self.db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if user_doc.exists:
            return UserInDB(**user_doc.to_dict())
        return None

    def create_user(self, user_data: dict) -> UserInDB:
        user_id = user_data["uid"]
        user_ref = self.db.collection("users").document(user_id)
        user_data["createdAt"] = datetime.datetime.now(datetime.timezone.utc)
        user_ref.set(user_data)
        return UserInDB(**user_data)
    
    def update_user_login_time(self, user_id: str):
        user_ref = self.db.collection("users").document(user_id)
        user_ref.update({"lastLoginAt": datetime.datetime.now(datetime.timezone.utc)})

    def create_chat(self, user_id: str, title: str) -> Chat:
        chat_ref = self.db.collection("chats").document()
        chat_data = {
            "id": chat_ref.id,
            "userId": user_id,
            "title": title,
            "createdAt": datetime.datetime.now(datetime.timezone.utc),
            "messageCount": 0,
            "isActive": True
        }
        chat_ref.set(chat_data)
        return Chat(**chat_data)

    def get_chats_for_user(self, user_id: str) -> list[Chat]:
        chats_ref = self.db.collection("chats").where(filter=FieldFilter("userId", "==", user_id)).order_by("createdAt", direction="DESCENDING")
        chats = [Chat(**doc.to_dict()) for doc in chats_ref.stream()]
        return chats

    def get_chat(self, chat_id: str, user_id: str) -> Chat | None:
        chat_ref = self.db.collection("chats").document(chat_id)
        chat_doc = chat_ref.get()
        if chat_doc.exists:
            chat_data = chat_doc.to_dict()
            if chat_data.get("userId") == user_id:
                return Chat(**chat_data)
        return None
        
    def add_message_to_chat(self, chat_id: str, user_id: str, message_data: dict) -> Message:
        message_ref = self.db.collection("messages").document()
        full_message_data = {
            "id": message_ref.id,
            "chatId": chat_id,
            "userId": user_id,
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            **message_data
        }
        message_ref.set(full_message_data)

        # Increment message count in the chat document
        chat_ref = self.db.collection("chats").document(chat_id)
        chat_ref.update({"messageCount": Increment(1)})


        return Message(**full_message_data)

    def get_messages_for_chat(self, chat_id: str, user_id: str) -> list[Message]:
        # First, validate user has access to this chat
        if not self.get_chat(chat_id, user_id):
            return []
            
        messages_ref = self.db.collection("messages").where(filter=FieldFilter("chatId", "==", chat_id)).order_by("timestamp")
        messages = [Message(**doc.to_dict()) for doc in messages_ref.stream()]
        return messages