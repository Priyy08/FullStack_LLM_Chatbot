# # File: chatbot/backend/api/websocket.py (Updated)

# from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
# from firebase_admin import auth
# import json
# from ..models.message import WebsocketMessage
# from ..core.dependencies import get_chat_service, get_firebase_service
# from ..services.chat_service import ChatService
# from ..services.firebase_service import FirebaseService

# router = APIRouter()

# class ConnectionManager:
#     def __init__(self):
#         self.active_connections: dict[str, list[WebSocket]] = {}

#     async def connect(self, websocket: WebSocket, chat_id: str):
#         await websocket.accept()
#         if chat_id not in self.active_connections:
#             self.active_connections[chat_id] = []
#         self.active_connections[chat_id].append(websocket)

#     def disconnect(self, websocket: WebSocket, chat_id: str):
#         if chat_id in self.active_connections:
#             self.active_connections[chat_id].remove(websocket)
#             if not self.active_connections[chat_id]:
#                 del self.active_connections[chat_id]

#     async def broadcast(self, message: str, chat_id: str):
#         if chat_id in self.active_connections:
#             for connection in self.active_connections[chat_id]:
#                 await connection.send_text(message)

# manager = ConnectionManager()

# async def get_token_from_query(
#     websocket: WebSocket,
#     token: str | None = Query(None),
# ):
#     """Dependency to extract and validate token from websocket query params."""
#     if token is None:
#         await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing token")
#         return None
#     return token

# @router.websocket("/ws/{chat_id}")
# async def websocket_endpoint(
#     websocket: WebSocket,
#     chat_id: str,
#     token: str = Depends(get_token_from_query),
#     chat_service: ChatService = Depends(get_chat_service),
#     firebase_service: FirebaseService = Depends(get_firebase_service)
# ):
#     if not token:
#         return # Connection already closed by dependency

#     try:
#         # Authenticate the user for the WebSocket connection
#         decoded_token = auth.verify_id_token(token)
#         user_id = decoded_token['uid']
        
#         # Check if user has access to this chat
#         chat = firebase_service.get_chat(chat_id=chat_id, user_id=user_id)
#         if not chat:
#             await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Access denied or chat not found")
#             return
#     except Exception as e:
#         await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=f"Authentication failed: {e}")
#         return

#     await manager.connect(websocket, chat_id)
#     print(f"User {user_id} connected to chat {chat_id}")
    
#     try:
#         while True:
#             data = await websocket.receive_text()
#             message = WebsocketMessage(content=data)
            
#             # Delegate the entire message processing flow to the ChatService
#             user_msg, ai_msg = chat_service.process_user_message(
#                 chat_id=chat_id,
#                 user_id=user_id,
#                 user_message_content=message.content
#             )

#             # Broadcast both new messages back to all clients in the chat room
#             # The client-side will use the 'role' field to render them differently
#             await manager.broadcast(user_msg.model_dump_json(), chat_id)
#             await manager.broadcast(ai_msg.model_dump_json(), chat_id)

#     except WebSocketDisconnect:
#         manager.disconnect(websocket, chat_id)
#         print(f"User {user_id} disconnected from chat {chat_id}")
#     except Exception as e:
#         print(f"An error occurred in websocket for chat {chat_id}: {e}")
#         await websocket.close(code=status.WS_1011_INTERNAL_ERROR)




from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from firebase_admin import auth
import json
from ..models.message import WebsocketMessage
from ..core.dependencies import get_chat_service, get_firebase_service
from ..services.chat_service import ChatService
from ..services.firebase_service import FirebaseService

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, chat_id: str):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, websocket: WebSocket, chat_id: str):
        if chat_id in self.active_connections:
            self.active_connections[chat_id].remove(websocket)
            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]

    async def broadcast(self, message: str, chat_id: str):
        if chat_id in self.active_connections:
            for connection in self.active_connections[chat_id]:
                await connection.send_text(message)

manager = ConnectionManager()

async def get_token_from_query(
    websocket: WebSocket,
    token: str | None = Query(None),
):
    """Dependency to extract and validate token from websocket query params."""
    if token is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing token")
        return None
    return token

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    chat_id: str,
    token: str = Depends(get_token_from_query),
    chat_service: ChatService = Depends(get_chat_service),
    firebase_service: FirebaseService = Depends(get_firebase_service)
):
    if not token:
        return

    try:
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        chat = firebase_service.get_chat(chat_id=chat_id, user_id=user_id)
        if not chat:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Access denied or chat not found")
            return
    except Exception as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=f"Authentication failed: {e}")
        return

    await manager.connect(websocket, chat_id)
    print(f"✅ [1/7] User '{user_id}' connected successfully to chat '{chat_id}'.")
    
    try:
        while True:
            # --- START OF MESSAGE PROCESSING ---
            data = await websocket.receive_text()
            print(f"✅ [2/7] Received text from client: '{data}'")

            message = WebsocketMessage(content=data)
            
            print(f"✅ [3/7] Calling ChatService to process the message.")
            user_msg, ai_msg = chat_service.process_user_message(
                chat_id=chat_id,
                user_id=user_id,
                user_message_content=message.content
            )
            print(f"✅ [4/7] ChatService returned. User Msg ID: {user_msg.id}, AI Msg ID: {ai_msg.id}")
            
            print(f"✅ [5/7] Broadcasting USER message back to client. Content: '{user_msg.content}'")
            await manager.broadcast(user_msg.model_dump_json(), chat_id)
            
            print(f"✅ [6/7] Broadcasting AI message back to client. Content: '{ai_msg.content[:50]}...'") # Log first 50 chars
            await manager.broadcast(ai_msg.model_dump_json(), chat_id)
            
            print(f"✅ [7/7] Broadcast complete. Waiting for next message.")
            # --- END OF MESSAGE PROCESSING ---

    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_id)
        print(f"🔌 User {user_id} disconnected from chat {chat_id}")
    except Exception as e:
        print(f"❌ An error occurred in websocket for chat {chat_id}: {e}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)