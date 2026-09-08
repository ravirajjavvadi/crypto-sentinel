import zipfile
import tempfile
import os
import shutil
import subprocess
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .scanner import scan_project
from .dependency_parser import scan_directory_for_dependencies
from .tls_scanner import scan_domain

from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class ScanStatus(str, enum.Enum):
    PENDING = "PENDING"
    EXTRACTING = "EXTRACTING"
    ANALYZING = "ANALYZING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True)
    status = Column(Enum(ScanStatus))
    project_id = Column(Integer)

class FindingSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

class Finding(Base):
    __tablename__ = "findings"
    id = Column(Integer, primary_key=True)
    scan_id = Column(Integer, nullable=False)
    organization_id = Column(Integer, nullable=False)
    rule_id = Column(String)
    message = Column(String)
    severity = Column(Enum(FindingSeverity))
    file_path = Column(String)
    line_number = Column(Integer)
    algorithm = Column(String)
    is_quantum_safe = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)

class AssetType(str, enum.Enum):
    LIBRARY = "LIBRARY"
    CERTIFICATE = "CERTIFICATE"
    KEY = "KEY"

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True)
    scan_id = Column(Integer, nullable=False)
    organization_id = Column(Integer, nullable=False)
    asset_type = Column(Enum(AssetType))
    name = Column(String)
    algorithm = Column(String)
    key_size = Column(Integer)
    is_quantum_safe = Column(Boolean)
    expiration_date = Column(DateTime, nullable=True)
    domain = Column(String, nullable=True)
    version = Column(String, nullable=True)
    last_checked = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

from app.db.session import SessionLocal

def dummy_scan_task(scan_id: int, file_path: str, org_id: int = 1):
    """Fallback legacy task. Extracts ZIP, runs Semgrep and Cert parsing, saves to DB."""
    
    db = SessionLocal()
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    
    if not scan:
        db.close()
        return

    try:
        scan.status = ScanStatus.EXTRACTING
        db.commit()

        extract_dir = tempfile.mkdtemp()
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

        scan.status = ScanStatus.ANALYZING
        db.commit()
        
        results = scan_project(extract_dir)
        dependency_assets = scan_directory_for_dependencies(extract_dir)
        
        # Save Findings
        for finding_data in results["findings"]:
            finding = Finding(
                scan_id=scan.id,
                organization_id=org_id,
                rule_id=finding_data["rule_id"],
                message=finding_data["message"],
                severity=finding_data["severity"],
                file_path=finding_data["file_path"],
                line_number=finding_data["line_number"],
                algorithm=finding_data["algorithm"],
                is_quantum_safe=finding_data["is_quantum_safe"]
            )
            db.add(finding)
            
        # Save Assets (Certs & Deps)
        all_assets = results["assets"] + dependency_assets
        for asset_data in all_assets:
            asset = Asset(
                scan_id=scan.id,
                organization_id=org_id,
                asset_type=asset_data["asset_type"],
                name=asset_data["name"],
                algorithm=asset_data["algorithm"],
                key_size=asset_data["key_size"],
                is_quantum_safe=asset_data["is_quantum_safe"],
                expiration_date=asset_data.get("expiration_date"),
                domain=asset_data.get("domain"),
                version=asset_data.get("version")
            )
            db.add(asset)

        scan.status = ScanStatus.COMPLETED
        db.commit()

    except Exception as e:
        print(f"Scan failed: {e}")
        scan.status = ScanStatus.FAILED
        db.commit()
    finally:
        db.close()
        if 'extract_dir' in locals():
            shutil.rmtree(extract_dir, ignore_errors=True)
        if os.path.exists(file_path):
            os.remove(file_path)

def repo_scan_task(scan_id: int, repo_url: str, org_id: int):
    """Clones a repo, runs Semgrep and Dependency parsing."""
    db = SessionLocal()
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        db.close()
        return

    try:
        scan.status = ScanStatus.EXTRACTING
        db.commit()

        extract_dir = tempfile.mkdtemp()
        subprocess.run(["git", "clone", "--depth", "1", repo_url, extract_dir], check=True, capture_output=True)

        scan.status = ScanStatus.ANALYZING
        db.commit()

        results = scan_project(extract_dir)
        dependency_assets = scan_directory_for_dependencies(extract_dir, repo_url)

        for finding_data in results["findings"]:
            finding = Finding(
                scan_id=scan.id,
                organization_id=org_id,
                rule_id=finding_data["rule_id"],
                message=finding_data["message"],
                severity=finding_data["severity"],
                file_path=finding_data["file_path"],
                line_number=finding_data["line_number"],
                algorithm=finding_data["algorithm"],
                is_quantum_safe=finding_data["is_quantum_safe"]
            )
            db.add(finding)

        all_assets = results["assets"] + dependency_assets
        for asset_data in all_assets:
            asset = Asset(
                scan_id=scan.id,
                organization_id=org_id,
                asset_type=asset_data["asset_type"],
                name=asset_data["name"],
                algorithm=asset_data["algorithm"],
                key_size=asset_data["key_size"],
                is_quantum_safe=asset_data["is_quantum_safe"],
                expiration_date=asset_data.get("expiration_date"),
                domain=asset_data.get("domain"),
                version=asset_data.get("version")
            )
            db.add(asset)

        scan.status = ScanStatus.COMPLETED
        db.commit()

    except Exception as e:
        print(f"Repo Scan failed: {e}")
        scan.status = ScanStatus.FAILED
        db.commit()
    finally:
        db.close()
        if 'extract_dir' in locals():
            shutil.rmtree(extract_dir, ignore_errors=True)

def domain_scan_task(scan_id: int, domain_url: str, org_id: int):
    """Scans a live domain for TLS certificates."""
    db = SessionLocal()
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        db.close()
        return

    try:
        scan.status = ScanStatus.ANALYZING
        db.commit()

        # Clean domain URL (remove https://, trailing slashes, etc)
        clean_domain = domain_url.replace("https://", "").replace("http://", "").split("/")[0]

        asset_data = scan_domain(clean_domain)
        if asset_data:
            # Check if domain already exists, to just update it instead of duplicate
            existing = db.query(Asset).filter(Asset.domain == clean_domain, Asset.organization_id == org_id).first()
            
            if existing:
                existing.expiration_date = asset_data.get("expiration_date")
                existing.algorithm = asset_data.get("algorithm")
                existing.key_size = asset_data.get("key_size")
                existing.last_checked = datetime.utcnow()
                existing.name = asset_data.get("name")
            else:
                asset = Asset(
                    scan_id=scan.id,
                    organization_id=org_id,
                    asset_type=asset_data["asset_type"],
                    name=asset_data["name"],
                    algorithm=asset_data["algorithm"],
                    key_size=asset_data["key_size"],
                    is_quantum_safe=asset_data["is_quantum_safe"],
                    expiration_date=asset_data.get("expiration_date"),
                    domain=asset_data.get("domain"),
                    version=asset_data.get("version")
                )
                db.add(asset)

        scan.status = ScanStatus.COMPLETED
        db.commit()

    except Exception as e:
        print(f"Domain Scan failed: {e}")
        scan.status = ScanStatus.FAILED
        db.commit()
    finally:
        db.close()
