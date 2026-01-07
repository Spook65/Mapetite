// Centralized environment handling for the backend.
// Exists to validate and document runtime configuration for different deploy targets.
// Does NOT read from .env directly; dotenv wiring stays in index.js or the process manager.
import logger from "./logger.js";

const NODE_ENV = process.env.NODE_ENV || "development";

const raw = {
  nodeEnv: NODE_ENV,
  port: process.env.PORT || "5000",
  databaseUrl: process.env.DATABASE_URL,
  // Support both historical MONGO_URI and newer MONGODB_URI names.
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || "",
};

const validate = () => {
  // In production we hard-require Postgres connectivity to be configured.
  if (raw.nodeEnv === "production" && !raw.databaseUrl) {
    throw new Error("DATABASE_URL is required in production");
  }

  if (!raw.databaseUrl) {
    logger.warn("DATABASE_URL missing; Prisma will fail if invoked.", {
      nodeEnv: raw.nodeEnv,
    });
  }

  if (!raw.mongoUri) {
    logger.warn("Mongo URI not configured; cache features will be disabled.", {
      nodeEnv: raw.nodeEnv,
    });
  }
};

validate();

export const env = raw;

export default env;



