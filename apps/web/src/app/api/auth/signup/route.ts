import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Mock user creation
    return NextResponse.json({
      id: 1,
      email: body.email,
      role: "ORG_OWNER",
      organization_id: 1
    });
  } catch (error) {
    return NextResponse.json({ detail: "Bad request" }, { status: 400 });
  }
}
