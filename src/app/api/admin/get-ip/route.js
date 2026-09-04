
// app/api/admin/get-ip/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AdminSettings from "@/models/AdminSettings";

export async function GET() {
  try {
    await connectDB();
    const setting = await AdminSettings.findOne();
    
    // अगर डेटाबेस खाली है, तो कम से कम लोकलहोस्ट आईपी अलाउ रखें ताकि आप पहली बार सेटअप कर सकें
    if (!setting || !setting.allowedIps || setting.allowedIps.length === 0) {
      return NextResponse.json({ success: true, allowedIps: ["127.0.0.1", "::1"] });
    }

    return NextResponse.json({ success: true, allowedIps: setting.allowedIps });
  } catch (err) {
    // एरर आने पर भी डिफ़ॉल्ट रिटर्न करें ताकि मिडलवेयर ब्लॉक न करे
    return NextResponse.json({ success: true, allowedIps: ["127.0.0.1", "::1"] });
  }
}



