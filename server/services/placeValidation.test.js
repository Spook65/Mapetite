import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PlaceValidationError,
  suggestPlaces,
  validatePlaceInput,
} from "./placeValidation.js";

describe("place validation", () => {
  it("accepts generated-index California search cities", () => {
    const supportedPlaces = [
      ["Stockton", "California", "United States"],
      ["Lodi", "California", "United States"],
      ["Manteca", "California", "United States"],
      ["Modesto", "California", "United States"],
      ["Tracy", "California", "United States"],
      ["Sacramento", "California", "United States"],
      ["San Francisco", "California", "United States"],
      ["San Jose", "California", "United States"],
      ["Fresno", "California", "United States"],
      ["Bakersfield", "California", "United States"],
      ["Oakland", "California", "United States"],
      ["Berkeley", "California", "United States"],
      ["Los Angeles", "California", "United States"],
      ["San Diego", "California", "United States"],
      ["Irvine", "California", "United States"],
      ["Anaheim", "California", "United States"],
      ["Riverside", "California", "United States"],
      ["Long Beach", "California", "United States"],
    ];

    for (const [city, state, country] of supportedPlaces) {
      expect(validatePlaceInput({ city, state, country })).toMatchObject({
        city,
        state,
        country,
      });
    }
  });

  it("accepts generated-index international search cities", () => {
    const supportedPlaces = [
      ["Tokyo", "Tokyo", "Japan"],
      ["Kyoto", "Kyoto", "Japan"],
      ["Osaka", "Osaka", "Japan"],
      ["Paris", "Ile-de-France", "France"],
      ["London", "England", "United Kingdom"],
      ["Toronto", "Ontario", "Canada"],
      ["Vancouver", "British Columbia", "Canada"],
      ["Dubai", "Dubai", "United Arab Emirates"],
      ["Singapore", "", "Singapore"],
      ["Phnom Penh", "Phnom Penh", "Cambodia"],
      ["Siem Reap", "Siem Reap", "Cambodia"],
      ["Sydney", "New South Wales", "Australia"],
    ];

    for (const [city, state, country] of supportedPlaces) {
      const result = validatePlaceInput({ city, state, country });
      expect(result.city).toBeTruthy();
      expect(result.country).toBe(country);
    }
  });

  it("accepts Manteca when region and country disambiguate the real city", () => {
    expect(
      validatePlaceInput({
        city: "Manteca",
        state: "California",
        country: "United States",
      }),
    ).toMatchObject({
      city: "Manteca",
      state: "California",
      regionCode: "CA",
      country: "United States",
      countryCode: "US",
      timezone: "America/Los_Angeles",
    });
  });

  it("rejects fake cities that are not in the generated validation index", () => {
    expect(() =>
      validatePlaceInput({
        city: "fakecity",
        state: "California",
        country: "United States",
      }),
    ).toThrow(PlaceValidationError);
  });

  it("keeps ambiguous city-only searches blocked until region or country is supplied", () => {
    expect(() =>
      validatePlaceInput({
        city: "Springfield",
      }),
    ).toThrow(expect.objectContaining({ code: "PLACE_AMBIGUOUS" }));
  });

  it("rejects nonsense strings that are not exact generated-index matches", () => {
    expect(() =>
      validatePlaceInput({
        city: "asdfasdf",
      }),
    ).toThrow(expect.objectContaining({ code: "PLACE_NOT_FOUND" }));
  });

  it("resolves ambiguous names when region and country identify one indexed place", () => {
    expect(
      validatePlaceInput({
        city: "San Jose",
        state: "California",
        country: "United States",
      }),
    ).toMatchObject({
      city: "San Jose",
      state: "California",
      country: "United States",
    });
  });

  it("keeps globally ambiguous names ambiguous without supporting location context", () => {
    expect(() =>
      validatePlaceInput({
        city: "Paris",
      }),
    ).toThrow(expect.objectContaining({ code: "PLACE_AMBIGUOUS" }));
  });

  it("keeps Portland city-only ambiguous because multiple indexed matches exist", () => {
    expect(() =>
      validatePlaceInput({
        city: "Portland",
      }),
    ).toThrow(expect.objectContaining({ code: "PLACE_AMBIGUOUS" }));
  });

  it("loads the backend place index when started from the server directory", () => {
    const output = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        "import { validatePlaceInput } from './services/placeValidation.js'; process.stdout.write(validatePlaceInput({ city: 'Manteca', state: 'California', country: 'United States' }).city);",
      ],
      {
        cwd: join(process.cwd(), "server"),
        encoding: "utf8",
      },
    );

    expect(output).toBe("Manteca");
  });
});

