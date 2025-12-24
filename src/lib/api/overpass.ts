import type { Restaurant } from "@/store/restaurant-search-store";

type OverpassElement = {
	id: number;
	type: "node" | "way" | "relation";
	lat?: number;
	lon?: number;
	center?: { lat: number; lon: number };
	tags?: Record<string, string>;
};

type OverpassResponse = {
	elements: OverpassElement[];
};

function pickTag(
	tags: Record<string, string> | undefined,
	key: string,
): string | undefined {
	if (!tags) return undefined;
	return tags[key] || tags[`addr:${key}`];
}

function parseCategories(tags?: Record<string, string>): string[] {
	if (!tags) return ["Restaurant"];
	if (tags.cuisine) {
		return tags.cuisine
			.split(";")
			.map((c) => c.trim())
			.filter(Boolean)
			.map((c) => c[0]?.toUpperCase() + c.slice(1));
	}
	return ["Restaurant"];
}

function parseHours(tags?: Record<string, string>):
	| { open: string; close: string }
	| undefined {
	const hours = tags?.opening_hours;
	if (!hours) return undefined;

	const firstRange = hours.split(";")[0];
	const match = firstRange.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
	if (!match) return undefined;
	return { open: match[1], close: match[2] };
}

function isOpenNow(hours: { open: string; close: string }): boolean {
	const now = new Date();
	const current = now.getHours() * 60 + now.getMinutes();
	const [openH, openM] = hours.open.split(":").map(Number);
	const [closeH, closeM] = hours.close.split(":").map(Number);
	const open = openH * 60 + openM;
	const close = closeH * 60 + closeM;
	if (close < open) {
		return current >= open || current <= close;
	}
	return current >= open && current <= close;
}

export async function fetchRestaurantsNearby(
	latitude: number,
	longitude: number,
	radiusMeters = 3000,
): Promise<Restaurant[]> {
	const query = `
		[out:json][timeout:25];
		(
			node["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});
			way["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});
			relation["amenity"="restaurant"](around:${radiusMeters},${latitude},${longitude});
		);
		out center tags;
	`;

	const res = await fetch("https://overpass-api.de/api/interpreter", {
		method: "POST",
		body: query,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});

	if (!res.ok) return [];
	const data = (await res.json()) as OverpassResponse;

	return data.elements
		.map((el) => {
			const tags = el.tags || {};
			const lat = el.lat ?? el.center?.lat;
			const lon = el.lon ?? el.center?.lon;
			if (lat === undefined || lon === undefined) return null;

			const categories = parseCategories(tags);
			const hours = parseHours(tags);
			const openNow = hours ? isOpenNow(hours) : undefined;

			const addressLine =
				pickTag(tags, "street") ||
				pickTag(tags, "road") ||
				pickTag(tags, "addr:full") ||
				"";

			const city =
				pickTag(tags, "city") ||
				pickTag(tags, "town") ||
				pickTag(tags, "village") ||
				pickTag(tags, "municipality") ||
				"";

			const state = pickTag(tags, "state") || "";
			const country = pickTag(tags, "country") || "";
			const zipCode = pickTag(tags, "postcode") || "";

			const name = tags.name || "Restaurant";

			return {
				id: `${el.type}-${el.id}`,
				name,
				address: {
					street: addressLine,
					city,
					state,
					country,
					zipCode,
				},
				rating: 0,
				reviewCount: 0,
				categories,
				priceRange: 1,
				description:
					tags.description ||
					tags.note ||
					"Restaurant discovered via OpenStreetMap",
				latitude: lat,
				longitude: lon,
				reviews: [],
				distance: undefined,
				isOpenNow: openNow,
				hours,
			} satisfies Restaurant;
		})
		.filter(Boolean) as Restaurant[];
}

