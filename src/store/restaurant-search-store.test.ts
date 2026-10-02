import { beforeEach, describe, expect, it } from "vitest";
import {
	type Restaurant,
	useRestaurantSearchStore,
} from "./restaurant-search-store";

describe("restaurant search lifecycle", () => {
	beforeEach(() => {
		useRestaurantSearchStore.getState().resetStore();
		localStorage.clear();
	});

	it("marks a newly started search as active", () => {
		const requestId =
			useRestaurantSearchStore.getState().beginRestaurantSearch();
		const state = useRestaurantSearchStore.getState();

		expect(state.isSearching).toBe(true);
		expect(state.activeSearchRequestId).toBe(requestId);
		expect(state.isCurrentRestaurantSearch(requestId)).toBe(true);
	});

	it("keeps a newer request authoritative over stale completion", () => {
		const firstRequest =
			useRestaurantSearchStore.getState().beginRestaurantSearch();
		const secondRequest =
			useRestaurantSearchStore.getState().beginRestaurantSearch();

		expect(secondRequest).toBeGreaterThan(firstRequest);
		expect(
			useRestaurantSearchStore
				.getState()
				.isCurrentRestaurantSearch(firstRequest),
		).toBe(false);
		expect(
			useRestaurantSearchStore.getState().finishRestaurantSearch(firstRequest),
		).toBe(false);
		expect(useRestaurantSearchStore.getState().isSearching).toBe(true);
		expect(
			useRestaurantSearchStore
				.getState()
				.isCurrentRestaurantSearch(secondRequest),
		).toBe(true);

		const staleResults = [{ id: "stale-result" }] as Restaurant[];
		if (
			useRestaurantSearchStore
				.getState()
				.isCurrentRestaurantSearch(firstRequest)
		) {
			useRestaurantSearchStore.getState().setRestaurants(staleResults);
		}
		expect(useRestaurantSearchStore.getState().restaurants).toEqual([]);
	});

	it("retains pending lifecycle state independently of route observers", () => {
		const requestId =
			useRestaurantSearchStore.getState().beginRestaurantSearch();

		const remountedObserverState = useRestaurantSearchStore.getState();
		expect(remountedObserverState.isSearching).toBe(true);
		expect(remountedObserverState.activeSearchRequestId).toBe(requestId);
	});

	it("clears searching only for the current request", () => {
		const requestId =
			useRestaurantSearchStore.getState().beginRestaurantSearch();

		expect(
			useRestaurantSearchStore.getState().finishRestaurantSearch(requestId),
		).toBe(true);
		expect(useRestaurantSearchStore.getState().isSearching).toBe(false);
	});

	it("excludes transient lifecycle values from persisted search state", () => {
		useRestaurantSearchStore.getState().beginRestaurantSearch();

		const persisted = JSON.parse(
			localStorage.getItem("restaurant-search-storage") ?? "{}",
		) as { state?: Record<string, unknown> };

		expect(persisted.state).not.toHaveProperty("isSearching");
		expect(persisted.state).not.toHaveProperty("activeSearchRequestId");
	});
});
