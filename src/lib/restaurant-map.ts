import type { Restaurant } from "@/store/restaurant-search-store";

export interface RestaurantMapPin {
	id: string;
	name: string;
	category: string | null;
	city: string | null;
	rating: number | null;
	hoursLabel: string | null;
	distanceLabel: string | null;
	latitude: number;
	longitude: number;
}

export interface RestaurantMapDistanceOrigin {
	latitude: number;
	longitude: number;
	label: "you" | "search center";
	displayName?: string | null;
}

const EARTH_RADIUS_MILES = 3958.8;

export function hasValidMapCoordinate(latitude?: number, longitude?: number) {
	return (
		Number.isFinite(latitude) &&
		Number.isFinite(longitude) &&
		latitude! >= -90 &&
		latitude! <= 90 &&
		longitude! >= -180 &&
		longitude! <= 180 &&
		!(latitude === 0 && longitude === 0)
	);
}

export function hasValidRestaurantCoordinates(restaurant: Restaurant) {
	const { latitude, longitude } = restaurant;

	return hasValidMapCoordinate(latitude, longitude);
}

export function getRestaurantMapPins(
	restaurants: Restaurant[],
	distanceOrigin?: RestaurantMapDistanceOrigin | null,
): RestaurantMapPin[] {
	return restaurants
		.filter(hasValidRestaurantCoordinates)
		.map((restaurant) => ({
			id: restaurant.id,
			name: restaurant.name,
			category: restaurant.categories?.[0] ?? null,
			city: restaurant.address?.city ?? null,
			rating: Number.isFinite(restaurant.rating) ? restaurant.rating : null,
			hoursLabel: getRestaurantMapHoursLabel(restaurant),
			distanceLabel: getRestaurantMapDistanceLabel(restaurant, distanceOrigin),
			latitude: restaurant.latitude,
			longitude: restaurant.longitude,
		}));
}

export function calculateDistanceMiles(
	originLatitude: number,
	originLongitude: number,
	destinationLatitude: number,
	destinationLongitude: number,
) {
	const originLatRadians = toRadians(originLatitude);
	const destinationLatRadians = toRadians(destinationLatitude);
	const latitudeDelta = toRadians(destinationLatitude - originLatitude);
	const longitudeDelta = toRadians(destinationLongitude - originLongitude);

	const haversine =
		Math.sin(latitudeDelta / 2) ** 2 +
		Math.cos(originLatRadians) *
			Math.cos(destinationLatRadians) *
			Math.sin(longitudeDelta / 2) ** 2;

	return (
		EARTH_RADIUS_MILES *
		2 *
		Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
	);
}

export function formatApproxDistanceMiles(distanceMiles: number) {
	if (!Number.isFinite(distanceMiles) || distanceMiles < 0) return null;
	if (distanceMiles < 0.1) return "nearby";
	if (distanceMiles < 10) return `${distanceMiles.toFixed(1)} mi`;
	return `${Math.round(distanceMiles).toLocaleString()} mi`;
}

function getRestaurantMapDistanceLabel(
	restaurant: Restaurant,
	origin?: RestaurantMapDistanceOrigin | null,
) {
	if (
		!origin ||
		!hasValidMapCoordinate(origin.latitude, origin.longitude) ||
		!hasValidRestaurantCoordinates(restaurant)
	) {
		return null;
	}

	const distance = calculateDistanceMiles(
		origin.latitude,
		origin.longitude,
		restaurant.latitude,
		restaurant.longitude,
	);
	const formattedDistance = formatApproxDistanceMiles(distance);
	if (!formattedDistance) return null;

	const originLabel =
		origin.label === "you"
			? "from you"
			: origin.displayName
				? `from ${origin.displayName} center`
				: "from search center";
	return formattedDistance === "nearby"
		? `nearby · ${originLabel}`
		: `approx. ${formattedDistance} ${originLabel}`;
}

function toRadians(degrees: number) {
	return (degrees * Math.PI) / 180;
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
