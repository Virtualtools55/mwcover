import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Order from "@/models/order";

export async function GET(request) {
  try {
    // 1. कुकी से JWT टोकन निकालें और वेरीफाई करें
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please login first." }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded.email;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token structure." }, { status: 401 });
    }

    await connectDB();

    // 2. Sirf userId ke basis par saare orders fetch karein (Status filter hata diya gaya hai)
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}