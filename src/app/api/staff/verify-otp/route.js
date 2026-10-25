import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AdminStaff from "@/models/AdminStaff";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const cleanEmail = email.trim().toLowerCase();
    const staff = await AdminStaff.findOne({ email: cleanEmail });

    if (!staff) {
      return NextResponse.json({ success: false, error: "Staff not found." }, { status: 400 });
    }

    if (!staff.otp || String(staff.otp).trim() !== String(otp).trim()) {
      return NextResponse.json({ success: false, error: "Invalid OTP." }, { status: 400 });
    }

    if (staff.otpExpires && new Date(staff.otpExpires) < new Date()) {
      return NextResponse.json({ success: false, error: "OTP expired." }, { status: 400 });
    }

    // Account verify kar dein aur OTP clear kar dein
    staff.isVerified = true;
    staff.otp = null;
    staff.otpExpires = null;
    await staff.save();

    return NextResponse.json({ success: true, message: "Account successfully verified! You can now login." });
  } catch (err) {
    console.error("Verify agent error:", err);
    return NextResponse.json({ success: false, error: "Verification failed." }, { status: 500 });
  }
}