// models/ContactSettings.js
import mongoose from "mongoose";

const ContactSettingsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  workingHours: { type: String, default: "Mon - Sat: 10 AM - 7 PM" },
  location: { type: String, default: "India" }
}, { timestamps: true });

export default mongoose.models.ContactSettings || mongoose.model("ContactSettings", ContactSettingsSchema);