import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import OTP from "@/models/OTP";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();
    // Destructure pincode along with name, mobile, address
    const { email, otp, name, mobile, address, pincode } = await req.json();

    // 1. Verify OTP
    const storedOtpRecord = await OTP.findOne({ email, otp });
    if (!storedOtpRecord) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP." }, { status: 400 });
    }

    // Clear OTP after successful check
    await OTP.deleteOne({ _id: storedOtpRecord._id });

    // 2. Find or Create User
    let user = await User.findOne({ email });
    if (!user) {
      if (!name || !mobile || !address || !pincode) {
        return NextResponse.json({ success: false, error: "All profile details including pincode are required for registration." }, { status: 400 });
      }
      // Include pincode here
      user = await User.create({ name, email, mobile, address, pincode });
    }

    // 3. Create Session Token (30 Days)
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    const response = NextResponse.json({ success: true, user });

    // Set secure HttpOnly Cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ success: false, error: "Authentication failed." }, { status: 500 });
  }
}