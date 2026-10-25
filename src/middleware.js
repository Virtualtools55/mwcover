// src/middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const currentPath = request.nextUrl.pathname;
  
  // Separate tokens for regular users and staff
  const userToken = request.cookies.get("token")?.value;
  const staffToken = request.cookies.get("staff_token")?.value; // <-- Staff token

  // ================= 1. USER AUTHENTICATION CHECK =================
  const protectedRoutes = ["/cart", "/orders", "/checkout", "/account"];
  const isProtected = protectedRoutes.some((route) => currentPath.startsWith(route));

  if (isProtected && !userToken) {
    const signinUrl = new URL("/auth/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", currentPath);
    return NextResponse.redirect(signinUrl);
  }

  // ================= 2. ADMIN & DELIVERY ROUTE PROTECTION =================
  const isAdminRoute = currentPath.startsWith("/admin");
  const isDeliveryRoute = currentPath.startsWith("/delivery");
  const isLoginPage = currentPath === "/admin/admin-login";

  if (isAdminRoute || isDeliveryRoute) {
    // If staff is already logged in and trying to access the login page
    if (isLoginPage && staffToken) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(staffToken, secret);
        if (payload.role === "delivery") {
          return NextResponse.redirect(new URL("/delivery", request.url));
        }
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } catch (err) {
        // Token invalid, allow login page
      }
    }

    // If accessing staff routes without staffToken -> Redirect to Home
    if (!isLoginPage && !staffToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Role-based authorization enforcement using staffToken
    if (!isLoginPage && staffToken) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(staffToken, secret);
        const userRole = payload.role;

        // Admin trying to access delivery routes
        if (isDeliveryRoute && userRole !== "delivery") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }

        // Delivery agent trying to access admin routes
        if (isAdminRoute && userRole !== "admin") {
          return NextResponse.redirect(new URL("/delivery", request.url));
        }
      } catch (err) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
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
    "/delivery/:path*",
    "/api/admin/:path*",
  ],
};