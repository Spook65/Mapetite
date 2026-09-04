import type { Restaurant } from "@/store/restaurant-search-store";

export const PRICE_LEVELS = [1, 2, 3, 4] as const;

const PRICE_LEVEL_SET = new Set<number>(PRICE_LEVELS);
type RestaurantPrice = Pick<Restaurant, "priceRange"> | { priceRange?: number | null };

export function normalizePriceFilter(prices: number[]) {
	return Array.from(
		new Set(prices.filter((price) => PRICE_LEVEL_SET.has(price))),
	).sort((a, b) => a - b);
}

export function isPriceFilterActive(prices: number[]) {
	const normalized = normalizePriceFilter(prices);
	return normalized.length > 0 && normalized.length < PRICE_LEVELS.length;
}

export function matchesPriceFilter(
	restaurant: RestaurantPrice,
	prices: number[],
) {
	if (!isPriceFilterActive(prices)) return true;
	const priceRange = restaurant.priceRange;
	if (typeof priceRange !== "number" || !PRICE_LEVEL_SET.has(priceRange)) {
		return false;
	}
	return normalizePriceFilter(prices).includes(priceRange);
}

export function togglePriceFilterSelection(prices: number[], price: number) {
	if (!PRICE_LEVEL_SET.has(price)) return normalizePriceFilter(prices);

	const normalized = normalizePriceFilter(prices);
	if (!isPriceFilterActive(normalized)) return [price];

	if (normalized.includes(price)) {
		return normalized.filter((selectedPrice) => selectedPrice !== price);
	}

	return [...normalized, price].sort((a, b) => a - b);
}

export function getPriceFilterLabel(prices: number[]) {
	if (!isPriceFilterActive(prices)) return null;
	return normalizePriceFilter(prices)
		.map((price) => "$".repeat(price))
		.join(", ");
}
