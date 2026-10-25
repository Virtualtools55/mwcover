// app/api/admin/auth/send-otp/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // <-- Import nodemailer
import connectDB from "@/lib/db";
import AdminStaff from "@/models/AdminStaff";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1. Check if email exists in database
    const staff = await AdminStaff.findOne({ email: email.trim().toLowerCase() });
    
    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your email or password." },
        { status: 401 }
      );
    }

    // 2. STRICT PASSWORD VALIDATION
    const isPasswordValid = await bcrypt.compare(password, staff.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your email or password." },
        { status: 401 }
      );
    }

    // 3. Generate 6-digit OTP & 10-min Expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    staff.otp = otp;
    staff.otpExpires = otpExpires;
    await staff.save();

    // 4. SEND EMAIL VIA NODEMAILER
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Caseo Team" <${process.env.EMAIL_USER}>`,
      to: staff.email,
      subject: "Your Admin Security OTP",
      text: `Your login OTP is: ${otp}. It is valid for 10 minutes.`,
      html: `<h3>Your Login OTP</h3><p>Your secure OTP is: <b>${otp}</b></p><p>Valid for 10 minutes only.</p>`,
    });

    return NextResponse.json({
      success: true,
      message: "Credentials verified successfully. OTP sent.",
      role: staff.role,
    }, { status: 200 });

  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error while sending email." },
      { status: 500 }
    );
  }
}