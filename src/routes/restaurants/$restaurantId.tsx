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
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import { useRestaurantSearchStore } from "@/store/restaurant-search-store";
import type { Restaurant } from "@/store/restaurant-search-store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	ArrowRight,
	Clock,
	DollarSign,
	Heart,
	MapPin,
	Navigation,
	Star,
	Utensils,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/restaurants/$restaurantId")({
	component: RestaurantDetailPage,
});

function RestaurantDetailPage() {
	const params = Route.useParams();
	const restaurantId = params.restaurantId as string;
	const navigate = useNavigate();
	const restaurants = useRestaurantSearchStore((state) => state.restaurants);
	const [reservationModalOpen, setReservationModalOpen] = useState(false);

	// API-based favorites using React Query with error handling
	const { data: favoritesData } = useFavorites();
	const { mutate: toggleFavoriteMutate, isPending: isTogglingFavorite } =
		useToggleFavorite({
			onSuccess: (data) => {
				// Show success toast based on action
				if (data.action === "added") {
					toast.success("Added to favorites", {
						description: `${restaurant?.name} has been added to your favorites.`,
					});
				} else {
					toast.success("Removed from favorites", {
						description: `${restaurant?.name} has been removed from your favorites.`,
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

	// Find the restaurant from the store
	const restaurant = restaurants.find((r) => r.id === restaurantId);

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
								The restaurant you're looking for could not be found. Please
								return to the search page.
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

	return (
		<Layout>
			<div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
				{/* Back Button */}
				<div className="mb-6">
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/restaurants" })}
						className="cursor-pointer border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 font-serif-elegant font-semibold tracking-wide shadow-md transition-all"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Search
					</Button>
				</div>

				{/* Restaurant Detail Card - Floating Light Module */}
				<Card className="border-2 border-primary/40 bg-card shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.25),0_8px_24px_black] relative overflow-hidden">
					{/* Subtle glowing texture */}
					<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.15)_8px,oklch(0.55_0.18_240_/_0.15)_9px)] pointer-events-none" />

					<CardContent className="p-6 md:p-8 relative z-10">
						{/* Restaurant Header */}
						<div className="mb-8">
							<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
								<div className="flex-1">
									<h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-display text-card-foreground tracking-tight leading-tight mb-3">
										{restaurant.name}
									</h1>
									<div className="flex flex-wrap items-center gap-2 mb-4">
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
								<Button
									size="icon"
									variant={
										favoriteIds.has(restaurant.id) ? "default" : "outline"
									}
									onClick={() => toggleFavorite(restaurant.id)}
									disabled={isTogglingFavorite}
									className={cn(
										"cursor-pointer shadow-md flex-shrink-0 h-12 w-12 transition-all duration-200",
										favoriteIds.has(restaurant.id)
											? "shadow-layered"
											: "border-2 border-primary/30",
										isTogglingFavorite && "opacity-60 cursor-not-allowed",
									)}
								>
									<Heart
										className={cn(
											"size-5 transition-all duration-200",
											favoriteIds.has(restaurant.id) && "fill-current",
											isTogglingFavorite && "animate-pulse",
										)}
									/>
								</Button>
							</div>

							{/* Rating and Price */}
							<div className="flex flex-wrap items-center gap-4 mb-4">
								<div className="flex items-center gap-2">
									{[...Array(5)].map((_, i) => (
										<Star
											key={`star-${restaurant.id}-${i}`}
											className={cn(
												"size-6",
												i < Math.floor(restaurant.rating)
													? "fill-secondary text-secondary drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]"
													: i < restaurant.rating
														? "fill-secondary/50 text-secondary drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.3)]"
														: "fill-muted text-muted",
											)}
										/>
									))}
								</div>
								<span className="text-xl font-serif-elegant font-semibold text-secondary drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.4)]">
									{restaurant.rating.toFixed(1)} / 5.0
								</span>
								<span className="text-sm text-card-foreground/70">
									({restaurant.reviewCount} reviews)
								</span>
							</div>

							{/* Location */}
							<div className="flex items-center gap-2 text-card-foreground/80 mb-4">
								<MapPin className="size-5 text-primary flex-shrink-0 stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.4)]" />
								<span className="font-serif-elegant">
									{restaurant.address.city}, {restaurant.address.state}
								</span>
							</div>

							{/* Description */}
							<p className="text-base md:text-lg font-serif-elegant text-card-foreground/80 leading-relaxed mb-6">
								{restaurant.description}
							</p>

							{/* Additional Details */}
							<div className="flex flex-wrap items-center gap-4 text-sm">
								{/* Price Range */}
								<div className="flex items-center gap-2">
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
												variant={restaurant.isOpenNow ? "default" : "secondary"}
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
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 mb-8">
							<Button
								className="w-full sm:w-auto cursor-pointer group bg-gradient-to-r from-primary via-secondary to-primary text-white hover:shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.5)] font-serif-elegant font-semibold tracking-wide shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)] px-8 py-5 text-base transition-all duration-300 border-2 border-primary/60"
								onClick={() => setReservationModalOpen(true)}
							>
								Make Reservation
								<ArrowRight className="ml-2 h-5 w-5 stroke-[2.5]" />
							</Button>
							<Button
								variant="outline"
								className="w-full sm:w-auto cursor-pointer border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 font-serif-elegant font-semibold tracking-wide shadow-md px-8 py-5 text-base transition-all duration-300"
								onClick={() => openInMaps(restaurant)}
							>
								<Navigation className="mr-2 h-5 w-5" />
								Get Directions
							</Button>
						</div>

						{/* Divider */}
						<div className="border-t-2 border-primary/30 shadow-[0_-2px_20px_oklch(0.55_0.18_240_/_0.1)] mb-8" />

						{/* Full Address */}
						<div className="mb-8 w-full">
							<Card className="border-2 border-primary/30 bg-[oklch(0.96_0.008_50)] shadow-sm">
								<CardHeader>
									<CardTitle className="text-xl font-serif-display text-card-foreground flex items-center gap-2">
										<MapPin className="size-5 text-primary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
										Full Address
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-base font-serif-elegant text-card-foreground/80 leading-relaxed">
										{restaurant.address.street}
										<br />
										{restaurant.address.city}, {restaurant.address.state}{" "}
										{restaurant.address.zipCode}
										<br />
										{restaurant.address.country}
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Photo Carousel */}
						<div className="mb-8 w-full">
							<DetailPhotoCarousel restaurantName={restaurant.name} />
						</div>

						{/* Chef Profile Section */}
						<div className="mb-8 w-full">
							<ChefProfileSection />
						</div>

						{/* Signature Menu */}
						<div className="mb-8 w-full">
							<SignatureMenu />
						</div>

						{/* Review Summary */}
						<div className="mb-8 w-full">
							<ReviewSummary
								overallRating={restaurant.rating}
								totalReviews={restaurant.reviewCount}
								reviews={restaurant.reviews}
							/>
						</div>
					</CardContent>
				</Card>
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
				restaurant={restaurant}
				open={reservationModalOpen}
				onOpenChange={setReservationModalOpen}
			/>
		</Layout>
	);
}
