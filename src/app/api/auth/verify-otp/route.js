import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import OTP from "@/models/OTP";
import User from "@/models/User";

// Helper to strip HTML tags and prevent Stored XSS & Injection
const sanitizeInput = (val) => {
  if (typeof val !== "string") return "";
  return val
    .replace(/<[^>]*>?/gm, "") // Strip any HTML/script tags
    .replace(/javascript:/gi, "") // Remove javascript: pseudo-protocols
    .trim();
};

export async function POST(req) {
  try {
    await dbConnect();
    
    // Parse JSON safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { email, otp, name, mobile, address, pincode } = body;

    // Type checking guard to prevent NoSQL injection via object payloads
    if (
      !email ||
      !otp ||
      typeof email !== "string" ||
      typeof otp !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Email and OTP code are required and must be strings." },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanOtp = sanitizeInput(otp);

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { success: false, error: "Invalid email address format." },
        { status: 400 }
      );
    }

    // Validate OTP format (Exactly 6 digits)
    if (!/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { success: false, error: "OTP must be a valid 6-digit number." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Fetch stored OTP record
    let otpRecord = await OTP.findOne({ email: cleanEmail });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP. Please request a new code." },
        { status: 400 }
      );
    }

    // 1. Check if the account is currently locked out due to failed attempts
    if (otpRecord.lockedUntil && otpRecord.lockedUntil > now) {
      const remainingMinutes = Math.ceil((otpRecord.lockedUntil - now) / (60 * 1000));
      return NextResponse.json(
        {
          success: false,
          error: `Too many incorrect attempts. Please try again after ${remainingMinutes} minute(s).`,
        },
        { status: 429 }
      );
    }

    // Explicit expiration validation guard
    if (otpRecord.expiresAt && new Date(otpRecord.expiresAt) < now) {
      return NextResponse.json(
        { success: false, error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. Validate OTP Match with Brute-Force Protection (Max 3 Tries)
    if (otpRecord.otp !== cleanOtp) {
      otpRecord.failedAttempts = (otpRecord.failedAttempts || 0) + 1;

      if (otpRecord.failedAttempts >= 3) {
        otpRecord.lockedUntil = new Date(now.getTime() + 30 * 60 * 1000); // Lock for 30 minutes
        await otpRecord.save();
        return NextResponse.json(
          {
            success: false,
            error: "You have entered an incorrect OTP 3 times. Your account is temporarily locked. Please try again after 30 minutes.",
          },
          { status: 429 }
        );
      }

      await otpRecord.save();
      const remainingAttempts = 3 - otpRecord.failedAttempts;
      return NextResponse.json(
        {
          success: false,
          error: `Invalid OTP. You have ${remainingAttempts} attempt(s) remaining before temporary lockout.`,
        },
        { status: 400 }
      );
    }

    // 3. OTP is correct! Clear the OTP record so it cannot be reused
    await OTP.deleteOne({ email: cleanEmail });

    // 4. User Existence Check & Provisioning
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Validate mandatory fields for registration
      if (!name || !mobile || !address || !pincode) {
        return NextResponse.json(
          {
            success: false,
            error: "Registration incomplete: Name, Mobile, Address & Pincode are required.",
          },
          { status: 400 }
        );
      }

      const cleanName = sanitizeInput(String(name));
      const cleanMobile = sanitizeInput(String(mobile));
      const cleanAddress = sanitizeInput(String(address));
      const cleanPincode = sanitizeInput(String(pincode));

      // Strict validation checks for registration details
      if (cleanName.length < 2 || cleanName.length > 60) {
        return NextResponse.json({ success: false, error: "Invalid name length." }, { status: 400 });
      }
      if (!/^\d{10}$/.test(cleanMobile)) {
        return NextResponse.json({ success: false, error: "Invalid 10-digit mobile number." }, { status: 400 });
      }
      if (cleanAddress.length === 0 || cleanAddress.length > 300) {
        return NextResponse.json({ success: false, error: "Invalid address." }, { status: 400 });
      }
      if (!/^\d{6}$/.test(cleanPincode)) {
        return NextResponse.json({ success: false, error: "Invalid 6-digit pincode." }, { status: 400 });
      }

      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        address: cleanAddress,
        pincode: cleanPincode,
      });
    }

    // 5. Generate Secure JWT Session
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

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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