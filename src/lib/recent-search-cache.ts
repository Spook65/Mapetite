import type { LocationState, Restaurant } from "@/store/restaurant-search-store";

const RECENT_SEARCHES_STORAGE_KEY = "mapetite-recent-searches-v1";
const LAST_SEARCH_STORAGE_KEY = "mapetite-last-search-v1";
const LAST_SEARCH_SCHEMA_VERSION = 1;
const DEFAULT_RECENT_SEARCH_LIMIT = 6;
const DEFAULT_LAST_SEARCH_LIMIT = 40;
export const LAST_SEARCH_TTL_MS = 12 * 60 * 60 * 1000;

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export type RecentSearchEntry = {
	city: string;
	state: string;
	country: string;
	label: string;
	timestamp: number;
	resultCount?: number;
};

export type LastSearchSnapshot = {
	schemaVersion: number;
	savedAt: number;
	expiresAt: number;
	search: {
		city: string;
		state: string;
		country: string;
		label: string;
	};
	location: LocationState;
	restaurants: Restaurant[];
	resultCount: number;
};

type StoredLastSearchSnapshot = LastSearchSnapshot;

function getBrowserStorage(): StorageLike | null {
	if (typeof window === "undefined") return null;
	return window.localStorage ?? null;
}

function normalizePart(value: unknown) {
	return String(value || "").trim();
}

function normalizeKeyPart(value: string) {
	return value.toLowerCase().replace(/\s+/g, " ");
}

function buildSearchKey(search: Pick<RecentSearchEntry, "city" | "state" | "country">) {
	return [
		normalizeKeyPart(search.city),
		normalizeKeyPart(search.state),
		normalizeKeyPart(search.country),
	].join("|");
}

export function buildSearchDisplayLabel(location: Partial<LocationState>) {
	return [
		normalizePart(location.city),
		normalizePart(location.state),
		normalizePart(location.country),
	]
		.filter(Boolean)
		.join(", ");
}

export function formatRecentSearchResultCount(resultCount: number | undefined) {
	if (typeof resultCount !== "number" || !Number.isFinite(resultCount)) return null;
	const count = Math.max(0, Math.trunc(resultCount));
	return `${count.toLocaleString()} ${count === 1 ? "result" : "results"}`;
}

export function isTypedPlaceSearch(location: Partial<LocationState>) {
	return Boolean(normalizePart(location.city));
}

function safeParseJson(value: string | null) {
	if (!value) return null;
	try {
		return JSON.parse(value) as unknown;
	} catch {
		return null;
	}
}

function toRecentSearchEntry(value: unknown): RecentSearchEntry | null {
	if (!value || typeof value !== "object") return null;
	const candidate = value as Partial<RecentSearchEntry>;
	const city = normalizePart(candidate.city);
	if (!city) return null;
	const state = normalizePart(candidate.state);
	const country = normalizePart(candidate.country);
	const label = normalizePart(candidate.label) || buildSearchDisplayLabel({ city, state, country });
	const timestamp =
		typeof candidate.timestamp === "number" && Number.isFinite(candidate.timestamp)
			? candidate.timestamp
			: Date.now();
	const resultCount =
		typeof candidate.resultCount === "number" && Number.isFinite(candidate.resultCount)
			? Math.max(0, Math.trunc(candidate.resultCount))
			: undefined;

	return {
		city,
		state,
		country,
		label,
		timestamp,
		...(resultCount !== undefined ? { resultCount } : {}),
	};
}

export function loadRecentSearches(storage: StorageLike | null = getBrowserStorage()) {
	if (!storage) return [];
	const parsed = safeParseJson(storage.getItem(RECENT_SEARCHES_STORAGE_KEY));
	if (!Array.isArray(parsed)) return [];

	return parsed
		.map(toRecentSearchEntry)
		.filter((entry): entry is RecentSearchEntry => Boolean(entry))
		.sort((a, b) => b.timestamp - a.timestamp)
		.slice(0, DEFAULT_RECENT_SEARCH_LIMIT);
}

