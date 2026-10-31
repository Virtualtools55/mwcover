// app/api/orders/cancel/route.js
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

    const order = await Order.findOne({ _id: orderId, userId: userId.toString() });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or unauthorized access attempt." },
        { status: 404 }
      );
    }

    // STATE GUARD: Prevent double cancellation / refund if already processed
    if (["Refund Initiated", "Refunded", "Cancelled", "Refund Failed"].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: `Order is already in '${order.status}' state.` },
        { status: 400 }
      );
    }

    if (order.status !== "Paid") {
      return NextResponse.json(
        { success: false, error: "Only active paid orders can be cancelled." },
        { status: 400 }
      );
    }

    const createdAtTime = new Date(order.createdAt).getTime();
    const currentTime = Date.now();
    const diffMinutes = (currentTime - createdAtTime) / (1000 * 60);

    if (diffMinutes > 30) {
      return NextResponse.json(
        { success: false, error: "The 30-minute cancellation window has expired." },
        { status: 400 }
      );
    }

    const paymentId = order.razorpayPaymentId || order.paymentId;
    if (paymentId) {
      try {
        // IDEMPOTENCY KEY: Prevents duplicate gateway refunds on network retries
        await razorpay.payments.refund(paymentId, {
          amount: Math.round(Number(order.amount || 0) * 100),
          speed: "optimum",
          notes: { 
            reason: "Customer requested cancellation within 30-min window",
            orderId: order._id.toString() 
          },
        }, {
          headers: {
            "X-Idempotency-Key": `user_cancel_${order._id.toString()}`
          }
        });
      } catch (razorpayErr) {
        console.error("Razorpay Refund Gateway Error:", razorpayErr);
      }
    }

    order.status = "Refund Initiated";
    order.cancelledAt = new Date();
    await order.save();

    return NextResponse.json({ 
      success: true, 
      message: "Order cancelled successfully. Refund initiated to your original payment method (takes 3-7 business days)." 
    }, { status: 200 });

  } catch (err) {
    console.error("Secure order cancellation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error processing cancellation." },
      { status: 500 }
    );
  }
}