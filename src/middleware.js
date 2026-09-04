// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const currentPath = request.nextUrl.pathname;

  // 1. अगर रिक्वेस्ट खुद get-ip API के लिए है, तो इसे बिना रोके सीधे जाने दें (लूप रोकने के लिए)
  if (currentPath === "/api/admin/get-ip") {
    return NextResponse.next();
  }

  // ================= 1. ADMIN IP RESTRICTION CHECK =================
  if (currentPath.startsWith("/admin") || currentPath.startsWith("/api/admin")) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    let clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : request.ip || "";

    // IPv4-mapped IPv6 एड्रेस को साफ करने के लिए (जैसे ::ffff:127.0.0.1 -> 127.0.0.1)
    if (clientIp.startsWith("::ffff:")) {
      clientIp = clientIp.replace("::ffff:", "");
    }

    try {
      const baseUrl = request.nextUrl.origin;
      const res = await fetch(`${baseUrl}/api/admin/get-ip`, {
        cache: "no-store",
      });
      const data = await res.json();
      const allowedIpsFromDB = data.allowedIps || [];

      // चेक करें कि क्लाइंट की IP डेटाबेस की लिस्ट में है या नहीं
      if (!allowedIpsFromDB.includes(clientIp)) {
        if (currentPath.startsWith("/api/")) {
          return NextResponse.json(
            { success: false, error: "Access Denied: Unauthorized IP address." },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (err) {
      if (currentPath.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Server IP verification failed." }, { status: 500 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ================= 2. USER AUTHENTICATION CHECK =================
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