import os
import json
import re

KNOWN_CRYPTO_LIBRARIES = {
    "python": ["cryptography", "pycryptodome", "pycrypto", "PyNaCl", "ecdsa", "rsa", "hashlib", "passlib", "bcrypt", "jwt", "python-jose", "jwcrypto"],
    "javascript": ["crypto", "crypto-js", "bcrypt", "jsonwebtoken", "node-forge", "tweetnacl", "jose", "jws"],
    "java": ["bouncycastle", "org.bouncycastle", "javax.crypto", "commons-crypto", "jjwt"]
}

def parse_requirements_txt(file_path: str):
    assets = []
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            # Simple regex for package==version
            match = re.match(r'^([a-zA-Z0-9_\-]+)(?:.*==(.*))?', line)
            if match:
                pkg_name = match.group(1)
                version = match.group(2) if match.group(2) else "unknown"
                
                if any(known.lower() in pkg_name.lower() for known in KNOWN_CRYPTO_LIBRARIES["python"]):
                    assets.append({
                        "name": pkg_name,
                        "asset_type": "LIBRARY",
                        "algorithm": "VARIOUS",
                        "key_size": None,
                        "is_quantum_safe": False,
                        "version": version
                    })
    return assets

def parse_package_json(file_path: str):
    assets = []
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            deps = {**data.get('dependencies', {}), **data.get('devDependencies', {})}
            
            # Check if the package itself is a crypto library
            pkg_name_self = data.get('name', '')
            if pkg_name_self and any(known.lower() in pkg_name_self.lower() for known in KNOWN_CRYPTO_LIBRARIES["javascript"]):
                assets.append({
                    "name": pkg_name_self,
                    "asset_type": "LIBRARY",
                    "algorithm": "VARIOUS",
                    "key_size": None,
                    "is_quantum_safe": False,
                    "version": data.get('version', 'unknown')
                })

            for pkg_name, version in deps.items():
                if any(known.lower() in pkg_name.lower() for known in KNOWN_CRYPTO_LIBRARIES["javascript"]):
                    assets.append({
                        "name": pkg_name,
                        "asset_type": "LIBRARY",
                        "algorithm": "VARIOUS",
                        "key_size": None,
                        "is_quantum_safe": False,
                        "version": version
                    })
    except Exception as e:
        print(f"Error parsing package.json: {e}")
    return assets

def scan_directory_for_dependencies(directory_path: str, repo_url: str = ""):
    assets = []
    
    # Try to detect if the repository itself is a known crypto repo based on the root folder name or url
    repo_name = ""
    if repo_url:
        repo_name = repo_url.rstrip('/').split('/')[-1]
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]
    else:
        repo_name = os.path.basename(directory_path.rstrip('/\\'))
        
    if repo_name and any(known.lower() in repo_name.lower() for known in KNOWN_CRYPTO_LIBRARIES["python"] + KNOWN_CRYPTO_LIBRARIES["javascript"] + KNOWN_CRYPTO_LIBRARIES["java"]):
        assets.append({
            "name": repo_name,
            "asset_type": "LIBRARY",
            "algorithm": "VARIOUS",
            "key_size": None,
            "is_quantum_safe": False,
            "version": "source"
        })

    for root, _, files in os.walk(directory_path):
        if 'requirements.txt' in files:
            assets.extend(parse_requirements_txt(os.path.join(root, 'requirements.txt')))
        if 'package.json' in files:
            assets.extend(parse_package_json(os.path.join(root, 'package.json')))
        
        # Super basic checks for python package names in setup.py or pyproject.toml
        if 'setup.py' in files or 'pyproject.toml' in files:
            try:
                content = ""
                if 'setup.py' in files:
                    with open(os.path.join(root, 'setup.py'), 'r', encoding='utf-8', errors='ignore') as f:
                        content += f.read()
                if 'pyproject.toml' in files:
                    with open(os.path.join(root, 'pyproject.toml'), 'r', encoding='utf-8', errors='ignore') as f:
                        content += f.read()
                        
                for known in KNOWN_CRYPTO_LIBRARIES["python"]:
                    if known in content:
                        # Avoid duplicates
                        if not any(a["name"] == known for a in assets):
                            assets.append({
                                "name": known,
                                "asset_type": "LIBRARY",
                                "algorithm": "VARIOUS",
                                "key_size": None,
                                "is_quantum_safe": False,
                                "version": "unknown"
                            })
            except:
                pass
            
    return assets
