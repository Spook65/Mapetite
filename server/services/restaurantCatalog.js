import env from "../config/env.js";
import {
  getGeoapifyRestaurantById,
  isGeoapifyEnabled,
  resolveGeoapifyLocation,
  searchGeoapifyRestaurants,
} from "./geoapifyProvider.js";

const SEARCH_RADIUS_METERS = 3000;
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const BACKEND_BASE_URL = `http://${env.host}:${env.port}`;

const searchCache = new Map();
const restaurantCache = new Map();

const CHEF_BY_CUISINE = {
  Noodles: ["Chef Takeshi Yamamoto", "Chef Li Wei", "Chef Nguyen Pham"],
  Vegetarian: ["Chef Maya Rodriguez", "Chef Priya Sharma", "Chef Emma Green"],
  Healthy: ["Chef Marcus Johnson", "Chef Sarah Williams", "Chef David Chen"],
  "Fast Food": ["Chef Mike Anderson", "Chef Jake Wilson", "Chef Tony Garcia"],
  Italian: ["Chef Giovanni Rossi", "Chef Maria Bianchi", "Chef Lucia Ferrari"],
  Mexican: ["Chef Carlos Hernandez", "Chef Rosa Lopez", "Chef Elena Sanchez"],
  Chinese: ["Chef Zhang Wei", "Chef Wang Fang", "Chef Liu Ming"],
  Japanese: ["Chef Hiroshi Nakamura", "Chef Yuki Sato", "Chef Akira Suzuki"],
  Indian: ["Chef Rajesh Kumar", "Chef Anita Patel", "Chef Priya Reddy"],
};

const REVIEW_TEMPLATES = [
  "Impeccable service and memorable flavors.",
  "A polished dining room with a confident kitchen.",
  "Thoughtful plating, great pacing, and a strong wine list.",
  "The menu feels focused and the quality is consistent.",
  "A destination worth returning to.",
];

