import { describe, expect, it } from "vitest";
import {
	getPriceFilterLabel,
	isPriceFilterActive,
	matchesPriceFilter,
	normalizePriceFilter,
} from "@/lib/search-result-filters";

describe("search result price filters", () => {
	it("treats an empty price selection as Any price", () => {
		expect(isPriceFilterActive([])).toBe(false);
		expect(matchesPriceFilter({ priceRange: 2 }, [])).toBe(true);
		expect(matchesPriceFilter({ priceRange: undefined }, [])).toBe(true);
		expect(getPriceFilterLabel([])).toBeNull();
	});

	it("treats all price levels as Any price", () => {
		expect(isPriceFilterActive([1, 2, 3, 4])).toBe(false);
		expect(matchesPriceFilter({ priceRange: 4 }, [1, 2, 3, 4])).toBe(true);
		expect(getPriceFilterLabel([1, 2, 3, 4])).toBeNull();
	});

	it("filters restaurants when explicit price levels are selected", () => {
		expect(matchesPriceFilter({ priceRange: 1 }, [1, 3])).toBe(true);
		expect(matchesPriceFilter({ priceRange: 2 }, [1, 3])).toBe(false);
		expect(matchesPriceFilter({ priceRange: 3 }, [1, 3])).toBe(true);
	});

	it("excludes missing price data only under explicit price filters", () => {
		expect(matchesPriceFilter({ priceRange: undefined }, [2])).toBe(false);
		expect(matchesPriceFilter({ priceRange: null }, [2])).toBe(false);
	});

	it("normalizes invalid, duplicated, and unordered price selections", () => {
		expect(normalizePriceFilter([3, 1, 3, 9, 2, 0])).toEqual([1, 2, 3]);
	});

	it("labels non-contiguous price selections accurately", () => {
		expect(getPriceFilterLabel([3, 1])).toBe("$, $$$");
	});
});
