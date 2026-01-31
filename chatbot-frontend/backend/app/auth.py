import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from supabase import create_client
import hashlib
import bcrypt

from dotenv import load_dotenv
load_dotenv()

import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-change-this")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET", "super-secret-refresh-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # 15 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 days

class TokenData(BaseModel):
    user_id: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    hashed_password_bytes = hashed_password.encode('utf-8')
    
    # 1. Try new method: SHA256 pre-hash
    password_hash = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    
    try:
        if bcrypt.checkpw(password_hash.encode('utf-8'), hashed_password_bytes):
            return True
    except Exception:
        pass # Fall through to legacy check

    # 2. Legacy check: Raw password (only if <= 72 bytes)
    plain_bytes = plain_password.encode('utf-8')
    if len(plain_bytes) <= 72:
        try:
             if bcrypt.checkpw(plain_bytes, hashed_password_bytes):
                 return True
        except Exception:
            pass
            
    return False

def get_password_hash(password: str) -> str:
    # Always pre-hash new passwords to ensure fixed length input for bcrypt
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    # bcrypt.hashpw returns bytes, decode to store as string
    return bcrypt.hashpw(password_hash.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    logger.debug(f"get_current_user called with token: {token[:20]}..." if token else "No token")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        logger.debug(f"Decoded user_id: {user_id}")
        if user_id is None:
            logger.error("user_id is None in token payload")
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError as e:
        logger.error(f"JWTError: {e}")
        raise credentials_exception
    
    response = supabase.table("users").select("*").eq("id", token_data.user_id).execute()
    user = response.data[0] if response.data else None
    if user is None:
        logger.error(f"User not found for id: {token_data.user_id}")
        raise credentials_exception
    logger.debug(f"User authenticated: {user.get('username')}")
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    
    # Store token in database
    user_id = data.get("sub")
    if user_id:
        try:
            supabase.table("refresh_tokens").insert({
                "token": encoded_jwt,
                "user_id": user_id,
                "expires_at": expire.isoformat()
            }).execute()
        except Exception as e:
            logger.error(f"Failed to store refresh token: {e}")
            # We continue even if DB storage fails to avoid breaking login flow immediately,
            # but verification will fail if we strictly check DB. 
            # Ideally we should raise an error here.
            pass
            
    return encoded_jwt

def verify_refresh_token(token: str) -> Optional[str]:
    """Verify refresh token and return user_id if valid and not revoked"""
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        user_id: str = payload.get("sub")
        
        # Check if token exists in DB and is not revoked
        try:
            response = supabase.table("refresh_tokens") \
                .select("id, revoked") \
                .eq("token", token) \
                .execute()
            
            if not response.data:
                logger.warning("Refresh token not found in database")
                return None
                
            if response.data[0]["revoked"]:
                logger.warning("Refresh token is revoked")
                return None
                
        except Exception as e:
            logger.error(f"Database error verifying refresh token: {e}")
            return None
            
        return user_id
    except JWTError:
        return None

def revoke_refresh_token(token: str) -> bool:
    """Revoke a refresh token"""
    try:
        supabase.table("refresh_tokens") \
            .update({"revoked": True}) \
            .eq("token", token) \
            .execute()
        return True
    except Exception as e:
        logger.error(f"Failed to revoke token: {e}")
        return False