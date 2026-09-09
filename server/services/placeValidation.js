import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const MAX_SUGGESTIONS = 5;
const MAX_AUTOCOMPLETE_SUGGESTIONS = 8;
const MIN_AUTOCOMPLETE_QUERY_LENGTH = 2;
const NEUTRAL_COUNTRY_PRIORITY = new Map([
  ["GB", 0],
  ["JP", 1],
  ["FR", 2],
  ["CA", 3],
  ["AU", 4],
  ["US", 5],
]);
const NEUTRAL_REGION_PRIORITY = new Map([
  ["GB|ENG", 0],
  ["JP|13", 1],
  ["JP|26", 2],
  ["JP|27", 3],
  ["FR|IDF", 4],
  ["CA|ON", 5],
  ["CA|BC", 6],
  ["AU|NSW", 7],
  ["US|CA", 8],
  ["US|NY", 9],
  ["US|TX", 10],
  ["US|FL", 11],
]);

function getPlaceIndexPath() {
  const candidates = [
    resolve(process.cwd(), "server/data/placeIndex.json"),
    resolve(process.cwd(), "data/placeIndex.json"),
  ];

  const indexPath = candidates.find((candidate) => existsSync(candidate));
  if (!indexPath) {
    throw new Error("Could not find server/data/placeIndex.json.");
  }

  return indexPath;
}

const placeIndex = JSON.parse(readFileSync(getPlaceIndexPath(), "utf8"));

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
    normalizedCity: rawPlace.cityKey || normalizePlaceToken(rawPlace.city),
    normalizedCityAliases: Array.isArray(rawPlace.cityAliases)
      ? rawPlace.cityAliases.map(normalizePlaceToken).filter(Boolean)
      : [],
    normalizedRegion: rawPlace.regionKey || normalizeRegionToken(rawPlace.region),
    normalizedRegionAliases: Array.isArray(rawPlace.regionAliases)
      ? rawPlace.regionAliases.map(normalizeRegionToken).filter(Boolean)
      : [],
    normalizedRegionCode: normalizeRegionToken(rawPlace.regionCode),
    normalizedCountry: rawPlace.countryKey || normalizeCountryToken(rawPlace.country),
    normalizedCountryCode: normalizeCountryToken(rawPlace.countryCode),
  };
}

const places = Array.isArray(placeIndex.places)
  ? placeIndex.places.map(buildPlaceRecord)
  : [];

const placesByCity = new Map();

for (const place of places) {
  const cityKeys = [place.normalizedCity, ...place.normalizedCityAliases];
  for (const cityKey of cityKeys) {
    const matches = placesByCity.get(cityKey) || [];
    matches.push(place);
    placesByCity.set(cityKey, matches);
  }
}

function toSuggestion(place) {
  return {
    city: place.city,
    region: place.region,
    regionCode: place.regionCode,
    country: place.country,
    countryCode: place.countryCode,
  };
}

function toAutocompleteSuggestion(place) {
  const suggestion = toSuggestion(place);
  return {
    ...suggestion,
    label: [suggestion.city, suggestion.region, suggestion.country]
      .filter(Boolean)
      .join(", "),
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

function uniqueAutocompleteSuggestions(matches, limit = MAX_AUTOCOMPLETE_SUGGESTIONS) {
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
    suggestions.push(toAutocompleteSuggestion(match));
    if (suggestions.length >= limit) break;
  }

  return suggestions;
}

function isCountryContextMatch(place, countryInput) {
  return Boolean(countryInput && isCountryMatch(place, countryInput));
}

function isRegionContextMatch(place, regionInput) {
  return Boolean(regionInput && isRegionMatch(place, regionInput));
}

function getNeutralCountryPriority(place) {
  return NEUTRAL_COUNTRY_PRIORITY.get(place.countryCode) ?? 20;
}

function getNeutralRegionPriority(place) {
  return NEUTRAL_REGION_PRIORITY.get(`${place.countryCode}|${place.regionCode}`) ?? 20;
}

function getSuggestionContextRank(place, context = {}) {
  let rank = 0;

  if (isCountryContextMatch(place, context.country)) rank -= 60;
  if (isRegionContextMatch(place, context.region)) rank -= 30;
  if (isCountryContextMatch(place, context.recentCountry)) rank -= 16;
  if (isRegionContextMatch(place, context.recentRegion)) rank -= 8;
  if (isCountryContextMatch(place, context.localeCountry)) rank -= 5;
  if (isCountryContextMatch(place, context.timezoneCountry)) rank -= 3;

  return rank;
}

function getSuggestionMatchRank(place, normalizedQuery) {
  const cityTokens = [place.normalizedCity, ...place.normalizedCityAliases];
  if (cityTokens.includes(normalizedQuery)) return 0;
  if (cityTokens.some((token) => token.startsWith(normalizedQuery))) return 1;
  return 2;
}

function sortAutocompleteMatches(matches, normalizedQuery, context = {}) {
  return [...matches].sort((first, second) => {
    const matchRank =
      getSuggestionMatchRank(first, normalizedQuery) -
      getSuggestionMatchRank(second, normalizedQuery);
    if (matchRank !== 0) return matchRank;

    const contextRank =
      getSuggestionContextRank(first, context) -
      getSuggestionContextRank(second, context);
    if (contextRank !== 0) return contextRank;

    const countryRank =
      getNeutralCountryPriority(first) - getNeutralCountryPriority(second);
    if (countryRank !== 0) return countryRank;

    const regionRank =
      getNeutralRegionPriority(first) - getNeutralRegionPriority(second);
    if (regionRank !== 0) return regionRank;

    const cityLengthRank =
      first.normalizedCity.length - second.normalizedCity.length;
    if (cityLengthRank !== 0) return cityLengthRank;

    return [first.city, first.region, first.country]
      .join("|")
      .localeCompare([second.city, second.region, second.country].join("|"));
  });
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
    place.normalizedRegionCode === normalizedRegion ||
    place.normalizedRegionAliases.includes(normalizedRegion)
  );
}

function isCityMatch(place, cityInput) {
  return (
    place.normalizedCity === cityInput ||
    place.normalizedCityAliases.includes(cityInput)
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

export function suggestPlaces(query = "", options = {}) {
  const normalizedQuery = normalizePlaceToken(query);
  const limit = Math.min(
    Math.max(Number(options.limit) || MAX_AUTOCOMPLETE_SUGGESTIONS, 1),
    MAX_AUTOCOMPLETE_SUGGESTIONS,
  );

  if (normalizedQuery.length < MIN_AUTOCOMPLETE_QUERY_LENGTH) {
    return [];
  }

  const exactMatches = [];
  const prefixMatches = [];
  const containsMatches = [];

  for (const place of places) {
    const cityTokens = [place.normalizedCity, ...place.normalizedCityAliases];
    if (cityTokens.includes(normalizedQuery)) {
      exactMatches.push(place);
      continue;
    }

    if (cityTokens.some((token) => token.startsWith(normalizedQuery))) {
      prefixMatches.push(place);
      continue;
    }

    if (cityTokens.some((token) => token.includes(normalizedQuery))) {
      containsMatches.push(place);
    }
  }

  return uniqueAutocompleteSuggestions(
    sortAutocompleteMatches(
      [...exactMatches, ...prefixMatches, ...containsMatches],
      normalizedQuery,
      {
        country: options.country,
        region: options.region,
        recentCountry: options.recentCountry,
        recentRegion: options.recentRegion,
        localeCountry: options.localeCountry,
        timezoneCountry: options.timezoneCountry,
      },
    ),
    limit,
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

  const cityMatches = placesByCity.get(city) || [];
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
