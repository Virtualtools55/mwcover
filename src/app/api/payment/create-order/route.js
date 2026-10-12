import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Order from "@/models/order"; // Casing matches Order.js model filename
import User from "@/models/User";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await connectDB();
    const { amount, products } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let userId = "guest_user";
    let userPhone = "N/A";
    let userAddress = "N/A";
    let userPincode = "N/A";

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userIdentifier = decoded.userId || decoded.id || decoded.email || decoded._id;

        if (userIdentifier) {
          let dbUser = null;

          // Safe MongoDB lookup without ObjectId Cast Error crash
          if (mongoose.Types.ObjectId.isValid(userIdentifier)) {
            dbUser = await User.findById(userIdentifier);
          }
          
          if (!dbUser) {
            dbUser = await User.findOne({ email: userIdentifier });
          }

          if (dbUser) {
            userId = dbUser._id.toString();
            userPhone = dbUser.mobile ? String(dbUser.mobile) : (dbUser.phone ? String(dbUser.phone) : "N/A");
            userAddress = dbUser.address || "N/A";
            userPincode = dbUser.pincode ? String(dbUser.pincode) : "N/A";
          }
        }
      } catch (err) {
        console.error("Token verification error during order creation:", err);
      }
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Initial status set to "Pending". Updated to "Paid" ONLY in verify API after HMAC signature check!
    const newOrder = await Order.create({
      userId,
      phone: userPhone,
      address: userAddress,
      pincode: userPincode,
      products,
      amount: Number(amount),
      razorpayOrderId: razorpayOrder.id,
      status: "Pending", // SECURE: Payment confirm hone ke baad Verification API ise "Paid" karegi
    });

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      dbOrderId: newOrder._id,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return NextResponse.json({ success: false, error: "Server error creating payment order" }, { status: 500 });
  }
}