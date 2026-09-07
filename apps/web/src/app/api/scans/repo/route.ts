import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Note: Project 1 is hardcoded for MVP
    const res = await fetch(`${backendUrl}/api/scans/project/1/scan/repo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ repo_url: url })
    });

    if (!res.ok) {
        throw new Error("Backend repo scan failed");
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Failed" }, { status: 500 });
  }
}