// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const currentPath = request.nextUrl.pathname;

  // ================= USER AUTHENTICATION CHECK =================
  const token = request.cookies.get("token")?.value;
  const protectedRoutes = ["/cart", "/orders", "/checkout", "/account"];
  const isProtected = protectedRoutes.some((route) => currentPath.startsWith(route));

  if (isProtected && !token) {
    const signinUrl = new URL("/auth/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", currentPath);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/account/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};