import mongoose from "mongoose";

// One document per calendar day. The token embedded in the QR code's URL
// is only accepted while now < expiresAt (created + QR_LIFETIME_HOURS).
const dailyTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    dateKey: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("DailyToken", dailyTokenSchema);
