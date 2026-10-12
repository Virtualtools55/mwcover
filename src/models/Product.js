// models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a product title."],
      trim: true,
    },
    originalPrice: {
      type: Number,
      required: [true, "Please provide an original MRP price."],
    },
    price: {
      type: Number,
      required: [true, "Please provide a selling price."],
    },
    imageUrl: {
      type: String,
      required: [true, "Please provide an image URL."],
    },
    imageFileId: {
      type: String, 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);