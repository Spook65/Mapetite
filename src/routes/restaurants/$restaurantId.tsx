import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	ExternalLink,
	Heart,
	MapPin,
	Navigation,
	Phone,
	Star,
	Utensils,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/restaurants/$restaurantId")({
	component: RestaurantDetailPage,
});

function formatPriceRange(priceRange?: number | null) {
	if (!priceRange || priceRange < 1) return null;
	return "$".repeat(priceRange);
}

function buildLocationLine(restaurant: Restaurant) {
	return [restaurant.address.city, restaurant.address.state]
		.filter(Boolean)
		.join(", ");
}

function buildFullAddress(restaurant: Restaurant) {
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

function buildGalleryImages(restaurant: Restaurant) {
	if (restaurant.galleryImageUrls?.length) return restaurant.galleryImageUrls;
	if (restaurant.photoUrl) return [restaurant.photoUrl];
	return [];
}

function buildGalleryAttributions(restaurant: Restaurant) {
	if (restaurant.galleryPhotoAttributions?.length) {
		return restaurant.galleryPhotoAttributions;
	}
	if (restaurant.photoAttributions?.length) {
		return [restaurant.photoAttributions];
	}
	return [];
}

function buildMapEmbedUrl(restaurant: Restaurant) {
	const delta = 0.01;
	const bbox = [
		restaurant.longitude - delta,
		restaurant.latitude - delta,
		restaurant.longitude + delta,
		restaurant.latitude + delta,
	]
		.map((n) => n.toFixed(6))
		.join(",");

	return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${restaurant.latitude}%2C${restaurant.longitude}`;
}

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
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const storeRestaurant = restaurants.find((r) => r.id === restaurantId);
	const restaurantName =
		fetchedRestaurant?.name ?? storeRestaurant?.name ?? "Restaurant";

	const { data: favoritesData } = useFavorites();
	const { mutate: toggleFavoriteMutate, isPending: isTogglingFavorite } =
		useToggleFavorite({
			onSuccess: (data) => {
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
					setRestaurantLoadError("Restaurant details are not available right now.");
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

	useEffect(() => {
		setSelectedImageIndex(0);
	}, [restaurantId]);

	const restaurant = fetchedRestaurant ?? storeRestaurant;
	const favoriteIds = useMemo(
		() => new Set(favoritesData?.favorites ?? []),
		[favoritesData?.favorites],
	);

	const toggleFavorite = (targetRestaurantId: string) => {
		if (!isAuthenticatedSync()) {
			toast.error("Please log in to save favorites", {
				description:
					"You need to be logged in to add restaurants to your favorites.",
			});
			return;
		}

		toggleFavoriteMutate({ restaurant_id: targetRestaurantId });
	};

	const buildDirectionsUrl = (targetRestaurant: Restaurant) => {
		const hasCoordinates =
			Number.isFinite(targetRestaurant.latitude) &&
			Number.isFinite(targetRestaurant.longitude);

		return hasCoordinates
			? `https://www.openstreetmap.org/?mlat=${targetRestaurant.latitude}&mlon=${targetRestaurant.longitude}#map=18/${targetRestaurant.latitude}/${targetRestaurant.longitude}`
			: `https://www.openstreetmap.org/search?query=${encodeURIComponent(targetRestaurant.name)}`;
	};

	if (!restaurant && isLoadingRestaurant) {
		return (
			<Layout>
				<div className="mapetite-page-shell min-h-full">
					<div className="mapetite-container px-4 py-8 md:px-6 md:py-10">
						<div className="mapetite-panel mx-auto max-w-3xl px-6 py-16 text-center md:px-10">
							<div className="mx-auto flex size-16 items-center justify-center rounded-[12px] border border-[var(--mapetite-border-strong)] bg-[var(--mapetite-accent-soft)] text-[var(--mapetite-text)]">
								<Utensils className="size-7" />
							</div>
							<h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
								Loading restaurant
							</h2>
							<p className="mapetite-muted-copy mx-auto mt-3 max-w-md text-base leading-7">
								Fetching the latest details before you decide where to go.
							</p>
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	if (!restaurant) {
		return (
			<Layout>
				<div className="mapetite-page-shell min-h-full">
					<div className="mapetite-container px-4 py-8 md:px-6 md:py-10">
						<div className="mapetite-panel mx-auto max-w-3xl px-6 py-16 text-center md:px-10">
							<div className="mx-auto flex size-16 items-center justify-center rounded-[12px] border border-[var(--mapetite-border-strong)] bg-[var(--mapetite-accent-soft)] text-[var(--mapetite-text)]">
								<Utensils className="size-7" />
							</div>
							<h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
								Restaurant not found
							</h2>
							<p className="mapetite-muted-copy mx-auto mt-3 max-w-lg text-base leading-7">
								{restaurantLoadError ||
									"The restaurant you opened is not available right now. Return to search and try another shortlist."}
							</p>
							<div className="mt-8">
								<Button
									onClick={() => navigate({ to: "/restaurants" })}
									className="mapetite-accent-button rounded-[10px] px-6"
								>
									<ArrowLeft className="mr-2 size-4" />
									Back to search
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	const directionsUrl = buildDirectionsUrl(restaurant);
	const isFavorite = favoriteIds.has(restaurant.id);
	const priceRangeLabel = formatPriceRange(restaurant.priceRange);
	const locationLine = buildLocationLine(restaurant);
	const fullAddress = buildFullAddress(restaurant);
	const galleryImages = buildGalleryImages(restaurant);
	const galleryAttributions = buildGalleryAttributions(restaurant);
	const hasHours = !!restaurant.hours;
	const hasReviews = !!restaurant.reviews?.length;
	const hasRatingBreakdown = !!restaurant.ratingBreakdown;
	const hasMapCoordinates =
		Number.isFinite(restaurant.latitude) && Number.isFinite(restaurant.longitude);
	const hasWebsite = !!restaurant.website;
	const hasPhone = !!restaurant.phone;
	const hasAmenities = !!restaurant.amenities?.length;
	const hasPaymentMethods = !!restaurant.paymentMethods?.length;
	const selectedImage = galleryImages[selectedImageIndex] ?? null;
	const selectedImageAttribution = galleryAttributions[selectedImageIndex] ?? [];
	const ratingBreakdownRows = hasRatingBreakdown
		? ([5, 4, 3, 2, 1] as const).map((score) => ({
				score,
				count: restaurant.ratingBreakdown?.[score] ?? 0,
		  }))
		: [];
	const totalBreakdownCount = ratingBreakdownRows.reduce(
		(total, row) => total + row.count,
		0,
	);

	return (
		<Layout>
			<div className="mapetite-page-shell min-h-full">
				<div className="mapetite-container px-4 py-6 md:px-6 md:py-8">
					<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
						<button
							type="button"
							onClick={() => navigate({ to: "/restaurants" })}
							className="inline-flex items-center gap-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
						>
							<ArrowLeft className="size-4" />
							Back to search
						</button>
						<div className="mapetite-faint-copy text-sm">Restaurant detail</div>
					</div>

					<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
						<div className="space-y-6">
							<section className="mapetite-panel p-5 md:p-7">
								<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
									<div className="space-y-4">
										<div className="mapetite-eyebrow">Full restaurant view</div>
										<div>
											<h1 className="max-w-[11ch] text-4xl font-semibold tracking-[-0.06em] text-[var(--mapetite-text)] md:text-5xl lg:text-[3.6rem] lg:leading-[0.96]">
												{restaurant.name}
											</h1>
											<p className="mapetite-muted-copy mt-4 max-w-3xl text-base leading-8 md:text-lg">
												{restaurant.description}
											</p>
										</div>

										<div className="flex flex-wrap items-center gap-2">
											<div className="inline-flex items-center gap-2 rounded-full border border-[var(--mapetite-border)] bg-white/[0.03] px-3 py-2 text-sm text-[var(--mapetite-text-soft)]">
												<Star className="size-4 fill-[var(--mapetite-accent)] text-[var(--mapetite-accent)]" />
												<strong className="font-medium text-[var(--mapetite-text)]">
													{restaurant.rating.toFixed(1)}
												</strong>
												<span>({restaurant.reviewCount} reviews)</span>
											</div>

											{locationLine ? (
												<div className="inline-flex items-center gap-2 rounded-full border border-[var(--mapetite-border)] bg-white/[0.03] px-3 py-2 text-sm text-[var(--mapetite-text-soft)]">
													<MapPin className="size-4 text-[var(--mapetite-accent)]" />
													<span>{locationLine}</span>
												</div>
											) : null}

											{priceRangeLabel ? (
												<div className="inline-flex items-center gap-2 rounded-full border border-[var(--mapetite-border)] bg-white/[0.03] px-3 py-2 text-sm text-[var(--mapetite-text-soft)]">
													<DollarSign className="size-4 text-[var(--mapetite-accent)]" />
													<span>{priceRangeLabel}</span>
												</div>
											) : null}

											{hasHours ? (
												<div className="inline-flex items-center gap-2 rounded-full border border-[var(--mapetite-border)] bg-white/[0.03] px-3 py-2 text-sm text-[var(--mapetite-text-soft)]">
													<Clock className="size-4 text-[var(--mapetite-accent)]" />
													<span>
														{restaurant.hours?.open} - {restaurant.hours?.close}
													</span>
													<span
														className={cn(
															"rounded-full px-2 py-0.5 text-xs",
															restaurant.isOpenNow
																? "bg-[var(--mapetite-accent-soft)] text-[var(--mapetite-text)]"
																: "bg-white/[0.05] text-[var(--mapetite-text-soft)]",
														)}
													>
														{restaurant.isOpenNow ? "Open now" : "Closed"}
													</span>
												</div>
											) : null}
										</div>

										<div className="flex flex-wrap gap-2">
											{restaurant.categories.map((category) => (
												<Badge
													key={category}
													variant="outline"
													className="border-[var(--mapetite-border)] bg-white/[0.03] text-[var(--mapetite-text-soft)]"
												>
													{category}
												</Badge>
											))}
										</div>
									</div>

									<div className="flex flex-col gap-3 lg:min-w-[220px]">
										<Button
											asChild
											size="lg"
											className="mapetite-accent-button rounded-[10px] px-5"
										>
											<a href={directionsUrl} target="_blank" rel="noreferrer">
												<Navigation className="mr-2 size-4" />
												Get directions
											</a>
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => toggleFavorite(restaurant.id)}
											disabled={isTogglingFavorite}
											className="mapetite-quiet-button rounded-[10px] px-5"
										>
											<Heart
												className={cn(
													"mr-2 size-4",
													isFavorite && "fill-current",
												)}
											/>
											Save
										</Button>
										<Button
											type="button"
											variant="ghost"
											onClick={() => navigate({ to: "/restaurants" })}
											className="justify-start rounded-[10px] px-1 text-[var(--mapetite-text-soft)] hover:text-[var(--mapetite-text)]"
										>
											<ArrowLeft className="mr-2 size-4" />
											Back to search
										</Button>
									</div>
								</div>
							</section>

							<section className="space-y-6">
								<div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
									<div className="mapetite-panel overflow-hidden p-4 md:p-5">
										<div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_172px]">
											<div
												className={cn(
													"relative min-h-[360px] overflow-hidden rounded-[14px] border border-[var(--mapetite-border)] p-5 md:min-h-[420px]",
													selectedImage
														? "bg-black/10"
														: "mapetite-media-fallback",
												)}
											>
												{selectedImage ? (
													<img
														src={selectedImage}
														alt={`${restaurant.name} photo ${selectedImageIndex + 1}`}
														className="absolute inset-0 h-full w-full object-cover"
														loading="lazy"
														referrerPolicy="no-referrer"
													/>
												) : null}
												<div className="relative z-10 flex h-full flex-col justify-between">
													<div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--mapetite-border)] bg-black/30 px-3 py-1.5 text-xs text-[var(--mapetite-text-soft)] backdrop-blur">
														{selectedImage ? "Gallery" : "Room preview"}
													</div>
													<div className="max-w-md">
														<strong className="block text-3xl font-semibold tracking-[-0.05em] text-[var(--mapetite-text)] md:text-[2.1rem]">
															{selectedImage ? restaurant.name : "The room, the route, and the final call."}
														</strong>
														<p className="mt-3 text-sm leading-7 text-[var(--mapetite-text-soft)]">
															{selectedImage
																? restaurant.description
																: "When photos are limited, the address, route, and shortlist context still stay clear enough to decide."}
														</p>
													</div>
													<div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--mapetite-text-faint)]">
														<span>
															{selectedImage
																? `${selectedImageIndex + 1} of ${galleryImages.length}`
																: `${restaurant.categories[0] ?? "Restaurant"} · ${locationLine}`}
														</span>
														{selectedImageAttribution.length > 0 ? (
															<span>
																Photo credit: {selectedImageAttribution.join(", ")}
															</span>
														) : null}
													</div>
												</div>
											</div>

											<div className="grid gap-3">
												{galleryImages.length > 0 ? (
													galleryImages.map((image, index) => (
														<button
															key={`${image}-${index}`}
															type="button"
															onClick={() => setSelectedImageIndex(index)}
															className={cn(
																"grid gap-2 rounded-[12px] border p-3 text-left transition-all hover:-translate-y-0.5",
																selectedImageIndex === index
																	? "border-[var(--mapetite-border-strong)] bg-[var(--mapetite-accent-soft)]"
																	: "border-[var(--mapetite-border)] bg-white/[0.03]",
															)}
														>
															<div className="overflow-hidden rounded-[10px] border border-[var(--mapetite-border)] bg-black/10">
																<img
																	src={image}
																	alt={`${restaurant.name} thumbnail ${index + 1}`}
																	className="aspect-[4/3] w-full object-cover"
																	loading="lazy"
																	referrerPolicy="no-referrer"
																/>
															</div>
															<strong className="text-sm font-medium text-[var(--mapetite-text)]">
																{index === 0
																	? "Main room"
																	: index === 1
																		? "Service and seating"
																		: "Dining atmosphere"}
															</strong>
															<span className="text-xs text-[var(--mapetite-text-soft)]">
																{restaurant.categories[0] ?? "Restaurant"} · {locationLine}
															</span>
														</button>
													))
												) : (
													<div className="grid gap-3">
														{[
															"Dining room",
															"Service and seating",
															"Address and route",
														].map((label) => (
															<div
																key={label}
																className="rounded-[12px] border border-[var(--mapetite-border)] bg-white/[0.03] p-3"
															>
																<div className="mapetite-media-fallback min-h-[82px] rounded-[10px]" />
																<strong className="mt-3 block text-sm font-medium text-[var(--mapetite-text)]">
																	{label}
																</strong>
																<span className="mt-1 block text-xs text-[var(--mapetite-text-soft)]">
																	{restaurant.categories[0] ?? "Restaurant"} · {locationLine}
																</span>
															</div>
														))}
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="mapetite-panel p-5 md:p-6">
										<div className="mapetite-eyebrow">Restaurant context</div>
										<div className="mt-5 space-y-5">
											<div>
												<p className="text-sm font-medium text-[var(--mapetite-text)]">
													Address
												</p>
												<p className="mapetite-muted-copy mt-2 text-sm leading-7">
													{fullAddress}
												</p>
											</div>

											<div className="grid gap-3 sm:grid-cols-2">
												<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
													<p className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
														Cuisine
													</p>
													<p className="mt-2 text-sm font-medium leading-6 text-[var(--mapetite-text)]">
														{restaurant.categories.join(" · ")}
													</p>
												</div>
												<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
													<p className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
														Price
													</p>
													<p className="mt-2 text-sm font-medium leading-6 text-[var(--mapetite-text)]">
														{priceRangeLabel ? `${priceRangeLabel} pricing` : "Pricing varies"}
													</p>
												</div>
											</div>

											{hasHours ? (
												<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
													<p className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
														Hours
													</p>
													<div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--mapetite-text-soft)]">
														<Clock className="size-4 text-[var(--mapetite-accent)]" />
														<span>
															{restaurant.hours?.open} - {restaurant.hours?.close}
														</span>
														<span
															className={cn(
																"rounded-full px-2 py-0.5 text-xs",
																restaurant.isOpenNow
																	? "bg-[var(--mapetite-accent-soft)] text-[var(--mapetite-text)]"
																	: "bg-white/[0.05] text-[var(--mapetite-text-soft)]",
															)}
														>
															{restaurant.isOpenNow ? "Open now" : "Closed"}
														</span>
													</div>
												</div>
											) : null}

											{(hasAmenities || hasPaymentMethods) && (
												<div className="grid gap-3 sm:grid-cols-2">
													{hasAmenities ? (
														<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
															<p className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
																Amenities
															</p>
															<p className="mt-2 text-sm leading-7 text-[var(--mapetite-text-soft)]">
																{restaurant.amenities?.join(" · ")}
															</p>
														</div>
													) : null}
													{hasPaymentMethods ? (
														<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
															<p className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
																Payments
															</p>
															<p className="mt-2 text-sm leading-7 text-[var(--mapetite-text-soft)]">
																{restaurant.paymentMethods?.join(" · ")}
															</p>
														</div>
													) : null}
												</div>
											)}
										</div>
									</div>
								</div>

								{(hasReviews || hasRatingBreakdown) && (
									<section className="mapetite-panel p-5 md:p-6">
										<div className="flex flex-wrap items-end justify-between gap-4">
											<div>
												<div className="mapetite-eyebrow">Reviews and confidence</div>
												<h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
													See how the room holds up before you go.
												</h2>
												<p className="mapetite-muted-copy mt-3 max-w-2xl text-sm leading-7">
													Use the overall rating, review tone, and recent comments to
													get confidence before you commit.
												</p>
											</div>
										</div>

										<div className="mt-6 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
											<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-white/[0.03] p-5">
												<strong className="block text-5xl font-semibold tracking-[-0.06em] text-[var(--mapetite-text)]">
													{restaurant.rating.toFixed(1)}
												</strong>
												<p className="mt-2 text-sm text-[var(--mapetite-text-soft)]">
													Based on {restaurant.reviewCount.toLocaleString()} reviews
												</p>

												{totalBreakdownCount > 0 ? (
													<div className="mt-5 space-y-2">
														{ratingBreakdownRows.map((row) => {
															const width =
																totalBreakdownCount > 0
																	? `${(row.count / totalBreakdownCount) * 100}%`
																	: "0%";

															return (
																<div
																	key={row.score}
																	className="grid grid-cols-[28px_minmax(0,1fr)_40px] items-center gap-2 text-xs text-[var(--mapetite-text-soft)]"
																>
																	<span>{row.score}★</span>
																	<div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
																		<div
																			className="h-full rounded-full bg-[linear-gradient(90deg,rgba(213,154,104,0.92),rgba(180,108,67,0.82))]"
																			style={{ width }}
																		/>
																	</div>
																	<span>{row.count}</span>
																</div>
															);
														})}
													</div>
												) : null}
											</div>

											{hasReviews ? (
												<div className="space-y-3">
													{restaurant.reviews.map((review) => (
														<div
															key={review.id}
															className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4"
														>
															<div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
																<span className="font-medium text-[var(--mapetite-text)]">
																	{review.author}
																</span>
																<div className="flex items-center gap-0.5">
																	{[...Array(5)].map((_, i) => (
																		<Star
																			key={`review-star-${review.id}-${i}`}
																			className={cn(
																				"size-3.5",
																				i < Math.floor(review.rating)
																					? "fill-[var(--mapetite-accent)] text-[var(--mapetite-accent)]"
																					: "fill-muted text-muted-foreground",
																			)}
																		/>
																	))}
																</div>
																<span className="mapetite-faint-copy">
																	{review.date}
																</span>
															</div>
															<p className="mapetite-muted-copy text-sm leading-7">
																{review.comment}
															</p>
														</div>
													))}
												</div>
											) : (
												<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-5">
													<p className="mapetite-muted-copy text-sm leading-7">
														Rating data is available, but there are no written reviews to
														show for this restaurant yet.
													</p>
												</div>
											)}
										</div>
									</section>
								)}

								<section className="mapetite-panel p-5 md:p-6">
									<div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(300px,1.1fr)]">
										<div className="space-y-4">
											<div className="mapetite-eyebrow">Location and route</div>
											<h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
												Know the room. Know the route.
											</h2>
											<p className="mapetite-muted-copy text-base leading-7">
												Keep the address, route, and final decision close once the
												restaurant feels worth the trip.
											</p>

											<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
												<p className="text-sm font-medium text-[var(--mapetite-text)]">
													{restaurant.name}
												</p>
												<p className="mapetite-muted-copy mt-2 text-sm leading-7">
													{fullAddress}
												</p>
											</div>

											<div className="flex flex-wrap gap-3">
												<Button
													asChild
													className="mapetite-accent-button rounded-[10px] px-5"
												>
													<a href={directionsUrl} target="_blank" rel="noreferrer">
														<Navigation className="mr-2 size-4" />
														Get directions
													</a>
												</Button>
												<Button
													type="button"
													variant="outline"
													onClick={() => navigate({ to: "/restaurants" })}
													className="mapetite-quiet-button rounded-[10px] px-5"
												>
													<ArrowLeft className="mr-2 size-4" />
													Back to search
												</Button>
											</div>
										</div>

										<div>
											{hasMapCoordinates ? (
												<div className="mapetite-panel overflow-hidden border-[var(--mapetite-border)] bg-transparent">
													<iframe
														title="Map preview"
														src={buildMapEmbedUrl(restaurant)}
														className="h-[320px] w-full"
														loading="lazy"
														referrerPolicy="no-referrer"
													/>
												</div>
											) : (
												<div className="mapetite-media-fallback flex min-h-[320px] items-end rounded-[14px] p-5">
													<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
														Use directions to open the route with the current restaurant
														location.
													</p>
												</div>
											)}
										</div>
									</div>
								</section>
							</section>
						</div>

						<aside className="xl:sticky xl:top-20">
							<div className="mapetite-panel p-5 md:p-6">
								<div className="mapetite-eyebrow">Ready to decide?</div>
								<div className="mt-5 space-y-5">
									<div>
										<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											{restaurant.name}
										</h2>
										<p className="mapetite-muted-copy mt-2 text-sm leading-6">
											{locationLine}
										</p>
									</div>

									<div className="space-y-3">
										<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
											<span className="mapetite-faint-copy block text-xs uppercase tracking-[0.14em]">
												Rating
											</span>
											<div className="mt-2 flex items-center gap-2 text-sm">
												<Star className="size-4 fill-[var(--mapetite-accent)] text-[var(--mapetite-accent)]" />
												<strong className="text-[var(--mapetite-text)]">
													{restaurant.rating.toFixed(1)}
												</strong>
												<span className="text-[var(--mapetite-text-soft)]">
													({restaurant.reviewCount} reviews)
												</span>
											</div>
										</div>

										<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
											<span className="mapetite-faint-copy block text-xs uppercase tracking-[0.14em]">
												Address
											</span>
											<p className="mt-2 text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{fullAddress}
											</p>
										</div>

										{hasHours ? (
											<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
												<span className="mapetite-faint-copy block text-xs uppercase tracking-[0.14em]">
													Hours
												</span>
												<p className="mt-2 text-sm leading-6 text-[var(--mapetite-text-soft)]">
													{restaurant.hours?.open} - {restaurant.hours?.close}
												</p>
												<p className="mt-1 text-sm text-[var(--mapetite-text)]">
													{restaurant.isOpenNow ? "Open now" : "Currently closed"}
												</p>
											</div>
										) : null}
									</div>

									<div className="flex flex-col gap-3">
										<Button
											asChild
											size="lg"
											className="mapetite-accent-button rounded-[10px] px-5"
										>
											<a href={directionsUrl} target="_blank" rel="noreferrer">
												<Navigation className="mr-2 size-4" />
												Get directions
											</a>
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => toggleFavorite(restaurant.id)}
											disabled={isTogglingFavorite}
											className="mapetite-quiet-button rounded-[10px] px-5"
										>
											<Heart
												className={cn(
													"mr-2 size-4",
													isFavorite && "fill-current",
												)}
											/>
											Save
										</Button>
										<Button
											type="button"
											variant="ghost"
											onClick={() => navigate({ to: "/restaurants" })}
											className="justify-start rounded-[10px] px-1 text-[var(--mapetite-text-soft)] hover:text-[var(--mapetite-text)]"
										>
											<ArrowLeft className="mr-2 size-4" />
											Back to search
										</Button>
									</div>

									{(hasWebsite || hasPhone) && (
										<div className="space-y-2 border-t border-[var(--mapetite-border)] pt-4">
											{hasWebsite ? (
												<a
													href={restaurant.website}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
												>
													<ExternalLink className="size-4" />
													Website
												</a>
											) : null}
											{hasPhone ? (
												<a
													href={`tel:${restaurant.phone}`}
													className="inline-flex items-center gap-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
												>
													<Phone className="size-4" />
													{restaurant.phone}
												</a>
											) : null}
										</div>
									)}
								</div>
							</div>
						</aside>
					</div>
				</div>
			</div>
		</Layout>
	);
}
