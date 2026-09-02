import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Order from "@/models/order";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await connectDB();
    const { amount, products } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }

    // Extract logged-in user ID from cookies via JWT
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let userId = "guest_user";
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId || decoded.id || decoded.email || "guest_user";
      } catch (err) {
        console.error("Token verification error during order creation:", err);
      }
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order immediately to database with proper userId mapping
    const newOrder = await Order.create({
      userId,
      products: products || [],
      amount,
      razorpayOrderId: order.id,
      status: "Pending",
    });

    return NextResponse.json({ 
      success: true, 
      order, 
      dbOrderId: newOrder._id 
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return NextResponse.json({ success: false, error: "Server error creating payment order" }, { status: 500 });
  }
}