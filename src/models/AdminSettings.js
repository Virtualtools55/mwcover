// models/AdminSettings.js
import mongoose from "mongoose";

const AdminSettingsSchema = new mongoose.Schema({
  allowedIp: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.models.AdminSettings || mongoose.model("AdminSettings", AdminSettingsSchema);