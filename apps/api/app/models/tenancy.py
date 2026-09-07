import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    industry = Column(String)
    size = Column(String)
    country = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    teams = relationship("Team", back_populates="organization", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")

class UserRole(str, enum.Enum):
    ORG_OWNER = "ORG_OWNER"
    SECURITY_ADMIN = "SECURITY_ADMIN"
    SECURITY_ANALYST = "SECURITY_ANALYST"
    DEVELOPER = "DEVELOPER"
    AUDITOR = "AUDITOR"
    VIEWER = "VIEWER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="users")

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="teams")
    projects = relationship("Project", back_populates="team")

class ProjectCriticality(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ProjectExposure(str, enum.Enum):
    INTERNAL = "INTERNAL"
    INTERNET_FACING = "INTERNET_FACING"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"))
    criticality = Column(Enum(ProjectCriticality), default=ProjectCriticality.MEDIUM)
    exposure = Column(Enum(ProjectExposure), default=ProjectExposure.INTERNAL)
    data_sensitivity = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="projects")
    team = relationship("Team", back_populates="projects")
    scans = relationship("Scan", back_populates="project")

class ScanStatus(str, enum.Enum):
    PENDING = "PENDING"
    EXTRACTING = "EXTRACTING"
    ANALYZING = "ANALYZING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    status = Column(Enum(ScanStatus), default=ScanStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="scans")
    findings = relationship("Finding", back_populates="scan")
    assets = relationship("Asset", back_populates="scan")

class FindingSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    rule_id = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(Enum(FindingSeverity), default=FindingSeverity.INFO)
    file_path = Column(String, nullable=False)
    line_number = Column(Integer)
    algorithm = Column(String)
    is_quantum_safe = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="findings")
    organization = relationship("Organization")

class AssetType(str, enum.Enum):
    LIBRARY = "LIBRARY"
    CERTIFICATE = "CERTIFICATE"
    KEY = "KEY"

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    asset_type = Column(Enum(AssetType), nullable=False)
    name = Column(String, nullable=False) # e.g. "cryptography v3.4" or "CN=example.com"
    algorithm = Column(String)
    key_size = Column(Integer)
    is_quantum_safe = Column(Boolean, default=False)
    expiration_date = Column(DateTime, nullable=True)
    domain = Column(String, nullable=True)
    version = Column(String, nullable=True)
    last_checked = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="assets")
    organization = relationship("Organization")
