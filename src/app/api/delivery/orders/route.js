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
    const orders = await Order.find({ status: "Paid" }).sort({ createdAt: -1 }).lean();

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
          console.log("[DEBUG GET] User lookup error for order:", order._id);
        }
      }
    }

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("[DEBUG GET Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { action, orderId, otp, newStatus } = body;

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    let customerEmail = order.email || order.shippingAddress?.email;
    let customerName = order.name || order.shippingAddress?.name;

    if (order.userId) {
      try {
        let userDoc = null;
        if (mongoose.Types.ObjectId.isValid(order.userId)) {
          userDoc = await User.findById(order.userId);
        } else {
          userDoc = await User.findOne({ _id: order.userId }) || await User.findOne({ email: order.email });
        }

        if (userDoc) {
          customerEmail = userDoc.email || customerEmail;
          customerName = userDoc.name || customerName;
        }
      } catch (e) {
        console.log("[DEBUG POST] User lookup failed.");
      }
    }

    if (!customerEmail || !customerEmail.includes("@")) {
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

      const actionTitle = newStatus === "Cancelled" ? "Order Cancellation" : "Order Delivery Confirmation";

      await transporter.sendMail({
        from: `"Caseo" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Verification Code for ${actionTitle} - Caseo`,
        html: `
          <div style="font-family: sans-serif; padding: 25px; background: #0b0b0b; color: #ffffff; border-radius: 16px; max-width: 450px; margin: auto;">
            <h2 style="color: #fbbf24; margin-bottom: 10px;">Caseo Secure Dispatch</h2>
            <p style="color: #cccccc; font-size: 14px;">Your delivery agent has requested confirmation for <strong>${actionTitle}</strong> of Order #${order._id.toString().toUpperCase()}.</p>
            <p style="color: #cccccc; font-size: 14px;">Please share this 6-digit verification OTP with the agent:</p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 36px; letter-spacing: 8px; color: #fbbf24; background: #1a1a1a; padding: 12px 24px; border-radius: 12px; font-weight: bold; display: inline-block;">${generatedOtp}</span>
            </div>
            <p style="font-size: 11px; color: #777777; text-align: center;">This code is valid for 10 minutes only. Do not share it with anyone else.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, message: "OTP sent successfully to " + customerEmail });
    }

    if (action === "verify-otp") {
      const otpRecord = await DeliveryOtp.findOne({ orderId });
      const currentOtp = otpRecord?.otp ? String(otpRecord.otp).trim() : "";
      const providedOtp = otp ? String(otp).trim() : "";
      
      if (!currentOtp || currentOtp !== providedOtp || Date.now() > otpRecord?.otpExpires || !newStatus) {
        return NextResponse.json({ success: false, error: "Invalid or expired OTP, or missing status." }, { status: 400 });
      }

      // STATE GUARD
      if (newStatus === "Cancelled") {
        if (["Refund Initiated", "Refunded", "Cancelled", "Refund Failed"].includes(order.status)) {
          return NextResponse.json({ success: false, error: `Order is already in '${order.status}' state.` }, { status: 400 });
        }

        try {
          const paymentId = order.razorpayPaymentId || order.paymentId;
          if (paymentId) {
            const refundAmount = Math.round(order.amount * 100);
            
            await razorpay.payments.refund(paymentId, {
              amount: refundAmount,
              speed: "optimum",
              notes: {
                reason: "Cancelled by delivery agent via secure OTP verification",
                orderId: order._id.toString(),
              },
            }, {
              headers: {
                "X-Idempotency-Key": `delivery_cancel_${order._id.toString()}`
              }
            });
          }
        } catch (razorpayErr) {
          console.error("[RAZORPAY REFUND ERROR]:", razorpayErr);
        }

        order.status = "Refund Initiated";
      } else {
        order.status = newStatus;
      }

      await order.save();
      await DeliveryOtp.deleteOne({ orderId });

      const successMessage = newStatus === "Cancelled"
        ? "Order cancelled. Refund initiated to original payment method."
        : "Order successfully marked as delivered!";

      return NextResponse.json({ success: true, message: successMessage, order });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Delivery Action Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}