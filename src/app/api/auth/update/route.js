// app/api/auth/update/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User"; // Adjust to match your user model path if needed
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function PUT(req) {
  try {
    await connectDB();

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value; // Change "token" if your cookie name is different

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Verify token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id; // Adjust based on your JWT payload structure

    const { name, mobile, pincode, address } = await req.json();

    // Find and update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, mobile, pincode, address },
      { returnDocument: "after", runValidators: true }, // 👈 Changed from 'new: true' to 'returnDocument: 'after''
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("[Profile Update Error]:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
