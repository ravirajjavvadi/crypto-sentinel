from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.tenancy import User, UserRole, Organization
from app.core.security import SECRET_KEY

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        # Decode Supabase JWT
        payload = jwt.decode(token, key=SECRET_KEY, options={"verify_signature": False})
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid auth credentials (no email in token)")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid auth credentials")
    
    # Try to find user by email in local database
    user = db.query(User).filter(User.email == email).first()
    
    # Auto-provision if missing (bridge Next.js Supabase Auth with FastAPI local DB)
    if not user:
        org = db.query(Organization).first()
        if not org:
            org = Organization(name="CryptoSentinel Corp")
            db.add(org)
            db.commit()
            db.refresh(org)
            
        # First user is ORG_OWNER
        is_first = db.query(User).count() == 0
        role = UserRole.ORG_OWNER if is_first or email == "ravirajjavvadhi@gmail.com" else UserRole.VIEWER
        
        user = User(email=email, hashed_password="sso", organization_id=org.id, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_active_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role"
            )
        return user
