
import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Order from "@/models/order";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      dbOrderId,
      products,
      amount,
      status,
    } = body;

    // Handle payment dismissal / failure case from frontend modal ondismiss
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

    // Handle verification after successful payment modal callback
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Missing payment verification parameters" }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      // Signature mismatch - update order to failed
      if (dbOrderId) {
        await Order.findByIdAndUpdate(dbOrderId, { status: "Failed" });
      }
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    // Update existing order or create new one if reference wasn't tracked
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

    // Fallback if order was never written to DB during creation stage
    if (!updatedOrder) {
      updatedOrder = await Order.create({
        userId: "guest_user",
        products: products || [],
        amount: Number(amount) || 0,
        razorpayOrderId,
        razorpayPaymentId,
        status: "Paid",
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

