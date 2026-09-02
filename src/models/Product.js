import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a product title."],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price."],
    },
    imageUrl: {
      type: String,
      required: [true, "Please provide an image URL."],
    },
    imageFileId: {
      type: String, // Useful if you want to delete the image from ImageKit later
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);