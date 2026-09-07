from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.tenancy import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    organization_name: str # For MVP, creating a user creates an org

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[UserRole] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    organization_id: int

    class Config:
        from_attributes = True
