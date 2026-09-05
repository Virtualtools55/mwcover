import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/order";
import User from "@/models/User";
import DeliveryOtp from "@/models/DeliveryOtp";
import AllowedIP from "@/models/AllowedIp";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

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
  let clientIp = forwarded ? forwarded.split(",")[0].trim() : (realIp || "");
  
  if (clientIp.startsWith("::ffff:")) {
    clientIp = clientIp.replace("::ffff:", "");
  }

  try {
    const allowedDoc = await AllowedIP.findOne({ ip: clientIp });
    if (!allowedDoc) {
      return { isAllowed: false, clientIp };
    }
    return { isAllowed: true, clientIp };
  } catch (err) {
    console.error("[IP Verification Error]:", err);
    return { isAllowed: false, clientIp };
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { isAllowed, clientIp } = await verifyIP(req);

    if (!isAllowed) {
      return NextResponse.json({ success: false, error: `Access Denied: IP (${clientIp}) not authorized.` }, { status: 403 });
    }

    // केवल वही ऑर्डर्स फेच करें जिनका स्टेटस "Paid" है
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
            };
          }
        } catch (err) {
          console.log("[DEBUG GET] User lookup error for order:", order._id);
        }
      }
    }

    return NextResponse.json({ success: true, orders, clientIp });
  } catch (err) {
    console.error("[DEBUG GET Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { isAllowed, clientIp } = await verifyIP(req);
    if (!isAllowed) {
      return NextResponse.json({ success: false, error: `Access Denied: IP (${clientIp}) not authorized.` }, { status: 403 });
    }

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
      const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

      await DeliveryOtp.findOneAndUpdate(
        { orderId },
        { otp: generatedOtp, otpExpires: expiryTime },
        { upsert: true, new: true }
      );

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Verification Code for Order Status Update`,
        text: `Hello ${customerName || "Customer"}, your OTP to update your order status is: ${generatedOtp}. Valid for 10 minutes.`,
      });

      return NextResponse.json({ success: true, message: "OTP sent successfully to " + customerEmail });
    }

    if (action === "verify-otp") {
      const otpRecord = await DeliveryOtp.findOne({ orderId });
      
      const currentOtp = otpRecord?.otp ? String(otpRecord.otp).trim() : "";
      const providedOtp = otp ? String(otp).trim() : "";
      const now = Date.now();
      const expiryTime = otpRecord?.otpExpires || 0;
      const isExpired = now > expiryTime;

      console.log("[DEBUG POST] Verifying Delivery OTP - Stored:", currentOtp, "Provided:", providedOtp, "Expired:", isExpired);

      if (!currentOtp || currentOtp !== providedOtp || isExpired || !newStatus) {
        return NextResponse.json({ success: false, error: "Invalid or expired OTP, or missing status." }, { status: 400 });
      }

      order.status = newStatus;
      await order.save();

      await DeliveryOtp.deleteOne({ orderId });

      return NextResponse.json({ success: true, message: `Order successfully marked as ${newStatus}`, order });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Delivery Action Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}