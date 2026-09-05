// models/AdminSettings.js
import mongoose from "mongoose";

const AdminSettingsSchema = new mongoose.Schema({
  allowedIps: { type: [String], default: [] }, // यहाँ allowedIp की जगह allowedIps (Array) कर दिया है
}, { timestamps: true });

export default mongoose.models.AdminSettings || mongoose.model("AdminSettings", AdminSettingsSchema);