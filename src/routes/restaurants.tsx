import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { reverseGeocode } from "@/lib/api/nominatim";
import { getRestaurantById, searchRestaurants } from "@/lib/search-restaurants";
import { cn } from "@/lib/utils";
import { useRestaurantSearchStore } from "@/store/restaurant-search-store";
import type { Restaurant } from "@/store/restaurant-search-store";
import {
	createFileRoute,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import {
	Clock,
	Filter,
	Heart,
	MapPinned,
	Navigation,
	Search,
	SlidersHorizontal,
	Star,
	Utensils,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Define search params schema for the route
type RestaurantsSearch = {
	city?: string;
};

const INITIAL_VISIBLE_RESULTS = 36;
const RESULTS_BATCH_SIZE = 36;
const FAVORITE_SNAPSHOTS_STORAGE_KEY = "mapetite-favorite-snapshots-v1";

function loadFavoriteSnapshotsFromStorage(): Record<string, Restaurant> {
	if (typeof window === "undefined") return {};

	try {
		const raw = window.localStorage.getItem(FAVORITE_SNAPSHOTS_STORAGE_KEY);
		if (!raw) return {};

		const parsed = JSON.parse(raw) as Record<string, unknown>;
		if (!parsed || typeof parsed !== "object") return {};

		const snapshots: Record<string, Restaurant> = {};
		for (const [id, value] of Object.entries(parsed)) {
			if (!id || !value || typeof value !== "object") continue;
			const restaurant = value as Restaurant;
			if (typeof restaurant.id !== "string" || restaurant.id !== id) continue;
			snapshots[id] = restaurant;
		}
		return snapshots;
	} catch {
		return {};
	}
}

function persistFavoriteSnapshotsToStorage(
	snapshots: Record<string, Restaurant>,
) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(
			FAVORITE_SNAPSHOTS_STORAGE_KEY,
			JSON.stringify(snapshots),
		);
	} catch {
		// Ignore storage write failures (private mode/storage quota).
	}
}

function getRestaurantSnapshotCompleteness(restaurant: Restaurant) {
	let score = 0;
	if (restaurant.name) score += 1;
	if (restaurant.address?.street) score += 1;
	if (restaurant.address?.city) score += 1;
	if (Number.isFinite(restaurant.latitude) && Number.isFinite(restaurant.longitude))
		score += 1;
	if (Array.isArray(restaurant.categories) && restaurant.categories.length > 0)
		score += 1;
	if (restaurant.rating != null) score += 1;
	if (restaurant.reviewCount != null) score += 1;
	if (restaurant.priceRange != null) score += 1;
	if (restaurant.hours?.open && restaurant.hours?.close) score += 1;
	if (restaurant.photoUrl) score += 1;
	if (restaurant.galleryImageUrls?.length) score += 1;
	if (restaurant.website) score += 1;
	if (restaurant.phone) score += 1;
	if (restaurant.menuUrl) score += 1;
	if (restaurant.source) score += 1;
	return score;
}

export const Route = createFileRoute("/restaurants")({
	component: App,
	validateSearch: (search: Record<string, unknown>): RestaurantsSearch => {
		return {
			city: typeof search.city === "string" ? search.city : undefined,
		};
	},
});

function App() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isDetailRouteActive =
		pathname.startsWith("/restaurants/") && pathname !== "/restaurants";

	// The detail route is nested under /restaurants, so the parent route needs
	// to yield to its child route when a restaurant id is active.
	if (isDetailRouteActive) {
		return <Outlet />;
	}

	return <RestaurantSearchPage />;
}

function getPreviewImage(restaurant: Restaurant) {
	return restaurant.photoUrl ?? restaurant.galleryImageUrls?.[0] ?? null;
}

function getRestaurantInitials(restaurant: Restaurant) {
	return restaurant.name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("") || "MP";
}

function getLocationHint(restaurant: Restaurant) {
	const cityState = [restaurant.address.city, restaurant.address.state]
		.filter(Boolean)
		.join(", ");
	if (cityState) return cityState;
	return restaurant.address.street || restaurant.address.country || "Location set in details";
}

function getFullAddressLine(restaurant: Restaurant) {
	return [
		restaurant.address.street,
		[restaurant.address.city, restaurant.address.state, restaurant.address.zipCode]
			.filter(Boolean)
			.join(" "),
		restaurant.address.country,
	]
		.filter(Boolean)
		.join(", ");
}

