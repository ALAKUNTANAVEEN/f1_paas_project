from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import firebase_admin.auth as auth

router = APIRouter()

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: UserLogin):
    try:
        user_record = auth.get_user_by_email(user.email)
        return {"message": "Login successful", "uid": user_record.uid}
    except:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
 
