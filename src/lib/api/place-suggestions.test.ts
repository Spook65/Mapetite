import { afterEach, describe, expect, it, vi } from "vitest";
import { suggestPlacesApi } from "@/lib/api/restaurants";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
	vi.unstubAllEnvs();
});

describe("suggestPlacesApi", () => {
	it("skips short queries", async () => {
		const fetchMock = vi.fn();
		globalThis.fetch = fetchMock;
		vi.stubEnv("VITE_RESTAURANTS_API_BASE_URL", "https://api.example.test");

		await expect(suggestPlacesApi("s")).resolves.toEqual([]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns compact valid suggestions", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				suggestions: [
					{
						city: "Stockton",
						region: "California",
						regionCode: "CA",
						country: "United States",
						countryCode: "US",
						label: "Stockton, California, United States",
						latitude: 37.95,
					},
				],
			}),
		});
		vi.stubEnv("VITE_RESTAURANTS_API_BASE_URL", "https://api.example.test");

		await expect(suggestPlacesApi("sto", { limit: 8 })).resolves.toEqual([
			{
				city: "Stockton",
				region: "California",
				regionCode: "CA",
				country: "United States",
				countryCode: "US",
				label: "Stockton, California, United States",
			},
		]);
	});

	it("handles malformed responses safely", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				suggestions: [{ region: "California" }, null, "Stockton"],
			}),
		});
		vi.stubEnv("VITE_RESTAURANTS_API_BASE_URL", "https://api.example.test");

		await expect(suggestPlacesApi("sto")).resolves.toEqual([]);
	});
});
