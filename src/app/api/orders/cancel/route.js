import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import Order from "@/models/order";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await connectDB();
    const { orderId } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "Paid") {
      return NextResponse.json({ success: false, error: "Only paid active orders can be cancelled." }, { status: 400 });
    }

    // 30-minute validation rule
    const diffMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
    if (diffMinutes > 30) {
      return NextResponse.json({ success: false, error: "The 30-minute cancellation window has expired." }, { status: 400 });
    }

    // Razorpay Automated Normal Refund (3 working days processing standard)
    if (order.razorpayPaymentId) {
      await razorpay.payments.refund(order.razorpayPaymentId, { speed: "normal" });
    }

    order.status = "Refund Initiated";
    await order.save();

    return NextResponse.json({ 
      success: true, 
      message: "Order cancelled successfully. Refund has been initiated and will reflect in your account within 3-5 working days." 
    });
  } catch (err) {
    console.error("Cancellation error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}