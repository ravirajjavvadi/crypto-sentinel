from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.session import engine
from .models.tenancy import Base
from .api import auth, organizations, teams, scans

# Create tables for MVP without alembic (we will add alembic later if needed)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CryptoSentinel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["organizations"])
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(scans.router, prefix="/api/scans", tags=["scans"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
