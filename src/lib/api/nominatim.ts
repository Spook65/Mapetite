import type { LocationState } from "@/store/restaurant-search-store";

type NominatimResult = {
	display_name: string;
	lat: string;
	lon: string;
	address?: {
		city?: string;
		town?: string;
		village?: string;
		state?: string;
		county?: string;
		country?: string;
		country_code?: string;
	};
};

function toLocationState(result: NominatimResult): LocationState {
	const city =
		result.address?.city ||
		result.address?.town ||
		result.address?.village ||
		result.address?.county ||
		"";
	return {
		city,
		state: result.address?.state || "",
		country: result.address?.country || "",
		latitude: Number(result.lat),
		longitude: Number(result.lon),
	};
}

export async function searchCities(
	query: string,
	limit = 5,
): Promise<Array<LocationState & { displayName: string }>> {
	if (!query.trim()) return [];

	const url = new URL("https://nominatim.openstreetmap.org/search");
	url.searchParams.set("q", query);
	url.searchParams.set("format", "jsonv2");
	url.searchParams.set("addressdetails", "1");
	url.searchParams.set("limit", String(limit));

	const res = await fetch(url.toString(), {
		headers: { "User-Agent": "Mapetite/1.0 (education demo)" },
	});

	if (!res.ok) return [];
	const data = (await res.json()) as NominatimResult[];
	return data.map((item) => ({
		...toLocationState(item),
		displayName: item.display_name,
	}));
}

export async function resolveCityLocation(
	city: string,
	state?: string,
	country?: string,
): Promise<LocationState | null> {
	const query = [city, state, country].filter(Boolean).join(", ");
	const results = await searchCities(query, 1);
	return results[0] ?? null;
}

export async function reverseGeocode(
	latitude: number,
	longitude: number,
): Promise<LocationState | null> {
	const url = new URL("https://nominatim.openstreetmap.org/reverse");
	url.searchParams.set("lat", String(latitude));
	url.searchParams.set("lon", String(longitude));
	url.searchParams.set("format", "jsonv2");
	url.searchParams.set("addressdetails", "1");

	const res = await fetch(url.toString(), {
		headers: { "User-Agent": "Mapetite/1.0 (education demo)" },
	});
	if (!res.ok) return null;
	const data = (await res.json()) as NominatimResult;
	return toLocationState(data);
}

