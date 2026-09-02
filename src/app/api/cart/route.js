
// app/api/cart/route.js (Updated API to create a new row on every add-to-cart click)
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";

// GET: Fetch all items in the cart collection
export async function GET(request) {
  try {
    await connectDB();
    const cartItems = await Cart.find({ userId: "guest" });
    return NextResponse.json({ success: true, data: cartItems }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Always create a new entry in the collection on every click
export async function POST(request) {
  try {
    await connectDB();
    const { productId, title, price, imageUrl } = await request.json();

    // Directly create a new document every time without checking for duplicates
    const newItem = await Cart.create({
      userId: "guest",
      productId,
      title,
      price,
      imageUrl,
      quantity: 1, // Quantity stays 1 per row
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove specific item row by its unique MongoDB _id
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await Cart.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Item removed" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

