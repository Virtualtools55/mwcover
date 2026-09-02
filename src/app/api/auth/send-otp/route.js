
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/db";
import OTP from "@/models/OTP";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    // 1. Strict @gmail.com validation check
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Only @gmail.com domain is permitted." }, { status: 400 });
    }

    // 2. Check if user already exists (to handle login vs signup UX flow)
    const existingUser = await User.findOne({ email });

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Overwrite OTP in DB (Updated option to remove Mongoose deprecation warning)
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, returnDocument: "after" }
    );

    // 4. Configure Nodemailer (Use your Gmail App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Cover Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    });

    return NextResponse.json({ 
      success: true, 
      isExistingUser: !!existingUser,
      message: "OTP sent successfully to your Gmail." 
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send OTP email. Check Gmail credentials." }, { status: 500 });
  }
}

