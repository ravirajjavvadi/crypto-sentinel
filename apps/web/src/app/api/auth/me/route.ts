import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      cache: "no-store"
    });

    if (!res.ok) {
        throw new Error("Failed to fetch profile");
    }

    const profile = await res.json();
    return NextResponse.json(profile);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Backend error" }, { status: 500 });
  }
}
