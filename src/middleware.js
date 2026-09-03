import { NextResponse } from "next/server";

export function middleware(request) {
  // आपकी API 'token' नाम से कुकी सेट कर रही है, इसलिए हम यहीं नाम चेक कर रहे हैं
  const token = request.cookies.get("token")?.value;

  const currentPath = request.nextUrl.pathname;

  // जिन पेजेस और एक्शन्स को सुरक्षित (Protected) करना है
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
  ],
};