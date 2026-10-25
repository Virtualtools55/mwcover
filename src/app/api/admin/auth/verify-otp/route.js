// app/api/admin/auth/verify-otp/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import AdminStaff from "@/models/AdminStaff";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid request payload." }, { status: 400 });
    }

    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const staff = await AdminStaff.findOne({ email: cleanEmail });
    
    if (!staff) {
      // Security: Generic error message to prevent email enumeration
      return NextResponse.json({ success: false, error: "Invalid or expired OTP." }, { status: 400 });
    }

    // Check if account is locked due to multiple failed attempts
    if (staff.lockUntil && staff.lockUntil > new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: "Account temporarily locked due to multiple failed attempts. Try again later." 
      }, { status: 423 });
    }

    // Check if active OTP exists
    if (!staff.otp || !staff.otpExpires) {
      return NextResponse.json({ success: false, error: "No active OTP found. Please request a new one." }, { status: 400 });
    }

    // 1. Expiry Check (Secured)
    if (new Date(staff.otpExpires) < new Date()) {
      staff.otp = null;
      staff.otpExpires = null;
      await staff.save();
      return NextResponse.json({ success: false, error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // 2. Strict OTP Comparison
    const isOtpValid = String(staff.otp).trim() === cleanOtp;

    if (!isOtpValid) {
      // Increment failed attempts for security tracking
      staff.failedLoginAttempts = (staff.failedLoginAttempts || 0) + 1;
      
      // If failed attempts reach 5, lock account for 15 minutes
      if (staff.failedLoginAttempts >= 5) {
        staff.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await staff.save();

      return NextResponse.json({ success: false, error: "Invalid OTP code." }, { status: 400 });
    }

    // Reset failed login attempts on successful verification
    staff.failedLoginAttempts = 0;
    staff.lockUntil = null;
    staff.otp = null;
    staff.otpExpires = null;
    await staff.save();

    // Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL: JWT_SECRET is not defined in environment variables!");
      return NextResponse.json({ success: false, error: "Server authentication configuration error." }, { status: 500 });
    }

    // Generate Secure JWT Token
    const token = jwt.sign(
      { userId: staff._id.toString(), role: staff.role, email: staff.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      role: staff.role,
    });

    // Set HTTP-Only Secure Cookie
    response.cookies.set({
      name: "staff_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 Days
      path: "/",
    });

    return response;

  } catch (err) {
    console.error("Verify OTP secure error:", err);
    return NextResponse.json({ success: false, error: "Server error during verification." }, { status: 500 });
  }
}