import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { isAuthenticatedSync } from "@/lib/auth-integration";
import { getRestaurantResultReasons } from "@/lib/restaurant-result-reasons";
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

function formatTimeToTwelveHour(value?: string | null) {
	if (!value) return null;

	const match = String(value)
		.trim()
		.match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return value;

	const hours = Number(match[1]);
	const minutes = match[2];
	if (!Number.isInteger(hours) || hours < 0 || hours > 23) {
		return value;
	}

	const period = hours >= 12 ? "PM" : "AM";
	const displayHour = hours % 12 || 12;
	return `${displayHour}:${minutes} ${period}`;
}

function formatHoursRange(
	hours?: { open: string; close: string } | null,
) {
	if (!hours?.open || !hours?.close) return null;

	const open = formatTimeToTwelveHour(hours.open);
	const close = formatTimeToTwelveHour(hours.close);
	if (!open || !close) return `${hours.open} - ${hours.close}`;

	return `${open} – ${close}`;
}

function formatHoursTime(value?: string | null) {
	return formatTimeToTwelveHour(value) ?? value ?? "";
}

function getDetailHoursLabel(
	restaurant: Restaurant,
	formattedHoursRange: string | null,
) {
	const status = restaurant.hoursStatus;

	if (status?.state === "confirmed_open") {
		return status.closesAt
			? `Open now • until ${formatHoursTime(status.closesAt)}`
			: "Open now";
	}

	if (status?.state === "confirmed_closed") {
		return status.opensAt
			? `Closed now • opens ${formatHoursTime(status.opensAt)}`
			: "Closed now";
	}

	if (status?.state === "listed_hours_open") {
		return status.closesAt
			? `Likely open from listed hours • until ${formatHoursTime(status.closesAt)}`
			: "Likely open from listed hours";
	}

	if (status?.state === "listed_hours_closed") {
		return status.opensAt
			? `Closed based on listed hours • opens ${formatHoursTime(status.opensAt)}`
			: "Closed based on listed hours";
	}

	if (status?.state === "listed_hours_unknown") {
		return formattedHoursRange ? `Hours listed • ${formattedHoursRange}` : "Hours listed";
	}

	if (status?.state === "unavailable") {
		return "Hours unavailable";
	}

	if (restaurant.isOpenNow === true) {
		return restaurant.hours?.close
			? `Open now • until ${formatHoursTime(restaurant.hours.close)}`
			: "Open now";
	}

	if (restaurant.isOpenNow === false) {
		return "Closed now";
	}

	return formattedHoursRange ? `Hours listed • ${formattedHoursRange}` : "Hours unavailable";
}

function getDetailHoursBadge(restaurant: Restaurant) {
	const state = restaurant.hoursStatus?.state;
	if (state === "confirmed_open") return "Open now";
	if (state === "confirmed_closed") return "Closed now";
	if (state === "listed_hours_open") return "Likely open";
	if (state === "listed_hours_closed") return "Listed closed";
	if (state === "listed_hours_unknown") return "Hours listed";
	if (state === "unavailable") return null;

	if (restaurant.isOpenNow === true) return "Open now";
	if (restaurant.isOpenNow === false) return "Closed now";
	return restaurant.hours ? "Hours listed" : null;
}

function getDetailHoursNote(restaurant: Restaurant, hasWebsite: boolean) {
	const state = restaurant.hoursStatus?.state;

	if (state === "confirmed_open" || state === "confirmed_closed") {
		return "Open status is from the available public listing data. Confirm with the restaurant before making a special trip.";
	}

	if (state === "listed_hours_open" || state === "listed_hours_closed") {
		return "Based on simple listed public hours and the searched place timezone. Confirm before going.";
	}

	if (state === "listed_hours_unknown") {
		return hasWebsite
			? "Hours are listed, but Mapetite is not treating them as live open status. Check the restaurant website before going."
			: "Hours are listed, but live open status is not confirmed for this restaurant right now.";
	}

	return "Hours were not available from the current public listing source.";
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
	return restaurant.galleryImageUrls?.filter(Boolean) ?? [];
}

