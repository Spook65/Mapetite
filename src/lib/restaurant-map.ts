import type { Restaurant } from "@/store/restaurant-search-store";

export interface RestaurantMapPin {
	id: string;
	name: string;
	category: string | null;
	city: string | null;
	rating: number | null;
	hoursLabel: string | null;
	latitude: number;
	longitude: number;
}

export function hasValidRestaurantCoordinates(restaurant: Restaurant) {
	const { latitude, longitude } = restaurant;

	return (
		Number.isFinite(latitude) &&
		Number.isFinite(longitude) &&
		latitude >= -90 &&
		latitude <= 90 &&
		longitude >= -180 &&
		longitude <= 180 &&
		!(latitude === 0 && longitude === 0)
	);
}

export function getRestaurantMapPins(restaurants: Restaurant[]): RestaurantMapPin[] {
	return restaurants
		.filter(hasValidRestaurantCoordinates)
		.map((restaurant) => ({
			id: restaurant.id,
			name: restaurant.name,
			category: restaurant.categories?.[0] ?? null,
			city: restaurant.address?.city ?? null,
			rating: Number.isFinite(restaurant.rating) ? restaurant.rating : null,
			hoursLabel: getRestaurantMapHoursLabel(restaurant),
			latitude: restaurant.latitude,
			longitude: restaurant.longitude,
		}));
}

function getRestaurantMapHoursLabel(restaurant: Restaurant) {
	if (restaurant.hoursStatus?.label) return restaurant.hoursStatus.label;

	const hoursRange =
		restaurant.hours?.open && restaurant.hours?.close
			? `${restaurant.hours.open} - ${restaurant.hours.close}`
			: null;

	if (restaurant.isOpenNow === true) {
		return restaurant.hours?.close
			? `Open now · until ${restaurant.hours.close}`
			: "Open now";
	}

	if (restaurant.isOpenNow === false) {
		return hoursRange ? "Closed now · hours listed" : "Closed now";
	}

	return hoursRange ? `Hours listed · ${hoursRange}` : null;
}

export function getRestaurantMapCenter(pins: RestaurantMapPin[]) {
	if (pins.length === 0) return null;

	const totals = pins.reduce(
		(accumulator, pin) => ({
			latitude: accumulator.latitude + pin.latitude,
			longitude: accumulator.longitude + pin.longitude,
		}),
		{ latitude: 0, longitude: 0 },
	);

	return {
		latitude: totals.latitude / pins.length,
		longitude: totals.longitude / pins.length,
	};
}
