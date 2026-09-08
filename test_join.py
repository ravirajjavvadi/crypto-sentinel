import sys
sys.path.append('apps/api')
from app.db.session import SessionLocal
from app.models.tenancy import Asset, Scan, Project
db = SessionLocal()
q = db.query(Asset).join(Scan).filter(Scan.project_id == 14)
print(q.all())
