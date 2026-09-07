from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.tenancy import ProjectCriticality, ProjectExposure

class TeamCreate(BaseModel):
    name: str

class TeamResponse(BaseModel):
    id: int
    name: str
    organization_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    team_id: Optional[int] = None
    criticality: ProjectCriticality = ProjectCriticality.MEDIUM
    exposure: ProjectExposure = ProjectExposure.INTERNAL
    data_sensitivity: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    organization_id: int
    team_id: Optional[int]
    criticality: ProjectCriticality
    exposure: ProjectExposure
    data_sensitivity: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class OrganizationResponse(BaseModel):
    id: int
    name: str
    industry: Optional[str]
    size: Optional[str]
    country: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
