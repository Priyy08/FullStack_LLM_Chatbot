from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import auth

from ..models.user import UserCreate, UserLogin, Token, UserInDB
from ..services.auth_service import AuthService
from ..services.firebase_service import FirebaseService
from ..core.dependencies import get_firebase_service

router = APIRouter()

@router.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def register(user_create: UserCreate, firebase_service: FirebaseService = Depends(get_firebase_service)):
    """
    Register a new user. Creates an account in Firebase Auth and a user profile in Firestore.
    """
    auth_service = AuthService(firebase_service)
    try:
        user = auth_service.register_user(user_create)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")

# Note: A traditional /login endpoint returning a JWT is tricky with Firebase client-side auth.
# The standard Firebase flow is:
# 1. Client uses Firebase SDK to sign in with email/password.
# 2. Firebase SDK on the client receives the JWT (ID token).
# 3. Client sends this JWT in the Authorization header for all subsequent API requests.
# This backend is built to expect that JWT. No separate /login endpoint is needed on the backend.