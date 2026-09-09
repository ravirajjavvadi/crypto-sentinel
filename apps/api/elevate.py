from app.db.session import SessionLocal
from app.models.tenancy import User, Organization, UserRole
from app.core.security import get_password_hash

db = SessionLocal()

# Check if org exists
org = db.query(Organization).first()
if not org:
    org = Organization(name="CryptoSentinel Corp")
    db.add(org)
    db.commit()
    db.refresh(org)

email = "ravirajjavvadhi@gmail.com"
user = db.query(User).filter(User.email == email).first()

if not user:
    # Auto register
    user = User(
        email=email,
        hashed_password=get_password_hash("raviraj"),
        role=UserRole.ORG_OWNER,
        organization_id=org.id
    )
    db.add(user)
    db.commit()
    print(f"Created user {email} as ORG_OWNER")
else:
    user.role = UserRole.ORG_OWNER
    db.commit()
    print(f"Elevated user {email} to ORG_OWNER")
