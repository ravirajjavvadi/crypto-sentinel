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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://crypto-sentinel-production-c1e6.up.railway.app";
    const res = await fetch(`${backendUrl}/api/scans/scan/repo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ repo_url: url })
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error("Backend Error Text:", errText);
        return NextResponse.json({ detail: errText }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Failed" }, { status: 500 });
  }
}