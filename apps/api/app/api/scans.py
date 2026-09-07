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
