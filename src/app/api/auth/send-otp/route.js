import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/db";
import OTP from "@/models/OTP";
import User from "@/models/User";

// Helper to sanitize text input
const sanitizeInput = (val) => {
  if (typeof val !== "string") return "";
  return val
    .replace(/<[^>]*>?/gm, "") // Strip HTML/script tags
    .replace(/javascript:/gi, "") // Remove javascript pseudo-protocols
    .trim();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req) {
  try {
    await dbConnect();

    // Safe JSON parsing guard
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { email, mode = "login" } = body;

    // Type checking guard to prevent object/NoSQL injection payloads
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid email address string is required." },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeInput(email).toLowerCase();

    // Strict regex validation for Gmail addresses
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      cleanEmail.length > 254 ||
      !cleanEmail.endsWith("@gmail.com")
    ) {
      return NextResponse.json(
        { success: false, error: "Only valid @gmail.com email addresses are permitted." },
        { status: 400 }
      );
    }

    // Check user existence in database
    const existingUser = await User.findOne({ email: cleanEmail }).lean();

    // Mode-based authorization enforcement
    if (mode === "login" && !existingUser) {
      return NextResponse.json(
        {
          success: false,
          isExistingUser: false,
          error: "No account found with this email address. Please sign up first.",
        },
        { status: 404 }
      );
    }

    if (mode === "signup" && existingUser) {
      return NextResponse.json(
        {
          success: false,
          isExistingUser: true,
          error: "Account already exists with this email. Please log in.",
        },
        { status: 400 }
      );
    }

    // Check if there is an active lockout on the email before sending a new code
    const existingOtpRecord = await OTP.findOne({ email: cleanEmail });
    const now = new Date();

    if (existingOtpRecord && existingOtpRecord.lockedUntil && existingOtpRecord.lockedUntil > now) {
      const remainingMinutes = Math.ceil((existingOtpRecord.lockedUntil - now) / (60 * 1000));
      return NextResponse.json(
        {
          success: false,
          error: `Too many recent attempts. Please wait ${remainingMinutes} minute(s) before requesting another otp.`,
        },
        { status: 429 }
      );
    }

    // Generate secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

    // Upsert OTP record while preserving failed attempt counters if they haven't been locked out
    await OTP.findOneAndUpdate(
      { email: cleanEmail },
      {
        otp: generatedOtp,
        expiresAt,
        // Reset or initialize security trackers on fresh OTP generation if not currently locked
        ...(existingOtpRecord?.lockedUntil && existingOtpRecord.lockedUntil > now
          ? {}
          : { failedAttempts: 0, lockedUntil: null }),
      },
      { upsert: true, new: true }
    );

    // Send email securely
    await transporter.sendMail({
      from: `"Caseo" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Your Caseo Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0b0b0b; color: #ffffff; border-radius: 12px;">
          <h2 style="color: #fbbf24;">Caseo Authentication</h2>
          <p>Your secure OTP for verification is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #fbbf24; background: #121212; padding: 10px; display: inline-block; border-radius: 8px;">${generatedOtp}</h1>
          <p style="font-size: 12px; color: #888888;">Valid for 10 minutes only. Do not share this code with anyone.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your Gmail.",
      isExistingUser: !!existingUser,
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP due to a server error." },
      { status: 500 }
    );
  }
}