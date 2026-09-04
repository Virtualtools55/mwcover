// app/api/admin/get-ip/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AdminSettings from "@/models/AdminSettings";

export async function GET() {
  try {
    await connectDB();
    // डेटाबेस से पहली एंट्री उठाएं या डिफ़ॉल्ट आईपी सेट करें
    let setting = await AdminSettings.findOne();
    
    // अगर डेटाबेस खाली है, तो डिफ़ॉल्ट रूप से localhost या कोई सेफ आईपी भेज दें
    if (!setting) {
      return NextResponse.json({ success: true, allowedIp: "127.0.0.1" });
    }

    return NextResponse.json({ success: true, allowedIp: setting.allowedIp });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}