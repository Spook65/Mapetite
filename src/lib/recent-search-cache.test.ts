import { describe, expect, it } from "vitest";
import type { Restaurant } from "@/store/restaurant-search-store";
import {
	LAST_SEARCH_TTL_MS,
	buildSearchDisplayLabel,
	clearRecentSearches,
	isTypedPlaceSearch,
	loadLastSearchSnapshot,
	loadRecentSearches,
	saveLastSearchSnapshot,
	saveRecentSearch,
} from "@/lib/recent-search-cache";

function createMemoryStorage(initial: Record<string, string> = {}) {
	const store = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => store.get(key) ?? null,
		removeItem: (key: string) => {
			store.delete(key);
		},
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		dump: () => Object.fromEntries(store.entries()),
	};
}

function createRestaurant(overrides: Partial<Restaurant> = {}): Restaurant {
	return {
		id: overrides.id ?? "restaurant-1",
		name: overrides.name ?? "Demo Restaurant",
		address: {
			street: "123 Main St",
			city: "Stockton",
			state: "California",
			country: "United States",
			zipCode: "95202",
			...overrides.address,
		},
		rating: 4.5,
		reviewCount: 120,
		categories: ["Mexican"],
		priceRange: 2,
		description: "A restaurant from the current search.",
		latitude: 37.95,
		longitude: -121.29,
		reviews: [
			{
				id: "review-1",
				author: "Guest 1",
				rating: 5,
				comment: "Generated review text should not be stored.",
				date: "2026-01-01",
			},
		],
		galleryImageUrls: ["https://example.com/large-photo.jpg"],
		galleryPhotoAttributions: [["Example"]],
		ratingBreakdown: { 5: 10, 4: 4, 3: 2, 2: 1, 1: 0 },
		...overrides,
	};
}

describe("recent search cache", () => {
	it("builds a display label from place fields", () => {
		expect(
			buildSearchDisplayLabel({
				city: "Stockton",
				state: "California",
				country: "United States",
			}),
		).toBe("Stockton, California, United States");
	});

	it("detects typed place searches without requiring coordinates", () => {
		expect(isTypedPlaceSearch({ city: "Stockton" })).toBe(true);
		expect(isTypedPlaceSearch({ latitude: 37.95, longitude: -121.29 })).toBe(false);
	});

	it("saves typed city searches with most recent first", () => {
		const storage = createMemoryStorage();
		saveRecentSearch(
			{ city: "Stockton", state: "California", country: "United States" },
			{ storage, now: 100, resultCount: 40 },
		);
		saveRecentSearch(
			{ city: "Modesto", state: "California", country: "United States" },
			{ storage, now: 200, resultCount: 36 },
		);

		expect(loadRecentSearches(storage).map((entry) => entry.city)).toEqual([
			"Modesto",
			"Stockton",
		]);
		expect(loadRecentSearches(storage)[0]?.resultCount).toBe(36);
	});

	it("deduplicates same city, region, and country", () => {
		const storage = createMemoryStorage();
		saveRecentSearch(
			{ city: "Stockton", state: "California", country: "United States" },
			{ storage, now: 100 },
		);
		saveRecentSearch(
			{ city: " stockton ", state: "california", country: "united states" },
			{ storage, now: 200 },
		);

		const recent = loadRecentSearches(storage);
		expect(recent).toHaveLength(1);
		expect(recent[0]?.timestamp).toBe(200);
	});

	it("caps recent searches", () => {
		const storage = createMemoryStorage();
		for (let index = 0; index < 8; index += 1) {
			saveRecentSearch(
				{ city: `City ${index}`, state: "California", country: "United States" },
				{ storage, now: index, limit: 5 },
			);
		}

		expect(loadRecentSearches(storage)).toHaveLength(5);
		expect(loadRecentSearches(storage)[0]?.city).toBe("City 7");
	});

	it("clears recent searches", () => {
		const storage = createMemoryStorage();
		saveRecentSearch({ city: "Stockton" }, { storage });
		clearRecentSearches(storage);
		expect(loadRecentSearches(storage)).toEqual([]);
	});

	it("handles malformed JSON and missing storage safely", () => {
		const storage = createMemoryStorage({
			"mapetite-recent-searches-v1": "{not json",
		});
		expect(loadRecentSearches(storage)).toEqual([]);
		expect(loadRecentSearches(null)).toEqual([]);
	});

	it("keeps app usable when storage writes fail", () => {
		const storage = {
			getItem: () => null,
			removeItem: () => undefined,
			setItem: () => {
				throw new Error("quota exceeded");
			},
		};
		expect(saveRecentSearch({ city: "Stockton" }, { storage })).toEqual([]);
	});
});