function truncateCopy(copy: string | undefined, maxLength: number, fallback: string) {
	const value = copy?.trim();
	if (!value) return fallback;
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function RestaurantSearchPage() {
	const { city: searchCity } = Route.useSearch();

	// Global state from Zustand store
	const location = useRestaurantSearchStore((state) => state.location);
	const setLocation = useRestaurantSearchStore((state) => state.setLocation);
	const updateLocation = useRestaurantSearchStore(
		(state) => state.updateLocation,
	);
	const restaurants = useRestaurantSearchStore((state) => state.restaurants);
	const setRestaurants = useRestaurantSearchStore(
		(state) => state.setRestaurants,
	);
	const selectedCategories = useRestaurantSearchStore(
		(state) => state.selectedCategories,
	);
	const toggleCategory = useRestaurantSearchStore(
		(state) => state.toggleCategory,
	);
	const priceFilter = useRestaurantSearchStore((state) => state.priceFilter);
	const setPriceFilter = useRestaurantSearchStore(
		(state) => state.setPriceFilter,
	);
	const togglePriceFilter = useRestaurantSearchStore(
		(state) => state.togglePriceFilter,
	);
	const minRating = useRestaurantSearchStore((state) => state.minRating);
	const setMinRating = useRestaurantSearchStore((state) => state.setMinRating);
	const sortBy = useRestaurantSearchStore((state) => state.sortBy);
	const setSortBy = useRestaurantSearchStore((state) => state.setSortBy);
	const openNowOnly = useRestaurantSearchStore((state) => state.openNowOnly);
	const setOpenNowOnly = useRestaurantSearchStore(
		(state) => state.setOpenNowOnly,
	);
	const showFavorites = useRestaurantSearchStore(
		(state) => state.showFavorites,
	);
	const setShowFavorites = useRestaurantSearchStore(
		(state) => state.setShowFavorites,
	);
	const showRefinements = useRestaurantSearchStore(
		(state) => state.showRefinements,
	);
	const setShowRefinements = useRestaurantSearchStore(
		(state) => state.setShowRefinements,
	);
	const showMobileFilters = useRestaurantSearchStore(
		(state) => state.showMobileFilters,
	);
	const setShowMobileFilters = useRestaurantSearchStore(
		(state) => state.setShowMobileFilters,
	);
	const clearAllFilters = useRestaurantSearchStore(
		(state) => state.clearAllFilters,
	);

	// API-based favorites using React Query with error handling
	const { data: favoritesData } = useFavorites();
	const { mutate: toggleFavoriteMutate, isPending: isTogglingFavorite } =
		useToggleFavorite({
			onSuccess: (data) => {
				// Get restaurant name for better UX
				const restaurant = restaurants.find((r) => r.id === data.restaurant_id);
				const restaurantName = restaurant?.name || "Restaurant";

				// Show success toast based on action
				if (data.action === "added") {
					toast.success("Added to favorites", {
						description: `${restaurantName} has been added to your favorites.`,
					});
				} else {
					toast.success("Removed from favorites", {
						description: `${restaurantName} has been removed from your favorites.`,
					});
				}
			},
			onError: (error) => {
				// Show error toast and log the error
				console.error("Failed to toggle favorite:", error);
				toast.error("Failed to update favorites", {
					description:
						error.message ||
						"Something went wrong. Please try again in a moment.",
				});
			},
		});

	// Local component state (not persisted)
	const [isGettingLocation, setIsGettingLocation] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [isHydratingFavorites, setIsHydratingFavorites] = useState(false);
	const [visibleResultsCount, setVisibleResultsCount] = useState(
		INITIAL_VISIBLE_RESULTS,
	);
	const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
		null,
	);
	const [favoriteSnapshots, setFavoriteSnapshots] = useState<
		Record<string, Restaurant>
	>(() => loadFavoriteSnapshotsFromStorage());
	const activeSearchIdRef = useRef(0);
	const favoriteHydrationAttemptsRef = useRef<Set<string>>(new Set());

	const categories = ["Noodles", "Vegetarian", "Fast-Food"];

	// Handle city search parameter from navigation
	useEffect(() => {
		if (searchCity) {
			(async () => {
				const searchId = ++activeSearchIdRef.current;
				const requestedLocation = {
					city: searchCity,
					state: "",
					country: "",
				};
				setLocation(requestedLocation);
				setRestaurants([]);
				const { restaurants: results, location: resolvedLocation } =
					await searchRestaurants(requestedLocation, []);
				if (searchId !== activeSearchIdRef.current) {
					return;
				}
				setLocation(resolvedLocation ?? requestedLocation);
				setRestaurants(results);
				setShowFavorites(false);
			})();
		}
	}, [searchCity, setLocation, setRestaurants, setShowFavorites]);

	const handleSearch = async () => {
		if (!location.city) {
			toast.error("Add a city to search");
			return;
		}
		const searchId = ++activeSearchIdRef.current;
		setIsSearching(true);
		setRestaurants([]);
		try {
			const { restaurants: results, location: resolvedLocation } =
				await searchRestaurants(location, Array.from(selectedCategories));
			if (searchId !== activeSearchIdRef.current) {
				return;
			}
			setLocation(resolvedLocation ?? location);
			setRestaurants(results);
			setShowFavorites(false);
		} catch (error) {
			console.error("Search failed", error);
			toast.error("Search failed", {
				description: "Unable to fetch restaurants right now.",
			});
		} finally {
			if (searchId === activeSearchIdRef.current) {
				setIsSearching(false);
			}
		}
	};

	const handleGetCurrentLocation = () => {
		setIsGettingLocation(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;
					const searchId = ++activeSearchIdRef.current;
					try {
						const reverse = await reverseGeocode(latitude, longitude);
						const resolved = {
							country: reverse?.country || "",
							state: reverse?.state || "",
							city: reverse?.city || "Current Location",
							latitude,
							longitude,
						};
						setLocation(resolved);
						setRestaurants([]);
						const { restaurants: results, location: resolvedLocation } =
							await searchRestaurants(
								resolved,
								Array.from(selectedCategories),
							);
						if (searchId !== activeSearchIdRef.current) {
							return;
						}
						setLocation(resolvedLocation ?? resolved);
						setRestaurants(results);
						setShowFavorites(false);
					} catch (error) {
						console.error("Geolocation search failed", error);
						toast.error("Unable to get nearby places");
					} finally {
						if (searchId === activeSearchIdRef.current) {
							setIsGettingLocation(false);
						}
					}
				},
				(error) => {
					alert("Unable to get your location. Please enter manually.");
					setIsGettingLocation(false);
				},
			);
		} else {
			alert("Geolocation is not supported by your browser.");
			setIsGettingLocation(false);
		}
	};

	// Memoize handlers with useCallback to prevent unnecessary re-renders of child components.
	// These functions are passed as props to RestaurantCard, so stable references prevent re-renders.
	const toggleFavorite = useCallback((restaurantId: string) => {
		toggleFavoriteMutate({ restaurant_id: restaurantId });
	}, [toggleFavoriteMutate]);

	const buildDirectionsUrl = useCallback((restaurant: Restaurant) => {
		const hasCoordinates =
			Number.isFinite(restaurant.latitude) &&
			Number.isFinite(restaurant.longitude);

		return hasCoordinates
			? `https://www.openstreetmap.org/?mlat=${restaurant.latitude}&mlon=${restaurant.longitude}#map=18/${restaurant.latitude}/${restaurant.longitude}`
			: `https://www.openstreetmap.org/search?query=${encodeURIComponent(restaurant.name)}`;
	}, []);

	// Memoize favorite IDs Set to avoid recreating on every render.
	// Only recomputes when favoritesData?.favorites array reference changes.
	const favoriteIdList = favoritesData?.favorites ?? [];
	const favoriteIds = useMemo(
		() => new Set(favoriteIdList),
		[favoriteIdList],
	);

	const upsertFavoriteSnapshots = useCallback((incoming: Restaurant[]) => {
		setFavoriteSnapshots((previous) => {
			let changed = false;
			const next = { ...previous };

			for (const restaurant of incoming) {
				if (!restaurant?.id) continue;
				const existing = previous[restaurant.id];
				if (!existing) {
					next[restaurant.id] = restaurant;
					changed = true;
					continue;
				}

				const existingScore = getRestaurantSnapshotCompleteness(existing);
				const incomingScore = getRestaurantSnapshotCompleteness(restaurant);
				if (incomingScore > existingScore) {
					next[restaurant.id] = restaurant;
					changed = true;
				}
			}

			return changed ? next : previous;
		});
	}, []);

	useEffect(() => {
		persistFavoriteSnapshotsToStorage(favoriteSnapshots);
	}, [favoriteSnapshots]);

	const favoriteRestaurantLookup = useMemo(() => {
		const map = new Map<string, Restaurant>();
		for (const restaurant of restaurants) {
			if (favoriteIds.has(restaurant.id)) {
				map.set(restaurant.id, restaurant);
			}
		}
		for (const favoriteId of favoriteIdList) {
			if (map.has(favoriteId)) continue;
			const snapshot = favoriteSnapshots[favoriteId];
			if (snapshot) {
				map.set(favoriteId, snapshot);
			}
		}
		return map;
	}, [restaurants, favoriteIds, favoriteIdList, favoriteSnapshots]);

	const favoriteRestaurants = useMemo(
		() =>
			favoriteIdList
				.map((favoriteId) => favoriteRestaurantLookup.get(favoriteId))
				.filter(Boolean) as Restaurant[],
		[favoriteIdList, favoriteRestaurantLookup],
	);

	useEffect(() => {
		if (!favoriteIdList.length || !restaurants.length) return;
		const visibleFavorites = restaurants.filter((restaurant) =>
			favoriteIds.has(restaurant.id),
		);
		if (visibleFavorites.length) {
			upsertFavoriteSnapshots(visibleFavorites);
		}
	}, [favoriteIdList, restaurants, favoriteIds, upsertFavoriteSnapshots]);

	useEffect(() => {
		const attempts = favoriteHydrationAttemptsRef.current;
		for (const attemptedId of Array.from(attempts)) {
			if (!favoriteIds.has(attemptedId)) {
				attempts.delete(attemptedId);
			}
		}
	}, [favoriteIds]);

	useEffect(() => {
		setFavoriteSnapshots((previous) => {
			if (!Object.keys(previous).length) return previous;
			if (!favoriteIdList.length) return {};

			let changed = false;
			const next: Record<string, Restaurant> = {};
			for (const favoriteId of favoriteIdList) {
				const snapshot = previous[favoriteId];
				if (snapshot) {
					next[favoriteId] = snapshot;
				}
			}

			if (Object.keys(next).length !== Object.keys(previous).length) {
				changed = true;
			}

			return changed ? next : previous;
		});
	}, [favoriteIdList]);

	useEffect(() => {
		if (!favoriteIdList.length) return;

		const missingFavoriteIds = favoriteIdList.filter(
			(favoriteId) =>
				!favoriteRestaurantLookup.has(favoriteId) &&
				!favoriteHydrationAttemptsRef.current.has(favoriteId),
		);
		if (!missingFavoriteIds.length) return;

		for (const favoriteId of missingFavoriteIds) {
			favoriteHydrationAttemptsRef.current.add(favoriteId);
		}

		let cancelled = false;
		setIsHydratingFavorites(true);

		(async () => {
			const fetchedFavorites = await Promise.all(
				missingFavoriteIds.map(async (favoriteId) => {
					try {
						return await getRestaurantById(favoriteId);
					} catch {
						return null;
					}
				}),
			);

			if (cancelled) return;

			const resolvedFavorites = fetchedFavorites.filter(
				(restaurant): restaurant is Restaurant => !!restaurant,
			);
			if (resolvedFavorites.length) {
				upsertFavoriteSnapshots(resolvedFavorites);
			}
		})().finally(() => {
			if (!cancelled) {
				setIsHydratingFavorites(false);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [favoriteIdList, favoriteRestaurantLookup, upsertFavoriteSnapshots]);

	// Memoize filtered and sorted restaurant list to prevent unnecessary re-renders.
	// This expensive operation (filtering + sorting large arrays) only runs when:
	// - restaurants array changes (new search results)
	// - filter/sort parameters change (priceFilter, minRating, openNowOnly, sortBy)
	// - favorites toggle or favorites list changes (showFavorites, favoriteIds)
	// Note: location is NOT a dependency because distance is pre-calculated in restaurant objects.
	const displayedRestaurants = useMemo(() => {
		// Start with favorites filter if enabled, otherwise use all restaurants
		let filtered = showFavorites ? favoriteRestaurants : restaurants;

		// Apply price filter - only filter if priceRange exists and is valid
		filtered = filtered.filter((r) => {
			if (r.priceRange == null) return true; // Include restaurants without price data
			return priceFilter.includes(r.priceRange);
		});

		// Apply rating filter - only filter if rating exists and meets threshold
		filtered = filtered.filter((r) => {
			if (r.rating == null) return minRating === 0; // Include unrated only if minRating is 0
			return r.rating >= minRating;
		});

		// Apply open now filter - only filter if isOpenNow is explicitly false when filter is active
		if (openNowOnly) {
			filtered = filtered.filter(
				(r) => r.isOpenNow === true, // Only exclude if explicitly false or undefined
			);
		}

		// Apply sorting - handle undefined values gracefully
		// Create a copy before sorting to avoid mutating the filtered array
		const sorted = [...filtered];
		if (sortBy === "distance") {
			sorted.sort((a, b) => {
				const distA = a.distance ?? Infinity; // Put undefined at end
				const distB = b.distance ?? Infinity;
				return distA - distB;
			});
		} else if (sortBy === "rating") {
			sorted.sort((a, b) => {
				const ratingA = a.rating ?? -1; // Put undefined at start (lowest)
				const ratingB = b.rating ?? -1;
				return ratingB - ratingA; // Descending
			});
		} else if (sortBy === "reviews") {
			sorted.sort((a, b) => {
				const reviewsA = a.reviewCount ?? -1; // Put undefined at start (lowest)
				const reviewsB = b.reviewCount ?? -1;
				return reviewsB - reviewsA; // Descending
			});
		}

		return sorted;
	}, [
		restaurants,
		favoriteRestaurants,
		showFavorites,
		priceFilter,
		minRating,
		openNowOnly,
		sortBy,
	]);

	useEffect(() => {
		setVisibleResultsCount(INITIAL_VISIBLE_RESULTS);
	}, [
		restaurants,
		favoriteRestaurants,
		selectedCategories,
		priceFilter,
		minRating,
		sortBy,
		openNowOnly,
		showFavorites,
	]);

	useEffect(() => {
		if (
			selectedRestaurantId &&
			!displayedRestaurants.some(
				(restaurant) => restaurant.id === selectedRestaurantId,
			)
		) {
			setSelectedRestaurantId(null);
		}
	}, [displayedRestaurants, selectedRestaurantId]);

	const visibleRestaurants = useMemo(
		() => displayedRestaurants.slice(0, visibleResultsCount),
		[displayedRestaurants, visibleResultsCount],
	);

	const handleShowMoreResults = useCallback(() => {
		setVisibleResultsCount((current) =>
			Math.min(current + RESULTS_BATCH_SIZE, displayedRestaurants.length),
		);
	}, [displayedRestaurants.length]);

	/**
	 * Normalizes restaurant category for display in the category pill.
	 * Follows fallback hierarchy: first cuisine → "Restaurant" (if amenity exists) → null.
	 * 
	 * Handles OSM data inconsistencies:
	 * - Picks first category only (per requirement: "Pick the first cuisine only")
	 * - Handles multiple values separated by semicolons (takes first before splitting)
	 * - Replaces underscores/dashes with spaces
	 * - Capitalizes properly (Title Case)
	 * - Filters out geographic values (country/state/city names)
	 * - Returns "Restaurant" if no valid cuisine but amenity/type exists, null if nothing
	 */
	const getDisplayCategory = (restaurant: Restaurant): string | null => {
		// Geographic terms to exclude (case-insensitive)
		const geographicTerms = new Set([
			"country", "state", "city", "town", "village", "municipality",
			"region", "province", "district", "county", "area", "locale",
		]);

		const categories = restaurant.categories;
		if (!categories || categories.length === 0) return null;

		// Take first category only (requirement: "Pick the first cuisine only")
		let firstCategory = categories[0]?.trim();
		if (!firstCategory) return null;

		// Handle multiple values separated by semicolons: "mexican;american" → take "mexican"
		if (firstCategory.includes(";")) {
			firstCategory = firstCategory.split(";")[0]?.trim() || firstCategory;
		}

		// Normalize: replace underscores/dashes with spaces, lowercase for processing
		const normalized = firstCategory
			.replace(/[_-]/g, " ")
			.trim()
			.toLowerCase();

		// If normalized is "restaurant", treat as amenity/type, not cuisine
		if (normalized === "restaurant") {
			return "Restaurant"; // Fallback: amenity/type exists
		}

		// Exclude empty, too short, or geographic values
		if (
			normalized.length < 2 ||
			geographicTerms.has(normalized)
		) {
			// Check if amenity/type exists elsewhere in categories
			if (categories.some((cat) => 
				cat.trim().toLowerCase().replace(/[_-]/g, " ") === "restaurant"
			)) {
				return "Restaurant"; // Fallback: amenity/type exists
			}
			return null; // Nothing to display
		}

		// Valid cuisine found: capitalize properly (Title Case for each word)
		return normalized
			.split(" ")
			.map((word) => word[0]?.toUpperCase() + word.slice(1))
			.join(" ");
	};

	const totalResultsCount = showFavorites
		? favoriteRestaurants.length
		: restaurants.length;
	const matchingResultsCount = displayedRestaurants.length;
	const shownResultsCount = visibleRestaurants.length;
	const hasMoreResults = shownResultsCount < matchingResultsCount;
	const hasSearchResults = restaurants.length > 0;
	const hasFavoriteResults = favoriteRestaurants.length > 0;
	const hasResultsForCurrentView = showFavorites ? hasFavoriteResults : hasSearchResults;
	const selectedRestaurant = useMemo(
		() =>
			selectedRestaurantId
				? displayedRestaurants.find(
							(restaurant) => restaurant.id === selectedRestaurantId,
						) ??
						favoriteRestaurants.find(
							(restaurant) => restaurant.id === selectedRestaurantId,
						) ??
						restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ??
						null
					: null,
		[selectedRestaurantId, displayedRestaurants, favoriteRestaurants, restaurants],
	);
	const hasActiveFilters =
		selectedCategories.size > 0 ||
		priceFilter.length < 4 ||
		minRating > 0 ||
		openNowOnly;
	const resultHeading = showFavorites
		? "Saved restaurants"
		: location.city
			? `${location.city} results`
			: location.country
				? `${location.country} results`
				: "Search results";

	const handleSelectRestaurant = useCallback((restaurantId: string) => {
		setSelectedRestaurantId(restaurantId);
	}, []);

	return (
		<Layout>
			<div className="mapetite-page-shell min-h-full">
				<div
					className={cn(
						"mapetite-container px-4 pt-6 md:px-6 md:pt-8",
						selectedRestaurant
							? "pb-40 md:pb-12 min-[1261px]:pb-8"
							: "pb-6 md:pb-8",
					)}
				>
					<section className="mb-4 grid gap-5">
						<div>
							<div className="mapetite-eyebrow">Restaurant search</div>
							<h1 className="mt-3 max-w-[11ch] text-[clamp(2.25rem,4.6vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--mapetite-text)]">
								Choose a place, then browse with less noise.
							</h1>
							<p className="mapetite-muted-copy mt-3 max-w-[620px] text-[15px] leading-7">
								Start with a city and add region or country only when it helps.
								Refine after the list opens, then keep one selected restaurant
								visible while you compare.
							</p>
						</div>
					</section>

					<section className="mapetite-panel mb-4 grid gap-5 p-5 md:p-6">
						<div className="flex flex-wrap items-end justify-between gap-4">
							<div className="w-full text-center min-[1261px]:text-left">
								<strong className="text-[21px] font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
									Find restaurants by place
								</strong>
								<p className="mapetite-muted-copy mx-auto mt-2 max-w-[32rem] text-sm min-[1261px]:mx-0">
									Start with a city. Add region or country when the place name is
									shared.
								</p>
							</div>
						</div>

						<div className="mx-auto grid w-full max-w-[720px] gap-3.5 min-[1261px]:max-w-none min-[1261px]:items-end min-[1261px]:gap-3 min-[1261px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto]">
							<div className="grid gap-2.5">
								<Label
									htmlFor="city"
									className="text-[12px] tracking-[0.14em] text-[rgba(245,233,222,0.48)] uppercase"
								>
									City
								</Label>
								<Input
									id="city"
									placeholder="Paris, Tokyo, Chicago"
									value={location.city}
									onChange={(e) => updateLocation({ city: e.target.value })}
									className="h-[52px] rounded-[10px] border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] px-4 text-[var(--mapetite-text)] placeholder:text-[var(--mapetite-text-faint)]"
								/>
							</div>

							<div className="grid gap-2.5">
								<Label
									htmlFor="state"
									className="text-[12px] tracking-[0.14em] text-[rgba(245,233,222,0.48)] uppercase"
								>
									Region
								</Label>
								<Input
									id="state"
									placeholder="Optional region"
									value={location.state}
									onChange={(e) => updateLocation({ state: e.target.value })}
									className="h-[52px] rounded-[10px] border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] px-4 text-[var(--mapetite-text)] placeholder:text-[var(--mapetite-text-faint)]"
								/>
							</div>

							<div className="grid gap-2.5">
								<Label
									htmlFor="country"
									className="text-[12px] tracking-[0.14em] text-[rgba(245,233,222,0.48)] uppercase"
								>
									Country
								</Label>
								<Input
									id="country"
									placeholder="Optional country"
									value={location.country}
									onChange={(e) => updateLocation({ country: e.target.value })}
									className="h-[52px] rounded-[10px] border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] px-4 text-[var(--mapetite-text)] placeholder:text-[var(--mapetite-text-faint)]"
								/>
							</div>

							<Button
								type="button"
								onClick={handleSearch}
								disabled={isSearching}
								className="mapetite-accent-button h-[52px] w-full self-end justify-center rounded-[10px] px-5 text-[15px] font-semibold text-[#20140d] shadow-none min-[1261px]:w-auto"
							>
								<Search className="mr-2 size-4" />
								{isSearching ? "Searching..." : "Search restaurants"}
							</Button>

							<Button
								type="button"
								variant="outline"
								onClick={handleGetCurrentLocation}
								disabled={isGettingLocation}
								className="mapetite-quiet-button h-[52px] w-full self-end justify-center rounded-[10px] px-5 text-[15px] shadow-none min-[1261px]:w-auto"
							>
								<Navigation className="mr-2 size-4" />
								{isGettingLocation ? "Locating..." : "Use My Location"}
							</Button>
						</div>
					</section>

					<section className="mapetite-panel-soft mb-4 grid gap-4 p-4 md:p-5">
						<div className="grid gap-3 min-[981px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[981px]:items-center">
							<div className="grid justify-items-center gap-3 min-[981px]:block min-[981px]:justify-items-stretch">
								<div className="text-center min-[981px]:hidden">
									<div className="text-[12px] tracking-[0.14em] text-[rgba(245,233,222,0.48)] uppercase">
										Popular filters
									</div>
								</div>
								<div className="flex max-w-[330px] flex-wrap justify-center gap-2 min-[981px]:max-w-none min-[981px]:justify-start">
									{categories.map((category) => {
										const isActive = selectedCategories.has(category);
										return (
											<button
												key={category}
												type="button"
												onClick={() => toggleCategory(category)}
												className={cn(
													"rounded-full border px-4 py-2 text-sm transition-colors",
													isActive
														? "border-[rgba(213,154,104,0.34)] bg-[rgba(213,154,104,0.12)] text-[var(--mapetite-text)]"
														: "border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.02)] text-[rgba(245,233,222,0.62)] hover:border-[rgba(255,236,220,0.18)] hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]",
												)}
											>
												{category}
											</button>
										);
									})}
								</div>
							</div>

							<div className="grid w-full gap-3 min-[981px]:w-auto min-[981px]:grid-flow-col min-[981px]:items-center min-[981px]:justify-end">
								<div className="grid gap-1.5 min-[981px]:block">
									<div className="text-[12px] tracking-[0.14em] text-[rgba(245,233,222,0.48)] uppercase min-[981px]:hidden">
										Sort
									</div>
									<Select
										value={sortBy}
										onValueChange={(value) =>
											setSortBy(
												value as "distance" | "rating" | "reviews" | "none",
											)
										}
									>
										<SelectTrigger className="h-11 w-full min-w-0 rounded-[10px] border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)] min-[981px]:h-10 min-[981px]:w-auto min-[981px]:min-w-[190px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Sort: Best match</SelectItem>
											<SelectItem value="rating">Sort: Highest rated</SelectItem>
											<SelectItem value="distance">Sort: Closest first</SelectItem>
											<SelectItem value="reviews">Sort: Most reviews</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="grid gap-1.5 min-[981px]:block">
									<div className="text-[12px] tracking-[0.14em] text-[rgba(245,233,222,0.48)] uppercase min-[981px]:hidden">
										Saved
									</div>
									<Button
										type="button"
										variant="outline"
										onClick={() => setShowFavorites(!showFavorites)}
										className={cn(
											"h-11 w-full justify-center gap-1.5 rounded-full px-4 shadow-none min-[981px]:h-10 min-[981px]:w-auto",
											showFavorites
												? "border-[rgba(213,154,104,0.34)] bg-[rgba(213,154,104,0.12)] text-[var(--mapetite-text)]"
												: "mapetite-quiet-button",
										)}
									>
										<Heart
											className={cn("size-4", showFavorites && "fill-current")}
										/>
										{showFavorites ? "Viewing favorites" : "Favorites only"}
									</Button>
								</div>

								{hasResultsForCurrentView && (
									<Button
										type="button"
										variant="outline"
										onClick={() => setShowMobileFilters(true)}
										className="mapetite-quiet-button w-full justify-center rounded-full px-4 shadow-none sm:w-auto md:hidden"
									>
										<SlidersHorizontal className="mr-2 size-4" />
										Filters
									</Button>
								)}
							</div>
						</div>
					</section>

					{showMobileFilters && (
						// biome-ignore lint/a11y/useKeyWithClickEvents: Overlay background for modal - intentional click-to-dismiss UX pattern
						<div
							className="fixed inset-0 z-50 bg-black/50 md:hidden"
							onClick={() => setShowMobileFilters(false)}
						>
							{/* biome-ignore lint/a11y/useKeyWithClickEvents: Prevents click propagation to overlay - intentional UX pattern */}
							<div
								className="absolute right-0 top-0 h-full w-80 max-w-[85vw] border-l border-[var(--mapetite-border)] bg-[#16110e]"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="flex items-center justify-between border-b border-[var(--mapetite-border)] px-4 py-4">
									<div>
										<h2 className="text-base font-semibold text-[var(--mapetite-text)]">
											Filters and sort
										</h2>
										<p className="mapetite-muted-copy text-sm">
											Adjust price, rating, and ordering.
										</p>
									</div>
									<button
										type="button"
										onClick={() => setShowMobileFilters(false)}
										className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)]"
									>
										<X className="size-4" />
									</button>
								</div>

								<div className="space-y-5 px-4 py-4">
									<div className="space-y-3">
										<Label className="text-[var(--mapetite-text)]">
											Price range
										</Label>
										<div className="grid grid-cols-4 gap-2">
											{[1, 2, 3, 4].map((price) => (
												<Button
													key={price}
													type="button"
													variant="outline"
													onClick={() => togglePriceFilter(price)}
													className={cn(
														"rounded-full shadow-none",
														priceFilter.includes(price)
															? "border-[rgba(213,154,104,0.34)] bg-[rgba(213,154,104,0.12)] text-[var(--mapetite-text)]"
															: "mapetite-quiet-button",
													)}
												>
													{"$".repeat(price)}
												</Button>
											))}
										</div>
									</div>

									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<Label className="text-[var(--mapetite-text)]">
												Minimum rating
											</Label>
											<span className="mapetite-muted-copy text-sm">
												{minRating === 0 ? "Any" : `${minRating.toFixed(1)}+`}
											</span>
										</div>
										<Slider
											value={[minRating]}
											onValueChange={(values) => setMinRating(values[0])}
											min={0}
											max={5}
											step={0.5}
											className="[&_[data-slot=slider-range]]:bg-[var(--mapetite-accent)] [&_[data-slot=slider-thumb]]:border-[var(--mapetite-accent)] [&_[data-slot=slider-thumb]]:bg-[#20140d] [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-thumb]]:hover:ring-[rgba(213,154,104,0.22)] [&_[data-slot=slider-thumb]]:focus-visible:ring-[rgba(213,154,104,0.32)] [&_[data-slot=slider-track]]:bg-[rgba(255,248,242,0.08)]"
										/>
									</div>

									<div className="space-y-3">
										<Label className="text-[var(--mapetite-text)]">
											Sort by
										</Label>
										<Select
											value={sortBy}
											onValueChange={(value) =>
												setSortBy(
													value as "distance" | "rating" | "reviews" | "none",
												)
											}
										>
											<SelectTrigger className="h-11 rounded-[10px] border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">Sort: Best match</SelectItem>
												<SelectItem value="distance">Sort: Closest first</SelectItem>
												<SelectItem value="rating">Sort: Highest rated</SelectItem>
												<SelectItem value="reviews">Sort: Most reviews</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center justify-between gap-4">
										<div className="space-y-1">
											<Label className="text-[var(--mapetite-text)]">
												Open now
											</Label>
											<p className="mapetite-muted-copy text-sm">
												Show only restaurants currently open.
											</p>
										</div>
										<Switch
											checked={openNowOnly}
											onCheckedChange={setOpenNowOnly}
										/>
									</div>

									<div className="flex gap-2 border-t border-[var(--mapetite-border)] pt-4">
										<Button
											type="button"
											variant="outline"
											className="mapetite-quiet-button flex-1 shadow-none"
											onClick={clearAllFilters}
										>
											Clear filters
										</Button>
										<Button
											type="button"
											className="mapetite-accent-button flex-1 shadow-none"
											onClick={() => setShowMobileFilters(false)}
										>
											Apply
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}

						{hasResultsForCurrentView && (
							<section className="mapetite-panel mb-4 hidden p-5 md:grid md:gap-5">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div>
									<div className="mapetite-eyebrow">Refine search</div>
									<p className="mapetite-muted-copy mt-3 text-sm">
										Filter by price, rating, distance, and open status.
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowRefinements(!showRefinements)}
									className="mapetite-quiet-button rounded-full px-4 shadow-none"
								>
									{showRefinements ? "Hide" : "Show"}
								</Button>
							</div>

							{showRefinements && (
								<div className="grid gap-5">
									<div className="grid gap-5 lg:grid-cols-2">
										<div className="grid gap-3">
											<Label className="text-[var(--mapetite-text)]">
												Price range
											</Label>
											<div className="grid grid-cols-4 gap-2">
												{[1, 2, 3, 4].map((price) => (
													<Button
														key={price}
														type="button"
														variant="outline"
														onClick={() => togglePriceFilter(price)}
														className={cn(
															"rounded-full shadow-none",
															priceFilter.includes(price)
																? "border-[rgba(213,154,104,0.34)] bg-[rgba(213,154,104,0.12)] text-[var(--mapetite-text)]"
																: "mapetite-quiet-button",
														)}
													>
														{"$".repeat(price)}
													</Button>
												))}
											</div>
										</div>

										<div className="grid gap-3">
											<Label className="text-[var(--mapetite-text)]">
												Sort by
											</Label>
											<Select
												value={sortBy}
												onValueChange={(value) =>
													setSortBy(
														value as "distance" | "rating" | "reviews" | "none",
													)
												}
											>
												<SelectTrigger className="h-11 rounded-[10px] border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">Sort: Best match</SelectItem>
													<SelectItem value="distance">Sort: Closest first</SelectItem>
													<SelectItem value="rating">Sort: Highest rated</SelectItem>
													<SelectItem value="reviews">Sort: Most reviews</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="grid gap-3">
										<div className="flex items-center justify-between">
											<Label className="text-[var(--mapetite-text)]">
												Minimum rating
											</Label>
											<span className="mapetite-muted-copy text-sm">
												{minRating === 0 ? "Any" : `${minRating.toFixed(1)}+`}
											</span>
										</div>
										<Slider
											value={[minRating]}
											onValueChange={(values) => setMinRating(values[0])}
											min={0}
											max={5}
											step={0.5}
											className="[&_[data-slot=slider-range]]:bg-[var(--mapetite-accent)] [&_[data-slot=slider-thumb]]:border-[var(--mapetite-accent)] [&_[data-slot=slider-thumb]]:bg-[#20140d] [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-thumb]]:hover:ring-[rgba(213,154,104,0.22)] [&_[data-slot=slider-thumb]]:focus-visible:ring-[rgba(213,154,104,0.32)] [&_[data-slot=slider-track]]:bg-[rgba(255,248,242,0.08)]"
										/>
									</div>

									<div className="flex items-center justify-between gap-4">
										<div className="space-y-1">
											<Label className="text-[var(--mapetite-text)]">
												Open now
											</Label>
											<p className="mapetite-muted-copy text-sm">
												Show only restaurants currently open.
											</p>
										</div>
										<Switch
											checked={openNowOnly}
											onCheckedChange={setOpenNowOnly}
										/>
									</div>

									<div className="flex justify-end border-t border-[var(--mapetite-border)] pt-4">
										<Button
											type="button"
											variant="outline"
											onClick={clearAllFilters}
											className="mapetite-quiet-button rounded-full px-4 shadow-none"
										>
											Clear filters
										</Button>
									</div>
								</div>
							)}
						</section>
					)}

						{hasResultsForCurrentView && (
							<section className="grid gap-6 min-[1261px]:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] min-[1261px]:items-start">
							<div className="grid gap-4">
								<div className="mapetite-panel flex flex-wrap items-center justify-between gap-3 px-5 py-4">
									<div>
										<strong className="text-[22px] font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											{resultHeading}
										</strong>
										<p className="mapetite-muted-copy mt-1 text-sm">
											{showFavorites
												? hasMoreResults
													? `Showing ${shownResultsCount.toLocaleString()} of ${matchingResultsCount.toLocaleString()} favorite matches`
													: `${matchingResultsCount.toLocaleString()} favorite matches`
												: matchingResultsCount !== totalResultsCount
													? hasMoreResults
														? `Showing ${shownResultsCount.toLocaleString()} of ${matchingResultsCount.toLocaleString()} matching restaurants • ${totalResultsCount.toLocaleString()} results found`
														: `${matchingResultsCount.toLocaleString()} matching restaurants • ${totalResultsCount.toLocaleString()} results found`
													: hasMoreResults
														? `Showing ${shownResultsCount.toLocaleString()} of ${totalResultsCount.toLocaleString()}`
														: `${totalResultsCount.toLocaleString()} ready to browse`}
										</p>
									</div>
									<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
										{matchingResultsCount.toLocaleString()} matching
									</span>
								</div>

								{hasActiveFilters && (
									<div className="mapetite-panel-soft flex flex-wrap items-center gap-2 px-4 py-4">
										<span className="text-sm font-medium text-[var(--mapetite-text)]">
											Active filters
										</span>

										{Array.from(selectedCategories).map((category) => (
											<button
												key={category}
												type="button"
												onClick={() => toggleCategory(category)}
												className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
											>
												{category}
												<X className="size-3" />
											</button>
										))}

										{priceFilter.length < 4 && (
											<button
												type="button"
												onClick={() => setPriceFilter([1, 2, 3, 4])}
												className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
											>
												{"$".repeat(priceFilter.length || 0) || "Any price"}
												<X className="size-3" />
											</button>
										)}

										{minRating > 0 && (
											<button
												type="button"
												onClick={() => setMinRating(0)}
												className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
											>
												<Star className="size-3 fill-current" />
												{minRating.toFixed(1)}+
												<X className="size-3" />
											</button>
										)}

										{openNowOnly && (
											<button
												type="button"
												onClick={() => setOpenNowOnly(false)}
												className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
											>
												<Clock className="size-3" />
												Open now
												<X className="size-3" />
											</button>
										)}

										<Button
											type="button"
											variant="ghost"
											onClick={clearAllFilters}
											className="ml-auto rounded-full text-[var(--mapetite-text-soft)] hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
										>
											Clear all
										</Button>
									</div>
								)}

								{displayedRestaurants.length > 0 &&
									visibleRestaurants.map((restaurant) => {
										const displayCategory = getDisplayCategory(restaurant);
										const previewImage = getPreviewImage(restaurant);
										const isSelected = selectedRestaurantId === restaurant.id;
										const priceLabel = restaurant.priceRange
											? "$".repeat(restaurant.priceRange)
											: null;
										const openLabel = restaurant.hours
											? restaurant.isOpenNow
												? `Open until ${restaurant.hours.close}`
												: `Hours ${restaurant.hours.open} - ${restaurant.hours.close}`
											: null;
										const summary = truncateCopy(
											restaurant.description,
											110,
											"Restaurant discovered from your current search. Open the detail page once it feels worth the trip.",
										);

										return (
											<article
												key={restaurant.id}
												role="button"
												tabIndex={0}
												onClick={() => handleSelectRestaurant(restaurant.id)}
												onKeyDown={(event) => {
													if (event.key === "Enter" || event.key === " ") {
														event.preventDefault();
														handleSelectRestaurant(restaurant.id);
													}
												}}
												className={cn(
													"grid gap-4 rounded-[14px] border p-4 text-left transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[rgba(213,154,104,0.92)] min-[981px]:grid-cols-[172px_minmax(0,1fr)_auto] min-[981px]:gap-4 min-[981px]:p-[18px]",
													isSelected
														? "border-[rgba(213,154,104,0.24)] bg-[rgba(255,248,242,0.05)] shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
														: "border-[rgba(255,236,220,0.08)] bg-[var(--mapetite-surface)] shadow-[0_18px_40px_rgba(0,0,0,0.18)] hover:border-[rgba(213,154,104,0.24)] hover:bg-[rgba(255,248,242,0.05)] hover:-translate-y-[1px]",
												)}
											>
												<div className="grid min-h-[132px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[12px] border border-[rgba(255,236,220,0.08)]">
													{previewImage ? (
														<div className="relative h-full min-h-[132px]">
															<img
																src={previewImage}
																alt={restaurant.name}
																className="absolute inset-0 h-full w-full object-cover"
																referrerPolicy="no-referrer"
															/>
															<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,15,13,0.08),rgba(19,15,13,0.74))]" />
															<div className="relative grid h-full grid-rows-[auto_1fr_auto] p-[14px]">
																<strong className="text-[22px] font-semibold tracking-[-0.04em] text-[rgba(255,244,236,0.92)]">
																	{getRestaurantInitials(restaurant)}
																</strong>
																<div />
																<span className="text-[12px] text-[rgba(245,233,222,0.72)]">
																	{displayCategory
																		? `${displayCategory} · ${getLocationHint(restaurant)}`
																		: getLocationHint(restaurant)}
																</span>
															</div>
														</div>
													) : (
														<div className="mapetite-media-fallback grid h-full min-h-[132px] grid-rows-[auto_1fr_auto] p-[14px]">
															<strong className="text-[22px] font-semibold tracking-[-0.04em] text-[rgba(255,244,236,0.92)]">
																{getRestaurantInitials(restaurant)}
															</strong>
															<div />
															<span className="text-[12px] text-[rgba(245,233,222,0.68)]">
																{displayCategory
																	? `${displayCategory} · ${getLocationHint(restaurant)}`
																	: getLocationHint(restaurant)}
															</span>
														</div>
													)}
												</div>

												<div className="grid gap-[10px]">
													<div className="flex flex-wrap items-center justify-between gap-3">
														<div>
															<h3 className="m-0 text-[clamp(1.8rem,2.2vw,2rem)] font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
																{restaurant.name}
															</h3>
															<p className="mapetite-muted-copy mt-2 text-[15px]">
																{displayCategory
																	? `${displayCategory} · ${getLocationHint(restaurant)}`
																	: getLocationHint(restaurant)}
															</p>
														</div>

														<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
															{restaurant.rating != null
																? `${restaurant.rating.toFixed(1)} rating`
																: restaurant.reviewCount
																	? `${restaurant.reviewCount} reviews`
																	: "New listing"}
														</span>
													</div>

													<p className="m-0 text-[15px] leading-[1.6] text-[var(--mapetite-text-soft)]">
														{summary}
													</p>

													<div className="flex flex-wrap gap-2">
														{priceLabel ? (
															<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
																{priceLabel}
															</span>
														) : null}
														{displayCategory ? (
															<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
																{displayCategory}
															</span>
														) : null}
														{openLabel ? (
															<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
																{openLabel}
															</span>
														) : null}
														{restaurant.reviewCount != null ? (
															<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
																{restaurant.reviewCount.toLocaleString()} reviews
															</span>
														) : null}
													</div>
												</div>

												<div className="grid content-start gap-2 min-[981px]:min-w-[120px] min-[981px]:justify-items-end">
													<Button
														asChild
														className="mapetite-accent-button h-11 w-full justify-center rounded-full px-4 text-[15px] font-semibold text-[#20140d] shadow-none min-[981px]:w-auto"
														onClick={(event) => event.stopPropagation()}
													>
														<Link
															to="/restaurants/$restaurantId"
															params={{ restaurantId: restaurant.id }}
														>
															View details
														</Link>
													</Button>

													<Button
														type="button"
														variant="outline"
														onClick={(event) => {
															event.stopPropagation();
															toggleFavorite(restaurant.id);
														}}
														disabled={isTogglingFavorite}
														className={cn(
															"mapetite-quiet-button h-11 w-full justify-center gap-1.5 rounded-full px-4 shadow-none min-[981px]:h-10 min-[981px]:w-[112px] min-[981px]:px-3.5",
															favoriteIds.has(restaurant.id) &&
																"border-[rgba(213,154,104,0.34)] bg-[rgba(213,154,104,0.12)] text-[var(--mapetite-text)]",
														)}
													>
														<Heart
															className={cn(
																"size-4",
																favoriteIds.has(restaurant.id) && "fill-current",
															)}
														/>
														{favoriteIds.has(restaurant.id) ? "Saved" : "Save"}
													</Button>

													<Button
														asChild
														variant="outline"
														className="mapetite-quiet-button h-11 w-full justify-center rounded-full px-4 shadow-none min-[981px]:h-10 min-[981px]:w-[112px] min-[981px]:px-3.5"
														onClick={(event) => event.stopPropagation()}
													>
														<a
															href={buildDirectionsUrl(restaurant)}
															target="_blank"
															rel="noreferrer"
														>
															Directions
														</a>
													</Button>

													{isSelected ? (
														<span className="hidden h-10 w-[112px] items-center justify-center rounded-full border border-[rgba(213,154,104,0.24)] bg-[rgba(213,154,104,0.12)] px-3.5 text-center text-[13px] text-[var(--mapetite-text)] min-[981px]:inline-flex">
															Previewing
														</span>
													) : null}
												</div>
											</article>
										);
									})}

								{displayedRestaurants.length > 0 && (
									<div className="flex flex-col items-center gap-3 pt-2">
										{hasMoreResults ? (
											<Button
												type="button"
												variant="outline"
												onClick={handleShowMoreResults}
												className="mapetite-quiet-button w-full rounded-full px-5 shadow-none sm:w-auto"
											>
												Show more restaurants
											</Button>
										) : matchingResultsCount > INITIAL_VISIBLE_RESULTS ? (
											<p className="mapetite-muted-copy text-sm">
												You&apos;ve reached the end of these results.
											</p>
										) : null}
									</div>
								)}

									{hasResultsForCurrentView &&
										displayedRestaurants.length === 0 &&
										!showFavorites && (
										<div className="mapetite-panel grid gap-4 px-6 py-10 text-center">
											<div className="mx-auto flex size-12 items-center justify-center rounded-[12px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)]">
												<Filter className="size-5" />
											</div>
											<div>
												<h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
													No matches for the current filters
												</h3>
												<p className="mapetite-muted-copy mt-2 text-sm">
													Adjust the filters above or clear them to widen the search.
												</p>
											</div>
											<div>
												<Button
													type="button"
													variant="outline"
													onClick={clearAllFilters}
													className="mapetite-quiet-button rounded-full px-5 shadow-none"
												>
													Clear filters
												</Button>
											</div>
										</div>
									)}
							</div>

							{displayedRestaurants.length > 0 && (
								<aside className="mapetite-panel hidden h-fit gap-[18px] p-[22px] min-[1261px]:sticky min-[1261px]:top-[94px] min-[1261px]:grid min-[1261px]:self-start">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<span className="text-[12px] uppercase tracking-[0.14em] text-[rgba(245,233,222,0.5)]">
											Selected restaurant
										</span>
										{selectedRestaurant?.rating != null ? (
											<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
												{selectedRestaurant.rating.toFixed(1)} rating
											</span>
										) : null}
									</div>

									{selectedRestaurant ? (
										<>
											<h2 className="m-0 text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--mapetite-text)]">
												{selectedRestaurant.name}
											</h2>

											<div className="grid h-[220px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[14px] border border-[rgba(255,236,220,0.08)]">
												{getPreviewImage(selectedRestaurant) ? (
													<div className="relative h-full">
														<img
															src={getPreviewImage(selectedRestaurant) ?? ""}
															alt={selectedRestaurant.name}
															className="absolute inset-0 h-full w-full object-cover"
															referrerPolicy="no-referrer"
														/>
														<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,15,13,0.08),rgba(19,15,13,0.68))]" />
														<div className="relative grid h-full grid-rows-[auto_1fr_auto] p-4">
															<strong className="text-[28px] font-semibold tracking-[-0.05em] text-[rgba(255,244,236,0.92)]">
																{getRestaurantInitials(selectedRestaurant)}
															</strong>
															<div />
															<span className="text-[13px] text-[rgba(245,233,222,0.68)]">
																{getDisplayCategory(selectedRestaurant)
																	? `${getDisplayCategory(selectedRestaurant)} · ${getLocationHint(selectedRestaurant)}`
																	: getLocationHint(selectedRestaurant)}
															</span>
														</div>
													</div>
												) : (
													<div className="mapetite-media-fallback grid h-full grid-rows-[auto_1fr_auto] p-4">
														<strong className="text-[28px] font-semibold tracking-[-0.05em] text-[rgba(255,244,236,0.92)]">
															{getRestaurantInitials(selectedRestaurant)}
														</strong>
														<div />
														<span className="text-[13px] text-[rgba(245,233,222,0.68)]">
															{getDisplayCategory(selectedRestaurant)
																? `${getDisplayCategory(selectedRestaurant)} · ${getLocationHint(selectedRestaurant)}`
																: getLocationHint(selectedRestaurant)}
														</span>
													</div>
												)}
											</div>

											<p className="text-[15px] leading-[1.68] text-[var(--mapetite-text-soft)]">
												{truncateCopy(
													selectedRestaurant.description,
													220,
													"Keep the shortlist broad until one room feels worth the route. Use this panel to compare the address, timing, and quick cues before opening full details.",
												)}
											</p>

											<div className="flex flex-wrap gap-2">
												{getDisplayCategory(selectedRestaurant) ? (
													<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
														{getDisplayCategory(selectedRestaurant)}
													</span>
												) : null}
												{selectedRestaurant.address.city ? (
													<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
														{selectedRestaurant.address.city}
													</span>
												) : null}
												{selectedRestaurant.priceRange ? (
													<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
														{"$".repeat(selectedRestaurant.priceRange)}
													</span>
												) : null}
												{selectedRestaurant.hours ? (
													<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
														{selectedRestaurant.isOpenNow
															? `Open until ${selectedRestaurant.hours.close}`
															: `${selectedRestaurant.hours.open} - ${selectedRestaurant.hours.close}`}
													</span>
												) : null}
											</div>

											<div className="grid gap-3 sm:flex sm:flex-wrap">
												<Button
													asChild
													className="mapetite-accent-button h-[46px] w-full justify-center rounded-[10px] px-5 text-[15px] font-semibold text-[#20140d] shadow-none sm:w-auto"
												>
													<Link
														to="/restaurants/$restaurantId"
														params={{ restaurantId: selectedRestaurant.id }}
													>
														View details
													</Link>
												</Button>
												<Button
													type="button"
													variant="outline"
													onClick={() => toggleFavorite(selectedRestaurant.id)}
													disabled={isTogglingFavorite}
													className={cn(
														"mapetite-quiet-button h-[46px] w-full justify-center gap-1.5 rounded-[10px] px-5 shadow-none sm:w-auto min-[1261px]:h-10 min-[1261px]:w-[132px] min-[1261px]:px-4",
														favoriteIds.has(selectedRestaurant.id) &&
															"border-[rgba(213,154,104,0.34)] bg-[rgba(213,154,104,0.12)] text-[var(--mapetite-text)]",
													)}
												>
													<Heart
														className={cn(
															"size-4",
															favoriteIds.has(selectedRestaurant.id) && "fill-current",
														)}
													/>
													{favoriteIds.has(selectedRestaurant.id)
														? "Saved"
														: "Save favorite"}
												</Button>
												<Button
													asChild
													variant="outline"
													className="mapetite-quiet-button h-[46px] w-full justify-center rounded-[10px] px-5 shadow-none sm:w-auto min-[1261px]:h-10 min-[1261px]:w-[132px] min-[1261px]:px-4"
												>
													<a
														href={buildDirectionsUrl(selectedRestaurant)}
														target="_blank"
														rel="noreferrer"
													>
														Directions
													</a>
												</Button>
											</div>

											<div className="grid gap-3 border-t border-[rgba(255,236,220,0.08)] pt-4">
												<div>
													<strong className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--mapetite-text)]">
														{getFullAddressLine(selectedRestaurant) || "Address available in details"}
													</strong>
													<p className="mapetite-muted-copy mt-2 text-[14px] leading-6">
														{selectedRestaurant.reviewCount
															? `A stronger comparison pick when the shortlist should stay narrow and the room needs enough confidence to justify the route. ${selectedRestaurant.reviewCount.toLocaleString()} reviews available once you open details.`
															: "Use the full detail page when the address, timing, and route feel close enough to commit."}
													</p>
												</div>
											</div>
										</>
									) : (
										<div className="grid gap-4">
											<div className="mapetite-media-fallback grid h-[220px] grid-rows-[auto_1fr_auto] rounded-[14px] p-4">
												<strong className="text-[28px] font-semibold tracking-[-0.05em] text-[rgba(255,244,236,0.92)]">
													MP
												</strong>
												<div />
												<span className="text-[13px] text-[rgba(245,233,222,0.68)]">
													Preview one room while the rest of the shortlist stays visible.
												</span>
											</div>
											<h2 className="m-0 text-[30px] font-semibold leading-[1.04] tracking-[-0.05em] text-[var(--mapetite-text)]">
												Select a restaurant to preview.
											</h2>
											<p className="text-[15px] leading-[1.68] text-[var(--mapetite-text-soft)]">
												Choose a card from the left to keep one restaurant visible
												while you compare the shortlist. The full decision screen
												still lives on its own detail page.
											</p>
											<div className="grid gap-3 border-t border-[rgba(255,236,220,0.08)] pt-4">
												<div className="flex items-center gap-3 text-[14px] text-[var(--mapetite-text-soft)]">
													<MapPinned className="size-4 text-[var(--mapetite-accent)]" />
													<span>User-driven only. No automatic selection.</span>
												</div>
											</div>
										</div>
									)}
								</aside>
							)}
						</section>
					)}

					{isSearching && (
						<section className="mt-6 grid gap-4">
							<div className="mapetite-panel grid gap-3 px-6 py-5">
								<div className="h-4 w-40 rounded-full bg-[rgba(255,248,242,0.08)]" />
								<div className="h-3 w-[58%] rounded-full bg-[rgba(255,248,242,0.08)]" />
								<div className="grid gap-3 min-[981px]:grid-cols-2">
									<div className="mapetite-media-fallback h-32 rounded-[12px]" />
									<div className="grid gap-3">
										<div className="h-4 w-full rounded-full bg-[rgba(255,248,242,0.08)]" />
										<div className="h-4 w-[84%] rounded-full bg-[rgba(255,248,242,0.08)]" />
										<div className="h-4 w-[70%] rounded-full bg-[rgba(255,248,242,0.08)]" />
									</div>
								</div>
							</div>
						</section>
					)}

						{!showFavorites && restaurants.length === 0 && !isSearching && (
							<section className="mt-6">
							<div className="mapetite-panel grid gap-4 px-6 py-10 text-center">
								<div className="mx-auto flex size-12 items-center justify-center rounded-[12px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)]">
									<Search className="size-5" />
								</div>
								<div>
									<h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
										Search for restaurants
									</h3>
									<p className="mapetite-muted-copy mt-2 text-sm">
										Enter a city, state, or country above to open the list.
									</p>
								</div>
							</div>
						</section>
					)}

						{showFavorites &&
							!isHydratingFavorites &&
							displayedRestaurants.length === 0 && (
								<section className="mt-6">
									<div className="mapetite-panel grid gap-4 px-6 py-10 text-center">
										<Heart className="mx-auto size-8 text-[var(--mapetite-text-faint)]" />
										<div>
											<h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
												{favoriteIdList.length === 0
													? "No favorites yet"
													: "No favorite matches for these filters"}
											</h3>
											<p className="mapetite-muted-copy mt-2 text-sm">
												{favoriteIdList.length === 0
													? "Save restaurants from the list to collect them here."
													: "Try adjusting filters or sort to widen your saved shortlist."}
											</p>
										</div>
										<div>
										<Button
											type="button"
											onClick={() => setShowFavorites(false)}
											variant="outline"
											className="mapetite-quiet-button rounded-full px-5 shadow-none"
										>
											Browse restaurants
										</Button>
									</div>
								</div>
							</section>
						)}

						{showFavorites && isHydratingFavorites && displayedRestaurants.length === 0 && (
							<section className="mt-6">
								<div className="mapetite-panel grid gap-4 px-6 py-10 text-center">
									<Heart className="mx-auto size-8 text-[var(--mapetite-text-faint)]" />
									<div>
										<h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											Loading saved favorites
										</h3>
										<p className="mapetite-muted-copy mt-2 text-sm">
											Retrieving saved restaurants that are outside the current search list.
										</p>
									</div>
								</div>
							</section>
						)}
				</div>

				{selectedRestaurant && (
					<div className="fixed inset-x-4 bottom-4 z-40 min-[1261px]:hidden">
						<div className="mapetite-panel-soft border border-[rgba(255,236,220,0.12)] bg-[rgba(24,18,14,0.94)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<strong className="truncate text-[18px] font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											{selectedRestaurant.name}
										</strong>
										{selectedRestaurant.rating != null ? (
											<span className="rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] px-2.5 py-1 text-[12px] text-[var(--mapetite-text-soft)]">
												{selectedRestaurant.rating.toFixed(1)}
											</span>
										) : null}
									</div>
									<p className="mapetite-muted-copy mt-1 truncate text-[13px] leading-5">
										{getDisplayCategory(selectedRestaurant)
											? `${getDisplayCategory(selectedRestaurant)} · ${getLocationHint(selectedRestaurant)}`
											: getLocationHint(selectedRestaurant)}
									</p>
								</div>

								<button
									type="button"
									onClick={() => setSelectedRestaurantId(null)}
									className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(255,236,220,0.1)] bg-[rgba(255,248,242,0.03)] text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
									aria-label="Dismiss selected restaurant preview"
								>
									<X className="size-4" />
								</button>
							</div>

							<div className="mt-3 grid grid-cols-2 gap-2">
								<Button
									asChild
									className="mapetite-accent-button h-11 w-full justify-center rounded-full px-4 text-[14px] font-semibold text-[#20140d] shadow-none"
								>
									<Link
										to="/restaurants/$restaurantId"
										params={{ restaurantId: selectedRestaurant.id }}
									>
										View details
									</Link>
								</Button>

								<Button
									asChild
									variant="outline"
									className="mapetite-quiet-button h-11 w-full justify-center rounded-full px-4 text-[14px] shadow-none"
								>
									<a
										href={buildDirectionsUrl(selectedRestaurant)}
										target="_blank"
										rel="noreferrer"
									>
										Directions
									</a>
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
}
