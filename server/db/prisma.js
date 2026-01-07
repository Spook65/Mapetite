// Prisma client entrypoint for Node/Express (JS) code.
// Exists so health checks and services can talk to Postgres from JavaScript.
// Does NOT run migrations automatically; migrations are handled via prisma CLI.
import { PrismaClient } from "@prisma/client";
import logger from "../config/logger.js";

const globalForPrisma = globalThis;

/** @type {PrismaClient | undefined} */
let prisma = globalForPrisma.__mapetitePrisma;

if (!prisma) {
  prisma = new PrismaClient({
    log: ["warn", "error"],
  });
  globalForPrisma.__mapetitePrisma = prisma;
  logger.info("Prisma client initialized");
}

export default prisma;