function buildGalleryAttributions(restaurant: Restaurant) {
	if (restaurant.galleryPhotoAttributions?.length) {
		return restaurant.galleryPhotoAttributions;
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
					toast.success("Saved restaurant", {
						description: `${restaurantName} has been added to Saved Places.`,
					});
				} else {
					toast.success("Removed from saved places", {
						description: `${restaurantName} has been removed from Saved Places.`,
					});
				}
			},
			onError: (error) => {
				console.error("Failed to toggle favorite:", error);
				toast.error("Could not update saved places", {
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
			toast.error("Sign in to save places", {
				description:
					"Create a demo account or log in to keep a saved restaurant shortlist.",
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
	const hasVerifiedGalleryImages = galleryImages.length > 0;
	const hasReviews = !!restaurant.reviews?.length;
	const hasRatingBreakdown = !!restaurant.ratingBreakdown;
	const hasMapCoordinates =
		Number.isFinite(restaurant.latitude) && Number.isFinite(restaurant.longitude);
	const hasMenuUrl = !!restaurant.menuUrl;
	const hasWebsite = !!restaurant.website;
	const hasPhone = !!restaurant.phone;
	const hasPlanningActions = hasMenuUrl || hasWebsite || hasPhone;
	const hasCuisineHints = !!restaurant.cuisineHints?.hints?.length;
	const formattedHoursRange = formatHoursRange(restaurant.hours);
	const detailHoursLabel = getDetailHoursLabel(restaurant, formattedHoursRange);
	const detailHoursBadge = getDetailHoursBadge(restaurant);
	const primaryCategory = restaurant.categories[0] ?? null;
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
	const galleryViews = hasVerifiedGalleryImages
		? galleryImages.map((image, index) => ({
				badge: galleryImages.length === 1 ? "Available photo" : `Image ${index + 1}`,
				label: galleryImages.length === 1 ? "Available photo" : `Image ${index + 1}`,
				title:
					index === 0
						? `Photo coverage for ${restaurant.name}`
						: `Additional venue image ${index + 1}`,
				copy:
					"Photos are available from public listing data. Use them as a quick visual reference, not a guarantee of current conditions.",
				left:
					restaurant.categories.slice(0, 2).join(" • ") ||
					restaurant.categories[0] ||
					"Restaurant detail",
				right:
					galleryImages.length > 1
						? `Image ${index + 1} of ${galleryImages.length}`
						: "Verified venue photo",
				summary:
					galleryImages.length > 1
						? "One of the available venue photos."
						: "A verified venue image from the available photo coverage.",
				image,
				attribution: galleryAttributions[index] ?? [],
		  }))
		: [
				{
					badge: "Photo coverage unavailable",
					label: "Fallback artwork",
					title: "Verified venue photos are not available yet",
					copy:
						"Use the address, route, hours, reviews, and cuisine details to decide while photo coverage is limited.",
					left:
						locationLine || restaurant.categories[0] || "Restaurant detail",
					right: hasMapCoordinates ? "Directions available" : "Address available",
					summary: "A single fallback state instead of invented gallery coverage.",
					image: null,
					attribution: [] as string[],
				},
		  ];
	const activeGalleryView =
		galleryViews[
			Math.min(selectedImageIndex, Math.max(galleryViews.length - 1, 0))
		] ?? galleryViews[0];
	const heroHoursLabel = detailHoursBadge;
	const heroHoursValue =
		detailHoursBadge && detailHoursLabel !== detailHoursBadge
			? detailHoursLabel.replace(`${detailHoursBadge} • `, "")
			: formattedHoursRange;
	const tonightHoursLabel = detailHoursLabel;
	const hoursNote = getDetailHoursNote(restaurant, hasWebsite);
	const reviewSummaryCopy = hasReviews
		? "Use recent reviews and the overall rating together before you commit."
		: "Rating data is available, even if written reviews are limited for this restaurant.";
	const resultReasons = getRestaurantResultReasons(restaurant);
	const publicListingFacts = [
		{
			label: "Address",
			value: fullAddress ? "Available" : "Not available from source",
		},
		{
			label: "Hours",
			value: detailHoursBadge ?? "Unavailable",
		},
		{
			label: "Photos",
			value: hasVerifiedGalleryImages
				? `${galleryImages.length} available`
				: "Verified photos unavailable",
		},
		{
			label: "Menu",
			value: hasMenuUrl ? "Menu link available" : "Menu link unavailable",
		},
		{
			label: "Contact",
			value: [hasWebsite ? "Website" : null, hasPhone ? "Phone" : null]
				.filter(Boolean)
				.join(" / ") || "Limited",
		},
	];

	return (
		<Layout>
			<div className="mapetite-page-shell min-h-full">
				<div className="mapetite-container px-4 py-4 md:px-6 md:py-6">
					<main className="grid gap-6 py-6 md:py-8">
						<div className="flex flex-col items-center justify-center gap-3 text-center md:flex-row md:justify-between md:text-left">
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
							<div className="grid gap-6">
								<div className="grid justify-items-center gap-4 text-center">
									<div className="mapetite-eyebrow justify-center">Restaurant detail</div>
									<div className="grid justify-items-center">
										<h1 className="max-w-[12ch] text-[clamp(34px,4vw,52px)] font-semibold leading-none tracking-[-0.06em] text-[var(--mapetite-text)]">
											{restaurant.name}
										</h1>
										<p className="mapetite-muted-copy mt-4 max-w-[620px] text-[15px] leading-7">
											{restaurant.description}
										</p>
									</div>

									<div className="flex flex-wrap items-center justify-center gap-2.5">
										<div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
											<strong className="font-semibold text-[var(--mapetite-text)]">
												{restaurant.rating.toFixed(1)}
											</strong>
											<span>{restaurant.reviewCount} reviews</span>
										</div>
										{primaryCategory ? (
											<div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
												<span>{primaryCategory}</span>
											</div>
										) : null}
										{locationLine ? (
											<div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
												<span>{locationLine}</span>
											</div>
										) : null}
										{detailHoursLabel ? (
											<div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
												<strong className="font-semibold text-[var(--mapetite-text)]">
													{heroHoursLabel ?? "Hours"}
												</strong>
												{heroHoursValue ? <span>{heroHoursValue}</span> : null}
											</div>
										) : null}
									</div>

									<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
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

								<aside className="grid gap-4 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4 text-center md:p-[18px]">
									<small className="text-[12px] uppercase tracking-[0.14em] text-[rgba(245,233,222,0.46)]">
										Available public listing data
									</small>
									<strong className="text-lg font-semibold tracking-[-0.03em] text-[var(--mapetite-text)]">
										What Mapetite can show right now.
									</strong>
									<p className="mx-auto max-w-[720px] text-sm leading-6 text-[var(--mapetite-text-soft)]">
										This is a practical summary of fields returned by current public
										sources, not a claimed-business profile.
									</p>
									<div className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-5">
										{publicListingFacts.map((fact) => (
											<div
												key={fact.label}
												className="grid gap-1 rounded-[10px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] px-3 py-2 text-center"
											>
												<span className="text-[13px] font-medium text-[var(--mapetite-text)]">
													{fact.label}
												</span>
												<span className="text-[13px] text-[var(--mapetite-text-soft)]">
													{fact.value}
												</span>
											</div>
										))}
									</div>
								</aside>
							</div>
						</section>

						<div className="grid gap-6 min-[1181px]:grid-cols-[minmax(0,1fr)_320px] min-[1181px]:items-start">
							<div className="grid gap-6">
								<section id="gallery" className="mapetite-panel grid gap-[18px] p-[22px]">
									<div className="flex flex-wrap items-end justify-between gap-4">
										<div className="w-full text-center md:text-left">
											<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
												Photos
											</h2>
											<p className="mapetite-muted-copy mx-auto mt-2 max-w-[620px] text-sm leading-6 md:mx-0">
												{hasVerifiedGalleryImages
													? "Photos are available from public listing data. Treat them as a quick visual reference, not a guarantee of current conditions."
													: "Photo coverage is limited here, so Mapetite keeps the fallback honest instead of inventing a gallery."}
											</p>
										</div>
									</div>

									<div
										className={cn(
											"grid gap-4",
											galleryViews.length > 1
												? "lg:grid-cols-[minmax(0,1.25fr)_172px]"
												: "lg:grid-cols-1",
										)}
									>
										<div
											className={cn(
												"relative grid grid-rows-[auto_1fr_auto] gap-[14px] overflow-hidden rounded-[14px] border border-[rgba(255,236,220,0.08)] p-[22px]",
												hasVerifiedGalleryImages
													? "min-h-[360px] sm:min-h-[390px]"
													: "min-h-[240px] sm:min-h-[280px]",
												activeGalleryView.image
													? "bg-black/10"
													: "bg-[linear-gradient(180deg,rgba(255,248,242,0.04),rgba(255,248,242,0.02)),linear-gradient(145deg,rgba(213,154,104,0.26),rgba(180,108,67,0.08)_38%,rgba(17,13,11,0.2)_100%)]",
											)}
										>
											{activeGalleryView.image ? (
												<img
													src={activeGalleryView.image}
													alt={
														hasVerifiedGalleryImages
															? `${restaurant.name} image ${selectedImageIndex + 1}`
															: `${restaurant.name} fallback artwork`
													}
													className={cn(
														"absolute inset-0 h-full w-full",
														hasVerifiedGalleryImages
															? "object-cover"
															: "object-contain p-4 opacity-95 sm:p-6",
													)}
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

										{galleryViews.length > 1 ? (
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
																alt={`${restaurant.name} image ${index + 1}`}
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
										) : null}
									</div>
								</section>

								<section id="context" className="mapetite-panel grid gap-[18px] p-[22px]">
									<div className="text-center md:text-left">
										<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											Practical details
										</h2>
										<p className="mapetite-muted-copy mx-auto mt-2 max-w-[620px] text-sm leading-6 md:mx-0">
											The useful facts behind the shortlist: location, category, hours, price, and only the links that public data provides.
										</p>
									</div>

									<div className="grid gap-[18px] md:grid-cols-2">
										<div className="grid gap-2 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4 text-center md:text-left">
											<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
												Address
											</small>
											<strong className="text-base font-semibold text-[var(--mapetite-text)]">
												{fullAddress}
											</strong>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{locationLine
													? `Located in ${locationLine}. Use directions to confirm the exact route.`
													: "Use the full address before opening the route."}
											</p>
										</div>
										<div className="grid gap-2 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4 text-center md:text-left">
											<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
												Kitchen
											</small>
											<strong className="text-base font-semibold text-[var(--mapetite-text)]">
												{restaurant.categories.join(" • ") || "Category unavailable"}
											</strong>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												Category data helps frame the restaurant, but it is not a verified menu.
											</p>
										</div>
										<div className="grid gap-2 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4 text-center md:text-left">
											<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
												Hours
											</small>
											<strong className="text-base font-semibold text-[var(--mapetite-text)]">
												{detailHoursLabel}
											</strong>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{hoursNote}
											</p>
										</div>
										<div className="grid gap-2 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4 text-center md:text-left">
											<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
												Price
											</small>
											<strong className="text-base font-semibold text-[var(--mapetite-text)]">
												{priceRangeLabel ? `${priceRangeLabel} pricing` : "Pricing varies"}
											</strong>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{priceRangeLabel
													? "A quick spend signal from available listing data."
													: "Price was not available from the current listing source."}
											</p>
										</div>
									</div>

									{hasMenuUrl ? (
										<div className="grid gap-3 rounded-[14px] border border-[rgba(213,154,104,0.18)] bg-[linear-gradient(180deg,rgba(255,248,242,0.035),rgba(255,248,242,0.018)),linear-gradient(145deg,rgba(213,154,104,0.12),rgba(180,108,67,0.025))] p-4 text-center md:text-left">
											<div className="grid gap-1">
												<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
													Menu available
												</small>
												<strong className="text-base font-semibold text-[var(--mapetite-text)]">
													Real menu link found
												</strong>
											</div>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												This link comes from provider/open-data menu fields. If the restaurant changes its menu, the external page is the source to trust.
											</p>
											<a
												href={restaurant.menuUrl}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(213,154,104,0.24)] bg-[var(--mapetite-accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--mapetite-text)] transition-colors hover:border-[rgba(213,154,104,0.44)] hover:bg-[rgba(213,154,104,0.18)] md:justify-self-start"
											>
												<ExternalLink className="size-4" />
												View menu
											</a>
										</div>
									) : null}

									{hasCuisineHints && restaurant.cuisineHints ? (
										<div className="grid gap-3 rounded-[14px] border border-[rgba(213,154,104,0.18)] bg-[linear-gradient(180deg,rgba(255,248,242,0.035),rgba(255,248,242,0.018)),linear-gradient(145deg,rgba(213,154,104,0.12),rgba(180,108,67,0.025))] p-4 text-center md:text-left">
											<div className="grid gap-1">
												<small className="text-[12px] uppercase tracking-[0.12em] text-[rgba(245,233,222,0.46)]">
													{restaurant.cuisineHints.label}
												</small>
												<strong className="text-base font-semibold text-[var(--mapetite-text)]">
													Often associated with this cuisine
												</strong>
											</div>
											<div className="flex flex-wrap justify-center gap-2 md:justify-start">
												{restaurant.cuisineHints.hints.map((hint) => (
													<span
														key={hint}
														className="inline-flex items-center rounded-full border border-[rgba(213,154,104,0.24)] bg-[var(--mapetite-accent-soft)] px-[11px] py-2 text-[13px] text-[var(--mapetite-text)]"
													>
														{hint}
													</span>
												))}
											</div>
											<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
												{restaurant.cuisineHints.disclaimer}
											</p>
										</div>
									) : null}

								</section>

								<section id="why-this-result" className="mapetite-panel grid gap-[18px] p-[22px]">
									<div className="text-center md:text-left">
										<div className="mapetite-eyebrow justify-center md:justify-start">
											Why this result?
										</div>
										<h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											Useful listing signals
										</h2>
										<p className="mapetite-muted-copy mx-auto mt-2 max-w-[640px] text-sm leading-6 md:mx-0">
											{resultReasons.summary}
										</p>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<div className="grid gap-3 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4 text-center md:text-left">
											<h3 className="text-base font-semibold text-[var(--mapetite-text)]">
												Helpful signals
											</h3>
											<div className="flex flex-wrap justify-center gap-2 md:justify-start">
												{resultReasons.helpful.map((reason) => (
													<span
														key={reason}
														className="inline-flex items-center rounded-full border border-[rgba(213,154,104,0.22)] bg-[var(--mapetite-accent-soft)] px-[11px] py-2 text-[13px] text-[var(--mapetite-text)]"
													>
														{reason}
													</span>
												))}
											</div>
										</div>

										<div className="grid gap-3 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-4 text-center md:text-left">
											<h3 className="text-base font-semibold text-[var(--mapetite-text)]">
												What to double-check
											</h3>
											<div className="flex flex-wrap justify-center gap-2 md:justify-start">
												{resultReasons.cautions.map((reason) => (
													<span
														key={reason}
														className="inline-flex items-center rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.025] px-[11px] py-2 text-[13px] text-[var(--mapetite-text-soft)]"
													>
														{reason}
													</span>
												))}
											</div>
										</div>
									</div>

									<p className="text-center text-sm leading-6 text-[var(--mapetite-text-soft)] md:text-left">
										{resultReasons.note}
									</p>
								</section>

								<section id="reviews" className="mapetite-panel grid gap-[18px] p-[22px]">
									<div className="text-center md:text-left">
										<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											Rating context
										</h2>
										<p className="mapetite-muted-copy mx-auto mt-2 max-w-[620px] text-sm leading-6 md:mx-0">
											{reviewSummaryCopy}
										</p>
									</div>

									<div className="grid gap-[18px] lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
										<div className="grid gap-[10px] rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] p-[18px] text-center md:text-left">
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
									<div className="text-center md:text-left">
										<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											Location and route
										</h2>
										<p className="mapetite-muted-copy mx-auto mt-2 max-w-[620px] text-sm leading-6 md:mx-0">
											Use the available address, map preview, and route action before you leave the shortlist.
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

										<div className="grid justify-items-center gap-4 text-center md:justify-items-start md:text-left">
											<strong className="text-lg font-semibold tracking-[-0.03em] text-[var(--mapetite-text)]">
												{fullAddress}
											</strong>
											<p className="text-sm leading-7 text-[var(--mapetite-text-soft)]">
												Use the address and map preview as a route check before you leave the shortlist.
											</p>
											<div className="flex flex-wrap justify-center gap-2 md:justify-start">
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
										Plan your visit
									</h3>
									<p className="text-sm leading-6 text-[var(--mapetite-text-soft)]">
										Quick actions stay here so the profile remains useful after you scan the photos, hours, and route.
									</p>

									<div className="grid gap-3">
										<div className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] px-4 py-3">
											<strong className="text-sm text-[var(--mapetite-text)]">Hours</strong>
											<span className="text-sm text-[var(--mapetite-text-soft)]">
												{tonightHoursLabel}
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
										{hasPlanningActions && (
											<div className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(255,236,220,0.08)] bg-white/[0.025] px-4 py-3">
												<strong className="text-sm text-[var(--mapetite-text)]">
													Before you go
												</strong>
												<span className="text-right text-sm text-[var(--mapetite-text-soft)]">
													{[
														hasMenuUrl ? "Menu" : null,
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

									{hasPlanningActions && (
										<div className="border-t border-[rgba(255,236,220,0.08)] pt-4">
											<small className="block text-[12px] uppercase tracking-[0.14em] text-[rgba(245,233,222,0.46)]">
												Before you go
											</small>
											<div className="mt-3 grid gap-2">
												{hasMenuUrl ? (
													<a
														href={restaurant.menuUrl}
														target="_blank"
														rel="noreferrer"
														className="inline-flex items-center gap-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
													>
														<ExternalLink className="size-4" />
														View menu
													</a>
												) : null}
												{hasWebsite ? (
													<a
														href={restaurant.website}
														target="_blank"
														rel="noreferrer"
														className="inline-flex items-center gap-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
													>
														<ExternalLink className="size-4" />
														Visit website
													</a>
												) : null}
												{hasPhone ? (
													<a
														href={`tel:${restaurant.phone}`}
														className="inline-flex items-center gap-2 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:text-[var(--mapetite-text)]"
													>
														<Phone className="size-4" />
														Call restaurant
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
									The detail page should help you decide with clearer context, while
									keeping the route back to the shortlist clear.
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
