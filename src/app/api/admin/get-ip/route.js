// app/api/admin/get-ip/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AdminSettings from "@/models/AdminSettings";

export async function GET(req) {
  try {
    await connectDB();
    const setting = await AdminSettings.findOne();
    
    // If no settings or allowed IPs are configured in MongoDB, block everything
    if (!setting || !setting.allowedIps || setting.allowedIps.length === 0) {
      return NextResponse.json({ success: false, error: "No allowed IPs configured." }, { status: 403 });
    }

    // Extract client IP without defaulting to localhost
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    let clientIp = forwarded ? forwarded.split(",")[0].trim() : (realIp || "");

    // Clean up IPv6 mapped IPv4 prefix if present
    if (clientIp.startsWith("::ffff:")) {
      clientIp = clientIp.replace("::ffff:", "");
    }

    // If no IP header is found, block access
    if (!clientIp) {
      return NextResponse.json({ success: false, error: "Access Denied: Unable to detect IP." }, { status: 403 });
    }

    // Check if the client's IP exists in the allowedIps array stored in MongoDB
    const isAllowed = setting.allowedIps.includes(clientIp);

    if (!isAllowed) {
      return NextResponse.json({ 
        success: false, 
        error: `Access Denied: Your IP (${clientIp}) is not authorized.` 
      }, { status: 403 });
    }

    return NextResponse.json({ success: true, allowedIps: setting.allowedIps });
  } catch (err) {
    console.error("[Get IP API Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to verify IP" }, { status: 500 });
  }
}