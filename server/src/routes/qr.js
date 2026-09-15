import { Router } from "express";
import { getOrCreateTodayToken, validateToken } from "../utils/token.js";

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// GET /api/qr/today - the QR display screen polls this. Returns the URL to encode.
router.get("/today", async (req, res) => {
  try {
    const doc = await getOrCreateTodayToken();
    res.json({
      token: doc.token,
      dateKey: doc.dateKey,
      expiresAt: doc.expiresAt,
      scanUrl: `${FRONTEND_URL}/scan?token=${doc.token}`,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not generate today's QR code." });
  }
});

// GET /api/qr/validate/:token - the scan form calls this as soon as it loads.
router.get("/validate/:token", async (req, res) => {
  try {
    const result = await validateToken(req.params.token);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not validate the QR code." });
  }
});

export default router;
