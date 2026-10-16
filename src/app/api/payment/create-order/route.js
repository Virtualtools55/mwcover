import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import Order from "@/models/order";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Product from "@/models/Product"; // <-- Database product prices verify karne ke liye

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await connectDB();

    // 1. Authentication Check (Guest checkout not allowed)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login to checkout." },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid session token." },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid user session." },
        { status: 401 }
      );
    }

    // 2. Fetch User Details for Shipping
    const dbUser = await User.findById(userId);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User not found in database." },
        { status: 404 }
      );
    }

    const userPhone = dbUser.mobile ? String(dbUser.mobile) : (dbUser.phone ? String(dbUser.phone) : "N/A");
    const userAddress = dbUser.address || "N/A";
    const userPincode = dbUser.pincode ? String(dbUser.pincode) : "N/A";

    // 3. Fetch Cart Items securely from Database (Ignore whatever frontend sends)
    const cartItems = await Cart.find({ userId });
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart collection is empty." },
        { status: 400 }
      );
    }

    // 4. Server-Side MOQ Validation (Strictly >= 3 items)
    const totalQuantity = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
    if (totalQuantity < 3) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Security Alert: Minimum order quantity of 3 items is required to process checkout." 
        }, 
        { status: 400 }
      );
    }

    // 5. Secure Price Verification & Subtotal Calculation via Database Products
    let verifiedProducts = [];
    let calculatedSubtotal = 0;

    for (const cartItem of cartItems) {
      const productDoc = await Product.findById(cartItem.productId);
      if (!productDoc) {
        return NextResponse.json(
          { success: false, error: `Product not found or removed: ${cartItem.title}` },
          { status: 400 }
        );
      }

      const verifiedPrice = Number(productDoc.price);
      if (isNaN(verifiedPrice) || verifiedPrice <= 0) {
        return NextResponse.json(
          { success: false, error: `Invalid pricing for product: ${productDoc.title}` },
          { status: 400 }
        );
      }

      const itemQty = Number(cartItem.quantity) || 1;
      calculatedSubtotal += verifiedPrice * itemQty;

      verifiedProducts.push({
        productId: productDoc._id,
        title: productDoc.title,
        price: verifiedPrice, // <-- Database verified price
        imageUrl: productDoc.imageUrl || productDoc.image || "",
        quantity: itemQty,
      });
    }

    const finalAmount = calculatedSubtotal; // Free shipping model

    // 6. Create Razorpay Order with Server-Calculated Amount
    const options = {
      amount: Math.round(finalAmount * 100), // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 7. Save Order to Database with Verified Data
    const newOrder = await Order.create({
      userId: dbUser._id.toString(),
      phone: userPhone,
      address: userAddress,
      pincode: userPincode,
      products: verifiedProducts, // Store server-verified products & prices
      amount: finalAmount,        // Store server-verified total amount
      razorpayOrderId: razorpayOrder.id,
      status: "Pending",
    });

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      dbOrderId: newOrder._id,
    });
  } catch (err) {
    console.error("Razorpay secure order creation error:", err);
    return NextResponse.json(
      { success: false, error: "Server error creating payment order." },
      { status: 500 }
    );
  }
}