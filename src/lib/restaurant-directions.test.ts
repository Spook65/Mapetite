import {
	buildDirectionsDestination,
	buildGoogleMapsDirectionsUrl,
	buildOpenStreetMapLocationUrl,
	hasDirectionsDestination,
} from "@/lib/restaurant-directions";
import type { Restaurant } from "@/store/restaurant-search-store";
import { describe, expect, it } from "vitest";

function makeRestaurant(overrides: Partial<Restaurant> = {}): Restaurant {
	return {
		id: "test-restaurant",
		name: "Test Restaurant",
		address: {
			street: "123 Main St",
			city: "Stockton",
			state: "California",
			country: "United States",
			zipCode: "95202",
		},
		rating: 4.5,
		reviewCount: 120,
		categories: ["Mexican"],
		priceRange: 2,
		description: "A test restaurant.",
		latitude: 37.9577,
		longitude: -121.2908,
		reviews: [],
		...overrides,
	};
}

describe("restaurant directions helpers", () => {
	it("uses valid coordinates as the Google Maps destination first", () => {
		const restaurant = makeRestaurant();

		expect(buildDirectionsDestination(restaurant)).toBe("37.9577,-121.2908");
		expect(buildGoogleMapsDirectionsUrl(restaurant)).toBe(
			"https://www.google.com/maps/dir/?api=1&destination=37.9577%2C-121.2908",
		);
	});

	it("falls back to the full address when coordinates are missing", () => {
		const restaurant = makeRestaurant({
			latitude: Number.NaN,
			longitude: Number.NaN,
		});

		expect(buildDirectionsDestination(restaurant)).toBe(
			"123 Main St, Stockton California 95202, United States",
		);
		expect(buildGoogleMapsDirectionsUrl(restaurant)).toBe(
			"https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St%2C%20Stockton%20California%2095202%2C%20United%20States",
		);
	});

	it("rejects 0,0 coordinates and uses address fallback", () => {
		const restaurant = makeRestaurant({
			latitude: 0,
			longitude: 0,
		});

		expect(buildDirectionsDestination(restaurant)).toBe(
			"123 Main St, Stockton California 95202, United States",
		);
	});

	it("returns null when neither coordinates nor address are usable", () => {
		const restaurant = makeRestaurant({
			address: {
				street: "",
				city: "",
				state: "",
				country: "",
				zipCode: "",
			},
			latitude: Number.NaN,
			longitude: Number.NaN,
		});

		expect(hasDirectionsDestination(restaurant)).toBe(false);
		expect(buildDirectionsDestination(restaurant)).toBeNull();
		expect(buildGoogleMapsDirectionsUrl(restaurant)).toBeNull();
		expect(buildOpenStreetMapLocationUrl(restaurant)).toBeNull();
	});

	it("keeps OpenStreetMap as a secondary location link when available", () => {
		const restaurant = makeRestaurant();

		expect(buildOpenStreetMapLocationUrl(restaurant)).toBe(
			"https://www.openstreetmap.org/?mlat=37.9577&mlon=-121.2908#map=18/37.9577/-121.2908",
		);
	});
});
