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
    suggestions: suggestPlaces(query, {
      limit,
      country: typeof req.query.country === "string" ? req.query.country : "",
      region: typeof req.query.region === "string" ? req.query.region : "",
      recentCountry:
        typeof req.query.recentCountry === "string" ? req.query.recentCountry : "",
      recentRegion:
        typeof req.query.recentRegion === "string" ? req.query.recentRegion : "",
      localeCountry:
        typeof req.query.localeCountry === "string" ? req.query.localeCountry : "",
      timezoneCountry:
        typeof req.query.timezoneCountry === "string"
          ? req.query.timezoneCountry
          : "",
    }),
  });
});

export default router;
