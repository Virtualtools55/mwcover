import mongoose from "mongoose";

const AllowedIPSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true },
    isAllowed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.AllowedIP || mongoose.model("AllowedIP", AllowedIPSchema);