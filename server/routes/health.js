// Health and readiness probe endpoint for the backend.
// Exists to expose cheap signals for uptime, DB connectivity, and cache state.
// Does NOT mutate data or depend on Mongo being online; cache issues only warn.
import express from "express";
import prisma from "../db/prisma.js";
import mongoose from "../db/mongo.js";
import env from "../config/env.js";
import logger from "../config/logger.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const startedAt = process.uptime();

  const postgres = {
    status: "unknown",
  };

  const mongo = {
    status: "unknown",
  };

  // Postgres connectivity: cheap SELECT 1. Non-fatal for the process, but clearly surfaced.
  try {
    await prisma.$queryRaw`SELECT 1`;
    postgres.status = "up";
  } catch (err) {
    postgres.status = "down";
    postgres.error = err?.message ?? "unknown error";
    logger.warn("Postgres health check failed", { message: postgres.error });
  }

  // Mongo connectivity: we only inspect the connection state; no new connections are initiated here.
  try {
    const state = mongoose.connection.readyState;
    // 1 = connected, 2 = connecting, others are effectively down for cache purposes.
    mongo.status = state === 1 ? "up" : state === 2 ? "connecting" : "down";
    mongo.readyState = state;
    if (mongo.status !== "up" && env.mongoUri) {
      logger.warn("Mongo reported non-up state in health check", {
        status: mongo.status,
        readyState: state,
      });
    }
  } catch (err) {
    mongo.status = "down";
    mongo.error = err?.message ?? "unknown error";
    logger.warn("Mongo health check failed", { message: mongo.error });
  }

  res.json({
    status: "ok",
    uptimeSeconds: startedAt,
    nodeEnv: env.nodeEnv,
    postgres,
    mongo,
  });
});

export default router;



