import crypto from "crypto";
import DailyToken from "../models/DailyToken.js";

const LIFETIME_MS = (Number(process.env.QR_LIFETIME_HOURS) || 24) * 60 * 60 * 1000;

// "YYYY-MM-DD" in server local time - stable key for "today".
export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Returns today's active token, creating a fresh one the first time it's
// requested each day (or if the previous one has expired early for any reason).
export async function getOrCreateTodayToken() {
  const dateKey = todayKey();
  const now = new Date();

  let doc = await DailyToken.findOne({ dateKey });
  if (doc && doc.expiresAt > now) {
    return doc;
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(now.getTime() + LIFETIME_MS);

  // Upsert so two near-simultaneous requests at midnight don't create duplicates.
  doc = await DailyToken.findOneAndUpdate(
    { dateKey },
    { token, dateKey, expiresAt },
    { upsert: true, new: true }
  );

  return doc;
}

export async function validateToken(token) {
  if (!token) return { valid: false, reason: "missing" };

  const doc = await DailyToken.findOne({ token });
  if (!doc) return { valid: false, reason: "unknown" };
  if (doc.expiresAt <= new Date()) return { valid: false, reason: "expired" };

  return { valid: true, dateKey: doc.dateKey, expiresAt: doc.expiresAt };
}
