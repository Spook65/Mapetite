// Centralized environment handling for the backend.
// Exists to validate and document runtime configuration for different deploy targets.
// Does NOT read from .env directly; dotenv wiring stays in index.js or the process manager.
import logger from "./logger.js";

const NODE_ENV = process.env.NODE_ENV || "development";
const STORAGE_MODES = new Set(["memory", "database"]);

const raw = {
  nodeEnv: NODE_ENV,
  storageMode: process.env.MAPETITE_STORAGE_MODE || "memory",
  host: process.env.HOST || "127.0.0.1",
  port: process.env.PORT || "5001",
  corsOrigin: process.env.CORS_ORIGIN || "",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 300),
  searchRateLimitMax: Number(process.env.SEARCH_RATE_LIMIT_MAX || 60),
  databaseUrl: process.env.DATABASE_URL,
  geoapifyApiKey:
    process.env.GEOAPIFY_API_KEY || "",
  // Support both historical MONGO_URI and newer MONGODB_URI names.
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || "",
};

const validate = () => {
  if (!STORAGE_MODES.has(raw.storageMode)) {
    throw new Error(
      `MAPETITE_STORAGE_MODE must be one of: ${Array.from(STORAGE_MODES).join(", ")}`,
    );
  }

  if (raw.storageMode === "database" && !raw.databaseUrl) {
    throw new Error("DATABASE_URL is required when MAPETITE_STORAGE_MODE=database");
  }

  if (raw.storageMode === "memory") {
    logger.warn(
      "MAPETITE_STORAGE_MODE=memory is demo-only; runtime state resets on restart.",
      { nodeEnv: raw.nodeEnv },
    );
  }

  if (raw.storageMode === "database" && !raw.mongoUri) {
    logger.warn("Mongo URI not configured; cache features will be disabled.", {
      nodeEnv: raw.nodeEnv,
    });
  }

  if (!raw.geoapifyApiKey) {
    logger.warn("Geoapify API key not configured; search will fall back to OSM.", {
      nodeEnv: raw.nodeEnv,
    });
  }
};

validate();

export const env = raw;

export default env;
