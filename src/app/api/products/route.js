import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

// Initialize ImageKit with server-side private credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export async function POST(request) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const title = formData.get("title");
    const price = formData.get("price");
    const file = formData.get("image");

    if (!title || !price || !file) {
      return NextResponse.json(
        { success: false, error: "All fields (title, price, image) are required." },
        { status: 400 }
      );
    }

    // Convert file into a Buffer for ImageKit upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload image to ImageKit (you can specify a folder like "ecommerce-products")
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `${Date.now()}-${file.name}`,
      folder: "/ecommerce-products",
    });

    // Save product data along with ImageKit URL to MongoDB
    const newProduct = await Product.create({
      title,
      price: Number(price),
      imageUrl: uploadResponse.url,
      imageFileId: uploadResponse.fileId,
    });

    return NextResponse.json(
      { success: true, data: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}