function stableHash(value) {
  return String(value)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function titleCase(value) {
  return String(value)
    .replace(/[_-]/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildPhotoUrl(seed, width = 1200, height = 800) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

function buildMapPhotoUrl({
  latitude,
  longitude,
  label,
  variant = 0,
  width = 1200,
  height = 800,
  style,
}) {
  const url = new URL(`${BACKEND_BASE_URL}/api/maps/static`);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("label", label || "Mapetite");
  url.searchParams.set("variant", String(variant));
  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  url.searchParams.set(
    "style",
    style || (variant % 2 === 0 ? "osm-bright" : "toner-grey"),
  );
  url.searchParams.set("markerColor", variant % 2 === 0 ? "#0ea5e9" : "#14b8a6");
  return url.toString();
}

function buildGalleryImages(seed, count = 6, locationContext = {}, label = "") {
  const hasCoordinates =
    Number.isFinite(locationContext.latitude) && Number.isFinite(locationContext.longitude);

  if (!hasCoordinates) {
    return Array.from({ length: count }, (_, index) =>
      buildPhotoUrl(`${seed}-${index}`, 1400, 900),
    );
  }

  return Array.from({ length: count }, (_, index) =>
    buildMapPhotoUrl({
      latitude: locationContext.latitude,
      longitude: locationContext.longitude,
      label,
      variant: index,
      width: 1400,
      height: 900,
    }),
  );
}

function parseCategories(tags = {}) {
  const categories = [];
  const cuisine = tags.cuisine || tags["cuisine:en"];

  if (cuisine) {
    for (const value of cuisine.split(";")) {
      const cleaned = value.trim();
      if (cleaned) categories.push(titleCase(cleaned));
    }
  }

  if (tags.amenity === "restaurant" || tags.name) {
    categories.push("Restaurant");
  }

  return [...new Set(categories.length ? categories : ["Restaurant"])];
}

function parseHours(tags = {}) {
  const hours = tags.opening_hours;
  if (!hours) return undefined;

  const firstRange = hours.split(";")[0];
  const match = firstRange.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) return undefined;

  return { open: match[1], close: match[2] };
}

function isOpenNow(hours) {
  if (!hours) return undefined;

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = hours.open.split(":").map(Number);
  const [closeHour, closeMinute] = hours.close.split(":").map(Number);

  const open = openHour * 60 + openMinute;
  const close = closeHour * 60 + closeMinute;

  if (close < open) {
    return current >= open || current <= close;
  }

  return current >= open && current <= close;
}

function parsePriceRange(tags = {}, categories = []) {
  const explicit =
    Number(tags.price_level) ||
    Number(tags["price_level"]) ||
    Number(tags["price:range"]);

  if (explicit >= 1 && explicit <= 4) {
    return explicit;
  }

  const hash = stableHash([tags.name, categories.join("|")].join("-"));
  return (hash % 4) + 1;
}

function deriveRating(tags = {}, seed = "") {
  const explicit =
    Number(tags.stars) || Number(tags.rating) || Number(tags["rating"]);
  if (explicit >= 0 && explicit <= 5) return Number(explicit.toFixed(1));

  const hash = stableHash(seed);
  const rating = 3.7 + (hash % 13) / 10;
  return Math.min(4.9, Number(rating.toFixed(1)));
}

function deriveReviewCount(tags = {}, seed = "") {
  const explicit =
    Number(tags.review_count) ||
    Number(tags["review_count"]) ||
    Number(tags.reviews);
  if (explicit > 0) return Math.round(explicit);

  const hash = stableHash(seed);
  return 25 + (hash % 175);
}

function buildRatingBreakdown(rating, reviewCount) {
  const rounded = Math.max(1, Math.min(5, Math.round(rating)));
  const five = Math.max(1, Math.round(reviewCount * (0.46 + rounded * 0.05)));
  const four = Math.max(0, Math.round(reviewCount * 0.28));
  const three = Math.max(0, Math.round(reviewCount * 0.14));
  const two = Math.max(0, Math.round(reviewCount * 0.08));
  const one = Math.max(0, reviewCount - five - four - three - two);

  return {
    5: five,
    4: four,
    3: three,
    2: two,
    1: one,
  };
}

function buildChefInfo(categories, restaurantName, locationContext = {}) {
  const cuisine = categories.find((category) => category !== "Restaurant") || "Restaurant";
  const pool = CHEF_BY_CUISINE[cuisine] || [
    "Chef Elena Brooks",
    "Chef Olivia Carter",
    "Chef Daniel Reed",
    "Chef Nora Patel",
    "Chef Marcus Lee",
    "Chef Sofia Alvarez",
  ];
  const seed = [restaurantName, locationContext.city, locationContext.state, cuisine]
    .filter(Boolean)
    .join("|");
  const hash = stableHash(seed);
  const chefName = pool[hash % pool.length];
  const philosophyFragments = [
    "seasonal ingredients with precise, modern technique",
    "a menu that feels rooted in place and flexible by the day",
    "warm hospitality balanced with a sharp culinary point of view",
    "comfortable dishes with polished details and clean flavors",
  ];
  const philosophy = philosophyFragments[hash % philosophyFragments.length];

  return {
    name: chefName,
    bio:
      `At ${restaurantName}${locationContext.city ? ` in ${locationContext.city}` : ""}, ${chefName} leads a kitchen that emphasizes ${philosophy}.`,
    yearsOfExperience: 12 + (hash % 15),
    specialties: categories.slice(0, 3),
  };
}

function buildSignatureDishes(categories, restaurantName) {
  const cuisine = categories.find((category) => category !== "Restaurant") || "Seasonal";
  const dishes = [
    {
      name: `${cuisine} Tasting Course`,
      description: `A compact expression of the kitchen's ${cuisine.toLowerCase()} point of view at ${restaurantName}.`,
      price: 28,
      featured: true,
      tags: [cuisine, "Seasonal"],
    },
    {
      name: "Chef's Market Plate",
      description: "Fresh produce, careful seasoning, and an elegant finish.",
      price: 34,
      tags: ["Seasonal"],
    },
    {
      name: "Signature Dessert",
      description: "A composed sweet ending designed to echo the rest of the menu.",
      price: 16,
      tags: ["Dessert"],
    },
  ];

  return dishes;
}

function buildReviews(
  restaurantName,
  rating,
  reviewCount,
  locationContext = {},
  categories = [],
) {
  const openers = [
    "Impeccable service and memorable flavors.",
    "A polished dining room with a confident kitchen.",
    "Thoughtful plating, great pacing, and a strong wine list.",
    "The menu feels focused and the quality is consistent.",
    "A destination worth returning to.",
    "The room feels lively without losing its calm.",
  ];
  const middle = [
    "The pacing felt deliberate in the best way.",
    "The cooking had a clear point of view.",
    "It felt tailored to the neighborhood and the city.",
    "Every course arrived with good energy and restraint.",
    "You can tell the team cares about the details.",
  ];
  const closers = [
    "We would happily come back again.",
    "It left a strong impression.",
    "Worth planning a second visit.",
    "An easy recommendation for the area.",
  ];
  const seed = [restaurantName, locationContext.city, locationContext.state, categories.join("|")]
    .filter(Boolean)
    .join("|");

  return Array.from({ length: Math.min(4, Math.max(3, reviewCount > 80 ? 4 : 3)) }, (_, index) => {
    const hash = stableHash(`${seed}|review|${index}`);
    const score = Math.max(3.5, Math.min(5, rating - index * 0.2));
    const date = new Date();
    date.setDate(date.getDate() - (index + 1) * 11);

    return {
      id: `${stableHash(restaurantName)}-${index}`,
      author: `Guest ${index + 1}`,
      rating: Number(score.toFixed(1)),
      comment: `${openers[hash % openers.length]} ${middle[(hash >> 3) % middle.length]} ${closers[(hash >> 6) % closers.length]}`,
      date: date.toISOString(),
      helpfulCount: Math.max(1, Math.round(reviewCount / (index + 5))),
    };
  });
}

function normalizeAddress(tags = {}, fallbackLocation = {}) {
  return {
    street:
      tags["addr:street"] ||
      tags["addr:full"] ||
      tags.street ||
      tags.road ||
      "",
    city:
      tags["addr:city"] ||
      tags.city ||
      tags.town ||
      tags.village ||
      fallbackLocation.city ||
      "",
    state: tags["addr:state"] || tags.state || fallbackLocation.state || "",
    country: tags["addr:country"] || tags.country || fallbackLocation.country || "",
    zipCode: tags["addr:postcode"] || tags.postcode || "",
  };
}

function buildDescription(name, categories, locationContext, tags = {}) {
  const cuisine = categories.find((category) => category !== "Restaurant") || "restaurant";
  const city = locationContext?.city || tags["addr:city"] || "the area";
  const details = tags.description || tags.note || "";

  return (
    `${name} is a ${cuisine.toLowerCase()} destination in ${city}. ` +
    `It was discovered through live OpenStreetMap data and enriched for browsing. ` +
    (details ? `${details}` : "")
  ).trim();
}

function normalizeElement(element, locationContext = {}) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (lat === undefined || lon === undefined) {
    return null;
  }

  const id = `${element.type}-${element.id}`;
  const name = tags.name || tags.brand || tags.operator || "Restaurant";
  const categories = parseCategories(tags);
  const hours = parseHours(tags);
  const rating = deriveRating(tags, id);
  const reviewCount = deriveReviewCount(tags, id);
  const priceRange = parsePriceRange(tags, categories);
  const photoUrl = buildPhotoUrl(id);
  const distance =
    locationContext.latitude !== undefined && locationContext.longitude !== undefined
      ? calculateDistance(
          locationContext.latitude,
          locationContext.longitude,
          lat,
          lon,
        )
      : undefined;

  const restaurant = {
    id,
    name,
    address: normalizeAddress(tags, locationContext),
    rating,
    reviewCount,
    categories,
    priceRange,
    description: buildDescription(name, categories, locationContext, tags),
    latitude: lat,
    longitude: lon,
    reviews: buildReviews(name, rating, reviewCount, locationContext, categories),
    distance,
    isOpenNow: isOpenNow(hours),
    hours,
    photoUrl,
    galleryImageUrls: buildGalleryImages(id, 6, locationContext, name),
    chef: buildChefInfo(categories, name, locationContext),
    signatureDishes: buildSignatureDishes(categories, name),
    ratingBreakdown: buildRatingBreakdown(rating, reviewCount),
    amenities: [
      tags.wifi === "yes" ? "Wi-Fi" : null,
      tags.outdoor_seating === "yes" ? "Outdoor Seating" : null,
      tags.delivery === "yes" ? "Delivery" : null,
      tags.takeaway === "yes" ? "Takeaway" : null,
    ].filter(Boolean),
    paymentMethods: [
      tags.payment_cash === "yes" ? "Cash" : null,
      tags.payment_cards === "yes" ? "Cards" : null,
      tags.payment_diners === "yes" ? "Diners Club" : null,
    ].filter(Boolean),
    source: "osm",
  };

  return restaurant;
}

async function resolveLocation(locationInput = {}) {
  if (
    typeof locationInput.latitude === "number" &&
    typeof locationInput.longitude === "number"
  ) {
    return {
      city: locationInput.city || "",
      state: locationInput.state || "",
      country: locationInput.country || "",
      latitude: locationInput.latitude,
      longitude: locationInput.longitude,
    };
  }

  const geoapifyLocation = await resolveGeoapifyLocation(locationInput);
  if (geoapifyLocation) {
    return geoapifyLocation;
  }

  const query = [locationInput.city, locationInput.state, locationInput.country]
    .filter(Boolean)
    .join(", ");

  if (!query) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mapetite/1.0 (restaurant discovery)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const result = data?.[0];
  if (!result) return null;

  const address = result.address || {};
  return {
    city:
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      locationInput.city ||
      "",
    state: address.state || locationInput.state || "",
    country: address.country || locationInput.country || "",
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
}

async function fetchOverpass(query) {
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed (${response.status})`);
  }

  return response.json();
}

async function fetchNearbyRestaurants(location, radiusMeters = SEARCH_RADIUS_METERS) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${radiusMeters},${location.latitude},${location.longitude});
      way["amenity"="restaurant"](around:${radiusMeters},${location.latitude},${location.longitude});
      relation["amenity"="restaurant"](around:${radiusMeters},${location.latitude},${location.longitude});
    );
    out center tags;
  `;

  const data = await fetchOverpass(query);
  return Array.isArray(data?.elements) ? data.elements : [];
}

async function fetchRestaurantByIdFromOverpass(restaurantId) {
  const [type, id] = String(restaurantId).split("-");
  if (!type || !id || !["node", "way", "relation"].includes(type)) {
    return null;
  }

  const query = `
    [out:json][timeout:25];
    (
      ${type}(id:${id});
    );
    out center tags;
  `;

  const data = await fetchOverpass(query);
  const element = Array.isArray(data?.elements) ? data.elements[0] : null;
  return element || null;
}

function buildSearchCacheKey(params, location, provider) {
  return JSON.stringify({
    provider,
    city: params.city || "",
    state: params.state || "",
    country: params.country || "",
    latitude: location.latitude,
    longitude: location.longitude,
    radiusMeters: params.radiusMeters || SEARCH_RADIUS_METERS,
    categories: [...(params.categories || [])].sort(),
  });
}

function buildSyntheticRestaurant(seed, locationContext = {}, index = 0, queryCategories = []) {
  const baseSeed = `${seed}-${index}`;
  const hash = stableHash(baseSeed);
  const categoryLabel =
    queryCategories.find((category) => category !== "Restaurant") ||
    "Signature Dining";
  const nameFragments = [
    "Maison",
    "Table",
    "Kitchen",
    "Bistro",
    "Atelier",
    "Harbor",
    "Garden",
    "Room",
  ];
  const noun = nameFragments[hash % nameFragments.length];
  const city = locationContext.city || "Nearby";
  const latitude =
    typeof locationContext.latitude === "number"
      ? locationContext.latitude + ((hash % 21) - 10) / 1000
      : 40.7128 + ((hash % 21) - 10) / 1000;
  const longitude =
    typeof locationContext.longitude === "number"
      ? locationContext.longitude + ((hash % 19) - 9) / 1000
      : -74.006 + ((hash % 19) - 9) / 1000;

  const rating = Number((3.8 + (hash % 12) / 10).toFixed(1));
  const reviewCount = 40 + (hash % 160);
  const categories = [
    ...new Set(
      [
        ...queryCategories.map((category) => titleCase(category)),
        categoryLabel,
        "Restaurant",
      ].filter(Boolean),
    ),
  ];

  return {
    id: `demo:${baseSeed}`,
    name: `${categoryLabel} ${noun}`,
    address: {
      street: `${index + 1} ${city} Avenue`,
      city,
      state: locationContext.state || "",
      country: locationContext.country || "",
      zipCode: "",
    },
    rating,
    reviewCount,
    categories,
    priceRange: (hash % 4) + 1,
    description: `${categoryLabel} ${noun} is a polished demo restaurant in ${city}. It appears when live provider data is temporarily unavailable.`,
    latitude,
    longitude,
    reviews: buildReviews(`${seed}-${index}`, rating, reviewCount, locationContext, categories),
    distance:
      typeof locationContext.latitude === "number" &&
      typeof locationContext.longitude === "number"
        ? calculateDistance(locationContext.latitude, locationContext.longitude, latitude, longitude)
        : undefined,
    isOpenNow: index % 2 === 0,
    hours: {
      open: "11:00 AM",
      close: "10:00 PM",
    },
    photoUrl: buildMapPhotoUrl({
      latitude,
      longitude,
      label: `${city} ${categoryLabel}`,
      variant: 0,
      width: 1200,
      height: 800,
      style: "osm-bright",
    }),
    galleryImageUrls: buildGalleryImages(
      `demo-${baseSeed}`,
      6,
      locationContext,
      `${city} ${categoryLabel}`,
    ),
    photoAttributions: [],
    galleryPhotoAttributions: [],
    chef: buildChefInfo(categories, `${city} ${categoryLabel} ${noun}`, locationContext),
    signatureDishes: buildSignatureDishes(categories, `${categoryLabel} ${noun}`),
    ratingBreakdown: buildRatingBreakdown(rating, reviewCount),
    amenities: ["Wi-Fi", "Outdoor Seating"],
    paymentMethods: ["Cards", "Cash"],
    source: "demo",
  };
}

function buildSyntheticRestaurantList(params, locationContext, count = 8) {
  const categories = Array.isArray(params.categories) ? params.categories : [];
  return Array.from({ length: count }, (_, index) =>
    buildSyntheticRestaurant(
      [locationContext.city, locationContext.state, locationContext.country]
        .filter(Boolean)
        .join("-") || "demo",
      locationContext,
      index,
      categories,
    ),
  );
}

function rememberRestaurants(restaurants) {
  for (const restaurant of restaurants) {
    restaurantCache.set(restaurant.id, {
      ...restaurant,
      cachedAt: Date.now(),
    });
  }
}

function readKnownRestaurants() {
  return Array.from(restaurantCache.values())
    .map((restaurant) => {
      const { cachedAt, ...rest } = restaurant;
      return rest;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
}

function readSearchCache(key) {
  const cached = searchCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    searchCache.delete(key);
    return null;
  }

  return cached.payload;
}

function writeSearchCache(key, payload) {
  searchCache.set(key, {
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    payload,
  });
}

export async function searchRestaurants(params = {}) {
  const resolvedLocation = await resolveLocation(params);
  if (!resolvedLocation) {
    return { restaurants: [], location: null };
  }

  const preferredProvider = isGeoapifyEnabled() ? "geoapify" : "osm";
  const cacheKey = buildSearchCacheKey(params, resolvedLocation, preferredProvider);
  const cached = readSearchCache(cacheKey);
  if (cached) {
    return cached;
  }

  if (preferredProvider === "geoapify") {
    try {
      const payload = await searchGeoapifyRestaurants(params, resolvedLocation);
      if (payload.restaurants.length > 0) {
        writeSearchCache(cacheKey, payload);
        rememberRestaurants(payload.restaurants);
        return payload;
      }

      console.warn("Geoapify returned no restaurants; falling back to OpenStreetMap.");
    } catch (error) {
      console.warn(
        "Geoapify search failed; falling back to OpenStreetMap.",
        error,
      );
    }
  }

  try {
    const elements = await fetchNearbyRestaurants(
      resolvedLocation,
      params.radiusMeters || SEARCH_RADIUS_METERS,
    );

    let restaurants = elements
      .map((element) => normalizeElement(element, resolvedLocation))
      .filter(Boolean);

    if (Array.isArray(params.categories) && params.categories.length > 0) {
      restaurants = restaurants.filter((restaurant) =>
        restaurant.categories.some((category) =>
          params.categories.some(
            (selected) =>
              category.toLowerCase() === String(selected).toLowerCase() ||
              category.toLowerCase().includes(String(selected).toLowerCase()),
          ),
        ),
      );
    }

    restaurants.sort(
      (a, b) =>
        (a.distance ?? Number.POSITIVE_INFINITY) -
        (b.distance ?? Number.POSITIVE_INFINITY),
    );

    const payload = {
      restaurants,
      location: resolvedLocation,
      count: restaurants.length,
    };

    const osmCacheKey = buildSearchCacheKey(params, resolvedLocation, "osm");
    writeSearchCache(osmCacheKey, payload);
    rememberRestaurants(restaurants);

    return payload;
  } catch (error) {
    console.warn("OpenStreetMap search failed; using demo fallback data.", error);
    const restaurants = buildSyntheticRestaurantList(params, resolvedLocation);
    const payload = {
      restaurants,
      location: resolvedLocation,
      count: restaurants.length,
    };
    const demoCacheKey = buildSearchCacheKey(params, resolvedLocation, "demo");
    writeSearchCache(demoCacheKey, payload);
    rememberRestaurants(restaurants);
    return payload;
  }
}

export async function getRestaurantById(restaurantId) {
  const cached = restaurantCache.get(restaurantId);
  if (cached) {
    const { cachedAt, ...rest } = cached;
    return rest;
  }

  if (restaurantId.startsWith("geoapify:")) {
    const geoapifyRestaurant = await getGeoapifyRestaurantById(
      restaurantId.slice("geoapify:".length),
    );
    if (geoapifyRestaurant) {
      rememberRestaurants([geoapifyRestaurant]);
      return geoapifyRestaurant;
    }
  }

  if (restaurantId.startsWith("demo:")) {
    const demoRestaurant = buildSyntheticRestaurant(
      restaurantId.replace(/^demo:/, ""),
      {},
      0,
      [],
    );
    demoRestaurant.id = restaurantId;
    rememberRestaurants([demoRestaurant]);
    return demoRestaurant;
  }

  const element = await fetchRestaurantByIdFromOverpass(restaurantId);
  if (!element) {
    return null;
  }

  const restaurant = normalizeElement(element, {});
  if (!restaurant) {
    return null;
  }

  rememberRestaurants([restaurant]);
  return restaurant;
}

export function listKnownRestaurants() {
  return readKnownRestaurants();
}

export async function upsertRestaurantFromSnapshot(snapshot) {
  if (!snapshot || !snapshot.id) {
    throw new Error("Restaurant snapshot must include an id");
  }

  const restaurant = {
    ...snapshot,
    cachedAt: Date.now(),
  };

  restaurantCache.set(snapshot.id, restaurant);
  return snapshot;
}
