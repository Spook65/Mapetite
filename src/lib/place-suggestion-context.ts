import type { RecentSearchEntry } from "@/lib/recent-search-cache";

export type PlaceSuggestionContext = {
	country?: string;
	region?: string;
	recentCountry?: string;
	recentRegion?: string;
	localeCountry?: string;
	timezoneCountry?: string;
};

export type QuickPlaceSearch = Pick<
	RecentSearchEntry,
	"city" | "state" | "country" | "label" | "timestamp" | "resultCount"
>;

const GLOBAL_QUICK_SEARCHES: QuickPlaceSearch[] = [
	{
		city: "London",
		state: "England",
		country: "United Kingdom",
		label: "London",
		timestamp: 0,
	},
	{
		city: "Kyoto",
		state: "Kyoto",
		country: "Japan",
		label: "Kyoto",
		timestamp: 0,
	},
	{
		city: "Paris",
		state: "Ile-de-France",
		country: "France",
		label: "Paris",
		timestamp: 0,
	},
	{
		city: "Toronto",
		state: "Ontario",
		country: "Canada",
		label: "Toronto",
		timestamp: 0,
	},
	{
		city: "San Diego",
		state: "California",
		country: "United States",
		label: "San Diego",
		timestamp: 0,
	},
	{
		city: "Sydney",
		state: "New South Wales",
		country: "Australia",
		label: "Sydney",
		timestamp: 0,
	},
];

const COUNTRY_QUICK_SEARCHES: Record<string, QuickPlaceSearch[]> = {
	GB: [
		{
			city: "London",
			state: "England",
			country: "United Kingdom",
			label: "London",
			timestamp: 0,
		},
		{
			city: "Manchester",
			state: "England",
			country: "United Kingdom",
			label: "Manchester",
			timestamp: 0,
		},
		{
			city: "Edinburgh",
			state: "Scotland",
			country: "United Kingdom",
			label: "Edinburgh",
			timestamp: 0,
		},
	],
	JP: [
		{
			city: "Tokyo",
			state: "Tokyo",
			country: "Japan",
			label: "Tokyo",
			timestamp: 0,
		},
		{
			city: "Kyoto",
			state: "Kyoto",
			country: "Japan",
			label: "Kyoto",
			timestamp: 0,
		},
		{
			city: "Osaka",
			state: "Osaka",
			country: "Japan",
			label: "Osaka",
			timestamp: 0,
		},
	],
	US: [
		{
			city: "Stockton",
			state: "California",
			country: "United States",
			label: "Stockton",
			timestamp: 0,
		},
		{
			city: "Modesto",
			state: "California",
			country: "United States",
			label: "Modesto",
			timestamp: 0,
		},
		{
			city: "San Diego",
			state: "California",
			country: "United States",
			label: "San Diego",
			timestamp: 0,
		},
	],
};

const TIMEZONE_COUNTRY_PREFIXES: Array<[string, string]> = [
	["Europe/London", "GB"],
	["Europe/Paris", "FR"],
	["Asia/Tokyo", "JP"],
	["America/Los_Angeles", "US"],
	["America/New_York", "US"],
	["America/Chicago", "US"],
	["America/Denver", "US"],
	["America/Toronto", "CA"],
	["America/Vancouver", "CA"],
	["Australia/Sydney", "AU"],
];

function getCountryCodeFromNameOrCode(country: string | undefined) {
	const normalized = country?.trim().toLowerCase();
	if (!normalized) return "";
	const aliases: Record<string, string> = {
		au: "AU",
		australia: "AU",
		ca: "CA",
		canada: "CA",
		fr: "FR",
		france: "FR",
		gb: "GB",
		japan: "JP",
		jp: "JP",
		uk: "GB",
		"united kingdom": "GB",
		"united states": "US",
		us: "US",
		usa: "US",
	};
	return aliases[normalized] ?? "";
}

function uniqueQuickSearches(searches: QuickPlaceSearch[]) {
	const seen = new Set<string>();
	const unique: QuickPlaceSearch[] = [];

	for (const search of searches) {
		const key = [search.city, search.state, search.country]
			.join("|")
			.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push(search);
	}

	return unique;
}

export function getLocaleCountryCode(locale: string | undefined) {
	if (!locale) return "";
	const parts = locale.split("-");
	if (parts.length < 2) return "";
	const region = parts.at(-1);
	return region && region.length === 2 ? region.toUpperCase() : "";
}

export function getTimezoneCountryCode(timezone: string | undefined) {
	if (!timezone) return "";
	const match = TIMEZONE_COUNTRY_PREFIXES.find(([prefix]) =>
		timezone.startsWith(prefix),
	);
	return match?.[1] ?? "";
}

export function getBrowserSuggestionContext(
	recentSearches: RecentSearchEntry[],
): PlaceSuggestionContext {
	const latestRecentSearch = recentSearches[0];

	return {
		recentCountry: latestRecentSearch?.country || undefined,
		recentRegion: latestRecentSearch?.state || undefined,
		localeCountry:
			typeof navigator !== "undefined"
				? getLocaleCountryCode(navigator.language)
				: "",
		timezoneCountry:
			typeof Intl !== "undefined"
				? getTimezoneCountryCode(
						Intl.DateTimeFormat().resolvedOptions().timeZone,
					)
				: "",
	};
}

export function getQuickSearchesForContext(context: PlaceSuggestionContext) {
	const contextCountry =
		getCountryCodeFromNameOrCode(context.recentCountry) ||
		context.localeCountry ||
		context.timezoneCountry ||
		"";
	const regionSearches = COUNTRY_QUICK_SEARCHES[contextCountry] ?? [];

	return uniqueQuickSearches([...regionSearches, ...GLOBAL_QUICK_SEARCHES]).slice(
		0,
		6,
	);
}
