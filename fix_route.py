import os

path = r"apps\web\src\app\api\organizations\[...path]\route.ts"
os.makedirs(os.path.dirname(path), exist_ok=True)

content = """import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  return proxyToBackend(request, params.path);
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  return proxyToBackend(request, params.path);
}

export async function PATCH(request: Request, { params }: { params: { path: string[] } }) {
  return proxyToBackend(request, params.path);
}

async function proxyToBackend(request: Request, pathArray: string[]) {
  const supabase = await createClient();
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const pathStr = pathArray ? pathArray.join("/") : "";
    
    // Copy the request body if it exists
    let body = undefined;
    if (["POST", "PATCH", "PUT"].includes(request.method)) {
      body = await request.text();
    }

    const res = await fetch(`${backendUrl}/api/organizations/${pathStr}`, {
      method: request.method,
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": request.headers.get("Content-Type") || "application/json"
      },
      body,
      cache: "no-store"
    });

    const data = await res.json();
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Backend Proxy Error" }, { status: 500 });
  }
}
"""

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully wrote route.ts")
