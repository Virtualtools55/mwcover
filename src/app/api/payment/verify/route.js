import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Order from "@/models/order";
import User from "@/models/User";
import Cart from "@/models/Cart"; // <-- Cart clear karne ke liye import

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      dbOrderId,
      status,
    } = body;

    // 1. Handle payment dismissal / failure case from frontend modal ondismiss
    if (status === "Failed") {
      if (dbOrderId) {
        await Order.findByIdAndUpdate(dbOrderId, { status: "Failed" });
      } else if (razorpayOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId },
          { status: "Failed" }
        );
      }
      return NextResponse.json({ success: true, message: "Order marked as failed" });
    }

    // 2. Validate essential Razorpay signature parameters
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Missing payment verification parameters" }, { status: 400 });
    }

    // 3. Cryptographic Signature Verification (HMAC SHA256)
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      if (dbOrderId) {
        await Order.findByIdAndUpdate(dbOrderId, { status: "Failed" });
      }
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    // 4. Update existing order to Paid status
    let updatedOrder;
    if (dbOrderId) {
      updatedOrder = await Order.findByIdAndUpdate(
        dbOrderId,
        {
          razorpayPaymentId,
          status: "Paid",
        },
        { new: true }
      );
    }

    if (!updatedOrder) {
      updatedOrder = await Order.findOneAndUpdate(
        { razorpayOrderId },
        {
          razorpayPaymentId,
          status: "Paid",
        },
        { new: true }
      );
    }

    // 5. Strict Fallback Guard (Never trust client-passed products/amount)
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order record not found for this payment session." },
        { status: 400 }
      );
    }

    // 6. Clear user cart upon successful payment verification
    if (updatedOrder.userId && updatedOrder.userId !== "guest_user") {
      await Cart.deleteMany({ userId: updatedOrder.userId });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Secure payment verification error:", err);
    return NextResponse.json({ success: false, error: "Internal server error during verification." }, { status: 500 });
  }
}