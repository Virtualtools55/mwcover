import { NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Order from "@/models/order"; // Ensure casing matches your actual filename (Order.js vs order.js)
import User from "@/models/User";

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
      if (dbOrderId) {
        await Order.findByIdAndUpdate(dbOrderId, { status: "Failed" });
      }
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    // Update existing order
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
      // Try to fetch logged-in user info for fallback
      let userPhone = "N/A";
      let userAddress = "N/A";
      let userPincode = "N/A";
      let userId = "guest_user";

      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userIdentifier = decoded.userId || decoded.id || decoded.email;
          const dbUser = await User.findOne({
            $or: [{ _id: userIdentifier }, { email: userIdentifier }],
          });
          if (dbUser) {
            userId = dbUser._id.toString();
            userPhone = dbUser.mobile ? String(dbUser.mobile) : "N/A";
            userAddress = dbUser.address || "N/A";
            userPincode = dbUser.pincode ? String(dbUser.pincode) : "N/A";
          }
        }
      } catch (e) {
        console.error("Fallback user token error:", e);
      }

      updatedOrder = await Order.create({
        userId,
        phone: userPhone,
        address: userAddress,
        pincode: userPincode,
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