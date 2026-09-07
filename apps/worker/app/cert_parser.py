import os
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa

def parse_certificate(file_path: str):
    """Parses a PEM or DER certificate and extracts cryptographic details."""
    try:
        with open(file_path, "rb") as f:
            cert_data = f.read()
            
        try:
            cert = x509.load_pem_x509_certificate(cert_data, default_backend())
        except ValueError:
            cert = x509.load_der_x509_certificate(cert_data, default_backend())

        subject = cert.subject.rfc4514_string()
        public_key = cert.public_key()
        
        algorithm = "UNKNOWN"
        key_size = 0
        is_quantum_safe = False

        if isinstance(public_key, rsa.RSAPublicKey):
            algorithm = "RSA"
            key_size = public_key.key_size
        elif isinstance(public_key, ec.EllipticCurvePublicKey):
            algorithm = "ECDSA"
            key_size = public_key.key_size
        elif isinstance(public_key, dsa.DSAPublicKey):
            algorithm = "DSA"
            key_size = public_key.key_size
            
        return {
            "name": subject,
            "asset_type": "CERTIFICATE",
            "algorithm": algorithm,
            "key_size": key_size,
            "is_quantum_safe": is_quantum_safe # None of the classic ones are quantum safe
        }
    except Exception as e:
        print(f"Failed to parse certificate {file_path}: {e}")
        return None

def scan_directory_for_certs(directory_path: str):
    """Walks directory to find and parse certificates."""
    assets = []
    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.endswith(('.pem', '.crt', '.cer', '.der')):
                file_path = os.path.join(root, file)
                asset = parse_certificate(file_path)
                if asset:
                    asset["file_path"] = file_path
                    assets.append(asset)
    return assets
