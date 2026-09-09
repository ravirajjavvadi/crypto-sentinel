from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core import security
from app.models.tenancy import User, Organization, UserRole
from app.schemas.user import UserCreate, UserResponse, Token
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/login", response_model=Token)
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id), "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup", response_model=UserResponse)
def signup_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="User already exists.")
    
    org = db.query(Organization).filter(Organization.name == user_in.organization_name).first()
    if not org:
        org = Organization(name=user_in.organization_name)
        db.add(org)
        db.commit()
        db.refresh(org)
    
    existing_users_in_org = db.query(User).filter(User.organization_id == org.id).count()
    role = UserRole.ORG_OWNER if existing_users_in_org == 0 else UserRole.VIEWER

    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        role=role,
        organization_id=org.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
