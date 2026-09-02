// app/api/auth/logout/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const response = NextResponse.json({ 
    success: true, 
    message: "Logged out successfully" 
  });

  // Forcefully overwrite and clear the cookie by setting maxAge to 0
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });

  return response;
}