describe("last search snapshot cache", () => {
	it("stores a compact last successful typed search snapshot", () => {
		const storage = createMemoryStorage();
		const snapshot = saveLastSearchSnapshot(
			{
				city: "Stockton",
				state: "California",
				country: "United States",
				latitude: 37.95,
				longitude: -121.29,
			},
			[createRestaurant()],
			{ storage, now: 1_000 },
		);

		expect(snapshot?.search.label).toBe("Stockton, California, United States");
		const restored = loadLastSearchSnapshot(storage, { now: 1_500 });
		expect(restored?.restaurants).toHaveLength(1);
		expect(restored?.restaurants[0]?.galleryImageUrls).toBeUndefined();
		expect(restored?.restaurants[0]?.reviews).toEqual([]);
		expect(restored?.restaurants[0]?.ratingBreakdown).toBeUndefined();
	});

	it("rejects expired snapshots", () => {
		const storage = createMemoryStorage();
		saveLastSearchSnapshot(
			{ city: "Stockton", state: "", country: "" },
			[createRestaurant()],
			{ storage, now: 1_000, ttlMs: 10 },
		);

		expect(loadLastSearchSnapshot(storage, { now: 1_011 })).toBeNull();
	});

	it("rejects wrong schema versions", () => {
		const storage = createMemoryStorage({
			"mapetite-last-search-v1": JSON.stringify({
				schemaVersion: 999,
				expiresAt: Date.now() + LAST_SEARCH_TTL_MS,
				search: { city: "Stockton" },
				location: { city: "Stockton", state: "", country: "" },
				restaurants: [createRestaurant()],
			}),
		});

		expect(loadLastSearchSnapshot(storage)).toBeNull();
	});

	it("caps stored restaurants", () => {
		const storage = createMemoryStorage();
		const restaurants = Array.from({ length: 45 }, (_, index) =>
			createRestaurant({ id: `restaurant-${index}` }),
		);
		saveLastSearchSnapshot(
			{ city: "Stockton", state: "", country: "" },
			restaurants,
			{ storage, limit: 40 },
		);

		expect(loadLastSearchSnapshot(storage)?.restaurants).toHaveLength(40);
	});

	it("does not store coordinate-only user-location searches", () => {
		const storage = createMemoryStorage();
		const snapshot = saveLastSearchSnapshot(
			{
				city: "",
				state: "",
				country: "",
				latitude: 37.95,
				longitude: -121.29,
			},
			[createRestaurant()],
			{ storage },
		);

		expect(snapshot).toBeNull();
		expect(loadLastSearchSnapshot(storage)).toBeNull();
	});

	it("handles unavailable storage and write failures safely", () => {
		const failingStorage = {
			getItem: () => null,
			removeItem: () => undefined,
			setItem: () => {
				throw new Error("quota exceeded");
			},
		};

		expect(
			saveLastSearchSnapshot(
				{ city: "Stockton", state: "", country: "" },
				[createRestaurant()],
				{ storage: failingStorage },
			),
		).toBeNull();
		expect(loadLastSearchSnapshot(null)).toBeNull();
	});
});
