import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MAX_SUGGESTIONS = 5;
const placeIndex = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../data/placeIndex.json", import.meta.url)),
    "utf8",
  ),
);

export class PlaceValidationError extends Error {
  constructor(code, message, suggestions = []) {
    super(message);
    this.name = "PlaceValidationError";
    this.code = code;
    this.suggestions = suggestions;
  }
}

function normalizePlaceToken(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCountryToken(value) {
  const normalized = normalizePlaceToken(value);
  const aliases = {
    america: "united states",
    ae: "united arab emirates",
    england: "united kingdom",
    emirates: "united arab emirates",
    gb: "united kingdom",
    greatbritain: "united kingdom",
    jp: "japan",
    korea: "south korea",
    kr: "south korea",
    uk: "united kingdom",
    uae: "united arab emirates",
    "u a e": "united arab emirates",
    usa: "united states",
    us: "united states",
    "u s": "united states",
    "u s a": "united states",
    unitedarabemirates: "united arab emirates",
    unitedstates: "united states",
  };

  return aliases[normalized] || aliases[normalized.replace(/\s+/g, "")] || normalized;
}

function normalizeRegionToken(value) {
  const normalized = normalizePlaceToken(value);
  const aliases = {
    ca: "california",
    az: "arizona",
    fl: "florida",
    idf: "ile de france",
    il: "illinois",
    ma: "massachusetts",
    me: "maine",
    mo: "missouri",
    nv: "nevada",
    ny: "new york",
    on: "ontario",
    or: "oregon",
    pa: "pennsylvania",
    tx: "texas",
    wa: "washington",
  };

  return aliases[normalized] || normalized;
}

function buildPlaceRecord(rawPlace) {
  return {
    ...rawPlace,
    normalizedCity: normalizePlaceToken(rawPlace.city),
    normalizedRegion: normalizeRegionToken(rawPlace.region),
    normalizedRegionCode: normalizeRegionToken(rawPlace.regionCode),
    normalizedCountry: normalizeCountryToken(rawPlace.country),
    normalizedCountryCode: normalizeCountryToken(rawPlace.countryCode),
  };
}

const places = Array.isArray(placeIndex.places)
  ? placeIndex.places.map(buildPlaceRecord)
  : [];

function toSuggestion(place) {
  return {
    city: place.city,
    region: place.region,
    regionCode: place.regionCode,
    country: place.country,
    countryCode: place.countryCode,
  };
}

function uniqueSuggestions(matches) {
  const seen = new Set();
  const suggestions = [];

  for (const match of matches) {
    const key = [
      match.normalizedCity,
      match.normalizedRegion,
      match.normalizedCountry,
    ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(toSuggestion(match));
    if (suggestions.length >= MAX_SUGGESTIONS) break;
  }

  return suggestions;
}

function isCountryMatch(place, countryInput) {
  if (!countryInput) return true;
  const normalizedCountry = normalizeCountryToken(countryInput);
  return (
    place.normalizedCountry === normalizedCountry ||
    place.normalizedCountryCode === normalizedCountry
  );
}

function isRegionMatch(place, regionInput) {
  if (!regionInput) return true;
  const normalizedRegion = normalizeRegionToken(regionInput);
  return (
    place.normalizedRegion === normalizedRegion ||
    place.normalizedRegionCode === normalizedRegion
  );
}

function findNearbyCitySuggestions(cityInput) {
  const normalizedCity = normalizePlaceToken(cityInput);
  if (!normalizedCity) return [];

  return uniqueSuggestions(
    places.filter(
      (place) =>
        place.normalizedCity.startsWith(normalizedCity) ||
        normalizedCity.startsWith(place.normalizedCity),
    ),
  );
}

export function validatePlaceInput(locationInput = {}) {
  const city = normalizePlaceToken(locationInput.city);
  const region = normalizeRegionToken(locationInput.state || locationInput.region);
  const country = normalizeCountryToken(locationInput.country);

  if (!city) {
    throw new PlaceValidationError(
      "PLACE_NOT_FOUND",
      "Add a real city before searching.",
    );
  }

  const cityMatches = places.filter((place) => place.normalizedCity === city);
  if (cityMatches.length === 0) {
    throw new PlaceValidationError(
      "PLACE_NOT_FOUND",
      "We couldn't find that place. Check the spelling or add region/country.",
      findNearbyCitySuggestions(locationInput.city),
    );
  }

  let matches = cityMatches;

  if (country) {
    matches = matches.filter((place) => isCountryMatch(place, locationInput.country));
    if (matches.length === 0) {
      throw new PlaceValidationError(
        "PLACE_NOT_FOUND",
        "We couldn't match that city and country. Check the spelling or try a nearby city.",
        uniqueSuggestions(cityMatches),
      );
    }
  }

  if (region) {
    matches = matches.filter((place) => isRegionMatch(place, locationInput.state || locationInput.region));
    if (matches.length === 0) {
      throw new PlaceValidationError(
        "PLACE_NOT_FOUND",
        "We couldn't match that city and region. Check the spelling or add country.",
        uniqueSuggestions(country ? cityMatches.filter((place) => isCountryMatch(place, locationInput.country)) : cityMatches),
      );
    }
  }

  if (matches.length > 1) {
    throw new PlaceValidationError(
      "PLACE_AMBIGUOUS",
      "We found multiple places. Add region or country.",
      uniqueSuggestions(matches),
    );
  }

  const match = matches[0];
  return {
    city: match.city,
    state: match.region,
    regionCode: match.regionCode,
    country: match.country,
    countryCode: match.countryCode,
    latitude: match.latitude,
    longitude: match.longitude,
    timezone: match.timezone,
    source: "countries-states-cities-database",
  };
}

export function getPlaceValidationAttribution() {
  return placeIndex.source;
}
