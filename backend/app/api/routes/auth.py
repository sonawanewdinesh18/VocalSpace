from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, UserStats
from app.core.security import verify_password, get_password_hash, create_access_token
from pydantic import BaseModel, EmailStr
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    fullName: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    token: str
    email: str = None
    name: str = None
    google_id: str = None

class TokenResponse(BaseModel):
    token: str
    user: dict

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.fullName,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create user stats
    user_stats = UserStats(user_id=new_user.id)
    db.add(user_stats)
    db.commit()
    
    # Generate token
    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
    
    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "fullName": new_user.full_name,
            "role": new_user.role,
            "profileCompleted": new_user.profile_completed
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token
    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "role": user.role,
            "profileCompleted": user.profile_completed
        }
    }

@router.post("/google", response_model=TokenResponse)
async def google_auth(auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Google OAuth authentication endpoint
    Verifies Google ID token or access token and creates/logs in user
    """
    try:
        # Check if user info is already provided (OAuth2 flow)
        if auth_data.email and auth_data.google_id:
            email = auth_data.email
            name = auth_data.name or email.split('@')[0]
            google_id = auth_data.google_id
        else:
            # Verify the Google ID token (ID token flow)
            idinfo = id_token.verify_oauth2_token(
                auth_data.token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            
            # Check if token is from correct issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise HTTPException(status_code=401, detail="Invalid token issuer")
            
            # Extract user information
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            google_id = idinfo.get('sub')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            # User exists - login
            token = create_access_token(data={"sub": str(user.id), "email": user.email})
            
            return {
                "token": token,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "fullName": user.full_name,
                    "role": user.role,
                    "profileCompleted": user.profile_completed
                }
            }
        else:
            # New user - register
            new_user = User(
                email=email,
                full_name=name,
                hashed_password=get_password_hash(google_id),  # Use Google ID as password
                role="user"
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            # Create user stats
            user_stats = UserStats(user_id=new_user.id)
            db.add(user_stats)
            db.commit()
            
            # Generate token
            token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
            
            return {
                "token": token,
                "user": {
                    "id": new_user.id,
                    "email": new_user.email,
                    "fullName": new_user.full_name,
                    "role": new_user.role,
                    "profileCompleted": new_user.profile_completed
                }
            }
            
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")
