import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { reverseGeocode } from "@/lib/api/nominatim";
import { searchRestaurants } from "@/lib/search-restaurants";
import { cn } from "@/lib/utils";
import { useRestaurantSearchStore } from "@/store/restaurant-search-store";
import type { Restaurant } from "@/store/restaurant-search-store";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Clock,
	DollarSign,
	Filter,
	Heart,
	MapPin,
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

export const Route = createFileRoute("/restaurants")({
	component: App,
	validateSearch: (search: Record<string, unknown>): RestaurantsSearch => {
		return {
			city: typeof search.city === "string" ? search.city : undefined,
		};
	},
});

function App() {
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
	const activeSearchIdRef = useRef(0);

	const categories = [
		"Noodles",
		"Vegetarian",
		"Healthy",
		"Fast-Food",
		"Best Tourist Spot",
	];

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
	const favoriteIds = useMemo(
		() => new Set(favoritesData?.favorites ?? []),
		[favoritesData?.favorites],
	);

	// Memoize filtered and sorted restaurant list to prevent unnecessary re-renders.
	// This expensive operation (filtering + sorting large arrays) only runs when:
	// - restaurants array changes (new search results)
	// - filter/sort parameters change (priceFilter, minRating, openNowOnly, sortBy)
	// - favorites toggle or favorites list changes (showFavorites, favoriteIds)
	// Note: location is NOT a dependency because distance is pre-calculated in restaurant objects.
	const displayedRestaurants = useMemo(() => {
		// Start with favorites filter if enabled, otherwise use all restaurants
		let filtered = showFavorites
			? restaurants.filter((r) => favoriteIds.has(r.id))
			: restaurants;

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
		showFavorites,
		favoriteIds,
		priceFilter,
		minRating,
		openNowOnly,
		sortBy,
	]);

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

	return (
		<Layout>
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
				<section className="space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
						Restaurant search
					</h1>
					<p className="max-w-2xl text-sm text-muted-foreground">
						Search by city, then narrow results with cuisine, price, rating, and
						open-now filters.
					</p>
				</section>

				<Card className="border border-border">
					<CardHeader>
						<CardTitle className="text-lg">Search</CardTitle>
						<CardDescription>
							Enter a location and choose any categories you want included.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="grid gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="country">Country</Label>
								<Input
									id="country"
									placeholder="Optional"
									value={location.country}
									onChange={(e) => updateLocation({ country: e.target.value })}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="state">State or province</Label>
								<Input
									id="state"
									placeholder="State or province"
									value={location.state}
									onChange={(e) => updateLocation({ state: e.target.value })}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									placeholder="Paris, Tokyo, Chicago"
									value={location.city}
									onChange={(e) => updateLocation({ city: e.target.value })}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button
								onClick={handleSearch}
								size="lg"
								disabled={isSearching}
								className="w-full sm:w-auto"
							>
								<Search className="mr-2 size-4" />
								{isSearching ? "Searching..." : "Search restaurants"}
							</Button>
							<Button
								variant="outline"
								size="lg"
								onClick={handleGetCurrentLocation}
								disabled={isGettingLocation}
								className="w-full sm:w-auto"
							>
								<Navigation className="mr-2 size-4" />
								{isGettingLocation ? "Locating..." : "Use my location"}
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="border border-border">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Filter className="size-4 text-primary" />
							Categories
						</CardTitle>
						<CardDescription>
							Choose one or more categories to include in the search.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{categories.map((category) => (
								<Badge
									key={category}
									variant={
										selectedCategories.has(category) ? "default" : "outline"
									}
									className="cursor-pointer px-3 py-1.5"
									onClick={() => toggleCategory(category)}
								>
									{category}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>

				{restaurants.length > 0 && (
					<div className="md:hidden">
						<Button
							onClick={() => setShowMobileFilters(true)}
							variant="outline"
							className="w-full"
						>
							<SlidersHorizontal className="mr-2 size-4" />
							Filters and sort
						</Button>
					</div>
				)}

				{showMobileFilters && (
					// biome-ignore lint/a11y/useKeyWithClickEvents: Overlay background for modal - intentional click-to-dismiss UX pattern
					<div
						className="fixed inset-0 z-50 bg-black/50 md:hidden"
						onClick={() => setShowMobileFilters(false)}
					>
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: Prevents click propagation to overlay - intentional UX pattern */}
						<div
							className="absolute right-0 top-0 h-full w-80 max-w-[85vw] border-l border-border bg-background"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center justify-between border-b border-border px-4 py-4">
								<div>
									<h2 className="text-base font-semibold text-foreground">
										Filters and sort
									</h2>
									<p className="text-sm text-muted-foreground">
										Adjust price, rating, and ordering.
									</p>
								</div>
								<button
									type="button"
									onClick={() => setShowMobileFilters(false)}
									className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted"
								>
									<X className="size-4" />
								</button>
							</div>
							<div className="space-y-5 px-4 py-4">
								<div className="space-y-3">
									<Label>Price range</Label>
									<div className="flex flex-wrap gap-2">
										{[1, 2, 3, 4].map((price) => (
											<Button
												key={price}
												variant={
													priceFilter.includes(price) ? "default" : "outline"
												}
												size="sm"
												onClick={() => togglePriceFilter(price)}
											>
												{"$".repeat(price)}
											</Button>
										))}
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label>Minimum rating</Label>
										<span className="text-sm text-muted-foreground">
											{minRating === 0 ? "Any" : `${minRating.toFixed(1)}+`}
										</span>
									</div>
									<Slider
										value={[minRating]}
										onValueChange={(values) => setMinRating(values[0])}
										min={0}
										max={5}
										step={0.5}
									/>
								</div>

								<div className="space-y-3">
									<Label>Sort by</Label>
									<Select
										value={sortBy}
										onValueChange={(value) =>
											setSortBy(
												value as "distance" | "rating" | "reviews" | "none",
											)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Default</SelectItem>
											<SelectItem value="distance">Distance</SelectItem>
											<SelectItem value="rating">Rating</SelectItem>
											<SelectItem value="reviews">Most reviews</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center justify-between gap-4">
									<div className="space-y-1">
										<Label>Open now</Label>
										<p className="text-sm text-muted-foreground">
											Show only restaurants currently open.
										</p>
									</div>
									<Switch
										checked={openNowOnly}
										onCheckedChange={setOpenNowOnly}
									/>
								</div>

								<div className="flex gap-2 border-t border-border pt-4">
									<Button
										variant="outline"
										className="flex-1"
										onClick={clearAllFilters}
									>
										Clear filters
									</Button>
									<Button className="flex-1" onClick={() => setShowMobileFilters(false)}>
										Apply
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}

				{restaurants.length > 0 && (
					<Card className="hidden border border-border md:block">
						<CardHeader>
							<div className="flex items-center justify-between gap-4">
								<div>
									<CardTitle className="flex items-center gap-2 text-lg">
										<SlidersHorizontal className="size-4 text-primary" />
										Refine search
									</CardTitle>
									<CardDescription>
										Filter by price, rating, distance, and open status.
									</CardDescription>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowRefinements(!showRefinements)}
								>
									{showRefinements ? "Hide" : "Show"}
								</Button>
							</div>
						</CardHeader>
						{showRefinements && (
							<CardContent className="space-y-5">
								<div className="grid gap-5 lg:grid-cols-2">
									<div className="space-y-3">
										<Label>Price range</Label>
										<div className="grid grid-cols-4 gap-2">
											{[1, 2, 3, 4].map((price) => (
												<Button
													key={price}
													variant={
														priceFilter.includes(price) ? "default" : "outline"
													}
													size="sm"
													onClick={() => togglePriceFilter(price)}
												>
													{"$".repeat(price)}
												</Button>
											))}
										</div>
									</div>

									<div className="space-y-3">
										<Label>Sort by</Label>
										<Select
											value={sortBy}
											onValueChange={(value) =>
												setSortBy(
													value as "distance" | "rating" | "reviews" | "none",
												)
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">Default</SelectItem>
												<SelectItem value="distance">Distance</SelectItem>
												<SelectItem value="rating">Rating</SelectItem>
												<SelectItem value="reviews">Most reviews</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label>Minimum rating</Label>
										<span className="text-sm text-muted-foreground">
											{minRating === 0 ? "Any" : `${minRating.toFixed(1)}+`}
										</span>
									</div>
									<Slider
										value={[minRating]}
										onValueChange={(values) => setMinRating(values[0])}
										min={0}
										max={5}
										step={0.5}
									/>
								</div>

								<div className="flex items-center justify-between gap-4">
									<div className="space-y-1">
										<Label>Open now</Label>
										<p className="text-sm text-muted-foreground">
											Show only restaurants currently open.
										</p>
									</div>
									<Switch
										checked={openNowOnly}
										onCheckedChange={setOpenNowOnly}
									/>
								</div>

								<div className="flex justify-end border-t border-border pt-4">
									<Button variant="outline" onClick={clearAllFilters}>
										Clear filters
									</Button>
								</div>
							</CardContent>
						)}
					</Card>
				)}

				{restaurants.length > 0 && (
					<div className="space-y-4">
						<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<div>
								<h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
									{showFavorites
										? `Favorites (${favoritesData?.count ?? 0})`
										: `${restaurants.length} results`}
								</h2>
								{displayedRestaurants.length !== restaurants.length && (
									<p className="mt-1 text-sm text-muted-foreground">
										Showing {displayedRestaurants.length} matches.
									</p>
								)}
							</div>
							<Button
								variant={showFavorites ? "default" : "outline"}
								onClick={() => setShowFavorites(!showFavorites)}
							>
								<Heart
									className={cn("mr-2 size-4", showFavorites && "fill-current")}
								/>
								{showFavorites ? "View all" : "View favorites"}
							</Button>
						</div>

						{(selectedCategories.size > 0 ||
							priceFilter.length < 4 ||
							minRating > 0 ||
							openNowOnly) && (
							<div className="rounded-lg border border-border bg-card p-4">
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-sm font-medium text-foreground">
										Active filters
									</span>

									{Array.from(selectedCategories).map((category) => (
										<Badge
											key={category}
											variant="outline"
											className="cursor-pointer"
											onClick={() => toggleCategory(category)}
										>
											{category}
											<X className="size-3" />
										</Badge>
									))}

									{priceFilter.length < 4 && (
										<Badge
											variant="outline"
											className="cursor-pointer"
											onClick={() => setPriceFilter([1, 2, 3, 4])}
										>
											{"$".repeat(priceFilter.length || 0) || "Any price"}
											<X className="size-3" />
										</Badge>
									)}

									{minRating > 0 && (
										<Badge
											variant="outline"
											className="cursor-pointer"
											onClick={() => setMinRating(0)}
										>
											<Star className="size-3 fill-current" />
											{minRating.toFixed(1)}+
											<X className="size-3" />
										</Badge>
									)}

									{openNowOnly && (
										<Badge
											variant="outline"
											className="cursor-pointer"
											onClick={() => setOpenNowOnly(false)}
										>
											<Clock className="size-3" />
											Open now
											<X className="size-3" />
										</Badge>
									)}

									<Button
										variant="ghost"
										size="sm"
										onClick={clearAllFilters}
										className="ml-auto"
									>
										Clear all
									</Button>
								</div>
							</div>
						)}
					</div>
				)}

				{restaurants.length > 0 && displayedRestaurants.length > 0 && (
					<div className="space-y-4">
						{displayedRestaurants.map((restaurant) => (
							<Card key={restaurant.id} className="border border-border">
								<CardContent className="p-4 md:p-5">
									<div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
										<div className="overflow-hidden rounded-md border border-border bg-muted">
											<div className="aspect-[4/3] w-full">
												{restaurant.photoUrl ? (
													<img
														src={restaurant.photoUrl}
														alt={restaurant.name}
														className="h-full w-full object-cover"
														referrerPolicy="no-referrer"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center">
														<Utensils className="size-8 text-muted-foreground" />
													</div>
												)}
											</div>
										</div>

										<div className="space-y-3">
											<div className="flex items-start justify-between gap-3">
												<div className="space-y-1">
													<h3 className="text-lg font-semibold tracking-tight text-foreground">
														{restaurant.name}
													</h3>
													<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
														<span>
															{restaurant.address.city}, {restaurant.address.state}
														</span>
														{(() => {
															const displayCategory = getDisplayCategory(restaurant);
															return displayCategory ? (
																<Badge variant="outline">{displayCategory}</Badge>
															) : null;
														})()}
													</div>
												</div>

												<Button
													size="icon"
													variant={
														favoriteIds.has(restaurant.id) ? "default" : "outline"
													}
													onClick={() => toggleFavorite(restaurant.id)}
													disabled={isTogglingFavorite}
												>
													<Heart
														className={cn(
															"size-4",
															favoriteIds.has(restaurant.id) && "fill-current",
														)}
													/>
												</Button>
											</div>

											{restaurant.rating != null && (
												<div className="flex flex-wrap items-center gap-2">
													<div className="flex items-center gap-0.5">
														{[...Array(5)].map((_, i) => (
															<Star
																key={`star-${restaurant.id}-${i}`}
																className={cn(
																	"size-4",
																	i < Math.floor(restaurant.rating)
																		? "fill-primary text-primary"
																		: i < restaurant.rating
																			? "fill-primary/50 text-primary"
																			: "fill-muted text-muted-foreground",
																)}
															/>
														))}
													</div>
													<span className="text-sm font-medium text-foreground">
														{restaurant.rating.toFixed(1)}
													</span>
													{restaurant.reviewCount != null && (
														<span className="text-sm text-muted-foreground">
															({restaurant.reviewCount} reviews)
														</span>
													)}
												</div>
											)}

											<p className="text-sm leading-relaxed text-muted-foreground">
												{restaurant.description}
											</p>

											<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
												{restaurant.priceRange != null && (
													<div className="flex items-center gap-1">
														<DollarSign className="size-4 text-primary" />
														<span>{"$".repeat(restaurant.priceRange)} Pricing</span>
													</div>
												)}
												{restaurant.hours && (
													<div className="flex items-center gap-2">
														<Clock className="size-4 text-primary" />
														<span>
															{restaurant.hours.open} - {restaurant.hours.close}
														</span>
														<Badge
															variant={
																restaurant.isOpenNow ? "default" : "secondary"
															}
														>
															{restaurant.isOpenNow ? "Open now" : "Closed"}
														</Badge>
													</div>
												)}
											</div>

											<div className="flex flex-wrap gap-2">
												<Button asChild variant="outline">
													<Link
														to="/restaurants/$restaurantId"
														params={{ restaurantId: restaurant.id }}
														onClick={() => {
															console.log(
																"[ViewDetails] clicked restaurant:",
																restaurant.id,
																restaurant.name,
															);
															console.log(
																"[ViewDetails] navigating to detail route:",
																`/restaurants/${restaurant.id}`,
															);
														}}
													>
														View details
													</Link>
												</Button>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{restaurants.length > 0 &&
					displayedRestaurants.length === 0 &&
					!showFavorites && (
						<Card className="border border-border">
							<CardContent className="py-10 text-center">
								<h3 className="text-lg font-semibold text-foreground">
									No matches for the current filters
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									Adjust the filters above or clear them to widen the search.
								</p>
								<Button variant="outline" className="mt-4" onClick={clearAllFilters}>
									Clear filters
								</Button>
							</CardContent>
						</Card>
					)}

				{restaurants.length === 0 && !isSearching && (
					<Card className="border border-border">
						<CardContent className="py-10 text-center">
							<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md border border-border bg-background">
								<Search className="size-5 text-primary" />
							</div>
							<h3 className="text-lg font-semibold text-foreground">
								Search for restaurants
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Enter a location above to load results.
							</p>
						</CardContent>
					</Card>
				)}

				{showFavorites &&
					displayedRestaurants.length === 0 &&
					restaurants.length > 0 && (
						<Card className="border border-border">
							<CardContent className="py-10 text-center">
								<Heart className="mx-auto size-8 text-muted-foreground" />
								<h3 className="mt-3 text-lg font-semibold text-foreground">
									No favorites yet
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									Mark restaurants as favorites to collect them here.
								</p>
								<Button
									onClick={() => setShowFavorites(false)}
									variant="outline"
									className="mt-4"
								>
									Browse restaurants
								</Button>
							</CardContent>
						</Card>
					)}
			</div>
		</Layout>
	);
}
