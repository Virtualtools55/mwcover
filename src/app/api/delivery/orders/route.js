// app/api/delivery/orders/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/order";
import User from "@/models/User";
import DeliveryOtp from "@/models/DeliveryOtp";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function GET(req) {
  try {
    await connectDB();
    const orders = await Order.find({ status: { $in: ["Paid", "Cancelled", "Refunded", "Delivered"] } }).sort({ createdAt: -1 }).lean();

    for (let order of orders) {
      if (order.userId) {
        try {
          let userDoc = null;
          if (mongoose.Types.ObjectId.isValid(order.userId)) {
            userDoc = await User.findById(order.userId).lean();
          } else {
            userDoc = await User.findOne({ _id: order.userId }).lean() || await User.findOne({ email: order.email }).lean();
          }

          if (userDoc) {
            order.userId = {
              _id: userDoc._id,
              name: userDoc.name,
              email: userDoc.email,
              phone: userDoc.phone || order.phone,
              address: userDoc.address || order.address,
              pincode: userDoc.pincode || order.pincode,
            };
          }
        } catch (err) {
          console.log("[DEBUG GET] User lookup error:", err);
        }
      }
    }

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { action, orderId, otp, newStatus } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    let customerEmail = order.email || order.shippingAddress?.email;
    let customerName = order.name || order.shippingAddress?.name;

    if (!customerEmail) {
      return NextResponse.json({ success: false, error: "Customer email not found." }, { status: 400 });
    }

    if (action === "send-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = Date.now() + 10 * 60 * 1000;

      await DeliveryOtp.findOneAndUpdate(
        { orderId },
        { otp: generatedOtp, otpExpires: expiryTime },
        { upsert: true, new: true }
      );

      await transporter.sendMail({
        from: `"Caseo Team" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Verification Code for Order Cancellation - Caseo`,
        text: `Hello ${customerName || "Customer"}, your OTP to confirm order cancellation is: ${generatedOtp}. Valid for 10 minutes.`,
      });

      return NextResponse.json({ success: true, message: "OTP sent successfully to " + customerEmail });
    }

    if (action === "verify-otp") {
      const otpRecord = await DeliveryOtp.findOne({ orderId });
      const currentOtp = otpRecord?.otp ? String(otpRecord.otp).trim() : "";
      const providedOtp = otp ? String(otp).trim() : "";
      
      if (!currentOtp || currentOtp !== providedOtp || Date.now() > otpRecord?.otpExpires) {
        return NextResponse.json({ success: false, error: "Invalid or expired OTP." }, { status: 400 });
      }

      if (newStatus === "Cancelled") {
        try {
          const paymentId = order.razorpayPaymentId || order.paymentId;
          if (paymentId) {
            const refundAmount = Math.round(order.amount * 100);
            await razorpay.payments.refund(paymentId, {
              amount: refundAmount,
              speed: "optimum",
              notes: { reason: "Cancelled via delivery agent OTP", orderId: order._id.toString() },
            });
          }
        } catch (razorpayErr) {
          console.error("Razorpay refund error:", razorpayErr);
        }

        // UPDATE STATUS TO REFUNDED ONCE GATEWAY CALL COMPLETES
        order.status = "Refunded";
      } else {
        order.status = newStatus;
      }

      await order.save();
      await DeliveryOtp.deleteOne({ orderId });

      return NextResponse.json({ success: true, message: "Order cancelled and refund processed successfully!", order });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}