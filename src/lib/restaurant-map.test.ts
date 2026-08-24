import {
	calculateDistanceMiles,
	formatApproxDistanceMiles,
	getRestaurantMapCenter,
	getRestaurantMapPins,
	hasValidMapCoordinate,
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
	it("validates reusable map coordinates", () => {
		expect(hasValidMapCoordinate(37.9577, -121.2908)).toBe(true);
		expect(hasValidMapCoordinate(undefined, -121.2908)).toBe(false);
		expect(hasValidMapCoordinate(37.9577, Number.NaN)).toBe(false);
		expect(hasValidMapCoordinate(0, 0)).toBe(false);
	});

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
				hoursLabel: null,
				distanceLabel: null,
				latitude: 37.9577,
				longitude: -121.2908,
			}),
		]);
	});

	it("adds compact hours context to pins when listing hours are available", () => {
		const pins = getRestaurantMapPins([
			{
				...restaurant,
				hoursStatus: {
					state: "listed_hours_open",
					source: "listed_hours",
					confidence: "medium",
					label: "Likely open · until 10:00 PM",
				},
			},
		]);

		expect(pins[0]).toEqual(
			expect.objectContaining({
				hoursLabel: "Likely open · until 10:00 PM",
			}),
		);
	});

	it("adds approximate distance context when a valid origin is available", () => {
		const pins = getRestaurantMapPins([restaurant], {
			latitude: 37.9577,
			longitude: -121.2908,
			label: "you",
		});

		expect(pins[0]).toEqual(
			expect.objectContaining({
				distanceLabel: "nearby · from you",
			}),
		);
	});

	it("omits distance context when the origin is invalid", () => {
		const pins = getRestaurantMapPins([restaurant], {
			latitude: 0,
			longitude: 0,
			label: "search area",
		});

		expect(pins[0]).toEqual(
			expect.objectContaining({
				distanceLabel: null,
			}),
		);
	});

	it("calculates and formats approximate miles for map context", () => {
		const distance = calculateDistanceMiles(
			37.9577,
			-121.2908,
			37.9677,
			-121.3008,
		);

		expect(distance).toBeGreaterThan(0);
		expect(formatApproxDistanceMiles(0.05)).toBe("nearby");
		expect(formatApproxDistanceMiles(0.84)).toBe("0.8 mi");
		expect(formatApproxDistanceMiles(12.4)).toBe("12 mi");
		expect(formatApproxDistanceMiles(Number.NaN)).toBeNull();
		expect(formatApproxDistanceMiles(-1)).toBeNull();
	});

	it("calculates a simple center from mapped pins", () => {
		const center = getRestaurantMapCenter([
			{
				id: "a",
				name: "A",
				category: null,
				city: null,
				rating: null,
				hoursLabel: null,
				distanceLabel: null,
				latitude: 10,
				longitude: 20,
			},
			{
				id: "b",
				name: "B",
				category: null,
				city: null,
				rating: null,
				hoursLabel: null,
				distanceLabel: null,
				latitude: 30,
				longitude: 40,
			},
		]);

		expect(center).toEqual({ latitude: 20, longitude: 30 });
		expect(getRestaurantMapCenter([])).toBeNull();
	});
});
