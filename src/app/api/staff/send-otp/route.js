import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db";
import AdminStaff from "@/models/AdminStaff";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, mobile, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "All required fields must be filled." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingStaff = await AdminStaff.findOne({ email: cleanEmail });
    if (existingStaff) {
      return NextResponse.json({ success: false, error: "Staff with this email already exists." }, { status: 400 });
    }

    // 6-digit OTP generate karein
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new AdminStaff({
      name: name.trim(),
      email: cleanEmail,
      mobile: mobile ? mobile.trim() : "",
      password: hashedPassword,
      role: role.toLowerCase().trim(),
      otp: otp,
      otpExpires: otpExpires,
      isVerified: false, // Pehle unverified rahega
    });

    await newStaff.save();

    // Nodemailer se email par OTP bhejein
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Caseo Team" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Welcome to Caseo - Verify Your Delivery Agent Account",
      html: `<h3>Account Verification</h3><p>Hello ${name}, your onboarding OTP is: <b>${otp}</b></p><p>Valid for 15 minutes.</p>`,
    });

    return NextResponse.json({
      success: true,
      message: "Staff account created. Verification OTP sent to their email.",
    }, { status: 201 });

  } catch (err) {
    console.error("Create staff error:", err);
    return NextResponse.json({ success: false, error: "Server error while creating staff." }, { status: 500 });
  }
}