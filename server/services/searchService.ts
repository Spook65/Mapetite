// Service boundary for search orchestration across cache, external APIs, and Postgres.
// Exists so routes remain thin and to centralize caching + normalization strategy.
// Does NOT expose raw DB clients; it delegates structured writes to restaurantService.
import mongoose from "../db/mongo.js";
import { upsertRestaurantFromSnapshot } from "./restaurantService.js";

const CachedSearch =
  mongoose.models.CachedSearch ||
  mongoose.model(
    "CachedSearch",
    new mongoose.Schema(
      {
        query: { type: String, required: true },
        location: { type: String, required: true },
        rawResults: { type: mongoose.Schema.Types.Mixed, required: true },
        expiresAt: { type: Date, required: true, index: { expires: 0 } },
      },
      { timestamps: true }
    )
  );

export const getCachedSearch = async (query: string, location: string) => {
  if (mongoose.connection.readyState !== 1) return null;
  return CachedSearch.findOne({ query, location, expiresAt: { $gt: new Date() } });
};

export const saveSearchSnapshot = async (params: {
  query: string;
  location: string;
  rawResults: unknown;
  ttlSeconds: number;
}) => {
  if (mongoose.connection.readyState !== 1) return null;
  const expiresAt = new Date(Date.now() + params.ttlSeconds * 1000);
  return CachedSearch.findOneAndUpdate(
    { query: params.query, location: params.location },
    { rawResults: params.rawResults, expiresAt },
    { upsert: true, new: true }
  );
};

export const fetchExternalResults = async (query: string, location: string) => {
  // TODO: wire to real provider (e.g., Places API). Keep stub deterministic for now.
  return [
    {
      externalId: `stub-${query}-${location}`,
      name: `Sample ${query}`,
      cuisineName: "Sample Cuisine",
      latitude: 0,
      longitude: 0,
    },
  ];
};

export const searchAndNormalize = async (query: string, location: string) => {
  // 1) Cache first
  const cached = await getCachedSearch(query, location);
  if (cached) return cached.rawResults;

  // 2) External fetch (stubbed)
  const results = await fetchExternalResults(query, location);

  // 3) Persist snapshot for observability/caching
  await saveSearchSnapshot({
    query,
    location,
    rawResults: results,
    ttlSeconds: 60 * 5,
  });

  // 4) Normalize structured subset into Postgres
  await Promise.all(results.map((r) => upsertRestaurantFromSnapshot(r)));

  return results;
};

