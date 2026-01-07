// Express route for canonical restaurant reads.
// Exists to expose Postgres-backed data without touching caches or external APIs.
// Does NOT handle writes from users; normalization happens in services/searchService.
import express from "express";
import { listRestaurants } from "../services/restaurantService.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const restaurants = await listRestaurants();
    res.json({ restaurants });
  } catch (err) {
    console.error("[restaurants] list failed", err);
    res.status(500).json({ message: "Unable to load restaurants" });
  }
});

export default router;

