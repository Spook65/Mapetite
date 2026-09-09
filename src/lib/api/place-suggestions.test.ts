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
		const fetchMock = vi.fn().mockResolvedValue({
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
		globalThis.fetch = fetchMock;
		vi.stubEnv("VITE_RESTAURANTS_API_BASE_URL", "https://api.example.test");

		await expect(
			suggestPlacesApi("sto", {
				limit: 8,
				country: "United States",
				region: "California",
				recentCountry: "Japan",
				localeCountry: "GB",
				timezoneCountry: "US",
			}),
		).resolves.toEqual([
			{
				city: "Stockton",
				region: "California",
				regionCode: "CA",
				country: "United States",
				countryCode: "US",
				label: "Stockton, California, United States",
			},
		]);
		const calledUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
		expect(calledUrl.searchParams.get("country")).toBe("United States");
		expect(calledUrl.searchParams.get("region")).toBe("California");
		expect(calledUrl.searchParams.get("recentCountry")).toBe("Japan");
		expect(calledUrl.searchParams.get("localeCountry")).toBe("GB");
		expect(calledUrl.searchParams.get("timezoneCountry")).toBe("US");
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
