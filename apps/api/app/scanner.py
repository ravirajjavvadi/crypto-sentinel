import subprocess
import json
import os
from .cert_parser import scan_directory_for_certs

SEMGREP_RULES_DIR = os.environ.get("SEMGREP_RULES_DIR", "/app/rules")

def run_semgrep(directory_path: str):
    """Runs semgrep against a directory using custom rules."""
    cmd = [
        "semgrep",
        "scan",
        "--config", SEMGREP_RULES_DIR,
        "--json",
        "--quiet",
        directory_path
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.stdout:
            data = json.loads(result.stdout)
            return parse_semgrep_results(data)
        return []
    except Exception as e:
        print(f"Semgrep execution failed: {e}")
        return []

def parse_semgrep_results(semgrep_data):
    """Parses Semgrep JSON output into Finding dicts."""
    findings = []
    
    for result in semgrep_data.get("results", []):
        metadata = result.get("extra", {}).get("metadata", {})
        findings.append({
            "rule_id": result.get("check_id"),
            "message": result.get("extra", {}).get("message", "No message"),
            "severity": "CRITICAL" if result.get("extra", {}).get("severity") == "ERROR" else "WARNING",
            "file_path": result.get("path"),
            "line_number": result.get("start", {}).get("line"),
            "algorithm": metadata.get("algorithm", "UNKNOWN"),
            "is_quantum_safe": metadata.get("quantum_safe", False)
        })
        
    return findings

def scan_project(directory_path: str):
    """Runs all scanning tools against the directory."""
    findings = run_semgrep(directory_path)
    assets = scan_directory_for_certs(directory_path)
    
    return {
        "findings": findings,
        "assets": assets
    }
