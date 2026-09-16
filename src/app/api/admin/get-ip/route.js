// app/api/admin/get-ip/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AdminSettings from "@/models/AdminSettings";

export async function GET() {
  try {
    await connectDB();
    const setting = await AdminSettings.findOne();
    
    // अगर डेटाबेस खाली है, तो खाली अरे भेजें
    if (!setting || !setting.allowedIps || setting.allowedIps.length === 0) {
      return NextResponse.json({ success: true, allowedIps: [] });
    }

    return NextResponse.json({ success: true, allowedIps: setting.allowedIps });
  } catch (err) {
    console.error("[Get IP API Error]:", err);
    return NextResponse.json({ success: false, allowedIps: [], error: "Failed to fetch IPs" }, { status: 500 });
  }
}