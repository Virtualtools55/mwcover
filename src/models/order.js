import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  phone: { type: String, default: "N/A" },
  address: { type: String, default: "N/A" },
  pincode: { type: String, default: "N/A" },
  products: [
    {
      productId: { type: String, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      imageUrl: { type: String },
      quantity: { type: Number, default: 1 },
    },
  ],
  amount: { type: Number, required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  status: { type: String, default: "Paid" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);