import type {
	LocationState,
	Restaurant,
} from "@/store/restaurant-search-store";

function getRestaurantsApiBaseUrl() {
	const configuredBaseUrl = import.meta.env.VITE_RESTAURANTS_API_BASE_URL;
	if (configuredBaseUrl) {
		return configuredBaseUrl;
	}

	if (import.meta.env.DEV) {
		return "http://127.0.0.1:5001";
	}

	throw new Error(
		"VITE_RESTAURANTS_API_BASE_URL is required for deployed restaurant API calls.",
	);
}

export interface RestaurantSearchRequest {
	city?: string;
	state?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
	radiusMeters?: number;
	categories?: string[];
}

export interface RestaurantSearchResponse {
	restaurants: Restaurant[];
	location?: LocationState | null;
	count?: number;
}

export interface RestaurantDetailResponse {
	restaurant: Restaurant | null;
}

type RestaurantSearchApiPayload = {
	restaurants?: Restaurant[];
	results?: Restaurant[];
	location?: LocationState | null;
	count?: number;
};

function appendIfDefined(params: URLSearchParams, key: string, value: unknown) {
	if (value === undefined || value === null || value === "") {
		return;
	}

	params.set(key, String(value));
}

export async function searchRestaurantsApi(
	request: RestaurantSearchRequest,
): Promise<RestaurantSearchResponse> {
	const url = new URL(`${getRestaurantsApiBaseUrl()}/api/restaurants/search`);
	appendIfDefined(url.searchParams, "city", request.city);
	appendIfDefined(url.searchParams, "state", request.state);
	appendIfDefined(url.searchParams, "country", request.country);
	appendIfDefined(url.searchParams, "latitude", request.latitude);
	appendIfDefined(url.searchParams, "longitude", request.longitude);
	appendIfDefined(url.searchParams, "radiusMeters", request.radiusMeters);

	if (request.categories && request.categories.length > 0) {
		url.searchParams.set("categories", request.categories.join(","));
	}

	const response = await fetch(url.toString(), {
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		throw new Error(
			errorBody.message || `Restaurant search failed: ${response.statusText}`,
		);
	}

	const data = (await response.json()) as RestaurantSearchApiPayload;
	const restaurants = data.restaurants ?? data.results ?? [];
	return {
		restaurants,
		location: data.location ?? null,
		count: typeof data.count === "number" ? data.count : restaurants.length,
	};
}

export async function getRestaurantByIdApi(
	restaurantId: string,
): Promise<Restaurant | null> {
	const response = await fetch(
		`${getRestaurantsApiBaseUrl()}/api/restaurants/${encodeURIComponent(restaurantId)}`,
		{
			headers: {
				Accept: "application/json",
			},
		},
	);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		throw new Error(
			errorBody.message || `Restaurant detail failed: ${response.statusText}`,
		);
	}

	const data = (await response.json()) as RestaurantDetailResponse | Restaurant;
	if ("restaurant" in data) {
		return data.restaurant;
	}

	return data as Restaurant;
}
