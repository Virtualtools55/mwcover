import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

// Helper function to extract userId from JWT cookie
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

// GET: Fetch cart items for the authenticated user
export async function GET(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    await connectDB();
    const cartItems = await Cart.find({ userId });
    return NextResponse.json({ success: true, data: cartItems }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add or update cart item securely using Database Price Verification
export async function POST(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    await connectDB();
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    // Fetch authentic product from database to prevent price tampering
    const productData = await Product.findById(productId);
    if (!productData) {
      return NextResponse.json(
        { success: false, error: "Product not found in database." },
        { status: 404 }
      );
    }

    // Strict Price Validation: Reject zero or invalid prices
    const authenticPrice = Number(productData.price);
    if (isNaN(authenticPrice) || authenticPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid product pricing configured in database." },
        { status: 400 }
      );
    }

    const authenticTitle = productData.title;
    const authenticImage = productData.imageUrl || productData.image;

    // Check if the product already exists in user's cart
    const existingItem = await Cart.findOne({ userId, productId });

    if (existingItem) {
      existingItem.quantity += Number(quantity) || 1;
      existingItem.price = authenticPrice; // Sync with latest authentic price
      await existingItem.save();
      return NextResponse.json({ success: true, data: existingItem }, { status: 200 });
    }

    // Create new cart entry with server-verified data
    const newItem = await Cart.create({
      userId,
      productId,
      title: authenticTitle,
      price: authenticPrice,
      imageUrl: authenticImage,
      quantity: Number(quantity) || 1,
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove specific cart item belonging to the user
export async function DELETE(request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID parameter is missing." },
        { status: 400 }
      );
    }

    await Cart.findOneAndDelete({ _id: id, userId });

    return NextResponse.json(
      { success: true, message: "Item removed successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}