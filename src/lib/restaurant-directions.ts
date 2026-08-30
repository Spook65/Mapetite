import { hasValidMapCoordinate } from "@/lib/restaurant-map";
import type { Restaurant } from "@/store/restaurant-search-store";

function joinAddressParts(parts: Array<string | null | undefined>) {
	return parts
		.map((part) => part?.trim())
		.filter(Boolean)
		.join(", ");
}

export function buildRestaurantAddressLine(restaurant: Restaurant) {
	const address = restaurant.address;
	if (!address) return "";
	const cityRegion = [address.city, address.state, address.zipCode]
		.map((part) => part?.trim())
		.filter(Boolean)
		.join(" ");

	return joinAddressParts([
		address.street,
		cityRegion,
		address.country,
	]);
}

export function buildDirectionsDestination(restaurant: Restaurant) {
	if (hasValidMapCoordinate(restaurant.latitude, restaurant.longitude)) {
		return `${restaurant.latitude},${restaurant.longitude}`;
	}

	const address = buildRestaurantAddressLine(restaurant);
	return address || null;
}

export function hasDirectionsDestination(restaurant: Restaurant) {
	return buildDirectionsDestination(restaurant) != null;
}

export function buildGoogleMapsDirectionsUrl(restaurant: Restaurant) {
	const destination = buildDirectionsDestination(restaurant);
	if (!destination) return null;

	return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export function buildOpenStreetMapLocationUrl(restaurant: Restaurant) {
	if (hasValidMapCoordinate(restaurant.latitude, restaurant.longitude)) {
		return `https://www.openstreetmap.org/?mlat=${restaurant.latitude}&mlon=${restaurant.longitude}#map=18/${restaurant.latitude}/${restaurant.longitude}`;
	}

	const address = buildRestaurantAddressLine(restaurant);
	if (!address) return null;

	return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
}
