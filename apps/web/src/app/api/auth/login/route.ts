import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

    // In a real app, validate against the DB. Here we just mock success.
    if (username && password) {
      return NextResponse.json({
        access_token: "mock-jwt-token-for-testing",
        token_type: "bearer"
      });
    }
    
    return NextResponse.json(
      { detail: "Incorrect email or password" }, 
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ detail: "Bad request" }, { status: 400 });
  }
}
