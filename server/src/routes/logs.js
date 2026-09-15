import { Router } from "express";
import LogEntry from "../models/LogEntry.js";
import Location from "../models/Location.js";
import { validateToken, todayKey } from "../utils/token.js";

const router = Router();

// POST /api/logs - submitted by the scan form for both sign-in and sign-out.
router.post("/", async (req, res) => {
  try {
    const { token, name, locationId, action } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Please enter a name." });
    }
    if (!locationId) {
      return res.status(400).json({ error: "Please choose a key." });
    }
    if (!["sign-in", "sign-out"].includes(action)) {
      return res.status(400).json({ error: "Please choose Sign In or Sign Out." });
    }

    const tokenResult = await validateToken(token);
    if (!tokenResult.valid) {
      return res.status(410).json({
        error:
          tokenResult.reason === "expired"
            ? "This QR code has expired. Please scan the one currently on display."
            : "This QR code is not recognized. Please scan the one currently on display.",
      });
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ error: "That key could not be found." });
    }

    const entry = await LogEntry.create({
      name: name.trim(),
      location: location._id,
      locationName: location.name,
      action,
      dateKey: todayKey(),
      timestamp: new Date(),
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: "Could not save the entry. Please try again." });
  }
});

// GET /api/logs?date=YYYY-MM-DD&locationId=... - for an admin review screen.
router.get("/", async (req, res) => {
  const { date, locationId } = req.query;
  const filter = {};
  if (date) filter.dateKey = date;
  if (locationId) filter.location = locationId;

  const entries = await LogEntry.find(filter).sort({ timestamp: -1 }).limit(500);
  res.json(entries);
});

export default router;
