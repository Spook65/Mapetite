import { describe, expect, it } from "vitest";
import {
  applyRestaurantCityScope,
  classifyRestaurantCityScope,
} from "./restaurantCityScope.js";

const STOCKTON = {
  city: "Stockton",
  state: "California",
  country: "United States",
  latitude: 37.9577,
  longitude: -121.2908,
};

function restaurant(overrides = {}) {
  const { address = {}, ...rest } = overrides;

  return {
    id: "restaurant-1",
    name: "Mapetite Cafe",
    address: {
      street: "123 Main St",
      city: "Stockton",
      state: "California",
      country: "United States",
      zipCode: "",
      ...address,
    },
    distance: 1,
    ...rest,
  };
}

describe("restaurant city scope", () => {
  it("keeps exact city matches with a normal result scope", () => {
    expect(
      classifyRestaurantCityScope(restaurant(), STOCKTON),
    ).toEqual({
      state: "exact_city",
      label: "Stockton result",
    });
  });

  it("matches searched city case-insensitively", () => {
    const scope = classifyRestaurantCityScope(
      restaurant({ address: { city: "stockton" } }),
      STOCKTON,
    );

    expect(scope?.state).toBe("exact_city");
  });

  it("keeps nearby city mismatches with an honest nearby label", () => {
    expect(
      classifyRestaurantCityScope(
        restaurant({
          address: { city: "Lodi", state: "California" },
          distance: 13,
        }),
        STOCKTON,
      ),
    ).toEqual({
      state: "nearby_city",
      label: "Nearby · Lodi, California",
    });
  });

  it("marks far city mismatches as out of area", () => {
    const scope = classifyRestaurantCityScope(
      restaurant({
        address: { city: "Sacramento", state: "California" },
        distance: 48,
      }),
      STOCKTON,
    );

    expect(scope?.state).toBe("out_of_area");
  });

  it("keeps missing-city results conservatively when they are close", () => {
    const scope = classifyRestaurantCityScope(
      restaurant({
        address: { city: "" },
        distance: 2,
      }),
      STOCKTON,
    );

    expect(scope).toEqual({
      state: "city_unknown",
      label: "City not listed by source",
    });
  });

  it("filters clearly far out-of-area restaurants", () => {
    const result = applyRestaurantCityScope(
      [
        restaurant({ id: "stockton" }),
        restaurant({
          id: "nearby",
          address: { city: "Manteca", state: "California" },
          distance: 13,
        }),
        restaurant({
          id: "far",
          address: { city: "Sacramento", state: "California" },
          distance: 48,
        }),
      ],
      STOCKTON,
    );

    expect(result.restaurants.map((item) => item.id)).toEqual([
      "stockton",
      "nearby",
    ]);
    expect(result.meta).toEqual({
      exactCity: 1,
      nearbyCity: 1,
      cityUnknown: 0,
      outOfArea: 1,
      returnedCount: 2,
    });
  });
});
