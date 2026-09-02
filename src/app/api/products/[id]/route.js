// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // Apne database connection ka path check kar lein
import Product from "@/models/Product"; // Apna Product model check kar lein

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (err) {
    console.error("Error fetching single product:", err);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}