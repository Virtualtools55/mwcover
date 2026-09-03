import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: [
    {
      productId: { type: String, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      imageUrl: { type: String },
      quantity: { type: Number, default: 1 }
    },
  ],
  amount: { type: Number, required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  status: { type: String, default: "Paid" }, // Paid, Failed, Cancelled & Refunded, Delivered, Cancelled
  createdAt: { type: Date, default: Date.now },
 
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);