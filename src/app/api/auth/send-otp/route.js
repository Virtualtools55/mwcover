// app/api/auth/send-otp/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/db";
import OTP from "@/models/OTP";
import User from "@/models/User";

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
    const { email, mode = "login" } = await req.json(); // mode: 'login' or 'signup'

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email address is required." }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail }).lean();

    // STRICT CHECK: Mode-based verification
    if (mode === "login" && !existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          isExistingUser: false,
          error: "No account found with this email address. Please sign up first." 
        },
        { status: 404 }
      );
    }

    if (mode === "signup" && existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          isExistingUser: true,
          error: "Account already exists with this email. Please log in." 
        },
        { status: 400 }
      );
    }

    // 6-digit OTP generation (Only reached if checks pass)
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

    // Upsert OTP record
    await OTP.findOneAndUpdate(
      { email: cleanEmail },
      { otp: generatedOtp, expiresAt },
      { upsert: true, new: true }
    );

    // Send Mail
    await transporter.sendMail({
      from: `"Caseo" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Your Caseo Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0b0b0b; color: #ffffff; border-radius: 12px;">
          <h2 style="color: #fbbf24;">Caseo Authentication</h2>
          <p>Your OTP for verification is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #fbbf24; background: #121212; padding: 10px; display: inline-block; border-radius: 8px;">${generatedOtp}</h1>
          <p style="font-size: 12px; color: #888888;">Valid for 10 minutes only.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
      isExistingUser: !!existingUser,
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    return NextResponse.json({ success: false, error: "Failed to send OTP." }, { status: 500 });
  }
}