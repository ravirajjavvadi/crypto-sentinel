import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from celery import Celery
from app.db.session import get_db
from app.models.tenancy import Project, Scan, User, UserRole, ScanStatus
from app.schemas.scan import ScanResponse
from app.api.deps import get_current_active_user

router = APIRouter()

# Setup celery client to point to worker
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("worker", broker=REDIS_URL)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

from pydantic import BaseModel

class RepoScanRequest(BaseModel):
    repo_url: str

class DomainScanRequest(BaseModel):
    domain_url: str

@router.post("/project/{project_id}/scan/repo", response_model=ScanResponse)
async def scan_repo(
    project_id: int,
    request: RepoScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    scan = Scan(project_id=project.id, status=ScanStatus.PENDING)
    db.add(scan)
    db.commit()
    db.refresh(scan)

    celery_app.send_task("app.tasks.repo_scan_task", args=[scan.id, request.repo_url, current_user.organization_id])
    return scan

@router.post("/project/{project_id}/scan/domain", response_model=ScanResponse)
async def scan_domain(
    project_id: int,
    request: DomainScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    scan = Scan(project_id=project.id, status=ScanStatus.PENDING)
    db.add(scan)
    db.commit()
    db.refresh(scan)

    celery_app.send_task("app.tasks.domain_scan_task", args=[scan.id, request.domain_url, current_user.organization_id])
    return scan

@router.post("/project/{project_id}/scan", response_model=ScanResponse)
async def upload_and_scan(
    project_id: int,
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

    # Trigger celery task (from apps/worker/app/tasks.py)
    # The absolute file path needs to be accessible by the worker container.
    # In docker-compose, we would share a volume for /uploads
    celery_app.send_task("app.tasks.dummy_scan_task", args=[scan.id, file_path])

    return scan

@router.get("/stats", response_model=dict)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    org_id = current_user.organization_id
    
    projects_count = db.query(Project).filter(Project.organization_id == org_id).count()
    from app.models.tenancy import Asset, Finding
    
    assets_count = db.query(Asset).filter(Asset.organization_id == org_id).count()
    critical_findings = db.query(Finding).filter(
        Finding.organization_id == org_id,
        Finding.severity == "CRITICAL"
    ).count()
    quantum_exposure = db.query(Asset).filter(
        Asset.organization_id == org_id,
        Asset.is_quantum_safe == False
    ).count()
    
    recent_assets_q = db.query(Asset).filter(Asset.organization_id == org_id).order_by(Asset.created_at.desc()).limit(10).all()
    
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
        "projects": projects_count,
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
