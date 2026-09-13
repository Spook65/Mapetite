import "dotenv/config";
import express from "express";
import cors from "cors";

// Local config + infra
import env from "./config/env.js";
import logger from "./config/logger.js";
import { connectMongo } from "./db/mongo.js";

// Routes
import restaurantRoutes from "./routes/restaurants.js";
import placeRoutes from "./routes/places.js";
import mapRoutes from "./routes/maps.js";
import healthRoutes from "./routes/health.js";
import { createDemoAuthRouter } from "./routes/demoAuth.js";
import { createRateLimiter } from "./middleware/rateLimiter.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

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
  skip: (req) => req.path === "/places/suggest",
});
const searchRateLimiter = createRateLimiter({
  windowMs: env.rateLimitWindowMs,
  maxRequests: env.searchRateLimitMax,
  keyPrefix: "search",
});
const placeSuggestRateLimiter = createRateLimiter({
  windowMs: env.placeSuggestRateLimitWindowMs,
  maxRequests: env.placeSuggestRateLimitMax,
  keyPrefix: "place-suggest",
  errorCode: "PLACE_SUGGEST_RATE_LIMITED",
  message: "Suggestions paused. You can still search.",
});

// Fire-and-forget optional Mongo connection for cache and document stores.
// Demo memory deployments intentionally run without Mongo.
if (env.mongoUri) {
  void connectMongo(env.mongoUri);
}

app.use("/api/places/suggest", placeSuggestRateLimiter);
app.use("/api", apiRateLimiter);
app.use("/api/restaurants/search", searchRateLimiter);
if (env.storageMode === "memory") {
  app.use("/api", createDemoAuthRouter());
}
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/maps", mapRoutes);
app.use("/health", healthRoutes);

const PORT = Number(env.port || 5001);
const HOST = env.host || "127.0.0.1";

app.listen(PORT, HOST, () => {
  logger.info("Server started", {
    host: HOST,
    port: PORT,
    nodeEnv: env.nodeEnv,
    storageMode: env.storageMode,
  });
});
