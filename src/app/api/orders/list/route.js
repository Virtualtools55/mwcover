import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Order from "@/models/order";

// Helper function to extract and verify userId securely from cookie
async function getUserIdFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId || decoded.id || decoded.email || decoded._id || null;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    await connectDB();

    // 1. Secure Authentication Check
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // 2. Fetch orders securely using lean() for optimized read performance
    const orders = await Order.find({ userId: userId.toString() })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (err) {
    console.error("Secure fetch orders error:", err);
    return NextResponse.json(
      { success: false, error: "Server error while fetching your orders." },
      { status: 500 }
    );
  }
}