from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.tenancy import User, UserRole
from app.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(db: Session = Depends(get_db)) -> User:
    # Next.js proxy handles Supabase Auth validation.
    # For MVP, just return the primary user
    user = db.query(User).first()
    if not user:
        # Create a dummy user and org if none exists
        from app.models.tenancy import Organization, UserRole
        org = Organization(name="Default Org")
        db.add(org)
        db.commit()
        db.refresh(org)
        
        user = User(email="admin@example.com", hashed_password="pwd", organization_id=org.id, role=UserRole.ORG_OWNER)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
