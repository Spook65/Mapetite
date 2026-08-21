import { getRestaurantResultReasons } from "@/lib/restaurant-result-reasons";
import type { Restaurant } from "@/store/restaurant-search-store";
import { describe, expect, it } from "vitest";

const baseRestaurant: Restaurant = {
	id: "restaurant-1",
	name: "Tequileros Taqueria",
	address: {
		street: "123 Main St",
		city: "Stockton",
		state: "California",
		country: "United States",
		zipCode: "95202",
	},
	rating: 4.4,
	reviewCount: 174,
	categories: ["Mexican"],
	priceRange: 2,
	description: "A Mexican option in Stockton with available listing details.",
	latitude: 37.9577,
	longitude: -121.2908,
	reviews: [],
	hours: {
		open: "10:00",
		close: "22:00",
	},
	hoursStatus: {
		state: "listed_hours_open",
		source: "listed_hours",
		confidence: "medium",
		label: "Likely open · until 10:00 PM",
		closesAt: "22:00",
		timezone: "America/Los_Angeles",
	},
	galleryImageUrls: ["https://example.com/photo.jpg"],
	phone: "+12095550123",
	website: "https://example.com",
	menuUrl: "https://example.com/menu",
	source: "geoapify",
};

describe("restaurant result reasons", () => {
	it("summarizes useful public listing signals without exposing scores", () => {
		const reasons = getRestaurantResultReasons(baseRestaurant);

		expect(reasons.helpful).toContain("Likely open from listed hours");
		expect(reasons.helpful).toContain("4.4 rating · 174 reviews");
		expect(reasons.helpful).toContain("Address + directions available");
		expect(reasons.helpful).not.toContain("Best choice");
		expect(reasons.cautions).not.toContain("Menu link unavailable");
	});

	it("adds cautious missing-data notes without inventing menu or photo claims", () => {
		const reasons = getRestaurantResultReasons({
			...baseRestaurant,
			hours: undefined,
			hoursStatus: {
				state: "unavailable",
				source: "none",
				confidence: "low",
				label: "Hours unavailable",
			},
			galleryImageUrls: [],
			phone: undefined,
			website: undefined,
			menuUrl: undefined,
		});

		expect(reasons.cautions).toContain("Hours unavailable");
		expect(reasons.cautions).toContain("Limited photo coverage");
		expect(reasons.cautions).toContain("Menu link unavailable");
		expect(reasons.helpful).not.toContain("Menu link available");
		expect(reasons.helpful).not.toContain("Photos available");
	});

	it("uses honest labels for closed and unevaluated listed hours", () => {
		const closedReasons = getRestaurantResultReasons({
			...baseRestaurant,
			hoursStatus: {
				state: "listed_hours_closed",
				source: "listed_hours",
				confidence: "medium",
				label: "Closed based on listed hours",
			},
		});
		const unknownReasons = getRestaurantResultReasons({
			...baseRestaurant,
			hoursStatus: {
				state: "listed_hours_unknown",
				source: "listed_hours",
				confidence: "low",
				label: "Hours listed",
			},
		});

		expect(closedReasons.cautions).toContain("Closed based on listed hours");
		expect(unknownReasons.cautions).toContain("Hours listed but not evaluated");
	});

	it("caps reasons so the detail page stays compact", () => {
		const reasons = getRestaurantResultReasons(baseRestaurant);

		expect(reasons.helpful.length).toBeLessThanOrEqual(4);
		expect(reasons.cautions.length).toBeLessThanOrEqual(3);
	});
});
