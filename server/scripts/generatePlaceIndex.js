import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const DEFAULT_OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../data/placeIndex.json",
);
const SAFE_ALIASES = [
  {
    city: "New York City",
    regionCode: "NY",
    countryCode: "US",
    cityAliases: ["New York"],
  },
  {
    city: "Paris",
    regionCode: "75C",
    countryCode: "FR",
    regionAliases: ["Ile-de-France", "IDF"],
  },
  {
    city: "London",
    regionCode: "WSM",
    countryCode: "GB",
    regionAliases: ["England", "ENG"],
  },
];

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

function readJsonSource(inputPath) {
  const resolvedInputPath = resolve(inputPath);
  if (!existsSync(resolvedInputPath)) {
    throw new Error(`Source file not found: ${resolvedInputPath}`);
  }

  const raw = readFileSync(resolvedInputPath);
  const json = resolvedInputPath.endsWith(".gz")
    ? gunzipSync(raw).toString("utf8")
    : raw.toString("utf8");

  return JSON.parse(json);
}

function toCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(6)) : null;
}

function getCountryTimezone(country) {
  const timezone = country.timezones?.[0]?.zoneName;
  return typeof timezone === "string" && timezone.trim() ? timezone : "";
}

function getSafeAliases(country, region, city) {
  const alias = SAFE_ALIASES.find(
    (candidate) =>
      candidate.city === city.name &&
      candidate.regionCode === region.iso2 &&
      candidate.countryCode === country.iso2,
  );
  if (!alias) return {};

  return {
    cityAliases: alias.cityAliases?.map(normalizePlaceToken).filter(Boolean),
    regionAliases: alias.regionAliases
      ?.map(normalizePlaceToken)
      .filter(Boolean),
  };
}

function toPlace(country, region, city) {
  const latitude = toCoordinate(city.latitude);
  const longitude = toCoordinate(city.longitude);
  const cityKey = normalizePlaceToken(city.name);
  if (!cityKey || latitude == null || longitude == null) {
    return null;
  }

  return {
    city: city.name,
    cityKey,
    region: region.name,
    regionCode: region.iso2 || "",
    country: country.name,
    countryCode: country.iso2 || "",
    latitude,
    longitude,
    timezone:
      city.timezone ||
      region.timezone ||
      getCountryTimezone(country),
    ...getSafeAliases(country, region, city),
  };
}

function comparePlaces(left, right) {
  return (
    left.country.localeCompare(right.country) ||
    left.region.localeCompare(right.region) ||
    left.city.localeCompare(right.city) ||
    left.latitude - right.latitude ||
    left.longitude - right.longitude
  );
}

function buildPlaceIndex(countries) {
  if (!Array.isArray(countries)) {
    throw new Error("Expected Countries States Cities combined JSON array.");
  }

  const places = [];
  const seen = new Set();

  for (const country of countries) {
    for (const region of country.states || []) {
      for (const city of region.cities || []) {
        const place = toPlace(country, region, city);
        if (!place) continue;

        const key = [
          place.cityKey,
          place.regionKey,
          place.regionCode,
          place.countryKey,
          place.countryCode,
        ].join("|");
        if (seen.has(key)) continue;

        seen.add(key);
        places.push(place);
      }
    }
  }

  places.sort(comparePlaces);

  const countryCount = new Set(places.map((place) => place.countryCode)).size;
  const regionCount = new Set(
    places.map((place) =>
      [place.countryCode, place.regionCode, place.regionKey].join("|"),
    ),
  ).size;

  return {
    source: {
      name: "Countries States Cities Database",
      url: "https://github.com/dr5hn/countries-states-cities-database",
      license: "ODbL v1.0",
      note:
        "Generated backend-only validation index from compact Countries States Cities fields. Regenerate from the upstream release export when updating coverage.",
    },
    generated: {
      strategy: "backend-only compact city/state/country validation index",
      inputFormat: "json-countries+states+cities.json(.gz)",
      countries: countryCount,
      regions: regionCount,
      places: places.length,
    },
    places,
  };
}

function main() {
  const [, , inputPath, outputPath = DEFAULT_OUTPUT_PATH] = process.argv;
  if (!inputPath) {
    throw new Error(
      "Usage: node server/scripts/generatePlaceIndex.js <json-countries+states+cities.json[.gz]> [outputPath]",
    );
  }

  const index = buildPlaceIndex(readJsonSource(inputPath));
  writeFileSync(resolve(outputPath), `${JSON.stringify(index)}\n`);
  console.log(
    `Generated ${index.generated.places.toLocaleString()} places at ${resolve(outputPath)}`,
  );
}

main();
