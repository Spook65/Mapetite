import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PlaceValidationError, validatePlaceInput } from "./placeValidation.js";

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
