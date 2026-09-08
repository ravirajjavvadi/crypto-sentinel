import sys
sys.path.append('apps/api')
from app.db.session import SessionLocal
from app.models.tenancy import Asset, Scan, Project
db = SessionLocal()
print('PROJECTS:', [(p.id, p.name) for p in db.query(Project).all()])
print('SCANS:', [(s.id, s.project_id) for s in db.query(Scan).all()])
print('ASSETS:', [(a.id, a.scan_id, a.name) for a in db.query(Asset).all()])
print('JOIN:', db.query(Asset).join(Scan).filter(Scan.project_id == 14).count())
