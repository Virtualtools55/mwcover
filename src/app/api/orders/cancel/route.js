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

// Helper function to extract userId from JWT cookie securely
function getUserIdFromToken(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId || decoded.id || decoded._id || null;
  } catch (error) {
    return null;
  }
}

export async function POST(req) {
  try {
    await connectDB();

    // 1. Authentication Check (Guest/Unauthorized cannot cancel)
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 }
      );
    }

    // 2. Fetch Order & Verify Ownership (Prevents IDOR Attack)
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or unauthorized access." },
        { status: 404 }
      );
    }

    // 3. Status Validation (Only Paid orders can be cancelled)
    if (order.status !== "Paid") {
      return NextResponse.json(
        { success: false, error: "Only paid active orders can be cancelled." },
        { status: 400 }
      );
    }

    // 4. Strict 30-Minute Cancellation Validation Rule
    const diffMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
    if (diffMinutes > 30) {
      return NextResponse.json(
        { success: false, error: "The 30-minute cancellation window has expired." },
        { status: 400 }
      );
    }

    // 5. Razorpay Automated Refund Request with Explicit Amount
    if (order.razorpayPaymentId) {
      await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(Number(order.amount) * 100), // Amount in paise
        speed: "normal",
        notes: { reason: "Customer requested cancellation within 30-min window" },
      });
    }

    // 6. Update Order Status in Database
    order.status = "Refund Initiated";
    order.cancelledAt = new Date();
    await order.save();

    return NextResponse.json({ 
      success: true, 
      message: "Order cancelled successfully. Refund has been initiated and will reflect in your account within 3-5 working days." 
    }, { status: 200 });

  } catch (err) {
    console.error("Secure order cancellation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error processing cancellation." },
      { status: 500 }
    );
  }
}