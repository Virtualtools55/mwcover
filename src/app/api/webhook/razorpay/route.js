// app/api/webhook/razorpay/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Order from "@/models/order";

export async function POST(req) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing signature header" }, { status: 400 });
    }

    // WEBHOOK SIGNATURE VERIFICATION (Blocks fake third-party requests)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(bodyText)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);
    await connectDB();

    if (event.event === "refund.processed") {
      const refundEntity = event.payload.refund.entity;
      const orderId = refundEntity.notes?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        // Only update if currently in refund initiated state
        if (order && order.status === "Refund Initiated") {
          order.status = "Refunded";
          await order.save();
          console.log(`[WEBHOOK SUCCESS] Order ${orderId} marked as Refunded.`);
        }
      }
    }

    if (event.event === "refund.failed") {
      const refundEntity = event.payload.refund.entity;
      const orderId = refundEntity.notes?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { status: "Refund Failed" });
        console.log(`[WEBHOOK FAILED] Order ${orderId} refund failed.`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}