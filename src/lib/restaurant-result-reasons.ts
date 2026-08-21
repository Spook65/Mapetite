import type { Restaurant } from "@/store/restaurant-search-store";

export interface RestaurantResultReasons {
	helpful: string[];
	cautions: string[];
	summary: string;
	note: string;
}

const MAX_HELPFUL_REASONS = 6;
const MAX_CAUTION_REASONS = 4;

function hasText(value?: string | null) {
	return typeof value === "string" && value.trim().length > 0;
}

function hasCoordinates(restaurant: Restaurant) {
	return (
		Number.isFinite(restaurant.latitude) &&
		Number.isFinite(restaurant.longitude) &&
		!(restaurant.latitude === 0 && restaurant.longitude === 0)
	);
}

function addUnique(target: string[], reason: string) {
	if (!target.includes(reason)) {
		target.push(reason);
	}
}

function addHoursReason(restaurant: Restaurant, helpful: string[], cautions: string[]) {
	const state = restaurant.hoursStatus?.state;

	if (state === "confirmed_open") {
		addUnique(helpful, "Open now from listing data");
		return;
	}

	if (state === "listed_hours_open") {
		addUnique(helpful, "Likely open from listed hours");
		return;
	}

	if (state === "confirmed_closed") {
		addUnique(cautions, "Currently shown as closed");
		return;
	}

	if (state === "listed_hours_closed") {
		addUnique(cautions, "Closed based on listed hours");
		return;
	}

	if (state === "listed_hours_unknown") {
		addUnique(cautions, "Hours listed but not evaluated");
		return;
	}

	if (state === "unavailable") {
		addUnique(cautions, "Hours unavailable");
		return;
	}

	if (restaurant.isOpenNow === true) {
		addUnique(helpful, "Open now from listing data");
		return;
	}

	if (restaurant.isOpenNow === false) {
		addUnique(cautions, "Currently shown as closed");
		return;
	}

	if (restaurant.hours?.open && restaurant.hours?.close) {
		addUnique(helpful, "Hours available");
		return;
	}

	addUnique(cautions, "Hours unavailable");
}

export function getRestaurantResultReasons(
	restaurant: Restaurant,
): RestaurantResultReasons {
	const helpful: string[] = [];
	const cautions: string[] = [];

	addHoursReason(restaurant, helpful, cautions);

	if (Number.isFinite(restaurant.rating)) {
		addUnique(helpful, "Rating available");
	}

	if (restaurant.reviewCount >= 100) {
		addUnique(helpful, "Good review volume");
	} else if (restaurant.reviewCount > 0) {
		addUnique(helpful, "Review history available");
	} else {
		addUnique(cautions, "Review count limited");
	}

	if (hasText(restaurant.address?.street) && hasText(restaurant.address?.city)) {
		addUnique(helpful, "Address available");
	} else {
		addUnique(cautions, "Address details limited");
	}

	if (hasCoordinates(restaurant)) {
		addUnique(helpful, "Route details available");
	}

	if ((restaurant.categories ?? []).length > 0) {
		addUnique(helpful, "Category fits restaurant search");
	}

	if ((restaurant.galleryImageUrls ?? []).filter(Boolean).length > 0) {
		addUnique(helpful, "Photos available");
	} else {
		addUnique(cautions, "Limited photo coverage");
	}

	if (restaurant.menuUrl) {
		addUnique(helpful, "Menu link available");
	} else {
		addUnique(cautions, "Menu link unavailable");
	}

	if (restaurant.website) {
		addUnique(helpful, "Website available");
	} else {
		addUnique(cautions, "Website unavailable");
	}

	if (restaurant.phone) {
		addUnique(helpful, "Phone available");
	} else {
		addUnique(cautions, "Phone unavailable");
	}

	const cappedCautions = cautions.slice(0, MAX_CAUTION_REASONS);
	if (cappedCautions.length === 0) {
		cappedCautions.push("Confirm details before going");
	}

	return {
		helpful: helpful.slice(0, MAX_HELPFUL_REASONS),
		cautions: cappedCautions,
		summary: "This place has several useful public listing signals.",
		note: "These notes are based on available public listing data, not a claimed-business profile. Confirm details before going.",
	};
}
