import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  return proxyToBackend(request, params.path);
}

export async function POST(request: Request, context: RouteContext) {
  const params = await context.params;
  return proxyToBackend(request, params.path);
}

export async function PATCH(request: Request, context: RouteContext) {
  const params = await context.params;
  return proxyToBackend(request, params.path);
}

async function proxyToBackend(request: Request, pathArray: string[]) {
  const supabase = await createClient();
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://crypto-sentinel-production-c1e6.up.railway.app";
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
