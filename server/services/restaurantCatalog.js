import {
  getGeoapifyRestaurantById,
  isGeoapifyEnabled,
  resolveGeoapifyLocation,
  searchGeoapifyRestaurants,
} from "./geoapifyProvider.js";
import {
  buildRestaurantArtworkUrl,
  resolveRestaurantMedia,
  resolveRestaurantMenuUrl,
} from "./restaurantMedia.js";

const SEARCH_RADIUS_METERS = 3000;
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
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

function normalizeWebsite(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7) {
    return "";
  }

  return raw.replace(/\s+/g, " ");
}

function normalizeMenuUrl(value, baseWebsite = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const parsed = new URL(raw, baseWebsite || undefined);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function titleCase(value) {
  return String(value)
    .replace(/[_-]/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const FOOD_CATEGORY_LABELS = {
  bakery: "Bakery",
  bar: "Bar",
  bistro: "Bistro",
  cafe: "Cafe",
  catering: "Catering",
  chinese: "Chinese",
  coffee_shop: "Cafe",
  dessert: "Dessert",
  diner: "Diner",
  fast_food: "Fast food",
  food: "Dining",
  food_and_drink: "Dining",
  food_court: "Food court",
  french: "French",
  indian: "Indian",
  italian: "Italian",
  japanese: "Japanese",
  korean: "Korean",
  mediterranean: "Mediterranean",
  mexican: "Mexican",
  burger: "Burger",
  pizza: "Pizza",
  pub: "Pub",
  ramen: "Ramen",
  restaurant: "Restaurant",
  seafood: "Seafood",
  sandwich: "Sandwiches",
  sushi: "Sushi",
  thai: "Thai",
  vietnamese: "Vietnamese",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  meal_takeaway: "Fast food",
  meal_delivery: "Catering",
  ice_cream: "Dessert",
};

const GENERIC_CATEGORY_LABELS = new Set(["Restaurant", "Dining", "Catering"]);
const LOW_CONFIDENCE_NAMES = new Set([
  "restaurant",
  "dining",
  "cafe",
  "bar",
  "bakery",
  "bistro",
  "food court",
]);

function normalizeFoodCategoryLabel(value) {
  const key = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return FOOD_CATEGORY_LABELS[key] || titleCase(key);
}

function normalizeRankingToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSpecificCategories(categories = []) {
  return categories.filter((category) => !GENERIC_CATEGORY_LABELS.has(category));
}

function hasExplicitRatingValue(value) {
  return Number.isFinite(value) && value >= 0 && value <= 5;
}

function hasExplicitReviewCountValue(value) {
  return Number.isFinite(value) && value > 0;
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

function hasFiniteCoordinates(location = {}) {
  return (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180 &&
    !(location.latitude === 0 && location.longitude === 0)
  );
}

function parseCategories(tags = {}) {
  const categories = [];
  const cuisine = tags.cuisine || tags["cuisine:en"];

  if (cuisine) {
    for (const value of cuisine.split(";")) {
      const cleaned = value.trim();
      if (cleaned) categories.push(normalizeFoodCategoryLabel(cleaned));
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

function scoreRestaurantForSearch(restaurant, options = {}) {
  const selectedCategories = Array.isArray(options.selectedCategories)
    ? options.selectedCategories
    : [];
  const location = options.location || {};
  const specificCategories = getSpecificCategories(restaurant.categories || []);
  const normalizedName = normalizeRankingToken(restaurant.name);
  const normalizedSelectedCategories = selectedCategories
    .map(normalizeRankingToken)
    .filter(Boolean);
  const normalizedRestaurantCategories = (restaurant.categories || [])
    .map(normalizeRankingToken)
    .filter(Boolean);
  const weightedReviewCount =
    restaurant.reviewCountSource === "provider"
      ? Math.min(restaurant.reviewCount || 0, 500)
      : Math.min(restaurant.reviewCount || 0, 8);
  const priorWeight =
    restaurant.ratingSource === "provider" || restaurant.reviewCountSource === "provider"
      ? 18
      : 40;
  const weightedRating =
    ((restaurant.rating || 3.8) * weightedReviewCount + 3.8 * priorWeight) /
    Math.max(1, weightedReviewCount + priorWeight);
  const ratingScore = weightedRating * 12;
  const reviewConfidenceBoost =
    restaurant.reviewCountSource === "provider"
      ? Math.min(Math.log10((restaurant.reviewCount || 0) + 1) * 4, 8)
      : Math.min(Math.log10((restaurant.reviewCount || 0) + 1) * 1.5, 2);
  const providerRatingBoost = restaurant.ratingSource === "provider" ? 4 : 0;
  const providerReviewBoost = restaurant.reviewCountSource === "provider" ? 3 : 0;
  const hasSelectedCategoryMatch =
    normalizedSelectedCategories.length > 0 &&
    normalizedRestaurantCategories.some((category) =>
      normalizedSelectedCategories.some(
        (selected) => category === selected || category.includes(selected) || selected.includes(category),
      ),
    );
  const categoryQualityScore =
    (specificCategories.length > 0 ? 8 : 1) +
    Math.min(specificCategories.length * 1.5, 4) +
    (hasSelectedCategoryMatch ? 10 : 0);
  const hasStreetAddress = Boolean(restaurant.address?.street);
  const hasCityAddress = Boolean(restaurant.address?.city);
  const hasCountryAddress = Boolean(restaurant.address?.country);
  const hasValidCoordinates =
    Number.isFinite(restaurant.latitude) &&
    Number.isFinite(restaurant.longitude) &&
    !(restaurant.latitude === 0 && restaurant.longitude === 0);
  const completenessScore =
    (hasStreetAddress ? 3 : hasCityAddress ? 2 : 0) +
    (hasCountryAddress ? 2 : 0) +
    (hasValidCoordinates ? 6 : -8) +
    (restaurant.hours ? 4 : 0) +
    (restaurant.website ? 3 : 0) +
    (restaurant.phone ? 2 : 0) +
    (restaurant.menuUrl ? 2 : 0) +
    (Array.isArray(restaurant.galleryImageUrls) && restaurant.galleryImageUrls.length > 0 ? 3 : 0);
  const locationScore =
    (location.city &&
    normalizeRankingToken(restaurant.address?.city) === normalizeRankingToken(location.city)
      ? 4
      : 0) +
    (location.state &&
    normalizeRankingToken(restaurant.address?.state) === normalizeRankingToken(location.state)
      ? 1.5
      : 0) +
    (location.country &&
    normalizeRankingToken(restaurant.address?.country) === normalizeRankingToken(location.country)
      ? 1.5
      : 0) +
    (Number.isFinite(restaurant.distance)
      ? restaurant.distance < 1
        ? 6
        : restaurant.distance < 3
          ? 5
          : restaurant.distance < 8
            ? 3
            : restaurant.distance < 20
              ? 1
              : restaurant.distance > 80
                ? -10
                : restaurant.distance > 40
                  ? -4
                  : 0
      : 0) +
    (restaurant.isOpenNow === true ? 2 : 0);
  let penalties = 0;

  if (!normalizedName || normalizedName.length < 3) {
    penalties -= 10;
  } else if (LOW_CONFIDENCE_NAMES.has(normalizedName)) {
    penalties -= 12;
  }

  if (specificCategories.length === 0) {
    penalties -= 4;
  }

  if (!hasStreetAddress && !hasCityAddress) {
    penalties -= 6;
  }

  if ((restaurant.reviewCount || 0) < 5 && (restaurant.rating || 0) >= 4.8) {
    penalties -= 3;
  }

  if (restaurant.source === "demo") {
    penalties -= 35;
  }

  return Number(
    (
      ratingScore +
      reviewConfidenceBoost +
      providerRatingBoost +
      providerReviewBoost +
      categoryQualityScore +
      completenessScore +
      locationScore +
      penalties
    ).toFixed(2),
  );
}

function rankRestaurantsForSearch(restaurants = [], options = {}) {
  return restaurants
    .map((restaurant) => ({
      ...restaurant,
      qualityScore: scoreRestaurantForSearch(restaurant, options),
    }))
    .sort((a, b) => {
      const scoreDelta = (b.qualityScore || 0) - (a.qualityScore || 0);
      if (scoreDelta !== 0) return scoreDelta;

      const reviewDelta = (b.reviewCount || 0) - (a.reviewCount || 0);
      if (reviewDelta !== 0) return reviewDelta;

      const ratingDelta = (b.rating || 0) - (a.rating || 0);
      if (ratingDelta !== 0) return ratingDelta;

      return (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY);
    });
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
  const cuisine =
    categories.find((category) => !["Restaurant", "Dining"].includes(category)) ||
    categories[0] ||
    "Restaurant";
  const city = locationContext?.city || tags["addr:city"] || "the area";
  const details = String(tags.description || tags.note || "").trim();
  const article = /^[aeiou]/i.test(cuisine) ? "An" : "A";
  const baseDescription =
    cuisine === "Restaurant" || cuisine === "Dining"
      ? `A restaurant listing in ${city} with available location details.`
      : `${article} ${cuisine} option in ${city} with available location details.`;

  return details ? `${baseDescription} ${details}` : baseDescription;
}

function normalizeElement(element, locationContext = {}) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180 ||
    (lat === 0 && lon === 0)
  ) {
    return null;
  }

  const id = `${element.type}-${element.id}`;
  const name = tags.name || tags.brand || tags.operator || "Restaurant";
  const categories = parseCategories(tags);
  const hours = parseHours(tags);
  const rating = deriveRating(tags, id);
  const reviewCount = deriveReviewCount(tags, id);
  const priceRange = parsePriceRange(tags, categories);
  const reviews = buildReviews(name, rating, reviewCount, locationContext, categories);
  const distance =
    hasFiniteCoordinates(locationContext)
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
    ratingSource: hasExplicitRatingValue(
      Number(tags.stars) || Number(tags.rating) || Number(tags["rating"]),
    )
      ? "provider"
      : "derived",
    reviewCount,
    reviewCountSource: hasExplicitReviewCountValue(
      Number(tags.review_count) ||
        Number(tags["review_count"]) ||
        Number(tags.reviews),
    )
      ? "provider"
      : "derived",
    categories,
    priceRange,
    description: buildDescription(name, categories, locationContext, tags),
    latitude: lat,
    longitude: lon,
    reviews,
    distance,
    isOpenNow: undefined,
    hours,
    hoursSource: hours ? "provider" : undefined,
    photoUrl: buildRestaurantArtworkUrl({
      categories,
      name,
      brand: tags.brand || tags.operator || "",
    }),
    galleryImageUrls: [],
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
    phone: normalizePhone(tags.phone || tags["contact:phone"] || tags["contact:mobile"] || ""),
    website: normalizeWebsite(tags.website || tags["contact:website"] || tags["website"] || ""),
    menuUrl: normalizeMenuUrl(
      tags["website:menu"] || tags["contact:menu"] || tags.menu || "",
      tags.website || tags["contact:website"] || tags["website"] || "",
    ),
    source: "osm",
  };

  return restaurant;
}

async function resolveLocation(locationInput = {}) {
  if (hasFiniteCoordinates(locationInput)) {
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
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

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
    latitude,
    longitude,
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

  const reviews = buildReviews(`${seed}-${index}`, rating, reviewCount, locationContext, categories);

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
    ratingSource: "derived",
    reviewCount,
    reviewCountSource: "derived",
    categories,
    priceRange: (hash % 4) + 1,
    description: `${categoryLabel} ${noun} is a polished demo restaurant in ${city}. It appears when live provider data is temporarily unavailable.`,
    latitude,
    longitude,
    reviews,
    distance:
      typeof locationContext.latitude === "number" &&
      typeof locationContext.longitude === "number"
        ? calculateDistance(locationContext.latitude, locationContext.longitude, latitude, longitude)
        : undefined,
    isOpenNow: undefined,
    hours: undefined,
    hoursSource: undefined,
    photoUrl: buildRestaurantArtworkUrl({
      categories,
      name: `${city} ${categoryLabel} ${noun}`,
    }),
    galleryImageUrls: [],
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

async function ensureRestaurantMedia(restaurant) {
  if (!restaurant || restaurant.source === "demo") {
    return restaurant;
  }

  if (Array.isArray(restaurant.galleryImageUrls) && restaurant.galleryImageUrls.length > 0) {
    return restaurant;
  }

  const media = await resolveRestaurantMedia({
    website: restaurant.website,
    name: restaurant.name,
    street: restaurant.address?.street,
    city: restaurant.address?.city,
    state: restaurant.address?.state,
    country: restaurant.address?.country,
    categories: restaurant.categories,
    placeId: restaurant.geoapifyPlaceId || restaurant.id,
  });

  if (media.images.length > 0) {
    restaurant.galleryImageUrls = media.images;
    restaurant.galleryPhotoAttributions = media.attributions;
    restaurant.photoUrl = media.images[0];
  }

  return restaurant;
}

async function ensureRestaurantMenu(restaurant) {
  if (!restaurant || restaurant.source === "demo") {
    return restaurant;
  }

  if (restaurant.menuUrl || !restaurant.website) {
    return restaurant;
  }

  const menuUrl = await resolveRestaurantMenuUrl({
    website: restaurant.website,
  });

  if (menuUrl) {
    restaurant.menuUrl = menuUrl;
  }

  return restaurant;
}

async function enrichSearchRestaurants(restaurants = [], limit = 8) {
  const visibleRestaurants = restaurants.slice(0, limit);
  const enrichedVisible = await Promise.all(
    visibleRestaurants.map((restaurant) => ensureRestaurantMedia(restaurant)),
  );
  return [...enrichedVisible, ...restaurants.slice(limit)];
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
    .sort(
      (a, b) =>
        (b.qualityScore || b.rating || 0) - (a.qualityScore || a.rating || 0),
    );
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
        payload.restaurants = rankRestaurantsForSearch(payload.restaurants, {
          selectedCategories: params.categories,
          location: resolvedLocation,
        });
        payload.restaurants = await enrichSearchRestaurants(payload.restaurants);
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

    restaurants = rankRestaurantsForSearch(restaurants, {
      selectedCategories: params.categories,
      location: resolvedLocation,
    });

    const payload = {
      restaurants,
      location: resolvedLocation,
      count: restaurants.length,
    };

    payload.restaurants = await enrichSearchRestaurants(payload.restaurants);

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
    const enriched = await ensureRestaurantMedia(rest);
    await ensureRestaurantMenu(enriched);
    rememberRestaurants([enriched]);
    return enriched;
  }

  if (restaurantId.startsWith("geoapify:")) {
    const geoapifyRestaurant = await getGeoapifyRestaurantById(
      restaurantId.slice("geoapify:".length),
    );
    if (geoapifyRestaurant) {
      const enriched = await ensureRestaurantMedia(geoapifyRestaurant);
      await ensureRestaurantMenu(enriched);
      rememberRestaurants([enriched]);
      return enriched;
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

  const enriched = await ensureRestaurantMedia(restaurant);
  await ensureRestaurantMenu(enriched);

  rememberRestaurants([enriched]);
  return enriched;
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
