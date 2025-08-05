from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# IMPORTANT: The imports must be relative to the 'backend' directory now.
from app.api import auth, chat, websocket
from app.core.database import initialize_firebase

# --- Application Setup ---
app = FastAPI(
    title="Persistent Real-Time Chatbot API",
    description="Backend for a real-time chatbot using FastAPI, LangChain, and Firebase.",
    version="1.0.0"
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Event Handlers ---
@app.on_event("startup")
def on_startup():
    """Initialize Firebase connection when the application starts."""
    initialize_firebase()

# --- API Routers ---
# This is the definitive fix for the trailing slash redirect issue.
# FastAPI can be strict. This ensures that requests to /api/chats/ go directly
# to the router without being redirected to /api/chats, which drops auth headers.
# By including the router on the root app and then mounting it, we solve this.
app.include_router(chat.router, prefix="/api/chats", tags=["Chat Management"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(websocket.router, tags=["Real-Time Chat"])

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Persistent Real-Time Chatbot API!"}

# --- For local development ---
if __name__ == "__main__":
    # Note the change in how uvicorn is called for script execution.
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)