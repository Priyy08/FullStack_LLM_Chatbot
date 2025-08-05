from firebase_admin import auth
from ..services.firebase_service import FirebaseService
from ..models.user import UserCreate, UserLogin, UserInDB

class AuthService:
    def __init__(self, firebase_service: FirebaseService):
        self.firebase_service = firebase_service

    def register_user(self, user_create: UserCreate) -> UserInDB:
        try:
            # Create user in Firebase Authentication
            new_user = auth.create_user(
                email=user_create.email,
                password=user_create.password,
                display_name=user_create.displayName
            )
            
            # Create corresponding user profile in Firestore
            user_data_for_db = {
                "uid": new_user.uid,
                "email": new_user.email,
                "displayName": new_user.display_name,
            }
            db_user = self.firebase_service.create_user(user_data_for_db)
            return db_user
        except auth.EmailAlreadyExistsError:
            raise ValueError("An account with this email already exists.")
        except Exception as e:
            raise e

    def generate_custom_token(self, uid: str) -> str:
        """
        Generates a custom token for a user. The client-side Firebase SDK
        uses this to sign in and get an ID token (JWT).
        """
        try:
            custom_token = auth.create_custom_token(uid)
            return custom_token.decode('utf-8')
        except Exception as e:
            raise RuntimeError(f"Failed to create custom token: {e}")