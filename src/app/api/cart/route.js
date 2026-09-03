// app/api/cart/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";

// Helper function to get userId from Cookie token
function getUserIdFromToken(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId || null;
  } catch (error) {
    return null;
  }
}

// GET: Fetch cart items strictly for the logged-in user
export async function GET(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please login first." }, { status: 401 });
    }

    await connectDB();
    const cartItems = await Cart.find({ userId });
    return NextResponse.json({ success: true, data: cartItems }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new cart entry only if the user is authenticated
export async function POST(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please login first." }, { status: 401 });
    }

    await connectDB();
    const { productId, title, price, imageUrl } = await request.json();

    // Create new item linked to the logged-in user's ID instead of "guest"
    const newItem = await Cart.create({
      userId,
      productId,
      title,
      price,
      imageUrl,
      quantity: 1,
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove specific item row ensuring it belongs to the logged-in user
export async function DELETE(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please login first." }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Delete item only if it matches the item ID and belongs to this user
    await Cart.findOneAndDelete({ _id: id, userId });
    
    return NextResponse.json({ success: true, message: "Item removed" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}