const NEARBY_CITY_MISMATCH_MAX_MILES = 18;
const MISSING_CITY_MAX_MILES = 25;

function normalizeCityToken(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasSearchCity(location = {}) {
  return Boolean(normalizeCityToken(location.city));
}

function formatCityLocation(address = {}) {
  return [address.city, address.state || address.country].filter(Boolean).join(", ");
}

function isFiniteDistance(value) {
  return Number.isFinite(value) && value >= 0;
}

export function classifyRestaurantCityScope(restaurant = {}, location = {}) {
  if (!hasSearchCity(location)) {
    return undefined;
  }

  const requestedCity = normalizeCityToken(location.city);
  const restaurantCity = normalizeCityToken(restaurant.address?.city);
  const distance = restaurant.distance;

  if (restaurantCity && restaurantCity === requestedCity) {
    return {
      state: "exact_city",
      label: `${location.city} result`,
    };
  }

  if (restaurantCity) {
    if (
      isFiniteDistance(distance) &&
      distance <= NEARBY_CITY_MISMATCH_MAX_MILES
    ) {
      return {
        state: "nearby_city",
        label: `Nearby · ${formatCityLocation(restaurant.address)}`,
      };
    }

    return {
      state: "out_of_area",
      label: `Outside ${location.city} area · ${formatCityLocation(restaurant.address)}`,
    };
  }

  if (isFiniteDistance(distance) && distance > MISSING_CITY_MAX_MILES) {
    return {
      state: "out_of_area",
      label: `Outside ${location.city} area`,
    };
  }

  return {
    state: "city_unknown",
    label: "City not listed by source",
  };
}

export function applyRestaurantCityScope(restaurants = [], location = {}) {
  const counts = {
    exactCity: 0,
    nearbyCity: 0,
    cityUnknown: 0,
    outOfArea: 0,
  };

  const scopedRestaurants = restaurants
    .map((restaurant) => {
      const cityScope = classifyRestaurantCityScope(restaurant, location);
      if (!cityScope) return restaurant;

      if (cityScope.state === "exact_city") counts.exactCity += 1;
      if (cityScope.state === "nearby_city") counts.nearbyCity += 1;
      if (cityScope.state === "city_unknown") counts.cityUnknown += 1;
      if (cityScope.state === "out_of_area") counts.outOfArea += 1;

      return {
        ...restaurant,
        cityScope,
      };
    })
    .filter((restaurant) => restaurant.cityScope?.state !== "out_of_area");

  return {
    restaurants: scopedRestaurants,
    meta: {
      ...counts,
      returnedCount: scopedRestaurants.length,
    },
  };
}
