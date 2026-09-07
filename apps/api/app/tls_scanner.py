import ssl
import socket
from datetime import datetime
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa

def scan_domain(domain: str, port: int = 443):
    """
    Connects to a live domain via TLS, fetches the certificate, and extracts details.
    """
    try:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE  # Fetch even if invalid for tracking purposes

        with socket.create_connection((domain, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                der_cert = ssock.getpeercert(binary_form=True)
                
        if not der_cert:
            return None

        cert = x509.load_der_x509_certificate(der_cert, default_backend())
        
        subject = cert.subject.rfc4514_string()
        public_key = cert.public_key()
        
        algorithm = "UNKNOWN"
        key_size = 0

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
            "is_quantum_safe": False,
            "expiration_date": cert.not_valid_after.isoformat() if hasattr(cert, 'not_valid_after') else None,
            "domain": domain,
            "version": None
        }

    except Exception as e:
        print(f"Failed to scan domain {domain}: {e}")
        return None
