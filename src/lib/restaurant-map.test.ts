import {
	getRestaurantMapCenter,
	getRestaurantMapPins,
	hasValidRestaurantCoordinates,
} from "@/lib/restaurant-map";
import type { Restaurant } from "@/store/restaurant-search-store";
import { describe, expect, it } from "vitest";

const restaurant = {
	id: "restaurant-1",
	name: "Mapetite Cafe",
	address: {
		street: "123 Main St",
		city: "Stockton",
		state: "California",
		country: "United States",
		zipCode: "95202",
	},
	rating: 4.5,
	reviewCount: 120,
	categories: ["Cafe"],
	priceRange: 2,
	description: "A restaurant with usable map coordinates.",
	latitude: 37.9577,
	longitude: -121.2908,
	reviews: [],
} satisfies Restaurant;

describe("restaurant map helpers", () => {
	it("accepts finite coordinates inside valid latitude and longitude ranges", () => {
		expect(hasValidRestaurantCoordinates(restaurant)).toBe(true);
	});

	it("rejects invalid, out-of-range, and null-island coordinates", () => {
		expect(
			hasValidRestaurantCoordinates({
				...restaurant,
				latitude: 0,
				longitude: 0,
			}),
		).toBe(false);
		expect(
			hasValidRestaurantCoordinates({
				...restaurant,
				latitude: 91,
			}),
		).toBe(false);
		expect(
			hasValidRestaurantCoordinates({
				...restaurant,
				longitude: -181,
			}),
		).toBe(false);
	});

	it("builds pins only for restaurants with usable coordinates", () => {
		const pins = getRestaurantMapPins([
			restaurant,
			{ ...restaurant, id: "bad", latitude: 0, longitude: 0 },
		]);

		expect(pins).toEqual([
			expect.objectContaining({
				id: "restaurant-1",
				name: "Mapetite Cafe",
				category: "Cafe",
				city: "Stockton",
				latitude: 37.9577,
				longitude: -121.2908,
			}),
		]);
	});

	it("calculates a simple center from mapped pins", () => {
		const center = getRestaurantMapCenter([
			{
				id: "a",
				name: "A",
				category: null,
				city: null,
				rating: null,
				latitude: 10,
				longitude: 20,
			},
			{
				id: "b",
				name: "B",
				category: null,
				city: null,
				rating: null,
				latitude: 30,
				longitude: 40,
			},
		]);

		expect(center).toEqual({ latitude: 20, longitude: 30 });
		expect(getRestaurantMapCenter([])).toBeNull();
	});
});
