// models/AdminStaff.js
import mongoose from "mongoose";

const AdminStaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, default: "" },
  role: { 
    type: String, 
    enum: ["admin", "delivery"], 
    required: true 
  },
  isVerified: { type: Boolean, default: false }, // Email verification status
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.AdminStaff || mongoose.model("AdminStaff", AdminStaffSchema);