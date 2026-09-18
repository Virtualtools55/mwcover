import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product"; // Adjust path if your model file name differs

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Case-insensitive regex search matching model names or titles
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    }).lean();

    return NextResponse.json({ success: true, data: products });
  } catch (err) {
    console.error("[Search API Error]:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}