from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from firebase_admin import auth
from jose import JWTError
from pydantic import ValidationError

from ..core.database import get_db
from ..services.firebase_service import FirebaseService
from ..models.user import UserInDB

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)) -> UserInDB:
    """
    Dependency to get the current authenticated user from a JWT token.
    It verifies the token using Firebase Admin SDK and fetches the user profile from Firestore.
    
    *** SELF-HEALING ***
    If a user exists in Firebase Auth but not in our Firestore `users` collection,
    this function will create the Firestore document automatically.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Verify the token using Firebase Admin SDK
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        firebase_service = FirebaseService(db)
        user = firebase_service.get_user(user_id=uid)
        
        # --- THIS IS THE CRITICAL FIX ---
        if user is None:
            # The user is authenticated with Firebase, but doesn't have a profile in our DB.
            # This can happen if the /register call failed or for users created manually.
            # We will create the user profile now to self-heal the system.
            print(f"User with UID {uid} not found in Firestore. Creating profile now.")
            
            # Fetch the full user record from Firebase Auth to get all details
            auth_user_record = auth.get_user(uid)
            
            user_data_for_db = {
                "uid": auth_user_record.uid,
                "email": auth_user_record.email,
                "displayName": auth_user_record.display_name,
            }
            # Create the user in Firestore and return the new user object
            user = firebase_service.create_user(user_data_for_db)
            if user is None:
                # If creation still fails, something is wrong with the DB connection.
                raise credentials_exception

        return user
    except (auth.InvalidIdTokenError, auth.ExpiredIdTokenError, ValueError, KeyError) as e:
        print(f"Token validation error: {e}")
        raise credentials_exception
    except Exception as e:
        # Catch any other potential errors during the process
        print(f"An unexpected error occurred in get_current_user: {e}")
        raise credentials_exception