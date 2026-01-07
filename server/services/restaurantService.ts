// Service boundary for canonical restaurant data stored in Postgres.
// Exists so routes never couple to Prisma directly and to keep Mongo/HTTP concerns out.
// Does NOT handle cache writes or external API fetching—that belongs in searchService.
import prisma from "../db/prisma.js";

export const listRestaurants = async () => {
  // Reads only from Postgres; Mongo/cache intentionally excluded.
  return prisma.restaurant.findMany({
    include: { cuisine: true, location: true },
    orderBy: { createdAt: "desc" },
  });
};

export const upsertRestaurantFromSnapshot = async (payload: {
  externalId: string;
  name: string;
  cuisineName?: string;
  latitude?: number;
  longitude?: number;
}) => {
  // Normalizes a search snapshot into structured tables.
  const { externalId, name, cuisineName, latitude, longitude } = payload;

  const cuisine =
    cuisineName &&
    (await prisma.cuisine.upsert({
      where: { name: cuisineName },
      update: {},
      create: { name: cuisineName },
    }));

  const location =
    latitude !== undefined && longitude !== undefined
      ? await prisma.location.upsert({
          where: { externalKey: `${externalId}` },
          update: { latitude, longitude },
          create: { latitude, longitude, externalKey: `${externalId}` },
        })
      : null;

  return prisma.restaurant.upsert({
    where: { externalId },
    update: {
      name,
      cuisineId: cuisine?.id ?? null,
      locationId: location?.id ?? null,
    },
    create: {
      externalId,
      name,
      cuisineId: cuisine?.id ?? null,
      locationId: location?.id ?? null,
    },
  });
};


