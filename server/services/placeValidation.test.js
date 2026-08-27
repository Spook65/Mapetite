import { describe, expect, it } from "vitest";
import { PlaceValidationError, validatePlaceInput } from "./placeValidation.js";

describe("place validation", () => {
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

  it("rejects fake cities that are not in the compact validation index", () => {
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
});