export function saveRecentSearch(
	location: Partial<LocationState>,
	options: {
		resultCount?: number;
		storage?: StorageLike | null;
		now?: number;
		limit?: number;
	} = {},
) {
	const storage = options.storage ?? getBrowserStorage();
	if (!storage || !isTypedPlaceSearch(location)) return loadRecentSearches(storage);

	const city = normalizePart(location.city);
	const state = normalizePart(location.state);
	const country = normalizePart(location.country);
	const entry: RecentSearchEntry = {
		city,
		state,
		country,
		label: buildSearchDisplayLabel({ city, state, country }),
		timestamp: options.now ?? Date.now(),
		...(typeof options.resultCount === "number"
			? { resultCount: Math.max(0, Math.trunc(options.resultCount)) }
			: {}),
	};
	const limit = options.limit ?? DEFAULT_RECENT_SEARCH_LIMIT;
	const existing = loadRecentSearches(storage);
	const next = [
		entry,
		...existing.filter((item) => buildSearchKey(item) !== buildSearchKey(entry)),
	].slice(0, limit);

	try {
		storage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
	} catch {
		return existing;
	}

	return next;
}

export function clearRecentSearches(storage: StorageLike | null = getBrowserStorage()) {
	if (!storage) return;
	try {
		storage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
	} catch {
		// Browser storage can fail in private mode; the app should remain usable.
	}
}

function compactRestaurantForStorage(restaurant: Restaurant): Restaurant {
	return {
		...restaurant,
		photoUrl: restaurant.photoUrl || undefined,
		photoAttributions: restaurant.photoAttributions?.slice(0, 2),
		galleryImageUrls: undefined,
		galleryPhotoAttributions: undefined,
		reviews: [],
		signatureDishes: undefined,
		ratingBreakdown: undefined,
		chef: restaurant.chef
			? {
					name: restaurant.chef.name,
					bio: restaurant.chef.bio,
				}
			: undefined,
		amenities: restaurant.amenities?.slice(0, 6),
		paymentMethods: restaurant.paymentMethods?.slice(0, 6),
	};
}

function isLastSearchSnapshot(value: unknown, now = Date.now()): value is StoredLastSearchSnapshot {
	if (!value || typeof value !== "object") return false;
	const candidate = value as Partial<StoredLastSearchSnapshot>;
	if (candidate.schemaVersion !== LAST_SEARCH_SCHEMA_VERSION) return false;
	if (typeof candidate.expiresAt !== "number" || candidate.expiresAt <= now) return false;
	if (!candidate.search || typeof candidate.search !== "object") return false;
	if (!isTypedPlaceSearch(candidate.search)) return false;
	if (!candidate.location || typeof candidate.location !== "object") return false;
	if (!Array.isArray(candidate.restaurants) || candidate.restaurants.length === 0) return false;
	return true;
}

export function loadLastSearchSnapshot(
	storage: StorageLike | null = getBrowserStorage(),
	options: { now?: number } = {},
) {
	if (!storage) return null;
	const parsed = safeParseJson(storage.getItem(LAST_SEARCH_STORAGE_KEY));
	if (!isLastSearchSnapshot(parsed, options.now ?? Date.now())) return null;
	return parsed;
}

export function saveLastSearchSnapshot(
	location: LocationState,
	restaurants: Restaurant[],
	options: {
		storage?: StorageLike | null;
		now?: number;
		ttlMs?: number;
		limit?: number;
	} = {},
) {
	const storage = options.storage ?? getBrowserStorage();
	if (!storage || !isTypedPlaceSearch(location) || restaurants.length === 0) {
		return loadLastSearchSnapshot(storage);
	}

	const now = options.now ?? Date.now();
	const limit = options.limit ?? DEFAULT_LAST_SEARCH_LIMIT;
	const search = {
		city: normalizePart(location.city),
		state: normalizePart(location.state),
		country: normalizePart(location.country),
		label: buildSearchDisplayLabel(location),
	};
	const snapshot: LastSearchSnapshot = {
		schemaVersion: LAST_SEARCH_SCHEMA_VERSION,
		savedAt: now,
		expiresAt: now + (options.ttlMs ?? LAST_SEARCH_TTL_MS),
		search,
		location: {
			city: search.city,
			state: search.state,
			country: search.country,
			latitude: location.latitude,
			longitude: location.longitude,
		},
		restaurants: restaurants.slice(0, limit).map(compactRestaurantForStorage),
		resultCount: restaurants.length,
	};

	try {
		storage.setItem(LAST_SEARCH_STORAGE_KEY, JSON.stringify(snapshot));
	} catch {
		return loadLastSearchSnapshot(storage);
	}

	return snapshot;
}
