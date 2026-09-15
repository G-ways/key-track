import mongoose from "mongoose";

const logEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    locationName: { type: String, required: true }, // denormalized for easy display/reporting
    action: { type: String, enum: ["sign-in", "sign-out"], required: true },
    dateKey: { type: String, required: true }, // "YYYY-MM-DD", the day the QR code belonged to
    timestamp: { type: Date, default: Date.now }, // server-side time of the scan
  },
  { timestamps: true }
);

logEntrySchema.index({ dateKey: 1, location: 1 });

export default mongoose.model("LogEntry", logEntrySchema);