describe("place suggestions", () => {
  it("returns empty suggestions for short queries", () => {
    expect(suggestPlaces("s")).toEqual([]);
    expect(suggestPlaces(" ")).toEqual([]);
  });

  it("suggests Stockton for a city prefix when U.S. context is available", () => {
    expect(suggestPlaces("sto", { timezoneCountry: "US" })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          city: "Stockton",
          region: "California",
          country: "United States",
          label: "Stockton, California, United States",
        }),
      ]),
    );
  });

  it("suggests Modesto for a city prefix", () => {
    expect(suggestPlaces("mod")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          city: "Modesto",
          region: "California",
          country: "United States",
        }),
      ]),
    );
  });

  it("returns multiple San Jose suggestions without resolving ambiguity", () => {
    const suggestions = suggestPlaces("san jose", { limit: 8 });
    expect(suggestions.length).toBeGreaterThan(1);
    expect(suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          city: "San Jose",
          region: "California",
          country: "United States",
        }),
      ]),
    );
  });

  it("uses selected country as an ordering bias without hiding global matches", () => {
    const suggestions = suggestPlaces("london", {
      country: "United Kingdom",
      limit: 8,
    });

    expect(suggestions[0]).toMatchObject({
      city: "London",
      country: "United Kingdom",
    });
    expect(suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          city: "London",
          country: "Canada",
        }),
      ]),
    );
  });

  it("keeps London UK above London California despite soft U.S. hints", () => {
    const suggestions = suggestPlaces("lon", {
      recentCountry: "United States",
      localeCountry: "US",
      timezoneCountry: "US",
      limit: 8,
    });

    expect(suggestions[0]).toMatchObject({
      city: "London",
      country: "United Kingdom",
    });
    const californiaLondonIndex = suggestions.findIndex(
      (suggestion) =>
        suggestion.city === "London" && suggestion.region === "California",
    );
    expect(californiaLondonIndex).toBeGreaterThan(0);
  });

  it("allows explicit California and United States context to rank London California first", () => {
    expect(
      suggestPlaces("lon", {
        country: "United States",
        region: "California",
        limit: 8,
      })[0],
    ).toMatchObject({
      city: "London",
      region: "California",
      country: "United States",
    });
  });

  it("ranks globally recognizable cities for neutral prefixes", () => {
    const parisSuggestions = suggestPlaces("par", {
      timezoneCountry: "US",
      limit: 8,
    });
    const parisIndex = parisSuggestions.findIndex(
      (suggestion) =>
        suggestion.city === "Paris" && suggestion.country === "France",
    );

    expect(parisIndex).toBeGreaterThanOrEqual(0);
    expect(parisIndex).toBeLessThan(3);
    expect(suggestPlaces("lon", { timezoneCountry: "US" })[0]).toMatchObject({
      city: "London",
      country: "United Kingdom",
    });
  });

  it("keeps Paris France above other Paris matches", () => {
    const suggestions = suggestPlaces("paris", { limit: 8 });

    expect(suggestions[0]).toMatchObject({
      city: "Paris",
      country: "France",
    });
  });

  it("uses an explicitly selected country before a shorter out-of-country match", () => {
    const suggestions = suggestPlaces("kyo", {
      country: "Japan",
      limit: 8,
    });

    expect(suggestions[0]).toMatchObject({
      city: "Kyoto",
      country: "Japan",
    });
  });

  it("keeps Stockton prominent with soft U.S. context", () => {
    expect(suggestPlaces("sto", { timezoneCountry: "US" })[0]).toMatchObject({
      city: "Stockton",
      region: "California",
      country: "United States",
    });
  });

  it("uses selected region as an ordering bias inside the same country", () => {
    const suggestions = suggestPlaces("san", {
      country: "United States",
      region: "California",
      limit: 8,
    });

    expect(suggestions.slice(0, 4)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          city: "San Jose",
          region: "California",
          country: "United States",
        }),
      ]),
    );
  });

  it("uses recent-search and locale country hints as soft ordering signals", () => {
    expect(
      suggestPlaces("ky", {
        recentCountry: "Japan",
        limit: 4,
      })[0],
    ).toMatchObject({
      city: "Kyoto",
      country: "Japan",
    });

    expect(
      suggestPlaces("lon", {
        localeCountry: "GB",
        limit: 4,
      })[0],
    ).toMatchObject({
      city: "London",
      country: "United Kingdom",
    });
  });

  it("returns empty suggestions for fake input", () => {
    expect(suggestPlaces("fakecity")).toEqual([]);
    expect(suggestPlaces("asdfasdf")).toEqual([]);
  });

  it("caps suggestion limits", () => {
    expect(suggestPlaces("san", { limit: 100 })).toHaveLength(8);
  });

  it("does not expose full index fields or coordinates", () => {
    const [suggestion] = suggestPlaces("stockton", {
      country: "United States",
      region: "California",
      limit: 1,
    });
    expect(suggestion).toEqual({
      city: "Stockton",
      region: "California",
      regionCode: "CA",
      country: "United States",
      countryCode: "US",
      label: "Stockton, California, United States",
    });
    expect(suggestion).not.toHaveProperty("latitude");
    expect(suggestion).not.toHaveProperty("longitude");
    expect(suggestion).not.toHaveProperty("timezone");
    expect(suggestion).not.toHaveProperty("cityKey");
  });
});
