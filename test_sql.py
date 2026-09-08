import sys
sys.path.append('apps/api')
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.tenancy import Asset, Scan
engine = create_engine('sqlite:///:memory:')
Session = sessionmaker(bind=engine)
db = Session()
print(db.query(Asset).join(Scan).filter(Scan.project_id == 14))
