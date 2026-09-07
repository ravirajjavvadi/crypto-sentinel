import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json({ detail: "Unauthorized - Strict Isolation Enforced" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const query = (projectId && projectId !== "ALL") ? `?project_id=${projectId}` : "";

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/api/scans/stats${query}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      cache: "no-store"
    });

    if (!res.ok) {
        throw new Error("Backend stats failed");
    }

    const stats = await res.json();
    return NextResponse.json(stats);
  } catch (e) {
    console.error(e);
    // Fallback if backend is down
    return NextResponse.json({
        projects_count: 0,
        projects_list: [],
        assets: 0,
        critical_findings: 0,
        quantum_exposure: 0,
        recent_assets: []
    });
  }
}
