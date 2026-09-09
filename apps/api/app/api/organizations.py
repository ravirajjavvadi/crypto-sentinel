from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.session import get_db
from app.models.tenancy import Organization, User, UserRole
from app.schemas.tenancy import OrganizationResponse
from app.api.deps import get_current_active_user, RoleChecker
from app.core import security
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/me", response_model=OrganizationResponse)
def get_my_organization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

class EnrollEmployeeRequest(BaseModel):
    name: str
    email: EmailStr
    role: UserRole

@router.post("/enroll", response_model=UserResponse)
def enroll_employee(
    request: EnrollEmployeeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ORG_OWNER, UserRole.SECURITY_ADMIN])),
):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Auto-provision password using the prefix of the email (intelligent setup as requested)
    prefix_password = request.email.split("@")[0]
    
    new_user = User(
        email=request.email,
        hashed_password=security.get_password_hash(prefix_password),
        role=request.role,
        organization_id=current_user.organization_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/employees")
def list_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ORG_OWNER, UserRole.SECURITY_ADMIN])),
):
    users = db.query(User).filter(User.organization_id == current_user.organization_id).all()
    return [{"id": u.id, "email": u.email, "role": u.role} for u in users]

class RoleUpdateRequest(BaseModel):
    role: UserRole

@router.patch("/employees/{user_id}/role")
def update_employee_role(
    user_id: int,
    request: RoleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ORG_OWNER])),
):
    target_user = db.query(User).filter(
        User.id == user_id, 
        User.organization_id == current_user.organization_id
    ).first()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    target_user.role = request.role
    db.commit()
    return {"message": "Role updated successfully"}
