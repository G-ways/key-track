import { Router } from "express";
import Location from "../models/Location.js";

const router = Router();

// GET /api/locations - populates the dropdown on the scan form.
router.get("/", async (req, res) => {
  const locations = await Location.find({ isActive: true }).sort("name");
  res.json(locations);
});

// POST /api/locations - simple admin endpoint to register a new key/location.
// NOTE: add authentication before exposing this publicly.
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "A location name is required." });
    }
    const location = await Location.create({ name: name.trim() });
    res.status(201).json(location);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "That location already exists." });
    }
    res.status(500).json({ error: "Could not create the location." });
  }
});

export default router;
