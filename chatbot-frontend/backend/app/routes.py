from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

from .auth import (
    get_current_user, 
    create_access_token, 
    create_refresh_token,
    verify_refresh_token,
    revoke_refresh_token,
    verify_password, 
    get_password_hash
)
from .agent_config import marketing_agent
from .utils import format_strategy
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

router = APIRouter()

# ------------------- Auth Models -------------------
class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: str  # username or email
    password: str

class UserInfo(BaseModel):
    id: str
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserInfo

class RefreshRequest(BaseModel):
    refresh_token: str

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

# ------------------- Chat Models -------------------
class ChatSessionResponse(BaseModel):
    id: str
    title: str
    pinned: bool
    created_at: datetime
    updated_at: datetime

class MessageResponse(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime

class SendMessageRequest(BaseModel):
    content: str

class UpdateChatRequest(BaseModel):
    title: Optional[str] = None
    pinned: Optional[bool] = None

# ------------------- Auth Routes -------------------
@router.post("/signup", response_model=TokenResponse)
async def signup(request: SignupRequest):
    # Check if username or email exists
    existing = supabase.table("users").select("id").or_(f"username.eq.{request.username},email.eq.{request.email}").execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed = get_password_hash(request.password)
    
    user_data = {
        "username": request.username,
        "email": request.email,
        "password_hash": hashed
    }
    # Add full_name if provided
    if request.full_name:
        user_data["full_name"] = request.full_name
    
    response = supabase.table("users").insert(user_data).execute()
    
    user = response.data[0]
    access_token = create_access_token(data={"sub": str(user["id"])})  
    refresh_token = create_refresh_token(data={"sub": str(user["id"])})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "full_name": user.get("full_name")
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    # Find user by username or email
    response = supabase.table("users").select("*").or_(
        f"username.eq.{request.identifier},email.eq.{request.identifier}"
    ).execute()
    
    user = response.data[0] if response.data else None
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username/email or password")
    
    access_token = create_access_token(data={"sub": str(user["id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["id"])})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "full_name": user.get("full_name")
        }
    }

@router.post("/refresh")
async def refresh_token(request: RefreshRequest):
    """Exchange refresh token for a new access token"""
    user_id = verify_refresh_token(request.refresh_token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Verify user still exists
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    user = response.data[0] if response.data else None
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Generate new access token
    new_access_token = create_access_token(data={"sub": str(user["id"])})
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(request: RefreshRequest):
    """Revoke the refresh token"""
    revoke_refresh_token(request.refresh_token)
    return {"detail": "Successfully logged out"}

@router.patch("/user/profile")
async def update_profile(request: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Update user profile information"""
    update_data = {}
    
    if request.full_name is not None:
        update_data["full_name"] = request.full_name
    
    if request.email is not None:
        # Check if email is already taken by another user
        existing = supabase.table("users").select("id").eq("email", request.email).execute()
        if existing.data and existing.data[0]["id"] != current_user["id"]:
            raise HTTPException(status_code=400, detail="Email already registered")
        update_data["email"] = request.email
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Update user profile
    response = supabase.table("users").update(update_data).eq("id", current_user["id"]).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    
    updated_user = response.data[0]
    return {
        "id": str(updated_user["id"]),
        "username": updated_user.get("username"),
        "email": updated_user.get("email"),
        "full_name": updated_user.get("full_name")
    }

# ------------------- Chat Routes -------------------
@router.get("/chats", response_model=List[ChatSessionResponse])
async def list_chats(current_user: dict = Depends(get_current_user)):
    response = supabase.table("chat_sessions") \
        .select("*") \
        .eq("user_id", current_user["id"]) \
        .order("updated_at", desc=True) \
        .execute()
    return response.data

@router.post("/chats")
async def create_chat(current_user: dict = Depends(get_current_user)):
    response = supabase.table("chat_sessions").insert({
        "user_id": current_user["id"],
        "title": "New Chat"
    }).execute()
    return response.data[0]

@router.patch("/chats/{chat_id}")
async def update_chat(chat_id: str, request: UpdateChatRequest, current_user: dict = Depends(get_current_user)):
    # Verify ownership
    ownership = supabase.table("chat_sessions").select("id").eq("id", chat_id).eq("user_id", current_user["id"]).execute()
    if not ownership.data:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    update_data = {}
    if request.title is not None:
        update_data["title"] = request.title
    if request.pinned is not None:
        update_data["pinned"] = request.pinned
    if update_data:
        update_data["updated_at"] = "now()"
    
    response = supabase.table("chat_sessions").update(update_data).eq("id", chat_id).execute()
    return response.data[0]

@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, current_user: dict = Depends(get_current_user)):
    ownership = supabase.table("chat_sessions").select("id").eq("id", chat_id).eq("user_id", current_user["id"]).execute()
    if not ownership.data:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    supabase.table("chat_sessions").delete().eq("id", chat_id).execute()
    return {"detail": "Chat deleted"}

@router.get("/chats/{chat_id}/messages")
async def get_messages(chat_id: str, current_user: dict = Depends(get_current_user)):
    # Verify ownership
    ownership = supabase.table("chat_sessions").select("id").eq("id", chat_id).eq("user_id", current_user["id"]).execute()
    if not ownership.data:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    response = supabase.table("chat_messages") \
        .select("*") \
        .eq("chat_session_id", chat_id) \
        .order("timestamp") \
        .execute()
    return response.data

@router.post("/chats/{chat_id}/messages")
async def send_message(chat_id: str, request: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    # Verify ownership
    ownership = supabase.table("chat_sessions").select("id").eq("id", chat_id).eq("user_id", current_user["id"]).execute()
    if not ownership.data:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    user_message = request.content.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Store user message
    supabase.table("chat_messages").insert({
        "chat_session_id": chat_id,
        "role": "user",
        "content": user_message
    }).execute()
    
    # Invoke agent (async) - fetch history first
    history_response = supabase.table("chat_messages") \
        .select("*") \
        .eq("chat_session_id", chat_id) \
        .order("timestamp") \
        .execute()
    
    # Format history for agent (exclude current user message which is already in request)
    # Actually, we should include all previous messages. The current one is passed as user_message.
    previous_messages = [
        {"role": msg["role"], "content": msg["content"]} 
        for msg in history_response.data 
        if msg["content"] != user_message # simplified check, ideally use ID or just slice
    ]
    
    result = await marketing_agent.ainvoke({
        "messages": previous_messages,
        "user_message": user_message
    })
    
    # Check if we have a strategy or just a conversation response
    if result.get("strategy"):
        strategy = result["strategy"]
        assistant_response = format_strategy(strategy)
    elif result.get("conversation_response"):
        assistant_response = result["conversation_response"]
    else:
        # Fallback
        assistant_response = "I'm listening. Please tell me more."
    
    # Store assistant message
    supabase.table("chat_messages").insert({
        "chat_session_id": chat_id,
        "role": "assistant",
        "content": assistant_response
    }).execute()
    
    # Update chat session timestamp
    supabase.table("chat_sessions").update({"updated_at": "now()"}).eq("id", chat_id).execute()
    
    return {"detail": "Message processed", "assistant_response": assistant_response}





from fastapi import File, UploadFile
# Import the function we just created
from app.components.doc_converter import process_document 

@router.post("/upload-doc")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # 1. Extract text (simulated or real)
    clean_text = await process_document(file)
    
    file_path = f"uploads/{current_user['id']}/{file.filename}"
    
    try:
        # Save metadata to database
        response = supabase.table("documents").insert({
            "user_id": current_user["id"],
            "filename": file.filename,
            "file_path": file_path,
            "content_type": file.content_type,
            "file_size": file.size or 0,
            "content_summary": clean_text[:200] + "..." if clean_text else None
        }).execute()
        
        doc_id = response.data[0]["id"]
        
        return {
            "filename": file.filename,
            "file_path": file_path,
            "document_id": doc_id,
            "summary": clean_text[:100] if clean_text else None,
            "character_count": len(clean_text) if clean_text else 0
        }
    except Exception as e:
        # If table doesn't exist yet, fallback to simple return
        print(f"DB Error: {e}")
        return {
             "filename": file.filename,
             "summary": clean_text[:100] if clean_text else "Uploaded",
             "character_count": len(clean_text) if clean_text else 0
        }

@router.get("/documents")
async def list_documents(current_user: dict = Depends(get_current_user)):
    """List user uploaded documents"""
    try:
        print(f"Fetching documents for user: {current_user['id']}")
        response = supabase.table("documents") \
            .select("*") \
            .eq("user_id", current_user["id"]) \
            .order("created_at", desc=True) \
            .execute()
        print(f"Found {len(response.data)} documents")
        return response.data
    except Exception as e:
        print(f"Error listing documents: {e}")
        return []
    
    # 3. Return to frontend OR pass to your LLM agent
    return {
        "filename": file.filename,
        "character_count": len(clean_text),
        "content": clean_text 
    }