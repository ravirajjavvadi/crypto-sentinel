from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.tenancy import Team, User, UserRole
from app.schemas.tenancy import TeamCreate, TeamResponse
from app.api.deps import get_current_active_user

router = APIRouter()

@router.post("/", response_model=TeamResponse)
def create_team(
    team_in: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role not in [UserRole.ORG_OWNER, UserRole.SECURITY_ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    team = Team(name=team_in.name, organization_id=current_user.organization_id)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team

@router.get("/", response_model=List[TeamResponse])
def list_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    teams = db.query(Team).filter(Team.organization_id == current_user.organization_id).all()
    return teams
