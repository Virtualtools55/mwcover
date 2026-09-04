// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const currentPath = request.nextUrl.pathname;

  // ================= 1. ADMIN IP RESTRICTION CHECK =================
  if (currentPath.startsWith("/admin") || currentPath.startsWith("/api/admin")) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : request.ip;

    const isLocalhost = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost";

    if (!isLocalhost) {
      try {
        const baseUrl = request.nextUrl.origin;
        const res = await fetch(`${baseUrl}/api/admin/get-ip`);
        const data = await res.json();
        const allowedIpFromDB = data.allowedIp;

        if (clientIp !== allowedIpFromDB) {
          // अगर कोई API पर गलत IP से हिट करे तो JSON एरर दें
          if (currentPath.startsWith("/api/")) {
            return NextResponse.json(
              { success: false, error: "Access Denied: Unauthorized IP address." },
              { status: 403 }
            );
          }
          // अगर कोई ब्राउज़र में पेज खोले तो होमपेज पर रीडायरेक्ट करें
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch (err) {
        if (currentPath.startsWith("/api/")) {
          return NextResponse.json({ success: false, error: "Server IP verification failed." }, { status: 500 });
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  // ================= 2. USER AUTHENTICATION CHECK =================
  const token = request.cookies.get("token")?.value;
  const protectedRoutes = ["/cart", "/orders", "/checkout", "/account"];
  const isProtected = protectedRoutes.some((route) => currentPath.startsWith(route));

  // अगर यूजर बिना लॉगिन किए प्रोटेक्टेड पेज पर जाता है, तो उसे साइन-इन पेज पर भेजें
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