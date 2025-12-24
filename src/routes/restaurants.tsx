import { ChefProfileSection } from "@/components/ChefProfileSection";
import { DetailPhotoCarousel } from "@/components/DetailPhotoCarousel";
import { Layout } from "@/components/Layout";
import { ReservationModal } from "@/components/ReservationModal";
import { ReviewSummary } from "@/components/ReviewSummary";
import { SignatureMenu } from "@/components/SignatureMenu";
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
import {
	resolveCityLocation,
	searchRestaurants,
} from "@/lib/search-restaurants";
import { cn } from "@/lib/utils";
import { useRestaurantSearchStore } from "@/store/restaurant-search-store";
import type { Restaurant } from "@/store/restaurant-search-store";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	ArrowUpDown,
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
	const [selectedRestaurant, setSelectedRestaurant] =
		useState<Restaurant | null>(null);
	const [isGettingLocation, setIsGettingLocation] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [reservationModalOpen, setReservationModalOpen] = useState(false);
	const [restaurantToReserve, setRestaurantToReserve] =
		useState<Restaurant | null>(null);

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
				const resolved = await resolveCityLocation(searchCity);
				if (!resolved) return;
				setLocation(resolved);
				const results = await searchRestaurants(resolved, []);
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
		setIsSearching(true);
		try {
			const resolved =
				(location.latitude && location.longitude && location) ||
				(await resolveCityLocation(
					location.city,
					location.state,
					location.country,
				));
			if (!resolved) {
				toast.error("Could not find that location");
				return;
			}
			setLocation(resolved);
			const results = await searchRestaurants(
				resolved,
				Array.from(selectedCategories),
			);
			setRestaurants(results);
			setShowFavorites(false);
		} catch (error) {
			console.error("Search failed", error);
			toast.error("Search failed", {
				description: "Unable to fetch restaurants right now.",
			});
		} finally {
			setIsSearching(false);
		}
	};

	const handleGetCurrentLocation = () => {
		setIsGettingLocation(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;
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
						const results = await searchRestaurants(
							resolved,
							Array.from(selectedCategories),
						);
						setRestaurants(results);
						setShowFavorites(false);
					} catch (error) {
						console.error("Geolocation search failed", error);
						toast.error("Unable to get nearby places");
					} finally {
						setIsGettingLocation(false);
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

	const toggleFavorite = (restaurantId: string) => {
		toggleFavoriteMutate({ restaurant_id: restaurantId });
	};

	const openInMaps = (restaurant: Restaurant) => {
		const address = `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}`;
		const encodedAddress = encodeURIComponent(address);

		// Detect platform
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isAndroid = /Android/.test(navigator.userAgent);

		let mapsUrl = "";
		if (isIOS) {
			mapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
		} else if (isAndroid) {
			mapsUrl = `geo:0,0?q=${encodedAddress}`;
		} else {
			mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
		}

		window.open(mapsUrl, "_blank");
	};

	// Apply filters and sorting
	const favoriteIds = new Set(favoritesData?.favorites ?? []);
	let displayedRestaurants = showFavorites
		? restaurants.filter((r) => favoriteIds.has(r.id))
		: restaurants;

	// Apply price filter
	displayedRestaurants = displayedRestaurants.filter((r) =>
		priceFilter.includes(r.priceRange),
	);

	// Apply rating filter
	displayedRestaurants = displayedRestaurants.filter(
		(r) => r.rating >= minRating,
	);

	// Apply open now filter
	if (openNowOnly) {
		displayedRestaurants = displayedRestaurants.filter((r) => r.isOpenNow);
	}

	// Apply sorting
	if (sortBy === "distance") {
		displayedRestaurants = [...displayedRestaurants].sort(
			(a, b) => (a.distance || 0) - (b.distance || 0),
		);
	} else if (sortBy === "rating") {
		displayedRestaurants = [...displayedRestaurants].sort(
			(a, b) => b.rating - a.rating,
		);
	} else if (sortBy === "reviews") {
		displayedRestaurants = [...displayedRestaurants].sort(
			(a, b) => b.reviewCount - a.reviewCount,
		);
	}

	const renderStars = (rating: number) => {
		const stars = [];
		for (let i = 0; i < 5; i++) {
			stars.push(
				<Star
					key={`star-${rating}-${i}`}
					className={cn(
						"size-4",
						i < Math.floor(rating)
							? "fill-primary text-primary"
							: i < rating
								? "fill-primary/50 text-primary"
								: "fill-muted text-muted",
					)}
				/>,
			);
		}
		return (
			<div className="flex items-center gap-1">
				{stars}
				<span className="text-sm font-medium ml-1 text-foreground">
					{rating.toFixed(1)}
				</span>
			</div>
		);
	};

	const renderPriceRange = (priceRange: number) => {
		const dollars = [];
		for (let i = 0; i < 4; i++) {
			dollars.push(
				<DollarSign
					key={`price-${priceRange}-${i}`}
					className={cn(
						"size-4",
						i < priceRange ? "text-secondary" : "text-muted",
					)}
				/>,
			);
		}
		return <div className="flex items-center gap-0.5">{dollars}</div>;
	};

	return (
		<Layout>
			<div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
				{/* Hero Header - Dark Theme */}
				<div className="mb-8 md:mb-12 text-center relative px-4">
					{/* Decorative top border */}
					<div className="flex items-center justify-center mb-4 md:mb-6">
						<div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent w-full max-w-md shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.4)]" />
					</div>

					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif-display text-[oklch(0.14_0.04_250)] mb-3 md:mb-4 tracking-tight">
						Discover Your Next
						<span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mt-2 drop-shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)]">
							Culinary Adventure
						</span>
					</h1>

					<p className="text-base md:text-lg lg:text-xl text-[oklch(0.18_0.035_250)] max-w-2xl mx-auto font-serif-elegant leading-relaxed">
						Embark on a journey through extraordinary flavors and unforgettable
						dining experiences
					</p>

					{/* Decorative bottom border with ornament */}
					<div className="flex items-center justify-center gap-2 md:gap-3 mt-4 md:mt-6">
						<div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-primary/80 w-20 md:w-32 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.4)]" />
						<div className="w-2 h-2 rotate-45 border border-primary/80 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
						<div className="h-px bg-gradient-to-l from-transparent via-primary/60 to-primary/80 w-20 md:w-32 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.4)]" />
					</div>
				</div>

				{/* Search Section - Floating Light Module */}
				<Card className="mb-12 relative shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.25),0_8px_24px_black] border-2 border-primary/40 bg-card overflow-hidden hover:shadow-[0_0_40px_oklch(0.55_0.18_240_/_0.35),0_10px_28px_black] transition-all search-container-mobile-centered">
					{/* Subtle glowing texture overlay */}
					<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.55_0.18_240_/_0.2)_10px,oklch(0.55_0.18_240_/_0.2)_11px)] pointer-events-none" />

					<CardHeader className="text-center pb-6 relative z-10 flex flex-col items-center">
						{/* Ornate icon frame with glow */}
						<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-sm bg-gradient-to-br from-primary via-secondary to-primary shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.5)] border-2 border-primary/50 search-icon-wrapper">
							<Search className="h-8 w-8 text-white stroke-[2.5] drop-shadow-[0_0_8px_white]" />
						</div>
						<CardTitle className="text-3xl font-serif-display text-card-foreground mb-2 search-title">
							Your Expedition Begins
						</CardTitle>
						<CardDescription className="text-base text-card-foreground/70 font-serif-elegant max-w-lg search-subtitle">
							Chart your course through the world's finest dining establishments
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6 relative z-10 flex flex-col items-center">
						{/* Location inputs wrapper with centered layout and constrained width */}
						<div className="w-full max-w-4xl search-inputs-wrapper">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
								<div className="space-y-2">
									<Label
										htmlFor="country"
										className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-xs"
									>
										Country
									</Label>
									<Input
										id="country"
										placeholder="Country (optional)"
										value={location.country}
										onChange={(e) =>
											updateLocation({ country: e.target.value })
										}
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="state"
										className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-xs"
									>
										State/Province
									</Label>
									<Input
										id="state"
										placeholder="State or province"
										value={location.state}
										onChange={(e) => updateLocation({ state: e.target.value })}
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="city"
										className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-xs"
									>
										City
									</Label>
									<Input
										id="city"
										placeholder="e.g. Paris, Tokyo"
										value={location.city}
										onChange={(e) => updateLocation({ city: e.target.value })}
									/>
								</div>
							</div>
						</div>
						{/* Action Buttons with Ornate Styling */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center search-buttons-wrapper">
							<Button
								onClick={handleSearch}
								size="lg"
								disabled={isSearching}
								className="w-full sm:w-auto cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-layered hover:shadow-[0_4px_12px_oklch(0.55_0.18_240_/_0.5),0_0_30px_oklch(0.55_0.18_240_/_0.7)] font-semibold tracking-wide px-8 py-6 text-base border border-primary/20 transition-all duration-300"
							>
								<Search className="mr-2 h-5 w-5" />
								{isSearching ? "Searching..." : "Start Exploring"}
							</Button>
							<Button
								variant="outline"
								size="lg"
								onClick={handleGetCurrentLocation}
								disabled={isGettingLocation}
								className="w-full sm:w-auto cursor-pointer border-2 border-primary/40 hover:bg-[oklch(0.96_0.01_75)] hover:border-primary/70 hover:shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.5),0_4px_12px_oklch(0.55_0.18_240_/_0.4)] font-semibold tracking-wide px-8 py-6 text-base shadow-md transition-all duration-300"
							>
								<Navigation className="mr-2 h-5 w-5" />
								{isGettingLocation ? "Locating..." : "Use My Location"}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Category Filters - Floating Light Module */}
				<Card className="mb-10 border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.2),0_6px_20px_black] hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.3),0_8px_24px_black] transition-all relative overflow-hidden">
					{/* Subtle glowing texture */}
					<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.55_0.18_240_/_0.15)_10px,oklch(0.55_0.18_240_/_0.15)_11px)] pointer-events-none" />

					<CardHeader className="relative z-10">
						<div className="flex items-center gap-3 mb-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary/50 shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)]">
								<Filter className="h-5 w-5 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.5)]" />
							</div>
							<CardTitle className="text-2xl font-serif-elegant text-card-foreground">
								Culinary Categories
							</CardTitle>
						</div>
						<CardDescription className="text-base font-serif-elegant text-card-foreground/70 ml-13">
							Refine your journey by selecting one or more cuisines
						</CardDescription>
					</CardHeader>
					<CardContent className="relative z-10">
						<div className="flex flex-wrap gap-3">
							{categories.map((category) => (
								<Badge
									key={category}
									variant={
										selectedCategories.has(category) ? "default" : "outline"
									}
									className={cn(
										"cursor-pointer px-5 py-2.5 text-sm font-semibold transition-all tracking-wide",
										selectedCategories.has(category)
											? "bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)] border-2 border-primary/60 hover:shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.5)]"
											: "border-2 border-primary/40 bg-card hover:bg-primary/10 hover:border-primary/60 shadow-sm",
									)}
									onClick={() => toggleCategory(category)}
								>
									{category}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Mobile Filter Button */}
				{restaurants.length > 0 && (
					<div className="md:hidden mb-4">
						<Button
							onClick={() => setShowMobileFilters(true)}
							className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
						>
							<SlidersHorizontal className="mr-2 h-5 w-5" />
							Filters & Sort
						</Button>
					</div>
				)}

				{/* Mobile Filter Overlay */}
				{showMobileFilters && (
					// biome-ignore lint/a11y/useKeyWithClickEvents: Overlay background for modal - intentional click-to-dismiss UX pattern
					<div
						className="md:hidden fixed inset-0 z-50 bg-black/50"
						onClick={() => setShowMobileFilters(false)}
					>
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: Prevents click propagation to overlay - intentional UX pattern */}
						<div
							className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-[oklch(0.97_0.008_75)] shadow-2xl overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b-2 border-primary/20 sticky top-0 bg-[oklch(0.97_0.008_75)] z-10">
								<div className="flex items-center justify-between mb-2">
									<h2 className="text-xl font-serif-display text-[oklch(0.2_0.03_145)]">
										Filters & Sort
									</h2>
									<button
										type="button"
										onClick={() => setShowMobileFilters(false)}
										className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
									>
										<X className="h-5 w-5 text-primary" />
									</button>
								</div>
								<p className="text-sm text-[oklch(0.35_0.03_145)] font-serif-elegant">
									Filter and sort results
								</p>
							</div>
							<div className="p-6 space-y-6">
								{/* Price Range Filter */}
								<div className="space-y-3">
									<Label className="text-base font-semibold">Price Range</Label>
									<div className="flex flex-wrap gap-2">
										{[1, 2, 3, 4].map((price) => (
											<Button
												key={price}
												variant={
													priceFilter.includes(price) ? "default" : "outline"
												}
												size="sm"
												onClick={() => togglePriceFilter(price)}
												className="gap-1"
											>
												{"$".repeat(price)}
											</Button>
										))}
									</div>
								</div>

								{/* Rating Filter */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="text-base font-semibold">
											Minimum Rating
										</Label>
										<span className="text-sm font-medium">
											{minRating === 0
												? "Any"
												: `${minRating.toFixed(1)}+ stars`}
										</span>
									</div>
									<Slider
										value={[minRating]}
										onValueChange={(values) => setMinRating(values[0])}
										min={0}
										max={5}
										step={0.5}
										className="w-full"
									/>
									<div className="flex justify-between text-xs text-gray-500">
										<span>Any</span>
										<span>5 stars</span>
									</div>
								</div>

								{/* Sort By */}
								<div className="space-y-3">
									<Label className="text-base font-semibold">Sort By</Label>
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
											<SelectItem value="distance">
												Distance (Closest First)
											</SelectItem>
											<SelectItem value="rating">
												Rating (Highest First)
											</SelectItem>
											<SelectItem value="reviews">Most Reviews</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Open Now Toggle */}
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base font-semibold">Open Now</Label>
										<p className="text-sm text-gray-500">
											Show only restaurants currently open
										</p>
									</div>
									<Switch
										checked={openNowOnly}
										onCheckedChange={setOpenNowOnly}
									/>
								</div>

								{/* Clear Filters Button */}
								<div className="pt-2 border-t">
									<Button
										variant="outline"
										className="w-full"
										onClick={clearAllFilters}
									>
										Clear All Filters
									</Button>
								</div>

								{/* Apply Button */}
								<Button
									className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
									onClick={() => setShowMobileFilters(false)}
								>
									Apply Filters
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Desktop Search Refinement Component - Floating Light Module */}
				{restaurants.length > 0 && (
					<Card className="mb-8 hidden md:block border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.2),0_6px_20px_black] relative overflow-hidden z-50">
						{/* Subtle glowing texture */}
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.15)_8px,oklch(0.55_0.18_240_/_0.15)_9px)] pointer-events-none" />

						<CardHeader className="relative z-10">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2 text-card-foreground">
										<SlidersHorizontal className="size-5 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.4)]" />
										Refine Search
									</CardTitle>
									<CardDescription className="text-card-foreground/70">
										Filter and sort results by price, rating, distance, and more
									</CardDescription>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowRefinements(!showRefinements)}
									className="hover:bg-primary/10"
								>
									{showRefinements ? "Hide" : "Show"}
								</Button>
							</div>
						</CardHeader>
						{showRefinements && (
							<CardContent className="space-y-5 md:space-y-6">
								{/* Desktop layout: 2 columns on larger screens */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
									{/* Price Range Filter */}
									<div className="space-y-2 md:space-y-3">
										<Label className="text-sm md:text-base font-semibold">
											Price Range
										</Label>
										<div className="grid grid-cols-4 gap-2">
											{[1, 2, 3, 4].map((price) => (
												<Button
													key={price}
													variant={
														priceFilter.includes(price) ? "default" : "outline"
													}
													size="sm"
													onClick={() => togglePriceFilter(price)}
													className="gap-1 cursor-pointer"
												>
													{"$".repeat(price)}
												</Button>
											))}
										</div>
									</div>

									{/* Sort By */}
									<div className="space-y-2 md:space-y-3">
										<Label className="text-sm md:text-base font-semibold">
											Sort By
										</Label>
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
												<SelectItem value="distance">
													Distance (Closest First)
												</SelectItem>
												<SelectItem value="rating">
													Rating (Highest First)
												</SelectItem>
												<SelectItem value="reviews">Most Reviews</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								{/* Rating Filter - Full Width */}
								<div className="space-y-2 md:space-y-3">
									<div className="flex items-center justify-between">
										<Label className="text-sm md:text-base font-semibold">
											Minimum Rating
										</Label>
										<span className="text-xs md:text-sm font-medium">
											{minRating === 0
												? "Any"
												: `${minRating.toFixed(1)}+ stars`}
										</span>
									</div>
									<Slider
										value={[minRating]}
										onValueChange={(values) => setMinRating(values[0])}
										min={0}
										max={5}
										step={0.5}
										className="w-full cursor-pointer"
									/>
									<div className="flex justify-between text-xs text-gray-500">
										<span>Any</span>
										<span>5 stars</span>
									</div>
								</div>

								{/* Open Now Toggle */}
								<div className="flex items-center justify-between gap-4">
									<div className="space-y-0.5 flex-1">
										<Label className="text-sm md:text-base font-semibold">
											Open Now
										</Label>
										<p className="text-xs md:text-sm text-gray-500">
											Show only restaurants currently open
										</p>
									</div>
									<Switch
										checked={openNowOnly}
										onCheckedChange={setOpenNowOnly}
										className="cursor-pointer"
									/>
								</div>

								{/* Clear Filters Button */}
								<div className="pt-2 border-t">
									<Button
										variant="outline"
										className="w-full cursor-pointer"
										onClick={clearAllFilters}
									>
										Clear All Filters
									</Button>
								</div>
							</CardContent>
						)}
					</Card>
				)}

				{/* Results Header - Dark Theme */}
				{restaurants.length > 0 && (
					<div className="mb-6 md:mb-8 space-y-4 px-4 md:px-0">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<h2 className="text-2xl md:text-3xl font-serif-display text-white drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.2)]">
									{showFavorites
										? `Your Curated Collection (${favoritesData?.count ?? 0})`
										: `${restaurants.length} Distinguished Establishments`}
								</h2>
								{displayedRestaurants.length !== restaurants.length && (
									<p className="text-sm text-white/80 mt-2 font-serif-elegant">
										Showcasing {displayedRestaurants.length} refined selections
									</p>
								)}
							</div>
							<Button
								variant={showFavorites ? "default" : "outline"}
								onClick={() => setShowFavorites(!showFavorites)}
								className={cn(
									"font-semibold tracking-wide shadow-md",
									showFavorites
										? "shadow-layered"
										: "border-2 border-primary/40",
								)}
							>
								<Heart
									className={cn("size-4 mr-2", showFavorites && "fill-current")}
								/>
								{showFavorites
									? "View All"
									: `Favorites (${favoritesData?.count ?? 0})`}
							</Button>
						</div>

						{/* Active Filters - Removable Chips */}
						{(selectedCategories.size > 0 ||
							priceFilter.length < 4 ||
							minRating > 0 ||
							openNowOnly) && (
							<div className="rounded-sm border-2 border-primary/40 bg-card/50 backdrop-blur-sm shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.15)] p-4">
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-sm font-serif-elegant font-semibold text-card-foreground flex items-center gap-2">
										<Filter className="h-4 w-4 text-primary" />
										Active Filters:
									</span>

									{/* Category Chips */}
									{Array.from(selectedCategories).map((category) => (
										<Badge
											key={category}
											className="cursor-pointer gap-1.5 bg-gradient-to-r from-primary/90 via-secondary/90 to-primary/90 hover:from-primary hover:via-secondary hover:to-primary text-white shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)] border border-primary/40 font-serif-elegant px-3 py-1.5 transition-all"
											onClick={() => toggleCategory(category)}
										>
											<span>Category: {category}</span>
											<X className="h-3 w-3" />
										</Badge>
									))}

									{/* Price Filter Chips */}
									{priceFilter.length < 4 && (
										<Badge
											className="cursor-pointer gap-1.5 bg-gradient-to-r from-primary/90 via-secondary/90 to-primary/90 hover:from-primary hover:via-secondary hover:to-primary text-white shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)] border border-primary/40 font-serif-elegant px-3 py-1.5 transition-all"
											onClick={() => setPriceFilter([1, 2, 3, 4])}
										>
											<span>
												Price:{" "}
												{priceFilter.map((p) => "$".repeat(p)).join(", ")}
											</span>
											<X className="h-3 w-3" />
										</Badge>
									)}

									{/* Rating Filter Chip */}
									{minRating > 0 && (
										<Badge
											className="cursor-pointer gap-1.5 bg-gradient-to-r from-primary/90 via-secondary/90 to-primary/90 hover:from-primary hover:via-secondary hover:to-primary text-white shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)] border border-primary/40 font-serif-elegant px-3 py-1.5 transition-all"
											onClick={() => setMinRating(0)}
										>
											<Star className="h-3 w-3 fill-current" />
											<span>Rating: {minRating.toFixed(1)}+</span>
											<X className="h-3 w-3" />
										</Badge>
									)}

									{/* Open Now Chip */}
									{openNowOnly && (
										<Badge
											className="cursor-pointer gap-1.5 bg-gradient-to-r from-primary/90 via-secondary/90 to-primary/90 hover:from-primary hover:via-secondary hover:to-primary text-white shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)] border border-primary/40 font-serif-elegant px-3 py-1.5 transition-all"
											onClick={() => setOpenNowOnly(false)}
										>
											<Clock className="h-3 w-3" />
											<span>Open Now</span>
											<X className="h-3 w-3" />
										</Badge>
									)}

									{/* Clear All Button */}
									{(selectedCategories.size > 0 ||
										priceFilter.length < 4 ||
										minRating > 0 ||
										openNowOnly) && (
										<Button
											variant="ghost"
											size="sm"
											onClick={clearAllFilters}
											className="ml-auto text-xs font-serif-elegant text-primary hover:text-secondary hover:bg-primary/10 transition-all"
										>
											Clear All
										</Button>
									)}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Restaurant Listing Cards - Floating Light Modules */}
				<div className="space-y-8">
					{displayedRestaurants.map((restaurant) => (
						<Card
							key={restaurant.id}
							className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.2),0_6px_20px_black] hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.3),0_8px_24px_black] hover:border-primary/60 transition-all duration-300 relative overflow-hidden"
						>
							{/* Subtle glowing texture */}
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.15)_8px,oklch(0.55_0.18_240_/_0.15)_9px)] pointer-events-none" />

							<CardContent className="p-4 md:p-6 lg:p-8 relative z-10">
								<div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
									{/* Photo Placeholder - Left Side */}
									<div className="flex-shrink-0 w-full md:w-auto">
										<div className="w-full md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 rounded-sm border-2 border-primary/40 bg-gradient-to-br from-[oklch(0.92_0.015_70)] to-[oklch(0.88_0.02_65)] shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.2)] flex items-center justify-center relative overflow-hidden group">
											{/* Decorative pattern overlay */}
											<div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,oklch(0.85_0.02_70_/_0.15)_12px,oklch(0.85_0.02_70_/_0.15)_13px)] pointer-events-none" />
											{/* Icon placeholder */}
											<Utensils className="h-16 md:h-20 w-16 md:w-20 text-primary/50 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.3)]" />
										</div>
									</div>

									{/* Main Content - Right Side */}
									<div className="flex-1 space-y-3 md:space-y-4 lg:space-y-5">
										{/* Restaurant Name & Favorite */}
										<div className="flex items-start justify-between gap-3 md:gap-4">
											<h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif-display text-card-foreground tracking-tight leading-tight">
												{restaurant.name}
											</h3>
											<Button
												size="icon"
												variant={
													favoriteIds.has(restaurant.id) ? "default" : "outline"
												}
												onClick={() => toggleFavorite(restaurant.id)}
												disabled={isTogglingFavorite}
												className={cn(
													"cursor-pointer shadow-md flex-shrink-0 transition-all duration-200",
													favoriteIds.has(restaurant.id)
														? "shadow-layered"
														: "border-2 border-primary/30",
													isTogglingFavorite && "opacity-60 cursor-not-allowed",
												)}
											>
												<Heart
													className={cn(
														"size-4 transition-all duration-200",
														favoriteIds.has(restaurant.id) && "fill-current",
														isTogglingFavorite && "animate-pulse",
													)}
												/>
											</Button>
										</div>

										{/* Location & Cuisine Type */}
										<div className="flex flex-wrap items-center gap-2 md:gap-3">
											<div className="flex items-center gap-1.5 md:gap-2 text-card-foreground/80 text-sm md:text-base font-serif-elegant">
												<MapPin className="size-5 text-primary flex-shrink-0 stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.4)]" />
												<span>
													{restaurant.address.city}, {restaurant.address.state}
												</span>
											</div>
											<span className="text-card-foreground/60">•</span>
											<div className="flex flex-wrap gap-2">
												{restaurant.categories.map((cat) => (
													<Badge
														key={cat}
														variant="secondary"
														className="font-serif-elegant font-medium shadow-sm px-3 py-1 border border-primary/20"
													>
														{cat}
													</Badge>
												))}
											</div>
										</div>

										{/* Star Rating - Glowing Accent */}
										<div className="flex flex-wrap items-center gap-2 md:gap-3">
											<div className="flex items-center gap-0.5 md:gap-1">
												{[...Array(5)].map((_, i) => (
													<Star
														key={`star-${restaurant.id}-${i}`}
														className={cn(
															"size-5",
															i < Math.floor(restaurant.rating)
																? "fill-secondary text-secondary drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]"
																: i < restaurant.rating
																	? "fill-secondary/50 text-secondary drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.3)]"
																	: "fill-muted text-muted",
														)}
													/>
												))}
											</div>
											<span className="text-base md:text-lg font-serif-elegant font-semibold text-secondary drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.4)]">
												{restaurant.rating.toFixed(1)} / 5.0
											</span>
											<span className="text-xs md:text-sm text-card-foreground/70">
												({restaurant.reviewCount} reviews)
											</span>
										</div>

										{/* Dining Experience Summary */}
										<p className="text-sm md:text-base font-serif-elegant text-card-foreground/80 leading-relaxed">
											{restaurant.description}
										</p>

										{/* Additional Details */}
										<div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm">
											{/* Price Range */}
											<div className="flex items-center gap-1.5">
												<DollarSign className="size-4 text-secondary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.4)]" />
												<span className="font-serif-elegant text-card-foreground/80">
													{"$".repeat(restaurant.priceRange)} Pricing
												</span>
											</div>

											{/* Distance */}
											{restaurant.distance !== undefined && (
												<>
													<span className="text-card-foreground/60">•</span>
													<span className="font-serif-elegant text-card-foreground/80">
														{restaurant.distance.toFixed(1)} miles away
													</span>
												</>
											)}

											{/* Operating Status */}
											{restaurant.hours && (
												<>
													<span className="text-card-foreground/60">•</span>
													<div className="flex items-center gap-2">
														<Clock className="size-4 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.4)]" />
														<span className="font-serif-elegant text-card-foreground/80">
															{restaurant.hours.open} - {restaurant.hours.close}
														</span>
														<Badge
															variant={
																restaurant.isOpenNow ? "default" : "secondary"
															}
															className={cn(
																"text-xs",
																restaurant.isOpenNow &&
																	"bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)] border border-primary/40",
															)}
														>
															{restaurant.isOpenNow ? "Open Now" : "Closed"}
														</Badge>
													</div>
												</>
											)}
										</div>

										{/* View Details and Reserve CTA */}
										<div className="pt-3 flex flex-col sm:flex-row gap-2 md:gap-3">
											<Button
												className="w-full sm:w-auto cursor-pointer group bg-gradient-to-r from-primary via-secondary to-primary text-white hover:shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.5)] font-serif-elegant font-semibold tracking-wide shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)] px-6 md:px-8 py-4 md:py-5 text-sm md:text-base transition-all duration-300 border-2 border-primary/60"
												onClick={() => {
													setRestaurantToReserve(restaurant);
													setReservationModalOpen(true);
												}}
											>
												Make Reservation
												<ArrowRight className="ml-2 h-5 w-5 stroke-[2.5]" />
											</Button>
											<Button
												variant="outline"
												className="w-full sm:w-auto cursor-pointer border-2 border-primary/40 hover:bg-[oklch(0.96_0.01_75)] hover:shadow-[0_0_12px_oklch(0.55_0.18_240_/_0.3)] font-serif-elegant font-semibold tracking-wide shadow-md px-6 md:px-8 py-4 md:py-5 text-sm md:text-base transition-all duration-300"
												onClick={() =>
													setSelectedRestaurant(
														selectedRestaurant?.id === restaurant.id
															? null
															: restaurant,
													)
												}
											>
												{selectedRestaurant?.id === restaurant.id
													? "Hide Details"
													: "View Details"}
											</Button>
										</div>

										{/* Expanded Details Section - Full Detail Page */}
										{selectedRestaurant?.id === restaurant.id && (
											<div className="mt-6 pt-6 border-t-2 border-primary/30 shadow-[0_-2px_20px_oklch(0.55_0.18_240_/_0.1)] space-y-6 md:space-y-8">
												{/* Full Address */}
												<div className="flex items-start gap-3">
													<MapPin className="size-5 mt-0.5 shrink-0 text-primary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
													<div className="flex-1">
														<p className="text-sm font-serif-elegant font-semibold text-card-foreground mb-1">
															Full Address
														</p>
														<p className="text-base font-serif-elegant text-card-foreground/80">
															{restaurant.address.street}
															<br />
															{restaurant.address.city},{" "}
															{restaurant.address.state}{" "}
															{restaurant.address.zipCode}
															<br />
															{restaurant.address.country}
														</p>
													</div>
												</div>

												{/* Recent Reviews */}
												<div>
													<h4 className="text-lg font-serif-display text-card-foreground mb-4">
														Recent Reviews
													</h4>
													<div className="space-y-4">
														{restaurant.reviews.map((review) => (
															<div
																key={review.id}
																className="border-l-3 border-secondary pl-4 bg-[oklch(0.96_0.01_75)] py-3 px-4 rounded-sm shadow-[0_0_15px_oklch(0.65_0.14_195_/_0.15)]"
															>
																<div className="flex items-center gap-3 mb-2">
																	<span className="font-serif-elegant font-semibold text-sm text-[oklch(0.2_0.03_145)]">
																		{review.author}
																	</span>
																	<div className="flex items-center gap-1">
																		{[...Array(5)].map((_, i) => (
																			<Star
																				key={`review-star-${review.id}-${i}`}
																				className={cn(
																					"size-3.5",
																					i < Math.floor(review.rating)
																						? "fill-secondary text-secondary drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.4)]"
																						: "fill-muted text-muted",
																				)}
																			/>
																		))}
																	</div>
																	<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)]">
																		{review.date}
																	</span>
																</div>
																<p className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] leading-relaxed">
																	{review.comment}
																</p>
															</div>
														))}
													</div>
												</div>

												{/* Map Direction Button */}
												<Button
													variant="outline"
													className="cursor-pointer w-full border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 font-serif-elegant font-semibold tracking-wide shadow-md py-6"
													onClick={() => openInMaps(restaurant)}
												>
													<MapPin className="size-5 mr-2" />
													Get Directions
												</Button>

												{/* Photo Carousel */}
												<div className="mt-6">
													<DetailPhotoCarousel
														restaurantName={restaurant.name}
													/>
												</div>

												{/* Chef Profile Section */}
												<div className="mt-6">
													<ChefProfileSection />
												</div>

												{/* Signature Menu */}
												<div className="mt-6">
													<SignatureMenu />
												</div>

												{/* Review Summary */}
												<div className="mt-6">
													<ReviewSummary
														overallRating={restaurant.rating}
														totalReviews={restaurant.reviewCount}
														reviews={restaurant.reviews}
													/>
												</div>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Empty State - Floating Light Module */}
				{restaurants.length === 0 && (
					<Card className="text-center py-16 shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.25),0_8px_24px_black] border-2 border-primary/40 bg-card relative overflow-hidden">
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.15)_8px,oklch(0.55_0.18_240_/_0.15)_9px)] pointer-events-none" />
						<CardContent className="relative z-10">
							<div className="mx-auto w-20 h-20 rounded-sm bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center mb-6 border-2 border-primary/50 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)]">
								<Search className="size-10 text-primary stroke-[2.5] drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.5)]" />
							</div>
							<h3 className="text-3xl font-serif-display text-card-foreground mb-3">
								Begin Your Expedition
							</h3>
							<p className="text-card-foreground/80 font-serif-elegant text-lg max-w-md mx-auto">
								Chart your destination above to unveil extraordinary culinary
								experiences awaiting your discovery
							</p>
						</CardContent>
					</Card>
				)}

				{/* Empty Favorites State - Floating Light Module */}
				{showFavorites &&
					displayedRestaurants.length === 0 &&
					restaurants.length > 0 && (
						<Card className="text-center py-12 shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.25),0_8px_24px_black] border-2 border-primary/40 bg-card relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.15)_8px,oklch(0.55_0.18_240_/_0.15)_9px)] pointer-events-none" />
							<CardContent className="relative z-10">
								<Heart className="size-16 mx-auto text-primary/50 mb-4 drop-shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)]" />
								<h3 className="text-xl font-serif-display text-card-foreground mb-2">
									No Favorites Yet
								</h3>
								<p className="text-card-foreground/80 font-serif-elegant mb-4">
									Start adding restaurants to your favorites list
								</p>
								<Button
									onClick={() => setShowFavorites(false)}
									className="cursor-pointer bg-gradient-to-r from-primary via-secondary to-primary text-white hover:text-[oklch(0.98_0_0)] shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)] hover:shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.6)] border-2 border-primary/60 transition-all duration-300"
								>
									Browse Restaurants
								</Button>
							</CardContent>
						</Card>
					)}
			</div>

			{/* Professional Footer - Deep Midnight Navy with Glowing Accents */}
			<footer className="relative mt-16 md:mt-24 bg-gradient-to-b from-[oklch(0.14_0.04_250)] to-[oklch(0.10_0.045_250)] border-t-2 border-primary/40 shadow-[0_-4px_30px_oklch(0.55_0.18_240_/_0.15)]">
				<div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-10">
						{/* Company Info */}
						<div className="space-y-5">
							<h3 className="text-xl font-serif-display text-white tracking-wide drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.3)]">
								Mapetite
							</h3>
							<p className="text-sm font-serif-elegant text-white/90 leading-relaxed">
								Discover exquisite restaurants worldwide with our premium dining
								discovery platform.
							</p>
						</div>

						{/* About Section */}
						<div className="space-y-5">
							<h4 className="text-base font-serif-elegant text-white tracking-wide uppercase">
								About
							</h4>
							<ul className="space-y-3">
								<li>
									<a
										href="#about-us"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href="#our-story"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Our Story
									</a>
								</li>
								<li>
									<a
										href="#team"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Team
									</a>
								</li>
							</ul>
						</div>

						{/* Legal Section */}
						<div className="space-y-5">
							<h4 className="text-base font-serif-elegant text-white tracking-wide uppercase">
								Legal
							</h4>
							<ul className="space-y-3">
								<li>
									<a
										href="#privacy-policy"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Privacy Policy
									</a>
								</li>
								<li>
									<a
										href="#terms-of-service"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Terms of Service
									</a>
								</li>
								<li>
									<a
										href="#cookies"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Cookie Policy
									</a>
								</li>
							</ul>
						</div>

						{/* Contact Section */}
						<div className="space-y-5">
							<h4 className="text-base font-serif-elegant text-white tracking-wide uppercase">
								Contact
							</h4>
							<ul className="space-y-3">
								<li>
									<a
										href="mailto:info@mapetite.com"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										info@mapetite.com
									</a>
								</li>
								<li>
									<a
										href="#support"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Support Center
									</a>
								</li>
								<li>
									<a
										href="#contact-us"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Contact Us
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t-2 border-primary/30">
						<div className="flex flex-col md:flex-row justify-between items-center gap-4">
							<p className="text-sm font-serif-elegant text-white/90">
								© 2024 Mapetite. All rights reserved.
							</p>
							<div className="flex gap-6">
								<a
									href="#facebook"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
								>
									Facebook
								</a>
								<a
									href="#twitter"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
								>
									Twitter
								</a>
								<a
									href="#instagram"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
								>
									Instagram
								</a>
								<a
									href="#linkedin"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
								>
									LinkedIn
								</a>
							</div>
						</div>
					</div>
				</div>
			</footer>

			{/* Reservation Modal */}
			<ReservationModal
				restaurant={restaurantToReserve}
				open={reservationModalOpen}
				onOpenChange={setReservationModalOpen}
			/>
		</Layout>
	);
}
