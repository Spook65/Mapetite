// Provides a singleton Prisma client for Postgres-backed, structured data.
// Exists to centralize the ORM entrypoint; intentionally does not run migrations or schema sync.
// Does NOT handle any MongoDB or cache concerns—keep those in dedicated adapters.
import { PrismaClient } from "@prisma/client";

// Lazy singleton to avoid multiple connections in hot-reload scenarios.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"], // keep logs minimal in shared environments
  });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

