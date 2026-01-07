import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Local config + infra
import env from "./config/env.js";
import logger from "./config/logger.js";
import { connectMongo } from "./db/mongo.js";

// Routes
import restaurantRoutes from "./routes/restaurants.js";
import healthRoutes from "./routes/health.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Fire-and-forget optional Mongo connection for cache and document stores.
// All failures are logged as warnings and must not prevent the server from running.
void connectMongo(env.mongoUri);

app.use("/api/restaurants", restaurantRoutes);
app.use("/health", healthRoutes);

const PORT = Number(env.port || 5000);

app.listen(PORT, () => {
  logger.info("Server started", { port: PORT, nodeEnv: env.nodeEnv });
});
