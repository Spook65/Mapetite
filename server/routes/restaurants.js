import express from "express";
import {
  getRestaurantById,
  listKnownRestaurants,
  searchRestaurants,
  upsertRestaurantFromSnapshot,
} from "../services/restaurantCatalog.js";

const router = express.Router();

function parseNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseCategories(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      String(item)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
    );
  }

  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildSearchParams(req) {
  return {
    city: typeof req.query.city === "string" ? req.query.city : undefined,
    state: typeof req.query.state === "string" ? req.query.state : undefined,
    country: typeof req.query.country === "string" ? req.query.country : undefined,
    latitude: parseNumber(req.query.latitude),
    longitude: parseNumber(req.query.longitude),
    radiusMeters: parseNumber(req.query.radiusMeters),
    categories: parseCategories(req.query.categories),
  };
}

async function handleSearch(req, res) {
  const params = buildSearchParams(req);

  if (
    !params.city &&
    params.latitude === undefined &&
    params.longitude === undefined
  ) {
    return res.status(400).json({
      message: "Provide either a city or coordinates for restaurant search",
    });
  }

  try {
    const result = await searchRestaurants(params);
    res.json(result);
  } catch (error) {
    console.error("[restaurants] search failed", error);
    res.status(500).json({ message: "Unable to search restaurants" });
  }
}

router.get("/search", handleSearch);

router.get("/:restaurantId", async (req, res) => {
  try {
    const restaurant = await getRestaurantById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({ restaurant });
  } catch (error) {
    console.error("[restaurants] detail failed", error);
    res.status(500).json({ message: "Unable to load restaurant" });
  }
});

router.get("/", async (req, res) => {
  const hasSearchParams =
    req.query.city ||
    req.query.state ||
    req.query.country ||
    req.query.latitude ||
    req.query.longitude ||
    req.query.categories;

  if (hasSearchParams) {
    return handleSearch(req, res);
  }

  res.json({ restaurants: listKnownRestaurants() });
});

router.post("/", async (req, res) => {
  try {
    const restaurant = await upsertRestaurantFromSnapshot(req.body);
    res.status(201).json({ restaurant });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
