import { describe, expect, it } from "vitest";
import {
	getLocaleCountryCode,
	getQuickSearchesForContext,
	getTimezoneCountryCode,
} from "@/lib/place-suggestion-context";

describe("place suggestion context", () => {
	it("extracts country codes from browser locale strings", () => {
		expect(getLocaleCountryCode("en-GB")).toBe("GB");
		expect(getLocaleCountryCode("ja-JP")).toBe("JP");
		expect(getLocaleCountryCode("en")).toBe("");
	});

	it("maps common browser timezones to soft country hints", () => {
		expect(getTimezoneCountryCode("Europe/London")).toBe("GB");
		expect(getTimezoneCountryCode("Asia/Tokyo")).toBe("JP");
		expect(getTimezoneCountryCode("America/Los_Angeles")).toBe("US");
		expect(getTimezoneCountryCode("Etc/UTC")).toBe("");
	});

	it("uses neutral global quick starts when no context exists", () => {
		expect(getQuickSearchesForContext({ }).map((search) => search.country)).toEqual(
			expect.arrayContaining([
				"United Kingdom",
				"Japan",
				"France",
				"United States",
			]),
		);
	});

	it("biases quick starts with locale country without implying nearby places", () => {
		const cities = getQuickSearchesForContext({ localeCountry: "GB" }).map(
			(search) => search.city,
		);

		expect(cities.slice(0, 3)).toEqual([
			"London",
			"Manchester",
			"Edinburgh",
		]);
	});

	it("understands recent-search country names for quick starts", () => {
		expect(
			getQuickSearchesForContext({ recentCountry: "Japan" })[0],
		).toMatchObject({
			city: "Tokyo",
			country: "Japan",
		});
	});
});
