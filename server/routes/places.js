import express from "express";
import { suggestPlaces } from "../services/placeValidation.js";

const router = express.Router();

function parseLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

router.get("/suggest", (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limit = parseLimit(req.query.limit);

  res.json({
    suggestions: suggestPlaces(query, { limit }),
  });
});

export default router;
