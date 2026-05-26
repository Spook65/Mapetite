import env from "../config/env.js";
import { buildRestaurantArtworkUrl } from "./restaurantMedia.js";

const GEOAPIFY_BASE_URL = "https://api.geoapify.com";
const GEOAPIFY_SEARCH_TIMEOUT_MS = 12000;
const GEOAPIFY_DEFAULT_LIMIT = 40;

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
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function slugify(value) {
  return String(value)
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

const FOOD_CATEGORY_LABELS = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  coffee: "Cafe",
  coffee_shop: "Cafe",
  tea: "Tea",
  bubble_tea: "Tea",
  bakery: "Bakery",
  bar: "Bar",
  pub: "Pub",
  bistro: "Bistro",
  diner: "Diner",
  dessert: "Dessert",
  fast_food: "Fast food",
  food: "Dining",
  food_and_drink: "Dining",
  food_court: "Food court",
  french: "French",
  japanese: "Japanese",
  korean: "Korean",
  mediterranean: "Mediterranean",
  sushi: "Sushi",
  ramen: "Ramen",
  pizza: "Pizza",
  burger: "Burger",
  seafood: "Seafood",
  sandwich: "Sandwiches",
  chinese: "Chinese",
  indian: "Indian",
  italian: "Italian",
  kebab: "Kebab",
  mexican: "Mexican",
  thai: "Thai",
  vietnamese: "Vietnamese",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  catering: "Catering",
  meal_takeaway: "Fast food",
  meal_delivery: "Catering",
  ice_cream: "Dessert",
};

const SECONDARY_CATEGORY_LABELS = new Set(["Catering", "Restaurant", "Dining"]);

const FOOD_NAME_KEYWORDS = [
  "bakery",
  "bar",
  "bistro",
  "burger",
  "cafe",
  "coffee",
  "deli",
  "diner",
  "eatery",
  "grill",
  "izakaya",
  "kitchen",
  "noodle",
  "pasta",
  "pizza",
  "pub",
  "ramen",
  "restaurant",
  "steak",
  "sushi",
  "taqueria",
  "tavern",
  "tea",
];

