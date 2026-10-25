import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import OTP from "@/models/OTP";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, otp, name, mobile, address, pincode } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and OTP code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // 1. Atomic Verification & Deletion (Prevents reuse & race-conditions)
    const storedOtpRecord = await OTP.findOneAndDelete({
      email: cleanEmail,
      otp: cleanOtp,
    }).lean();

    if (!storedOtpRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    // Explicit expiration validation guard
    if (storedOtpRecord.expiresAt && new Date(storedOtpRecord.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. User Existence Check & Provisioning
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Fast check for mandatory registration fields
      if (!name || !mobile || !address || !pincode) {
        return NextResponse.json(
          {
            success: false,
            error: "Registration incomplete: Name, Mobile, Address & Pincode are required.",
          },
          { status: 400 }
        );
      }

      // Fast Mongo creation with sanitized strings
      user = await User.create({
        name: String(name).trim(),
        email: cleanEmail,
        mobile: String(mobile).trim(),
        address: String(address).trim(),
        pincode: String(pincode).trim(),
      });
    }

    // 3. Generate 30-Day JWT Session
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable missing.");
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret,
      { expiresIn: "30d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        pincode: user.pincode,
      },
    });

    // 4. Secure HttpOnly Session Cookie Configuration
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Optimal mobile web browser session compatibility
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Internal Server Error." },
      { status: 500 }
    );
  }
}