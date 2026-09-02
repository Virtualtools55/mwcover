// models/Cart.js
import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "guest" }, // Can be replaced with user session/ID later
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);