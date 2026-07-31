import {
	getRestaurantByIdApi,
	RestaurantSearchApiError,
	searchRestaurantsApi,
} from "@/lib/api/restaurants";
import type { LocationState, Restaurant } from "@/store/restaurant-search-store";

const SEARCH_SERVICE_UNAVAILABLE_MESSAGE =
	"We couldn't reach the restaurant search service. Please try again in a moment.";

/**
 * Helper function to calculate distance between two coordinates (in miles)
 */
function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 3959; // Earth's radius in miles
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * Search restaurants based on location using OpenStreetMap (Overpass)
 * and optional category filters (matches cuisine tags).
 */
export async function searchRestaurants(
	location: LocationState,
	selectedCategories: string[],
): Promise<{ restaurants: Restaurant[]; location: LocationState | null }> {
	try {
		const response = await searchRestaurantsApi({
			city: location.city,
			state: location.state,
			country: location.country,
			latitude: location.latitude,
			longitude: location.longitude,
			categories: selectedCategories,
		});

		return {
			restaurants: response.restaurants,
			location: response.location ?? location,
		};
	} catch (error) {
		if (
			error instanceof RestaurantSearchApiError &&
			(error.code === "PLACE_NOT_FOUND" || error.code === "PLACE_AMBIGUOUS")
		) {
			throw error;
		}

		if (!import.meta.env.DEV) {
			throw new RestaurantSearchApiError(
				SEARCH_SERVICE_UNAVAILABLE_MESSAGE,
				"SEARCH_SERVICE_UNAVAILABLE",
			);
		}

		console.warn(
			"Backend restaurant search failed; using development-only local OSM fallback.",
			error,
		);
		const { fetchRestaurantsNearby } = await import("@/lib/api/overpass");
		const { resolveCityLocation: nominatimResolveCity } = await import(
			"@/lib/api/nominatim"
		);

		if (location.latitude === undefined || location.longitude === undefined) {
			const resolved = await nominatimResolveCity(
				[location.city, location.state, location.country]
					.filter(Boolean)
					.join(", "),
			);
			if (resolved?.latitude === undefined || resolved?.longitude === undefined) {
				return { restaurants: [], location: resolved ?? location };
			}
			location = resolved;
		}

		const latitude = location.latitude as number;
		const longitude = location.longitude as number;

		const results = await fetchRestaurantsNearby(
			latitude,
			longitude,
			3000,
		);

		const filtered =
			selectedCategories.length === 0
				? results
				: results.filter((r) =>
						r.categories.some((cat) =>
							selectedCategories.some(
								(sel) =>
									cat.toLowerCase() === sel.toLowerCase() ||
									cat.toLowerCase().includes(sel.toLowerCase()),
							),
						),
					);

		return {
			restaurants: filtered.map((r) => ({
				...r,
				distance:
					location.latitude !== undefined && location.longitude !== undefined
						? calculateDistance(
								location.latitude,
								location.longitude,
								r.latitude,
								r.longitude,
							)
						: undefined,
			})),
			location,
		};
	}
}

export async function getRestaurantById(
	restaurantId: string,
): Promise<Restaurant | null> {
	try {
		return await getRestaurantByIdApi(restaurantId);
	} catch (error) {
		console.warn(
			"Backend restaurant detail failed; unable to load restaurant by id.",
			error,
		);
		throw error;
	}
}

export async function findLocationForCity(
	cityName: string,
): Promise<LocationState | null> {
	const { resolveCityLocation: nominatimResolveCity } = await import(
		"@/lib/api/nominatim"
	);
	return nominatimResolveCity(cityName);
}
