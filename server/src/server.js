import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import qrRoutes from "./routes/qr.js";
import locationRoutes from "./routes/locations.js";
import logRoutes from "./routes/logs.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/qr", qrRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/logs", logRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => console.log(`API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });