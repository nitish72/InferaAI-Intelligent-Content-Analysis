import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
import pandas as pd
from app.core.excel_db import ExcelDB
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str | None = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/signup")
async def signup(user: UserCreate):
    users_df = ExcelDB.get_users()
    if not users_df[users_df['email'] == user.email].empty:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = {
        "email": user.email, 
        "full_name": user.full_name,
        "hashed_password": get_password_hash(user.password),
        "created_at": datetime.utcnow().isoformat()
    }
    users_df = pd.concat([users_df, pd.DataFrame([new_user])], ignore_index=True)
    ExcelDB.save_users(users_df)
    
    token = create_access_token(data={"sub": user.email})
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "email": user.email,
        "full_name": user.full_name,
        "created_at": new_user["created_at"]
    }

@router.post("/login")
async def login(user: UserCreate):
    users_df = ExcelDB.get_users()
    user_row = users_df[users_df['email'] == user.email]
    
    if user_row.empty or not verify_password(user.password, user_row.iloc[0]["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    db_user = user_row.iloc[0].to_dict()
    token = create_access_token(data={"sub": user.email})
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "email": db_user["email"],
        "full_name": db_user.get("full_name"),
        "created_at": str(db_user["created_at"])
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "full_name": current_user.get("full_name"),
        "created_at": str(current_user["created_at"])
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, request: Request):
    users_df = ExcelDB.get_users()
    if users_df[users_df['email'] == req.email].empty:
        return {"message": "If that email exists, a reset link has been generated.", "simulated_email_link": None}
    
    reset_token = secrets.token_urlsafe(32)
    expiry = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    
    tokens_df = ExcelDB.get_tokens()
    new_token = {
        "user_email": req.email,
        "token": reset_token,
        "expires_at": expiry
    }
    tokens_df = pd.concat([tokens_df, pd.DataFrame([new_token])], ignore_index=True)
    ExcelDB.save_tokens(tokens_df)
    
    frontend_origin = request.headers.get("origin") or "http://localhost:5173"
    reset_link = f"{frontend_origin}/?reset_token={reset_token}"
    return {
        "message": "Password reset link generated successfully.", 
        "simulated_email_link": reset_link
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    tokens_df = ExcelDB.get_tokens()
    token_row = tokens_df[tokens_df['token'] == req.token]
    
    if token_row.empty:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    expiry = datetime.fromisoformat(str(token_row.iloc[0]["expires_at"]))
    if expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    user_email = token_row.iloc[0]["user_email"]
    
    # Update user password
    users_df = ExcelDB.get_users()
    users_df.loc[users_df['email'] == user_email, 'hashed_password'] = get_password_hash(req.new_password)
    ExcelDB.save_users(users_df)
    
    # Delete token
    tokens_df = tokens_df[tokens_df['token'] != req.token]
    ExcelDB.save_tokens(tokens_df)
    
    return {"message": "Password has been reset successfully"}
