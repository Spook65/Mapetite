// Express route for search with cache-first, API-second behavior.
// Exists to demonstrate the hybrid flow without coupling to DB clients.
// Does NOT render frontend or assume Mongo availability—falls back to live fetch.
import express from "express";
import { searchAndNormalize } from "../services/searchService.js";
import { connectMongo } from "../db/mongo.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { q, location } = req.query as { q?: string; location?: string };
  if (!q || !location) {
    return res.status(400).json({ message: "Missing q or location" });
  }

  try {
    // Ensure cache connection is attempted but non-blocking.
    await connectMongo(process.env.MONGODB_URI);
    const results = await searchAndNormalize(q, location);
    res.json({ results });
  } catch (err) {
    console.error("[search] failed", err);
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;

