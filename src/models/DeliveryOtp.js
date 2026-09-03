import mongoose from "mongoose";

const DeliveryOtpSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  otp: { type: String, required: true },
  otpExpires: { type: Number, required: true }, // Numeric timestamp for foolproof comparison
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.DeliveryOtp || mongoose.model("DeliveryOtp", DeliveryOtpSchema);