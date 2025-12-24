import { fetchRestaurantsNearby } from "@/lib/api/overpass";
import {
	resolveCityLocation as nominatimResolveCity,
	searchCities,
} from "@/lib/api/nominatim";
import type { LocationState, Restaurant } from "@/store/restaurant-search-store";

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
): Promise<Restaurant[]> {
	if (!location.latitude || !location.longitude) return [];

	const results = await fetchRestaurantsNearby(
		location.latitude,
		location.longitude,
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

	// Add distance from user location if coordinates exist
	return filtered.map((r) => ({
		...r,
		distance:
			location.latitude && location.longitude
				? calculateDistance(
						location.latitude,
						location.longitude,
						r.latitude,
						r.longitude,
					)
				: undefined,
	}));
}

export async function findLocationForCity(
	cityName: string,
): Promise<LocationState | null> {
	return nominatimResolveCity(cityName);
}

export { resolveCityLocation } from "@/lib/api/nominatim";
export { searchCities } from "@/lib/api/nominatim";
