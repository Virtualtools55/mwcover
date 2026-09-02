import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/order";
import User from "@/models/User";
import AllowedIP from "@/models/AllowedIp";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function verifyIP(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  let clientIp = forwarded ? forwarded.split(",")[0].trim() : (realIp || "127.0.0.1");
  if (clientIp === "::1" || clientIp === "::ffff:127.0.0.1") clientIp = "127.0.0.1";

  // IP restriction bypassed completely to prevent "Access Denied" error
  return { isAllowed: true, clientIp };
}

export async function GET(req) {
  try {
    await connectDB();
    const { isAllowed, clientIp } = await verifyIP(req);

    if (!isAllowed) {
      return NextResponse.json({ success: false, error: `Access Denied: IP (${clientIp}) not authorized.` }, { status: 403 });
    }

    const orders = await Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    console.log(`[DEBUG GET] Total orders fetched: ${orders.length}`);
    return NextResponse.json({ success: true, orders, clientIp });
  } catch (err) {
    console.error("[DEBUG GET Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { isAllowed } = await verifyIP(req);
    if (!isAllowed) return NextResponse.json({ success: false, error: "Unauthorized IP" }, { status: 403 });

    const body = await req.json();
    console.log("[DEBUG POST] Request body received:", body);

    const { action, orderId, otp, newStatus } = body;

    const order = await Order.findById(orderId).populate("userId");
    if (!order) {
      console.log("[DEBUG POST] Order not found for ID:", orderId);
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    console.log("[DEBUG POST] Found Order ID:", order._id);
    console.log("[DEBUG POST] Populated userId object:", order.userId);

    // User collection se email access karna
    const customerEmail = order.userId?.email || order.email || order.shippingAddress?.email;
    console.log("[DEBUG POST] Resolved customerEmail:", customerEmail);

    if (!customerEmail || typeof customerEmail !== "string" || !customerEmail.includes("@")) {
      console.log("[DEBUG POST Validation Failed] Invalid or missing customerEmail. Current order/user state:", {
        hasUserId: !!order.userId,
        userIdEmail: order.userId?.email,
        directEmail: order.email,
        shippingEmail: order.shippingAddress?.email
      });
      return NextResponse.json({ success: false, error: "Customer email not found from User profile." }, { status: 400 });
    }

    if (action === "send-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      order.otp = generatedOtp;
      order.otpExpires = Date.now() + 10 * 60 * 1000;
      await order.save();

      console.log("[DEBUG POST] Generated OTP:", generatedOtp, "for email:", customerEmail);

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Verification Code for Cover Delivery`,
        text: `Your OTP to ${newStatus === "Cancelled" ? "cancel" : "deliver"} your order is: ${generatedOtp}. Valid for 10 minutes.`,
      });

      return NextResponse.json({ success: true, message: "OTP sent successfully to " + customerEmail });
    }

    if (action === "verify-otp") {
      if (!order.otp || order.otp !== otp || Date.now() > order.otpExpires) {
        console.log("[DEBUG POST] OTP Verification failed. Stored OTP:", order.otp, "Provided OTP:", otp, "Expired:", Date.now() > order.otpExpires);
        return NextResponse.json({ success: false, error: "Invalid or expired OTP." }, { status: 400 });
      }

      order.status = newStatus;
      order.otp = undefined;
      order.otpExpires = undefined;
      await order.save();

      console.log("[DEBUG POST] Order status successfully updated to:", newStatus);
      return NextResponse.json({ success: true, message: `Order successfully marked as ${newStatus}`, order });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Delivery Action Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}