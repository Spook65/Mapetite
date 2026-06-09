import "dotenv/config";
import express from "express";
import cors from "cors";

// Local config + infra
import env from "./config/env.js";
import logger from "./config/logger.js";
import { connectMongo } from "./db/mongo.js";

// Routes
import restaurantRoutes from "./routes/restaurants.js";
import mapRoutes from "./routes/maps.js";
import healthRoutes from "./routes/health.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

function createRateLimiter({ windowMs, maxRequests, keyPrefix = "global" }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 1000) {
      for (const [storedKey, storedHit] of hits) {
        if (storedHit.resetAt <= now) {
          hits.delete(storedKey);
        }
      }
    }

    const ip =
      req.ip ||
      req.socket.remoteAddress ||
      "unknown";
    const key = `${keyPrefix}:${ip}`;
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        message: "Too many requests. Please wait before trying again.",
      });
    }

    hits.set(key, current);
    return next();
  };
}

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (env.nodeEnv === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
});

const corsOptions = env.corsOrigin
  ? {
      origin: env.corsOrigin
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    }
  : undefined;

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

const apiRateLimiter = createRateLimiter({
  windowMs: env.rateLimitWindowMs,
  maxRequests: env.rateLimitMax,
  keyPrefix: "api",
});
const searchRateLimiter = createRateLimiter({
  windowMs: env.rateLimitWindowMs,
  maxRequests: env.searchRateLimitMax,
  keyPrefix: "search",
});

// Fire-and-forget optional Mongo connection for cache and document stores.
// All failures are logged as warnings and must not prevent the server from running.
void connectMongo(env.mongoUri);

app.use("/api", apiRateLimiter);
app.use("/api/restaurants/search", searchRateLimiter);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/maps", mapRoutes);
app.use("/health", healthRoutes);

const PORT = Number(env.port || 5001);
const HOST = env.host || "127.0.0.1";

app.listen(PORT, HOST, () => {
  logger.info("Server started", { host: HOST, port: PORT, nodeEnv: env.nodeEnv });
});
