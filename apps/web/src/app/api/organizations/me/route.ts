import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ detail: "Unauthorized - Strict Isolation Enforced" }, { status: 401 });
  }

  const orgName = user.user_metadata?.organization_name || "Unknown Org";

  // Mock organization details securely scoped to user
  return NextResponse.json({
    id: user.id,
    name: orgName,
    industry: "Enterprise",
    size: "N/A",
    country: "Global",
    created_at: new Date().toISOString()
  });
}

