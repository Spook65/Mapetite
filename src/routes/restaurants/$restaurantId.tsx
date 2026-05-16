import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { isAuthenticatedSync } from "@/lib/auth-integration";
import { getRestaurantById } from "@/lib/search-restaurants";
import { cn } from "@/lib/utils";
import { useRestaurantSearchStore } from "@/store/restaurant-search-store";
import type { Restaurant } from "@/store/restaurant-search-store";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	ExternalLink,
	Heart,
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
	const galleryViewBlueprints = [
		{
			badge: "Dining room",
			label: "Dining room",
			title: `A closer look at ${restaurant.name} before you commit.`,
			copy:
				restaurant.description ||
				"Keep the room, the route, and the shortlist context visible even when live media is limited.",
			left:
				locationLine || restaurant.categories[0] || "Restaurant detail",
			right: galleryImages.length > 0 ? "Gallery view active" : "Gallery fallback active",
			summary: "What the room feels like once you're seated.",
		},
		{
			badge: "Open kitchen",
			label: "Open kitchen",
			title: "A steadier read on pace, service, and the room around the table.",
			copy:
				restaurant.description ||
				"Even a smaller set of photos should help the page feel grounded rather than empty.",
			left:
				restaurant.categories.slice(0, 2).join(" • ") ||
				restaurant.categories[0] ||
				"Restaurant detail",
			right: hasHours
				? `${restaurant.isOpenNow ? "Open now" : "Closed"}${
						restaurant.hours?.close ? ` until ${restaurant.hours.close}` : ""
					}`
				: "Hours vary",
			summary: "Useful when the energy of the room matters.",
		},
		{
			badge: "Signature plates",
			label: "Signature plates",
			title: "Enough detail to understand the food before opening the route.",
			copy:
				priceRangeLabel
					? `${priceRangeLabel} pricing with ${restaurant.categories.join(" • ")} at the center of the meal.`
					: `A clearer read on ${restaurant.categories.join(" • ")} before deciding.`,
			left:
				priceRangeLabel
					? `${priceRangeLabel} pricing`
					: restaurant.categories[0] || "Restaurant detail",
			right:
				restaurant.reviewCount > 0
					? `${restaurant.reviewCount.toLocaleString()} reviews`
					: "Review data limited",
			summary: "A quick food cue before the final call.",
		},
		{
			badge: "Fallback state",
			label: "Fallback state",
			title: "Missing media should still feel polished, not broken.",
			copy:
				"When the source has fewer images, the page can still rely on address, reviews, and route context to help you decide.",
			left:
				hasMapCoordinates
					? "Map preview available"
					: locationLine || "Address stays visible",
			right:
				selectedImageIndex === 3 || galleryImages.length === 0
					? "No external image required"
					: "Fallback available",
			summary: "A designed fallback for restaurants without full photo coverage.",
		},
	] as const;
	const galleryViews =
		galleryImages.length > 0
			? galleryImages.map((image, index) => ({
					...galleryViewBlueprints[
						Math.min(index, galleryViewBlueprints.length - 1)
					],
					image,
					attribution: galleryAttributions[index] ?? [],
			  }))
			: galleryViewBlueprints.map((view) => ({
					...view,
					image: null,
					attribution: [] as string[],
			  }));
	const activeGalleryView =
		galleryViews[
			Math.min(selectedImageIndex, Math.max(galleryViews.length - 1, 0))
		] ?? galleryViews[0];
	const contextTags = [
		...restaurant.categories.slice(0, 3),
		hasHours ? (restaurant.isOpenNow ? "Open now" : "Hours vary") : null,
		locationLine || null,
		...(restaurant.amenities?.slice(0, 2) ?? []),
	].filter(Boolean) as string[];
	const reviewSummaryCopy = hasReviews
		? "Use recent reviews and the overall rating together before you commit."
		: "Rating data is available, even if written reviews are limited for this restaurant.";

	return (
		<Layout>
			<div className="mapetite-page-shell min-h-full">
				<div className="mapetite-container px-4 py-4 md:px-6 md:py-6">
					<main className="grid gap-6 py-6 md:py-8">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<button
								type="button"
								onClick={() => navigate({ to: "/restaurants" })}
								className="inline-flex items-center gap-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
							>
								<ArrowLeft className="size-4" />
								Back to shortlist
							</button>
							<p className="mapetite-faint-copy text-sm">
								Compare the room, the route, and the reviews before you commit.
							</p>
						</div>

						<section className="mapetite-panel p-6 md:p-7">
							<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
								<div className="grid gap-4">
									<div className="mapetite-eyebrow">Restaurant detail</div>
									<div>
										<h1 className="max-w-[10ch] text-[clamp(34px,4vw,52px)] font-semibold leading-none tracking-[-0.06em] text-[var(--mapetite-text)]">
											{restaurant.name}
										</h1>
										<p className="mapetite-muted-copy mt-4 max-w-[620px] text-[15px] leading-7">
											{restaurant.description}
										</p>
									</div>

									<div className="flex flex-wrap items-center gap-2.5">
										<div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
											<strong className="font-semibold text-[var(--mapetite-text)]">
												{restaurant.rating.toFixed(1)}
											</strong>
											<span>{restaurant.reviewCount} reviews</span>
										</div>
										{restaurant.categories.length > 0 ? (
											<div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
												<span>{restaurant.categories.join(" • ")}</span>
											</div>
										) : null}
										{locationLine ? (
											<div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
												<span>{locationLine}</span>
											</div>
										) : null}
										{priceRangeLabel ? (
											<div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
												<span>{priceRangeLabel}</span>
											</div>
										) : null}
										{hasHours ? (
											<div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
												<strong className="font-semibold text-[var(--mapetite-text)]">
													{restaurant.isOpenNow ? "Open now" : "Closed"}
												</strong>
												<span>
													{restaurant.hours?.close
														? `until ${restaurant.hours.close}`
														: `${restaurant.hours?.open} - ${restaurant.hours?.close}`}
												</span>
											</div>
										) : null}
									</div>

									<div className="flex flex-wrap gap-3">
										<Button asChild className="mapetite-accent-button rounded-[10px] px-5">
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
												className={cn("mr-2 size-4", isFavorite && "fill-current")}
											/>
											{isFavorite ? "Saved" : "Save"}
										</Button>
										<Button
											type="button"
											variant="ghost"
											onClick={() => navigate({ to: "/restaurants" })}
											className="rounded-[10px] border border-[rgba(255,236,220,0.1)] bg-white/[0.02] px-4 text-[var(--mapetite-text-soft)] hover:bg-white/[0.05] hover:text-[var(--mapetite-text)]"
										>
											<ArrowLeft className="mr-2 size-4" />
											Back to results
										</Button>
									</div>
								</div>

								<aside className="grid gap-3 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-[18px]">
									<small className="text-[12px] uppercase tracking-[0.14em] text-[rgba(245,233,222,0.46)]">
										Decision cues
									</small>
									<strong className="text-lg font-semibold tracking-[-0.03em] text-[var(--mapetite-text)]">
										Easy to compare, strong enough to commit.
									</strong>
									<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
										Photo coverage, tonight&apos;s hours, address, and review
										confidence stay visible without turning the page into a dashboard.
									</p>
									<div className="flex flex-wrap gap-2">
										{[
											hasMapCoordinates ? "Nearby map" : null,
											hasReviews || hasRatingBreakdown ? "Review summary" : null,
											"Back to shortlist",
										]
											.filter(Boolean)
											.map((tag, index) => (
												<span
													key={tag}
													className={cn(
														"inline-flex items-center rounded-full border px-[11px] py-2 text-[13px]",
														index === 0
															? "border-[rgba(213,154,104,0.24)] bg-[var(--mapetite-accent-soft)] text-[var(--mapetite-text)]"
															: "border-[rgba(255,236,220,0.1)] bg-white/[0.03] text-[var(--mapetite-text-soft)]",
													)}
												>
													{tag}
												</span>
											))}
									</div>
								</aside>
							</div>
						</section>

						<div className="grid gap-6 min-[1181px]:grid-cols-[minmax(0,1fr)_320px] min-[1181px]:items-start">
							<div className="grid gap-6">
								<section id="gallery" className="mapetite-panel grid gap-[18px] p-[22px]">
									<div className="flex flex-wrap items-end justify-between gap-4">
										<div>
											<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
												Gallery
											</h2>
											<p className="mapetite-muted-copy mt-2 max-w-[620px] text-sm leading-6">
												Use the space, plating, and pace of service to decide whether it
												matches the night you have in mind.
											</p>
										</div>
									</div>

									<div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_172px]">
										<div
											className={cn(
												"relative grid min-h-[420px] grid-rows-[auto_1fr_auto] gap-[14px] overflow-hidden rounded-[14px] border border-[rgba(255,236,220,0.08)] p-[22px]",
												activeGalleryView.image
													? "bg-black/10"
													: "bg-[linear-gradient(180deg,rgba(255,248,242,0.04),rgba(255,248,242,0.02)),linear-gradient(145deg,rgba(213,154,104,0.26),rgba(180,108,67,0.08)_38%,rgba(17,13,11,0.2)_100%)]",
											)}
										>
											{activeGalleryView.image ? (
												<img
													src={activeGalleryView.image}
													alt={`${restaurant.name} view ${selectedImageIndex + 1}`}
													className="absolute inset-0 h-full w-full object-cover"
													loading="lazy"
													referrerPolicy="no-referrer"
												/>
											) : null}

											<div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(255,236,220,0.12)] bg-black/30 px-[10px] py-2 text-xs text-[rgba(255,244,236,0.78)] backdrop-blur">
												{activeGalleryView.badge}
											</div>
											<div className="relative z-10 grid max-w-[420px] gap-[10px] self-end">
												<strong className="text-[34px] font-semibold leading-[0.98] tracking-[-0.05em] text-[rgba(255,248,242,0.96)]">
													{activeGalleryView.title}
												</strong>
												<p className="text-sm leading-[1.65] text-[rgba(255,240,232,0.76)]">
													{activeGalleryView.copy}
												</p>
											</div>
											<div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[rgba(255,240,232,0.68)]">
												<span>{activeGalleryView.left}</span>
												<span>
													{activeGalleryView.attribution.length > 0
														? `Photo credit: ${activeGalleryView.attribution.join(", ")}`
														: activeGalleryView.right}
												</span>
											</div>
										</div>

										<div className="grid gap-3">
											{galleryViews.map((view, index) => (
												<button
													key={`${view.label}-${index}`}
													type="button"
													onClick={() => setSelectedImageIndex(index)}
													className={cn(
														"grid gap-2 rounded-[12px] border p-[14px] text-left transition-all hover:-translate-y-0.5",
														selectedImageIndex === index
															? "border-[rgba(213,154,104,0.3)] bg-[linear-gradient(180deg,rgba(255,248,242,0.04),rgba(255,248,242,0.02)),linear-gradient(145deg,rgba(213,154,104,0.18),rgba(180,108,67,0.04))]"
															: "border-[rgba(255,236,220,0.08)] bg-[linear-gradient(180deg,rgba(255,248,242,0.04),rgba(255,248,242,0.02)),linear-gradient(145deg,rgba(213,154,104,0.18),rgba(180,108,67,0.04))]",
													)}
												>
													<div className="overflow-hidden rounded-[10px] border border-[rgba(255,236,220,0.08)]">
														{view.image ? (
															<img
																src={view.image}
																alt={`${restaurant.name} thumbnail ${index + 1}`}
																className="aspect-[4/3] w-full object-cover"
																loading="lazy"
																referrerPolicy="no-referrer"
															/>
														) : (
															<div className="min-h-[82px] bg-[linear-gradient(180deg,rgba(255,248,242,0.05),rgba(255,248,242,0.02)),linear-gradient(135deg,rgba(213,154,104,0.22),rgba(180,108,67,0.06)_50%,rgba(17,13,11,0.16)_100%)]" />
														)}
													</div>
													<strong className="text-[15px] font-semibold text-[var(--mapetite-text)]">
														{view.label}
													</strong>
													<span className="text-[13px] text-[var(--mapetite-text-soft)]">
														{view.summary}
													</span>
												</button>
											))}
										</div>
									</div>
								</section>

								<section id="context" className="mapetite-panel grid gap-[18px] p-[22px]">
									<div>
										<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											Restaurant context
										</h2>
										<p className="mapetite-muted-copy mt-2 max-w-[620px] text-sm leading-6">
											Keep the details useful: where it is, how it&apos;s priced, when
											it&apos;s open, and what makes it worth opening the route for.
										</p>
									</div>

									<div className="grid gap-[18px] md:grid-cols-2">
										<div className="grid gap-2 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4">
											<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
												Address
											</small>
											<strong className="text-base font-semibold text-[var(--mapetite-text)]">
												{fullAddress}
											</strong>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{locationLine
													? `Close enough to keep ${locationLine} in the plan without losing the search context.`
													: "Keep the full address close before opening the route."}
											</p>
										</div>
										<div className="grid gap-2 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4">
											<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
												Kitchen
											</small>
											<strong className="text-base font-semibold text-[var(--mapetite-text)]">
												{restaurant.categories.join(" • ")}
											</strong>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{restaurant.description}
											</p>
										</div>
										<div className="grid gap-2 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4">
											<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
												Hours
											</small>
											<strong className="text-base font-semibold text-[var(--mapetite-text)]">
												{hasHours
													? `${restaurant.isOpenNow ? "Open now" : "Hours listed"} • ${restaurant.hours?.open} - ${restaurant.hours?.close}`
													: "Hours not listed"}
											</strong>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{hasHours
													? "Use the current hours as one more signal before you leave the shortlist."
													: "Open status is not available for this restaurant right now."}
											</p>
										</div>
										<div className="grid gap-2 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4">
											<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
												Price
											</small>
											<strong className="text-base font-semibold text-[var(--mapetite-text)]">
												{priceRangeLabel ? `${priceRangeLabel} pricing` : "Pricing varies"}
											</strong>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{priceRangeLabel
													? "A quick spend check before you commit to the route."
													: "Use the rest of the detail signals to decide whether the place still fits."}
											</p>
										</div>
									</div>

									{contextTags.length > 0 ? (
										<div className="flex flex-wrap gap-2">
											{contextTags.map((tag, index) => (
												<span
													key={`${tag}-${index}`}
													className={cn(
														"inline-flex items-center gap-2 rounded-full border px-[11px] py-2 text-[13px]",
														index === 0
															? "border-[rgba(213,154,104,0.24)] bg-[var(--mapetite-accent-soft)] text-[var(--mapetite-text)]"
															: "border-[rgba(255,236,220,0.1)] bg-white/[0.03] text-[var(--mapetite-text-soft)]",
													)}
												>
													{tag}
												</span>
											))}
										</div>
									) : null}
								</section>

								<section id="reviews" className="mapetite-panel grid gap-[18px] p-[22px]">
									<div>
										<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											Reviews and confidence
										</h2>
										<p className="mapetite-muted-copy mt-2 max-w-[620px] text-sm leading-6">
											{reviewSummaryCopy}
										</p>
									</div>

									<div className="grid gap-[18px] lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
										<div className="grid gap-[10px] rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-[18px]">
											<strong className="text-[46px] font-semibold leading-[0.95] tracking-[-0.06em] text-[var(--mapetite-text)]">
												{restaurant.rating.toFixed(1)}
											</strong>
											<span className="text-sm text-[var(--mapetite-text-soft)]">
												{restaurant.reviewCount.toLocaleString()} ratings
											</span>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{reviewSummaryCopy}
											</p>
											{totalBreakdownCount > 0 ? (
												<div className="grid gap-2">
													{ratingBreakdownRows.map((row) => {
														const width =
															totalBreakdownCount > 0
																? `${(row.count / totalBreakdownCount) * 100}%`
																: "0%";

														return (
															<div
																key={row.score}
																className="grid grid-cols-[32px_minmax(0,1fr)_42px] items-center gap-[10px] text-[13px] text-[var(--mapetite-text-soft)]"
															>
																<span>{row.score}</span>
																<div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
																	<div
																		className="h-full rounded-full bg-[linear-gradient(90deg,rgba(213,154,104,0.9),rgba(180,108,67,0.82))]"
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
											<div className="grid gap-3">
												{restaurant.reviews.map((review) => (
													<article
														key={review.id}
														className="grid gap-3 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4"
													>
														<div className="flex flex-wrap items-center justify-between gap-2">
															<div className="flex flex-wrap items-center gap-2 text-sm">
																<strong className="text-[var(--mapetite-text)]">
																	{review.author}
																</strong>
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
															</div>
															<span className="text-sm text-[var(--mapetite-text-faint)]">
																{review.date}
															</span>
														</div>
														<p className="text-sm leading-7 text-[var(--mapetite-text-soft)]">
															{review.comment}
														</p>
													</article>
												))}
											</div>
										) : (
											<div className="grid gap-3 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4">
												<p className="text-sm leading-7 text-[var(--mapetite-text-soft)]">
													Written reviews are limited for this restaurant right now, but
													the overall rating still gives you a quick confidence signal.
												</p>
											</div>
										)}
									</div>
								</section>

								<section id="location" className="mapetite-panel grid gap-[18px] p-[22px]">
									<div>
										<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											Location and route
										</h2>
										<p className="mapetite-muted-copy mt-2 max-w-[620px] text-sm leading-6">
											Leave with the exact address, a grounded location preview, and a
											clear next action.
										</p>
									</div>

									<div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:items-start">
										<div className="overflow-hidden rounded-[14px] border border-[rgba(255,236,220,0.08)] bg-black/10">
											{hasMapCoordinates ? (
												<iframe
													title="Map preview"
													src={buildMapEmbedUrl(restaurant)}
													className="h-[320px] w-full"
													loading="lazy"
													referrerPolicy="no-referrer"
												/>
											) : (
												<div className="flex min-h-[320px] items-end bg-[linear-gradient(180deg,rgba(255,248,242,0.04),rgba(255,248,242,0.02)),linear-gradient(145deg,rgba(213,154,104,0.26),rgba(180,108,67,0.08)_38%,rgba(17,13,11,0.2)_100%)] p-5">
													<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
														Use directions to open the route even when a full map preview
														isn&apos;t available for this restaurant.
													</p>
												</div>
											)}
										</div>

										<div className="grid gap-4">
											<strong className="text-lg font-semibold tracking-[-0.03em] text-[var(--mapetite-text)]">
												{fullAddress}
											</strong>
											<p className="text-sm leading-7 text-[var(--mapetite-text-soft)]">
												Keep the address, route, and final decision close once the
												restaurant feels worth the trip.
											</p>
											<div className="flex flex-wrap gap-2">
												{[
													hasMapCoordinates ? "Map preview available" : null,
													locationLine || null,
												]
													.filter(Boolean)
													.map((tag) => (
														<span
															key={tag}
															className="inline-flex items-center rounded-full border border-[rgba(213,154,104,0.24)] bg-[var(--mapetite-accent-soft)] px-[11px] py-2 text-[13px] text-[var(--mapetite-text)]"
														>
															{tag}
														</span>
													))}
											</div>
											<Button asChild className="mapetite-quiet-button w-fit rounded-[10px] px-5">
												<a href={directionsUrl} target="_blank" rel="noreferrer">
													Check route details
												</a>
											</Button>
										</div>
									</div>
								</section>

							</div>

							<aside className="min-[1181px]:sticky min-[1181px]:top-[94px] min-[1181px]:self-start">
								<div className="mapetite-panel grid gap-5 p-5 md:p-6">
									<h3 className="text-[28px] font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
										Ready to decide?
									</h3>
									<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
										Keep the actions close to the facts you need most: where it is,
										whether it&apos;s open, and how to get back if you want another
										option.
									</p>

									<div className="grid gap-3">
										<div className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] px-4 py-3">
											<strong className="text-sm text-[var(--mapetite-text)]">Tonight</strong>
											<span className="text-sm text-[var(--mapetite-text-soft)]">
												{hasHours
													? `${restaurant.isOpenNow ? "Open" : "Closed"}${
															restaurant.hours?.close
																? ` until ${restaurant.hours.close}`
																: ""
														}`
													: "Hours vary"}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] px-4 py-3">
											<strong className="text-sm text-[var(--mapetite-text)]">Address</strong>
											<span className="text-right text-sm text-[var(--mapetite-text-soft)]">
												{restaurant.address.street || locationLine}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] px-4 py-3">
											<strong className="text-sm text-[var(--mapetite-text)]">Price</strong>
											<span className="text-sm text-[var(--mapetite-text-soft)]">
												{priceRangeLabel || "Varies"}
											</span>
										</div>
										{(hasWebsite || hasPhone) && (
											<div className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] px-4 py-3">
												<strong className="text-sm text-[var(--mapetite-text)]">Support</strong>
												<span className="text-right text-sm text-[var(--mapetite-text-soft)]">
													{[
														hasWebsite ? "Website" : null,
														hasPhone ? "Call" : null,
													]
														.filter(Boolean)
														.join(" / ")}
												</span>
											</div>
										)}
									</div>

									<div className="grid gap-3">
										<Button asChild size="lg" className="mapetite-accent-button rounded-[10px] px-5">
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
												className={cn("mr-2 size-4", isFavorite && "fill-current")}
											/>
											{isFavorite ? "Saved" : "Save"}
										</Button>
										<Button
											type="button"
											variant="ghost"
											onClick={() => navigate({ to: "/restaurants" })}
											className="rounded-[10px] border border-[rgba(255,236,220,0.1)] bg-white/[0.02] px-4 text-[var(--mapetite-text-soft)] hover:bg-white/[0.05] hover:text-[var(--mapetite-text)]"
										>
											<ArrowLeft className="mr-2 size-4" />
											Back to results
										</Button>
									</div>

									{(hasWebsite || hasPhone) && (
										<div className="border-t border-[rgba(255,236,220,0.08)] pt-4">
											<small className="block text-[12px] uppercase tracking-[0.14em] text-[rgba(245,233,222,0.46)]">
												Before you go
											</small>
											<div className="mt-3 grid gap-2">
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
										</div>
									)}
								</div>
							</aside>
						</div>

						<section className="mapetite-panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
							<div>
								<strong className="block text-lg font-semibold tracking-[-0.03em] text-[var(--mapetite-text)]">
									Keep searching if the fit is close, not final.
								</strong>
								<p className="mapetite-muted-copy mt-2 max-w-2xl text-sm leading-6">
									The detail page should help you commit with confidence, while
									keeping the route back to the shortlist clear and easy.
								</p>
							</div>
							<Button asChild className="mapetite-accent-button rounded-[10px] px-5">
								<Link to="/restaurants">Back to search results</Link>
							</Button>
						</section>
					</main>
				</div>
			</div>
		</Layout>
	);
}
