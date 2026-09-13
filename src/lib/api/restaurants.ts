import type { LocationState, Restaurant } from "@/store/restaurant-search-store";
import type { PlaceSuggestionContext } from "@/lib/place-suggestion-context";

const SEARCH_PERF_DEBUG = import.meta.env.VITE_SEARCH_PERF_DEBUG === "true";
let hasAttemptedRestaurantApiWarmup = false;

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

export type PlaceSearchSuggestion = {
	city: string;
	region?: string;
	regionCode?: string;
	country: string;
	countryCode?: string;
	label?: string;
};

export class PlaceSuggestionRateLimitError extends Error {
	retryAfterSeconds: number;

	constructor(retryAfterSeconds = 60) {
		super("Suggestions paused. You can still search.");
		this.name = "PlaceSuggestionRateLimitError";
		this.retryAfterSeconds = retryAfterSeconds;
	}
}

export class RestaurantSearchApiError extends Error {
	code?: string;
	suggestions: PlaceSearchSuggestion[];

	constructor(message: string, code?: string, suggestions: PlaceSearchSuggestion[] = []) {
		super(message);
		this.name = "RestaurantSearchApiError";
		this.code = code;
		this.suggestions = suggestions;
	}
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

function getPerfTime() {
	return typeof performance !== "undefined" && typeof performance.now === "function"
		? performance.now()
		: Date.now();
}

function debugSearchPerf(label: string, meta: Record<string, unknown> = {}) {
	if (!SEARCH_PERF_DEBUG) return;
	console.debug(`[SearchPerf] ${label}`, meta);
}

export function warmRestaurantsApiHealth() {
	if (hasAttemptedRestaurantApiWarmup) return;
	hasAttemptedRestaurantApiWarmup = true;

	let baseUrl: string;
	try {
		baseUrl = getRestaurantsApiBaseUrl();
	} catch {
		return;
	}

	const controller = new AbortController();
	const timeoutId = window.setTimeout(() => controller.abort(), 8_000);

	fetch(`${baseUrl}/health`, {
		headers: {
			Accept: "application/json",
		},
		signal: controller.signal,
	})
		.catch(() => {
			// Warmup is best-effort only. Real search requests still surface errors.
		})
		.finally(() => window.clearTimeout(timeoutId));
}

export async function searchRestaurantsApi(
	request: RestaurantSearchRequest,
): Promise<RestaurantSearchResponse> {
	const startedAt = getPerfTime();
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

	debugSearchPerf("request_start", {
		city: request.city || "",
		state: request.state || "",
		country: request.country || "",
		hasCoordinates:
			typeof request.latitude === "number" &&
			typeof request.longitude === "number",
		categories: request.categories?.length ?? 0,
	});

	const response = await fetch(url.toString(), {
		headers: {
			Accept: "application/json",
		},
	});
	debugSearchPerf("response_received", {
		status: response.status,
		duration_ms: Math.round(getPerfTime() - startedAt),
	});

	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		debugSearchPerf("error_shown", {
			status: response.status,
			duration_ms: Math.round(getPerfTime() - startedAt),
			code: typeof errorBody.error === "string" ? errorBody.error : undefined,
		});
		throw new RestaurantSearchApiError(
			errorBody.message || `Restaurant search failed: ${response.statusText}`,
			typeof errorBody.error === "string" ? errorBody.error : undefined,
			Array.isArray(errorBody.suggestions) ? errorBody.suggestions : [],
		);
	}

	const parseStartedAt = getPerfTime();
	const data = (await response.json()) as RestaurantSearchApiPayload;
	debugSearchPerf("response_parsed", {
		parse_ms: Math.round(getPerfTime() - parseStartedAt),
		total_ms: Math.round(getPerfTime() - startedAt),
	});
	const restaurants = data.restaurants ?? data.results ?? [];
	debugSearchPerf("results_received", {
		total_ms: Math.round(getPerfTime() - startedAt),
		restaurants: restaurants.length,
		count: typeof data.count === "number" ? data.count : restaurants.length,
	});
	return {
		restaurants,
		location: data.location ?? null,
		count: typeof data.count === "number" ? data.count : restaurants.length,
	};
}

export async function suggestPlacesApi(
	query: string,
	options: { limit?: number; signal?: AbortSignal } & PlaceSuggestionContext = {},
): Promise<PlaceSearchSuggestion[]> {
	const trimmedQuery = query.trim();
	if (trimmedQuery.length < 2) return [];

	const url = new URL(`${getRestaurantsApiBaseUrl()}/api/places/suggest`);
	url.searchParams.set("q", trimmedQuery);
	appendIfDefined(url.searchParams, "limit", options.limit);
	appendIfDefined(url.searchParams, "country", options.country);
	appendIfDefined(url.searchParams, "region", options.region);
	appendIfDefined(url.searchParams, "recentCountry", options.recentCountry);
	appendIfDefined(url.searchParams, "recentRegion", options.recentRegion);
	appendIfDefined(url.searchParams, "localeCountry", options.localeCountry);
	appendIfDefined(url.searchParams, "timezoneCountry", options.timezoneCountry);

	const response = await fetch(url.toString(), {
		headers: {
			Accept: "application/json",
		},
		signal: options.signal,
	});

	if (response.status === 429) {
		const retryAfterHeader = Number(response.headers?.get?.("Retry-After"));
		const errorBody = (await response.json().catch(() => ({}))) as {
			retryAfterSeconds?: unknown;
		};
		const retryAfterBody = Number(errorBody.retryAfterSeconds);
		const retryAfterSeconds =
			Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
				? retryAfterHeader
				: Number.isFinite(retryAfterBody) && retryAfterBody > 0
					? retryAfterBody
					: 60;
		throw new PlaceSuggestionRateLimitError(retryAfterSeconds);
	}

	if (!response.ok) return [];

	const data = (await response.json().catch(() => ({}))) as {
		suggestions?: unknown;
	};
	if (!Array.isArray(data.suggestions)) return [];

	return data.suggestions
		.map((suggestion): PlaceSearchSuggestion | null => {
			if (!suggestion || typeof suggestion !== "object") return null;
			const candidate = suggestion as Partial<PlaceSearchSuggestion>;
			if (typeof candidate.city !== "string" || !candidate.city.trim()) {
				return null;
			}
			if (typeof candidate.country !== "string" || !candidate.country.trim()) {
				return null;
			}

			return {
				city: candidate.city,
				region:
					typeof candidate.region === "string" ? candidate.region : undefined,
				regionCode:
					typeof candidate.regionCode === "string"
						? candidate.regionCode
						: undefined,
				country: candidate.country,
				countryCode:
					typeof candidate.countryCode === "string"
						? candidate.countryCode
						: undefined,
				label:
					typeof candidate.label === "string" ? candidate.label : undefined,
			};
		})
		.filter((suggestion): suggestion is PlaceSearchSuggestion =>
			Boolean(suggestion),
		);
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
