import mongoose from "mongoose";

// A "location" is one physical key (e.g. "Room 101", "Chemistry Lab", "Store Room").
// The QR code is shared across all locations - the person picks theirs on the form.
const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Location", locationSchema);
