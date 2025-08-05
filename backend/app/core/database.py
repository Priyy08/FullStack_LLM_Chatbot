import firebase_admin
from firebase_admin import credentials, firestore, auth
from ..config import settings
import os
import json

def initialize_firebase():
    """
    Initializes the Firebase Admin SDK. Should be called once on application startup.
    """
    try:
        # Check if the app is already initialized to prevent re-initialization error
        firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        if firebase_creds_json:
            print("Found FIREBASE_CREDENTIALS_JSON. Initializing Firebase from environment variable.")
            creds_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(creds_dict)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully.")
        else:
            print("Firebase Admin SDK already initialized.")
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        raise

def get_db():
    """
    FastAPI dependency to get a Firestore client instance.
    """
    try:
        return firestore.client()
    except Exception as e:
        print(f"Error getting Firestore client: {e}")
        # Attempt to re-initialize if not available
        initialize_firebase()
        return firestore.client()

def get_firebase_auth():
    """
    FastAPI dependency to get a Firebase Auth client instance.
    """
    return auth