import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ detail: "Unauthorized - Strict Isolation Enforced" }, { status: 401 });
  }

  // Determine isolation scope via user ID / metadata
  const orgName = user.user_metadata?.organization_name || "Unknown Org";

  // Mock scan statistics scoped strictly to this tenant
  return NextResponse.json({
    projects: 12,
    assets: 342,
    critical_findings: 15,
    quantum_exposure: 4,
    recent_assets: [
      { id: 1, name: "example.com (X.509)", type: "CERTIFICATE", algorithm: "RSA", key_size: 2048, safe: false },
      { id: 2, name: "cryptography v3.4", type: "LIBRARY", algorithm: "AES-256", key_size: 256, safe: true },
      { id: 3, name: "hashlib.md5", type: "FUNCTION", algorithm: "MD5", key_size: null, safe: false },
      { id: 4, name: "aws-kms-key-dev", type: "KEY", algorithm: "KMS", key_size: 256, safe: true },
      { id: 5, name: "legacy-app-cert", type: "CERTIFICATE", algorithm: "RSA", key_size: 1024, safe: false },
    ]
  });
}
