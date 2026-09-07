from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.tenancy import ScanStatus

class ScanResponse(BaseModel):
    id: int
    project_id: int
    status: ScanStatus
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
