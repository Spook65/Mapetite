import { ChefProfileSection } from "@/components/ChefProfileSection";
import { DetailPhotoCarousel } from "@/components/DetailPhotoCarousel";
import { Layout } from "@/components/Layout";
import { ReviewSummary } from "@/components/ReviewSummary";
import { SignatureMenu } from "@/components/SignatureMenu";
import { MapPreview } from "@/components/MapPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
} from "@/components/ui/card";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { isAuthenticatedSync } from "@/lib/auth-integration";
import { getRestaurantById } from "@/lib/search-restaurants";
import { cn } from "@/lib/utils";
import { useRestaurantSearchStore } from "@/store/restaurant-search-store";
import type { Restaurant } from "@/store/restaurant-search-store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Clock,
	DollarSign,
	Heart,
	MapPin,
	Navigation,
	Star,
	Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/restaurants/$restaurantId")({
	component: RestaurantDetailPage,
});

function RestaurantDetailPage() {
	const params = Route.useParams();
	const restaurantId = params.restaurantId as string;
	const navigate = useNavigate();
	const restaurants = useRestaurantSearchStore((state) => state.restaurants);
	const [fetchedRestaurant, setFetchedRestaurant] = useState<Restaurant | null>(
		null,
	);
	const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(false);
	const [restaurantLoadError, setRestaurantLoadError] = useState<string | null>(
		null,
	);

	const storeRestaurant = restaurants.find((r) => r.id === restaurantId);
	const restaurantName =
		fetchedRestaurant?.name ?? storeRestaurant?.name ?? "Restaurant";

	// API-based favorites using React Query with error handling
	const { data: favoritesData } = useFavorites();
	const { mutate: toggleFavoriteMutate, isPending: isTogglingFavorite } =
		useToggleFavorite({
			onSuccess: (data) => {
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

	useEffect(() => {
		let cancelled = false;
		const shouldFetchRemote = restaurantId.startsWith("geoapify:");

		if (storeRestaurant) {
			setFetchedRestaurant(storeRestaurant);
			if (!shouldFetchRemote) {
				setRestaurantLoadError(null);
				setIsLoadingRestaurant(false);
				return () => {
					cancelled = true;
				};
			}
		}

		setIsLoadingRestaurant(shouldFetchRemote || !storeRestaurant);
		setRestaurantLoadError(null);

		(async () => {
			try {
				const restaurantData = await getRestaurantById(restaurantId);
				if (cancelled) return;
				setFetchedRestaurant(restaurantData);
				if (!restaurantData) {
					setRestaurantLoadError("Restaurant details are not available yet.");
				}
			} catch (error) {
				if (cancelled) return;
				console.error("Failed to load restaurant details", error);
				setRestaurantLoadError(
					"Unable to load this restaurant right now. Please go back and search again.",
				);
			} finally {
				if (!cancelled) {
					setIsLoadingRestaurant(false);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [restaurantId, storeRestaurant]);

	// Prefer the fetched detail response when available, otherwise use the store copy.
	const restaurant = fetchedRestaurant ?? storeRestaurant;

	// If restaurant not found, show loading or error state
	if (!restaurant && isLoadingRestaurant) {
		return (
			<Layout>
				<div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
					<Card className="text-center py-16 shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.25),0_8px_24px_black] border-2 border-primary/40 bg-card relative overflow-hidden">
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.15)_8px,oklch(0.55_0.18_240_/_0.15)_9px)] pointer-events-none" />
						<CardContent className="relative z-10">
							<div className="mx-auto w-20 h-20 rounded-sm bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center mb-6 border-2 border-primary/50 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)]">
								<Utensils className="size-10 text-primary stroke-[2.5] drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.5)] animate-pulse" />
							</div>
							<h3 className="text-3xl font-serif-display text-card-foreground mb-3">
								Loading Restaurant
							</h3>
							<p className="text-card-foreground/80 font-serif-elegant text-lg max-w-md mx-auto">
								Fetching the latest restaurant details.
							</p>
						</CardContent>
					</Card>
				</div>
			</Layout>
		);
	}

	// If restaurant not found, show error state
	if (!restaurant) {
		return (
			<Layout>
				<div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
					<Card className="text-center py-16 shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.25),0_8px_24px_black] border-2 border-primary/40 bg-card relative overflow-hidden">
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.15)_8px,oklch(0.55_0.18_240_/_0.15)_9px)] pointer-events-none" />
						<CardContent className="relative z-10">
							<div className="mx-auto w-20 h-20 rounded-sm bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center mb-6 border-2 border-primary/50 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)]">
								<Utensils className="size-10 text-primary stroke-[2.5] drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.5)]" />
							</div>
							<h3 className="text-3xl font-serif-display text-card-foreground mb-3">
								Restaurant Not Found
							</h3>
							<p className="text-card-foreground/80 font-serif-elegant text-lg max-w-md mx-auto mb-6">
								{restaurantLoadError ||
									"The restaurant you're looking for could not be found. Please return to the search page."}
							</p>
							<Button
								onClick={() => navigate({ to: "/restaurants" })}
								className="cursor-pointer bg-gradient-to-r from-primary via-secondary to-primary text-white hover:shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.5)] font-serif-elegant font-semibold tracking-wide shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)] px-8 py-5 text-base transition-all duration-300 border-2 border-primary/60"
							>
								<ArrowLeft className="mr-2 h-5 w-5 stroke-[2.5]" />
								Back to Search
							</Button>
						</CardContent>
					</Card>
				</div>
			</Layout>
		);
	}

	const favoriteIds = new Set(favoritesData?.favorites ?? []);

	const toggleFavorite = (restaurantId: string) => {
		// Check authentication status before allowing favorite action
		if (!isAuthenticatedSync()) {
			toast.error("Please log in to save favorites", {
				description:
					"You need to be logged in to add restaurants to your favorites.",
			});
			return;
		}

		// Proceed with the toggle action if authenticated
		toggleFavoriteMutate({ restaurant_id: restaurantId });
	};

	const buildDirectionsUrl = (restaurant: Restaurant) => {
		const hasCoordinates =
			Number.isFinite(restaurant.latitude) &&
			Number.isFinite(restaurant.longitude);

		return hasCoordinates
			? `https://www.openstreetmap.org/?mlat=${restaurant.latitude}&mlon=${restaurant.longitude}#map=18/${restaurant.latitude}/${restaurant.longitude}`
			: `https://www.openstreetmap.org/search?query=${encodeURIComponent(restaurant.name)}`;
	};

	return (
		<Layout>
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
				<div>
					<Button variant="outline" onClick={() => navigate({ to: "/restaurants" })}>
						<ArrowLeft className="mr-2 size-4" />
						Back to search
					</Button>
				</div>

				<Card className="border border-border">
					<CardContent className="space-y-6 p-4 md:p-6">
						<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
							<div className="space-y-3">
								<div className="space-y-2">
									<h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
										{restaurant.name}
									</h1>
									<div className="flex flex-wrap gap-2">
										{restaurant.categories.map((cat) => (
											<Badge key={cat} variant="outline">
												{cat}
											</Badge>
										))}
									</div>
								</div>

								<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
									<div className="flex items-center gap-1">
										<Star className="size-4 fill-primary text-primary" />
										<span className="font-medium text-foreground">
											{restaurant.rating.toFixed(1)}
										</span>
										<span>({restaurant.reviewCount} reviews)</span>
									</div>
									<span>•</span>
									<div className="flex items-center gap-1">
										<MapPin className="size-4 text-primary" />
										<span>
											{restaurant.address.city}, {restaurant.address.state}
										</span>
									</div>
								</div>
							</div>

							<Button
								size="icon"
								variant={favoriteIds.has(restaurant.id) ? "default" : "outline"}
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

						<p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
							{restaurant.description}
						</p>

						<div className="grid gap-3 md:grid-cols-2">
							<div className="rounded-md border border-border p-4">
								<p className="text-sm font-medium text-foreground">Details</p>
								<div className="mt-3 space-y-2 text-sm text-muted-foreground">
									{restaurant.priceRange != null && (
										<div className="flex items-center gap-2">
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
												variant={restaurant.isOpenNow ? "default" : "secondary"}
											>
												{restaurant.isOpenNow ? "Open now" : "Closed"}
											</Badge>
										</div>
									)}
								</div>
							</div>

							<div className="rounded-md border border-border p-4">
								<p className="text-sm font-medium text-foreground">Address</p>
								<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
									{restaurant.address.street}
									<br />
									{restaurant.address.city}, {restaurant.address.state}{" "}
									{restaurant.address.zipCode}
									<br />
									{restaurant.address.country}
								</p>
							</div>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row">
							<Button asChild variant="outline" className="w-full sm:w-auto">
								<a
									href={buildDirectionsUrl(restaurant)}
									target="_blank"
									rel="noreferrer"
								>
									<Navigation className="mr-2 size-4" />
									Get directions
								</a>
							</Button>
						</div>

						{restaurant.latitude && restaurant.longitude && (
							<MapPreview
								latitude={restaurant.latitude}
								longitude={restaurant.longitude}
							/>
						)}

						<DetailPhotoCarousel
							restaurantName={restaurant.name}
							images={restaurant.galleryImageUrls}
							imageAttributions={restaurant.galleryPhotoAttributions}
							categories={restaurant.categories}
						/>

						<ChefProfileSection
							chefName={restaurant.chef?.name}
							chefBio={restaurant.chef?.bio}
							profileImage={restaurant.chef?.photoUrl}
						/>

						<SignatureMenu
							dishes={restaurant.signatureDishes}
							pricingNote={
								restaurant.priceRange != null
									? `Estimated pricing from $${restaurant.priceRange} to $$$$`
									: undefined
							}
						/>

						<ReviewSummary
							overallRating={restaurant.rating}
							totalReviews={restaurant.reviewCount}
							ratingBreakdown={restaurant.ratingBreakdown}
							reviews={restaurant.reviews}
						/>

						<div className="space-y-3">
							<p className="text-sm font-medium text-foreground">
								Recent reviews
							</p>
							<div className="space-y-3">
								{restaurant.reviews.map((review) => (
									<div
										key={review.id}
										className="rounded-md border border-border p-4"
									>
										<div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
											<span className="font-medium text-foreground">
												{review.author}
											</span>
											<div className="flex items-center gap-0.5">
												{[...Array(5)].map((_, i) => (
													<Star
														key={`review-star-${review.id}-${i}`}
														className={cn(
															"size-3.5",
															i < Math.floor(review.rating)
																? "fill-primary text-primary"
																: "fill-muted text-muted-foreground",
														)}
													/>
												))}
											</div>
											<span className="text-muted-foreground">
												{review.date}
											</span>
										</div>
										<p className="text-sm leading-relaxed text-muted-foreground">
											{review.comment}
										</p>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}
