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

// Secure helper function with async cookies handling
async function getAuthenticatedUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId || decoded.id || decoded._id || null;
  } catch (error) {
    console.error("JWT verification error during cancellation:", error);
    return null;
  }
}

export async function POST(req) {
  try {
    await connectDB();

    // 1. Secure Authentication Check
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to your account." },
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

    // 2. Strict IDOR Check: Match both orderId and userId in MongoDB query
    const order = await Order.findOne({ _id: orderId, userId: userId });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or unauthorized access attempt." },
        { status: 404 }
      );
    }

    // 3. Status Validation
    if (order.status !== "Paid") {
      return NextResponse.json(
        { success: false, error: "Only active paid orders can be cancelled." },
        { status: 400 }
      );
    }

    // 4. Strict 30-Minute Window Validation Rule
    const createdAtTime = new Date(order.createdAt).getTime();
    const currentTime = Date.now();
    const diffMinutes = (currentTime - createdAtTime) / (1000 * 60);

    if (diffMinutes > 30) {
      return NextResponse.json(
        { success: false, error: "The 30-minute cancellation window has expired." },
        { status: 400 }
      );
    }

    // 5. Razorpay Automated Refund Request
    if (order.razorpayPaymentId) {
      try {
        await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(Number(order.amount || 0) * 100), // Amount in paise
          speed: "normal",
          notes: { reason: "Customer requested cancellation within 30-min window" },
        });
      } catch (razorpayErr) {
        console.error("Razorpay Refund Gateway Error:", razorpayErr);
      }
    }

    // 6. Update Order Status
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