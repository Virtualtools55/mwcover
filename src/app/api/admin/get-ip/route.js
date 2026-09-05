// app/api/admin/get-ip/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AdminSettings from "@/models/AdminSettings";

export async function GET() {
  try {
    await connectDB();
    const setting = await AdminSettings.findOne();
    
    // अगर डेटाबेस खाली है, तो कोई भी आईपी अलाउ न करें (खाली अरे भेजें)
    if (!setting || !setting.allowedIps || setting.allowedIps.length === 0) {
      return NextResponse.json({ success: true, allowedIps: [] });
    }

    return NextResponse.json({ success: true, allowedIps: setting.allowedIps });
  } catch (err) {
    // एरर आने पर भी खाली अरे भेजें ताकि बिना डेटाबेस एंट्री के कोई एक्सेस न पा सके
    return NextResponse.json({ success: true, allowedIps: [] });
  }
}