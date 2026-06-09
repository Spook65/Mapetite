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

// Fire-and-forget optional Mongo connection for cache and document stores.
// All failures are logged as warnings and must not prevent the server from running.
void connectMongo(env.mongoUri);

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/maps", mapRoutes);
app.use("/health", healthRoutes);

const PORT = Number(env.port || 5001);
const HOST = env.host || "127.0.0.1";

app.listen(PORT, HOST, () => {
  logger.info("Server started", { host: HOST, port: PORT, nodeEnv: env.nodeEnv });
});