function hasValidCoordinates(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
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

function normalizeCategoryToken(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function extractCategoryTokens(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .split(".")
    .map(normalizeCategoryToken)
    .filter(Boolean);
}

function getDisplayCategoryLabel(value) {
  const token = normalizeCategoryToken(value);
  return FOOD_CATEGORY_LABELS[token] || titleCase(token);
}

function isFoodRelatedCategory(value) {
  const tokens = extractCategoryTokens(value);
  return tokens.some((token) => token in FOOD_CATEGORY_LABELS);
}

function isRestaurantLikePlace(props = {}) {
  const rawCategories = Array.isArray(props.categories) ? props.categories : [];
  if (rawCategories.some(isFoodRelatedCategory)) {
    return true;
  }

  const searchableText = [props.name, props.brand, props.address_line1]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return FOOD_NAME_KEYWORDS.some((keyword) => searchableText.includes(keyword));
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

const ROAD_NAME_PATTERN =
  /\b(avenue|ave\.?|street|st\.?|road|rd\.?|boulevard|blvd\.?|drive|dr\.?|lane|ln\.?|highway|hwy\.?|route|way|line|walk|circle|arcade|loop)\b/i;
const LOW_CONFIDENCE_PLACE_NAME_PATTERN =
  /\b(line|walk|circle|arcade|loop|under[-\s]?track|ground floor|1f|2f|3f|route)\b/i;
const RESTAURANT_NAME_SIGNAL_PATTERN =
  /\b(restaurant|cafe|bar|bistro|diner|kitchen|grill|ramen|sushi|taqueria|izakaya|yakitori|pho|bbq|pizza|noodle|steak|taco)\b/i;

function normalizeComparableText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isLikelyStreetOnlyPlaceName(name, props = {}) {
  if (!ROAD_NAME_PATTERN.test(name || "")) return false;

  const streetParts = [props.housenumber, props.street].filter(Boolean);
  const streetCandidate = streetParts.join(" ").trim() || props.address_line1 || "";
  if (!streetCandidate) return false;

  const normalizedName = normalizeComparableText(name);
  const normalizedStreet = normalizeComparableText(streetCandidate);
  if (!normalizedName || !normalizedStreet) return false;

  return (
    normalizedName === normalizedStreet ||
    normalizedName.endsWith(normalizedStreet) ||
    normalizedStreet.endsWith(normalizedName)
  );
}

function isLowConfidencePlaceName(name, props = {}) {
  const value = String(name || "").trim();
  if (!value) return true;
  if (value.length < 3) return true;
  if (/^\d+$/.test(value)) return true;

  const normalizedName = normalizeComparableText(value);
  const normalizedAddress = normalizeComparableText(
    props.address_line1 ||
      [props.housenumber, props.street].filter(Boolean).join(" "),
  );

  if (
    normalizedName &&
    normalizedAddress &&
    normalizedName === normalizedAddress &&
    !props.phone &&
    !props.website &&
    !props.brand
  ) {
    return true;
  }

  if (
    LOW_CONFIDENCE_PLACE_NAME_PATTERN.test(value) &&
    !RESTAURANT_NAME_SIGNAL_PATTERN.test(value)
  ) {
    return true;
  }

  return false;
}

function normalizeAddress(props = {}, fallbackLocation = {}) {
  const streetParts = [props.housenumber, props.street].filter(Boolean);

  return {
    street:
      streetParts.join(" ").trim() ||
      props.address_line1 ||
      fallbackLocation.street ||
      "",
    city: props.city || fallbackLocation.city || "",
    state: props.state || fallbackLocation.state || "",
    country: props.country || fallbackLocation.country || "",
    zipCode: props.postcode || "",
  };
}

function parsePriceRange(props = {}, categories = []) {
  const explicit = Number(props.price_level || props.priceLevel || props.price);
  if (explicit >= 1 && explicit <= 4) {
    return explicit;
  }

  const hash = stableHash([props.name, categories.join("|")].join("-"));
  return (hash % 4) + 1;
}

function deriveRating(props = {}, seed = "") {
  const explicit = Number(props.rating);
  if (explicit >= 0 && explicit <= 5) {
    return Number(explicit.toFixed(1));
  }

  const hash = stableHash(seed);
  const rating = 3.7 + (hash % 13) / 10;
  return Math.min(4.9, Number(rating.toFixed(1)));
}

function deriveReviewCount(props = {}, seed = "") {
  const explicit = Number(props.review_count || props.reviews);
  if (explicit > 0) {
    return Math.round(explicit);
  }

  const hash = stableHash(seed);
  return 25 + (hash % 175);
}

function hasExplicitRatingValue(value) {
  return Number.isFinite(value) && value >= 0 && value <= 5;
}

function hasExplicitReviewCountValue(value) {
  return Number.isFinite(value) && value > 0;
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
  const pool = [
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
    specialties: categories.slice(0, 3).filter(Boolean),
  };
}

function buildSignatureDishes(categories, restaurantName) {
  const cuisine = categories.find((category) => category !== "Restaurant") || "Seasonal";
  return [
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

function parseOpeningHours(openingHours) {
  if (!openingHours || typeof openingHours !== "string") {
    return undefined;
  }

  const firstRange = openingHours.split(";")[0];
  const match = firstRange.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) {
    return undefined;
  }

  return {
    open: match[1],
    close: match[2],
  };
}

function normalizeDisplayCategories(rawCategories = [], queryCategories = []) {
  const primaryCategories = new Set();
  const secondaryCategories = new Set();

  for (const category of rawCategories) {
    const normalized = String(category).trim().toLowerCase();
    if (!normalized) continue;

    if (!isFoodRelatedCategory(normalized)) {
      continue;
    }

    if (normalized === "catering.restaurant" || normalized.startsWith("catering.restaurant.")) {
      secondaryCategories.add("Restaurant");
      const parts = normalized.split(".");
      const last = parts[parts.length - 1];
      if (last && last !== "restaurant") {
        const label = getDisplayCategoryLabel(last);
        if (label && label !== "Restaurant") {
          if (SECONDARY_CATEGORY_LABELS.has(label)) {
            secondaryCategories.add(label);
          } else {
            primaryCategories.add(label);
          }
        }
      }
      continue;
    }

    if (normalized === "catering.fast_food" || normalized.startsWith("catering.fast_food.")) {
      primaryCategories.add("Fast food");
      secondaryCategories.add("Restaurant");
      continue;
    }

    const lastSegment = normalized.split(".").pop();
    if (lastSegment) {
      const label = getDisplayCategoryLabel(lastSegment);
      if (SECONDARY_CATEGORY_LABELS.has(label)) {
        secondaryCategories.add(label);
      } else {
        primaryCategories.add(label);
      }
    }
  }

  if (primaryCategories.size > 0 && !secondaryCategories.has("Restaurant")) {
    secondaryCategories.add("Restaurant");
  }

  if (primaryCategories.size === 0 && secondaryCategories.has("Catering")) {
    secondaryCategories.delete("Catering");
    secondaryCategories.add("Dining");
  }

  return [...primaryCategories, ...secondaryCategories];
}

function mapSearchCategories(categories = []) {
  const mappedCategories = new Set(["catering.restaurant"]);
  const mappedConditions = new Set();

  for (const category of categories) {
    const normalized = String(category).trim().toLowerCase();
    if (!normalized) continue;

    if (normalized === "fast-food" || normalized === "fast food") {
      mappedCategories.add("catering.fast_food");
      continue;
    }

    if (normalized === "vegetarian") {
      mappedConditions.add("vegetarian");
      continue;
    }

    if (normalized === "healthy") {
      mappedConditions.add("vegetarian");
      mappedConditions.add("vegan");
      continue;
    }

    if (normalized === "best tourist spot") {
      continue;
    }

    const slug = slugify(normalized);
    if (!slug) continue;

    if (["noodles", "noodle", "ramen", "sushi", "pizza", "tacos", "burger", "chinese", "japanese", "indian", "italian", "mexican"].includes(slug)) {
      mappedCategories.add(`catering.restaurant.${slug}`);
      continue;
    }

    mappedCategories.add(`catering.restaurant.${slug}`);
  }

  return {
    categories: [...mappedCategories],
    conditions: [...mappedConditions],
  };
}

function extractGeoapifyPlacesResponse(data) {
  if (!data) return [];

  if (Array.isArray(data.features)) {
    return data.features;
  }

  if (Array.isArray(data.results)) {
    return data.results.map((result) => ({
      type: "Feature",
      properties: result,
      geometry: result.geometry || {
        type: "Point",
        coordinates: [result.lon, result.lat],
      },
    }));
  }

  return [];
}

function extractGeoapifyDetailFeature(data) {
  const features = extractGeoapifyPlacesResponse(data);
  return (
    features.find((feature) => feature?.properties?.feature_type === "details") ||
    features[0] ||
    null
  );
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEOAPIFY_SEARCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Geoapify request failed (${response.status}): ${body || response.statusText}`,
      );
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchGeoapifyGeocode(query) {
  const url = new URL(`${GEOAPIFY_BASE_URL}/v1/geocode/search`);
  url.searchParams.set("text", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("apiKey", env.geoapifyApiKey);
  return fetchJson(url.toString());
}

async function fetchGeoapifyPlaces(url) {
  return fetchJson(url.toString());
}

function buildDescription(name, categories, locationContext = {}, props = {}) {
  const categoryLabel =
    categories.find((category) => !["Restaurant", "Dining"].includes(category)) ||
    categories[0] ||
    "Restaurant";
  const city = locationContext.city || props.city || "the area";
  const extra = String(props.description || "").trim();
  const article = /^[aeiou]/i.test(categoryLabel) ? "An" : "A";
  const baseDescription =
    categoryLabel === "Restaurant" || categoryLabel === "Dining"
      ? `A restaurant listing in ${city} with available location details.`
      : `${article} ${categoryLabel} option in ${city} with available location details.`;

  return extra ? `${baseDescription} ${extra}` : baseDescription;
}

function hasFiniteCoordinates(location = {}) {
  return (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    !(location.latitude === 0 && location.longitude === 0)
  );
}

function normalizeGeoapifyPlace(feature, locationContext = {}, queryCategories = [], index = 0) {
  const props = feature?.properties || {};
  const geometry = feature?.geometry || {};
  const coordinates = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
  const lon = Number(props.lon ?? coordinates[0]);
  const lat = Number(props.lat ?? coordinates[1]);

  if (!hasValidCoordinates(lat, lon)) {
    return null;
  }

  const placeId = props.place_id || props.placeId || `${lat},${lon}`;
  const name = props.name || props.brand || props.address_line1 || "Restaurant";
  const categories = normalizeDisplayCategories(props.categories || [], queryCategories);
  if (
    !isRestaurantLikePlace(props) ||
    categories.length === 0 ||
    isLikelyStreetOnlyPlaceName(name, props) ||
    isLowConfidencePlaceName(name, props)
  ) {
    return null;
  }
  const rating = deriveRating(props, placeId);
  const reviewCount = deriveReviewCount(props, placeId);
  const openingHours = parseOpeningHours(props.opening_hours);
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

  return {
    id: `geoapify:${placeId}`,
    geoapifyPlaceId: placeId,
    name,
    address: normalizeAddress(props, locationContext),
    rating,
    ratingSource: hasExplicitRatingValue(Number(props.rating))
      ? "provider"
      : "derived",
    reviewCount,
    reviewCountSource: hasExplicitReviewCountValue(
      Number(props.review_count || props.reviews),
    )
      ? "provider"
      : "derived",
    categories,
    priceRange: parsePriceRange(props, categories),
    description: buildDescription(name, categories, locationContext, props),
    latitude: lat,
    longitude: lon,
    reviews,
    distance,
    isOpenNow:
      typeof props.open_now === "boolean"
        ? props.open_now
        : typeof props.is_open_now === "boolean"
          ? props.is_open_now
          : undefined,
    hours: openingHours,
    hoursSource: openingHours ? "provider" : undefined,
    photoUrl: buildRestaurantArtworkUrl({
      categories,
      name,
      brand: props.brand || "",
    }),
    galleryImageUrls: [],
    photoAttributions: [],
    galleryPhotoAttributions: [],
    chef: buildChefInfo(categories, name, locationContext),
    signatureDishes: buildSignatureDishes(categories, name),
    ratingBreakdown: buildRatingBreakdown(rating, reviewCount),
    phone: normalizePhone(props.phone || props.phone_number || props.contact?.phone),
    website: normalizeWebsite(props.website || props.website_uri),
    menuUrl: normalizeMenuUrl(
      props.menu_url ||
        props.menu ||
        props.website_menu ||
        props["website:menu"] ||
        props["contact:menu"],
      props.website || props.website_uri || "",
    ),
    amenities: [
      props.wifi === "yes" ? "Wi-Fi" : null,
      props.outdoor_seating === "yes" ? "Outdoor Seating" : null,
      props.delivery === "yes" ? "Delivery" : null,
      props.takeaway === "yes" ? "Takeaway" : null,
      props.vegetarian === true ? "Vegetarian Options" : null,
      props.vegan === true ? "Vegan Options" : null,
    ].filter(Boolean),
    paymentMethods: [
      props.payment_cash === "yes" ? "Cash" : null,
      props.payment_cards === "yes" ? "Cards" : null,
      props.payment_diners === "yes" ? "Diners Club" : null,
    ].filter(Boolean),
    source: "geoapify",
  };
}

function buildLocationQuery(location) {
  return [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");
}

function scoreGeoapifyLocationCandidate(result, locationInput = {}) {
  const wantedCity = normalizeComparableText(locationInput.city || "");
  const wantedState = normalizeComparableText(locationInput.state || "");
  const wantedCountry = normalizeComparableText(locationInput.country || "");
  const resultCity = normalizeComparableText(result.city || result.name || "");
  const resultState = normalizeComparableText(result.state || "");
  const resultCountry = normalizeComparableText(result.country || "");
  const resultFormatted = normalizeComparableText(result.formatted || "");

  let score = 0;
  if (wantedCity) {
    if (resultCity === wantedCity) {
      score += 40;
    } else if (
      resultFormatted.includes(wantedCity) ||
      normalizeComparableText(result.county || "").includes(wantedCity)
    ) {
      score += 20;
    }
  }

  if (wantedState && resultState === wantedState) {
    score += 8;
  }

  if (wantedCountry && resultCountry === wantedCountry) {
    score += 8;
  }

  score += Number(result.rank?.importance || 0) * 10;
  score += Number(result.rank?.popularity || 0) * 3;
  score += Number(result.rank?.confidence_city_level || result.rank?.confidence || 0) * 6;
  return score;
}

function pickBestGeoapifyLocationResult(results = [], locationInput = {}) {
  const candidates = results.filter((result) => {
    const latitude = Number(result?.lat);
    const longitude = Number(result?.lon);
    return Number.isFinite(latitude) && Number.isFinite(longitude);
  });

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => {
    const scoreDelta =
      scoreGeoapifyLocationCandidate(b, locationInput) -
      scoreGeoapifyLocationCandidate(a, locationInput);
    if (scoreDelta !== 0) return scoreDelta;
    return Number(b.rank?.importance || 0) - Number(a.rank?.importance || 0);
  });

  return candidates[0];
}

export function isGeoapifyEnabled() {
  return Boolean(env.geoapifyApiKey);
}

export async function resolveGeoapifyLocation(locationInput = {}) {
  if (hasFiniteCoordinates(locationInput)) {
    return {
      city: locationInput.city || "",
      state: locationInput.state || "",
      country: locationInput.country || "",
      latitude: locationInput.latitude,
      longitude: locationInput.longitude,
    };
  }

  if (!isGeoapifyEnabled()) {
    return null;
  }

  const query = buildLocationQuery(locationInput);
  if (!query) return null;

  try {
    const data = await fetchGeoapifyGeocode(query);
    const result = pickBestGeoapifyLocationResult(
      Array.isArray(data?.results) ? data.results : [],
      locationInput,
    );
    if (!result) return null;

    const latitude = Number(result.lat);
    const longitude = Number(result.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return {
      city:
        result.city ||
        result.county ||
        locationInput.city ||
        "",
      state: result.state || locationInput.state || "",
      country: result.country || locationInput.country || "",
      latitude,
      longitude,
      placeId: result.place_id || result.placeId || undefined,
    };
  } catch (error) {
    console.warn("Geoapify geocoding failed", error);
    return null;
  }
}

export async function searchGeoapifyRestaurants(params = {}, locationContext = {}) {
  if (!isGeoapifyEnabled()) {
    return { restaurants: [], location: locationContext };
  }

  const queryCategories = Array.isArray(params.categories) ? params.categories : [];
  const mapped = mapSearchCategories(queryCategories);
  const url = new URL(`${GEOAPIFY_BASE_URL}/v2/places`);
  url.searchParams.set("apiKey", env.geoapifyApiKey);
  url.searchParams.set("categories", mapped.categories.join(","));
  if (mapped.conditions.length > 0) {
    url.searchParams.set("conditions", mapped.conditions.join(","));
  }
  url.searchParams.set("limit", String(params.limit || GEOAPIFY_DEFAULT_LIMIT));
  url.searchParams.set("lang", "en");

  if (locationContext.placeId) {
    url.searchParams.set("filter", `place:${locationContext.placeId}`);
  } else if (hasFiniteCoordinates(locationContext)) {
    url.searchParams.set(
      "filter",
      `circle:${locationContext.longitude},${locationContext.latitude},${params.radiusMeters || 3000}`,
    );
  } else {
    return {
      restaurants: [],
      location: locationContext,
      count: 0,
    };
  }

  const data = await fetchGeoapifyPlaces(url);
  const features = extractGeoapifyPlacesResponse(data);
  let restaurants = features
    .map((feature, index) =>
      normalizeGeoapifyPlace(feature, locationContext, queryCategories, index),
    )
    .filter(Boolean);

  return {
    restaurants,
    location: locationContext,
    count: restaurants.length,
  };
}

export async function getGeoapifyRestaurantById(placeId, locationContext = {}) {
  if (!isGeoapifyEnabled() || !placeId) {
    return null;
  }

  const url = new URL(`${GEOAPIFY_BASE_URL}/v2/place-details`);
  url.searchParams.set("apiKey", env.geoapifyApiKey);
  url.searchParams.set("id", placeId);
  url.searchParams.set("features", "details");
  url.searchParams.set("lang", "en");

  const data = await fetchGeoapifyPlaces(url);
  const feature = extractGeoapifyDetailFeature(data);
  if (!feature) {
    return null;
  }

  const restaurant = normalizeGeoapifyPlace(feature, locationContext, [], 0);
  return restaurant;
}
