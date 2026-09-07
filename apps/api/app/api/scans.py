import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.tenancy import Project, Scan, User, UserRole, ScanStatus
from app.schemas.scan import ScanResponse
from app.api.deps import get_current_active_user
from app.tasks import repo_scan_task, domain_scan_task, dummy_scan_task

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

from pydantic import BaseModel

class RepoScanRequest(BaseModel):
    repo_url: str

class DomainScanRequest(BaseModel):
    domain_url: str

@router.post("/scan/repo", response_model=ScanResponse)
async def scan_repo(
    request: RepoScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Find or create project
    project_name = request.repo_url.split("/")[-1]
    project = db.query(Project).filter(
        Project.name == project_name,
        Project.organization_id == current_user.organization_id
    ).first()
    
    if not project:
        project = Project(
            name=project_name,
            organization_id=current_user.organization_id
        )
        db.add(project)
        db.commit()
        db.refresh(project)

    scan = Scan(project_id=project.id, status=ScanStatus.PENDING)
    db.add(scan)
    db.commit()
    db.refresh(scan)

    background_tasks.add_task(repo_scan_task, scan.id, request.repo_url, current_user.organization_id)
    return scan

@router.post("/scan/domain", response_model=ScanResponse)
async def scan_domain(
    request: DomainScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    project = db.query(Project).filter(
        Project.name == request.domain_url,
        Project.organization_id == current_user.organization_id
    ).first()

    if not project:
        project = Project(
            name=request.domain_url,
            organization_id=current_user.organization_id
        )
        db.add(project)
        db.commit()
        db.refresh(project)

    scan = Scan(project_id=project.id, status=ScanStatus.PENDING)
    db.add(scan)
    db.commit()
    db.refresh(scan)

    background_tasks.add_task(domain_scan_task, scan.id, request.domain_url, current_user.organization_id)
    return scan

@router.post("/project/{project_id}/scan", response_model=ScanResponse)
async def upload_and_scan(
    project_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Verify project exists and belongs to user's org
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported")

    # Create scan record
    scan = Scan(project_id=project.id, status=ScanStatus.PENDING)
    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Save file safely
    safe_filename = f"scan_{scan.id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    background_tasks.add_task(dummy_scan_task, scan.id, file_path)

    return scan

from typing import Optional

@router.get("/stats", response_model=dict)
def get_stats(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    org_id = current_user.organization_id
    
    projects_q = db.query(Project).filter(Project.organization_id == org_id).all()
    projects_list = [{"id": p.id, "name": p.name} for p in projects_q]
    
    from app.models.tenancy import Asset, Finding
    
    assets_query = db.query(Asset).filter(Asset.organization_id == org_id)
    findings_query = db.query(Finding).filter(Finding.organization_id == org_id)
    
    if project_id:
        # We need to filter assets and findings by the given project
        # In this simple MVP, we filter assets by scanning those that belong to scans of this project
        assets_query = assets_query.join(Scan).filter(Scan.project_id == project_id)
        findings_query = findings_query.join(Scan).filter(Scan.project_id == project_id)

    assets_count = assets_query.count()
    critical_findings = findings_query.filter(Finding.severity == "CRITICAL").count()
    quantum_exposure = assets_query.filter(Asset.is_quantum_safe == False).count()
    
    recent_assets_q = assets_query.order_by(Asset.created_at.desc()).limit(10).all()
    
    recent_assets = []
    for a in recent_assets_q:
        recent_assets.append({
            "id": a.id,
            "name": a.name,
            "type": a.asset_type,
            "algorithm": a.algorithm,
            "key_size": a.key_size,
            "safe": a.is_quantum_safe,
            "expiration_date": a.expiration_date.isoformat() if a.expiration_date else None,
            "domain": a.domain,
            "version": a.version
        })
        
    return {
        "projects_count": len(projects_list),
        "projects_list": projects_list,
        "assets": assets_count,
        "critical_findings": critical_findings,
        "quantum_exposure": quantum_exposure,
        "recent_assets": recent_assets
    }

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan_status(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    # Verify org access
    project = db.query(Project).filter(Project.id == scan.project_id).first()
    if project.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return scan
