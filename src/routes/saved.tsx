import { LogInModal } from "@/components/auth/LogInModal";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/use-auth-api";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { getRestaurantById } from "@/lib/search-restaurants";
import { cn } from "@/lib/utils";
import {
	type Restaurant,
	useRestaurantSearchStore,
} from "@/store/restaurant-search-store";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Clock,
	Heart,
	Navigation,
	Search,
	Trash2,
	Utensils,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/saved")({
	component: SavedPlacesPage,
});

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
		// Ignore storage write failures in private mode or quota-limited browsers.
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

function getRestaurantInitials(restaurant: Restaurant) {
	return (
		restaurant.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part.charAt(0).toUpperCase())
			.join("") || "MP"
	);
}

function getDisplayCategory(restaurant: Restaurant) {
	return restaurant.categories?.[0] || "Restaurant";
}

function getLocationHint(restaurant: Restaurant) {
	const cityState = [restaurant.address?.city, restaurant.address?.state]
		.filter(Boolean)
		.join(", ");
	return cityState || restaurant.address?.country || "Location available in details";
}

function getHoursLabel(restaurant: Restaurant) {
	if (restaurant.hoursStatus) {
		if (
			restaurant.hoursStatus.state === "confirmed_open" &&
			restaurant.hoursStatus.closesAt
		) {
			return `Open now · until ${restaurant.hoursStatus.closesAt}`;
		}

		if (
			restaurant.hoursStatus.state === "listed_hours_open" &&
			restaurant.hoursStatus.closesAt
		) {
			return `Likely open · until ${restaurant.hoursStatus.closesAt}`;
		}

		return restaurant.hoursStatus.label;
	}

	if (restaurant.hours?.open && restaurant.hours?.close) {
		return `Hours listed · ${restaurant.hours.open} - ${restaurant.hours.close}`;
	}

	return "Hours unavailable";
}

function buildDirectionsUrl(restaurant: Restaurant) {
	const hasCoordinates =
		Number.isFinite(restaurant.latitude) &&
		Number.isFinite(restaurant.longitude);

	return hasCoordinates
		? `https://www.openstreetmap.org/?mlat=${restaurant.latitude}&mlon=${restaurant.longitude}#map=18/${restaurant.latitude}/${restaurant.longitude}`
		: `https://www.openstreetmap.org/search?query=${encodeURIComponent(restaurant.name)}`;
}

function SavedPlacesPage() {
	const restaurants = useRestaurantSearchStore((state) => state.restaurants);
	const { isAuthenticated, isLoading: isAuthLoading } = useAuthState();
	const { data: favoritesData, isLoading: isFavoritesLoading } = useFavorites({
		enabled: isAuthenticated,
	});
	const [isLogInOpen, setIsLogInOpen] = useState(false);
	const [isSignUpOpen, setIsSignUpOpen] = useState(false);
	const [isHydratingDetails, setIsHydratingDetails] = useState(false);
	const [favoriteSnapshots, setFavoriteSnapshots] = useState<
		Record<string, Restaurant>
	>(() => loadFavoriteSnapshotsFromStorage());
	const hydrationAttemptsRef = useRef<Set<string>>(new Set());

	const favoriteIds = useMemo(
		() => favoritesData?.favorites ?? [],
		[favoritesData?.favorites],
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

	useEffect(() => {
		if (!favoriteIds.length) {
			hydrationAttemptsRef.current.clear();
			setFavoriteSnapshots((previous) =>
				Object.keys(previous).length ? {} : previous,
			);
			return;
		}

		setFavoriteSnapshots((previous) => {
			let changed = false;
			const next: Record<string, Restaurant> = {};
			for (const favoriteId of favoriteIds) {
				const snapshot = previous[favoriteId];
				if (snapshot) next[favoriteId] = snapshot;
			}
			if (Object.keys(next).length !== Object.keys(previous).length) {
				changed = true;
			}
			return changed ? next : previous;
		});

		for (const attemptedId of Array.from(hydrationAttemptsRef.current)) {
			if (!favoriteIds.includes(attemptedId)) {
				hydrationAttemptsRef.current.delete(attemptedId);
			}
		}
	}, [favoriteIds]);

	const restaurantLookup = useMemo(() => {
		const map = new Map<string, Restaurant>();

		for (const restaurant of restaurants) {
			if (favoriteIds.includes(restaurant.id)) {
				map.set(restaurant.id, restaurant);
			}
		}

		for (const [id, restaurant] of Object.entries(favoriteSnapshots)) {
			if (!map.has(id)) {
				map.set(id, restaurant);
			}
		}

		return map;
	}, [favoriteIds, favoriteSnapshots, restaurants]);

	useEffect(() => {
		if (!isAuthenticated || !favoriteIds.length) return;

		const missingFavoriteIds = favoriteIds.filter(
			(favoriteId) =>
				!restaurantLookup.has(favoriteId) &&
				!hydrationAttemptsRef.current.has(favoriteId),
		);
		if (!missingFavoriteIds.length) return;

		for (const favoriteId of missingFavoriteIds) {
			hydrationAttemptsRef.current.add(favoriteId);
		}

		let cancelled = false;
		setIsHydratingDetails(true);

		(async () => {
			const fetchedRestaurants = await Promise.all(
				missingFavoriteIds.map(async (favoriteId) => {
					try {
						return await getRestaurantById(favoriteId);
					} catch {
						return null;
					}
				}),
			);

			if (cancelled) return;
			const resolvedRestaurants = fetchedRestaurants.filter(
				(restaurant): restaurant is Restaurant => !!restaurant,
			);
			if (resolvedRestaurants.length) {
				upsertFavoriteSnapshots(resolvedRestaurants);
			}
		})().finally(() => {
			if (!cancelled) {
				setIsHydratingDetails(false);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [favoriteIds, isAuthenticated, restaurantLookup, upsertFavoriteSnapshots]);

	const savedItems = useMemo(
		() =>
			favoriteIds.map((favoriteId) => ({
				id: favoriteId,
				restaurant: restaurantLookup.get(favoriteId) ?? null,
			})),
		[favoriteIds, restaurantLookup],
	);

	const { mutate: toggleFavoriteMutate, isPending: isTogglingFavorite } =
		useToggleFavorite({
			onSuccess: (data) => {
				toast.success(
					data.action === "removed" ? "Removed from saved places" : "Saved",
					{
						description:
							data.action === "removed"
								? "Your shortlist has been updated."
								: "This restaurant is now in your saved places.",
					},
				);
			},
			onError: (error) => {
				toast.error("Could not update saved places", {
					description:
						error.message || "Please try again in a moment.",
				});
			},
		});

	const removeFavorite = (restaurantId: string) => {
		toggleFavoriteMutate({ restaurant_id: restaurantId });
	};

	const isLoading = isAuthLoading || (isAuthenticated && isFavoritesLoading);

	return (
		<Layout>
			<div className="mapetite-page-shell min-h-full">
				<div className="mapetite-container px-4 py-4 md:px-6 md:py-6">
					<main className="grid gap-6 py-6 md:py-8">
						<div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
							<div>
								<div className="mapetite-eyebrow justify-center md:justify-start">
									Saved places
								</div>
								<h1 className="mt-3 text-[clamp(2.35rem,5vw,4.7rem)] font-semibold leading-[0.95] tracking-[-0.07em] text-[var(--mapetite-text)]">
									Your restaurant shortlist.
								</h1>
								<p className="mapetite-muted-copy mt-4 max-w-2xl text-base leading-7">
									Keep restaurants worth revisiting while you compare a city.
									In this portfolio demo, saved places are session-level and may
									reset when the demo backend restarts.
								</p>
							</div>

							<Button
								asChild
								variant="outline"
								className="mapetite-quiet-button rounded-full px-5 shadow-none"
							>
								<Link to="/restaurants">
									<ArrowLeft className="mr-2 size-4" />
									Back to search
								</Link>
							</Button>
						</div>

						{isLoading ? (
							<section className="mapetite-panel grid gap-4 px-6 py-12 text-center">
								<div className="mx-auto flex size-12 items-center justify-center rounded-[12px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)]">
									<Heart className="size-5" />
								</div>
								<div>
									<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
										Loading saved places
									</h2>
									<p className="mapetite-muted-copy mx-auto mt-2 max-w-md text-sm leading-6">
										Checking your demo session before loading the shortlist.
									</p>
								</div>
							</section>
						) : !isAuthenticated ? (
							<section className="mapetite-panel grid gap-5 px-6 py-12 text-center md:px-10">
								<div className="mx-auto flex size-14 items-center justify-center rounded-[14px] border border-[rgba(213,154,104,0.24)] bg-[var(--mapetite-accent-soft)] text-[var(--mapetite-text)]">
									<Heart className="size-6" />
								</div>
								<div>
									<h2 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--mapetite-text)]">
										Sign in to save places
									</h2>
									<p className="mapetite-muted-copy mx-auto mt-3 max-w-lg text-base leading-7">
										Create a demo account or sign in to keep a saved restaurant
										shortlist during this MVP session.
									</p>
								</div>
								<div className="mx-auto grid w-full max-w-sm gap-3 sm:flex sm:max-w-none sm:justify-center">
									<Button
										type="button"
										onClick={() => setIsLogInOpen(true)}
										className="mapetite-accent-button rounded-full px-6 text-[#20140d]"
									>
										Log In
									</Button>
									<Button
										type="button"
										onClick={() => setIsSignUpOpen(true)}
										variant="outline"
										className="mapetite-quiet-button rounded-full px-6 shadow-none"
									>
										Sign Up
									</Button>
									<Button
										asChild
										variant="ghost"
										className="rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.02] px-5 text-[var(--mapetite-text-soft)] hover:bg-white/[0.05] hover:text-[var(--mapetite-text)]"
									>
										<Link to="/restaurants">
											<Search className="mr-2 size-4" />
											Search restaurants
										</Link>
									</Button>
								</div>
							</section>
						) : savedItems.length === 0 ? (
							<section className="mapetite-panel grid gap-5 px-6 py-12 text-center md:px-10">
								<div className="mx-auto flex size-14 items-center justify-center rounded-[14px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)]">
									<Utensils className="size-6" />
								</div>
								<div>
									<h2 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--mapetite-text)]">
										No saved places yet
									</h2>
									<p className="mapetite-muted-copy mx-auto mt-3 max-w-lg text-base leading-7">
										Save restaurants from search results or detail pages to build
										a shortlist.
									</p>
								</div>
								<div>
									<Button
										asChild
										className="mapetite-accent-button rounded-full px-6 text-[#20140d]"
									>
										<Link to="/restaurants">
											<Search className="mr-2 size-4" />
											Search restaurants
										</Link>
									</Button>
								</div>
							</section>
						) : (
							<section className="grid gap-4">
								<div className="mapetite-panel-soft flex flex-col gap-3 px-5 py-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
									<div>
										<strong className="text-[15px] font-semibold text-[var(--mapetite-text)]">
											{savedItems.length} saved{" "}
											{savedItems.length === 1 ? "place" : "places"}
										</strong>
										<p className="mapetite-muted-copy mt-1 text-sm">
											Saved places are demo-level and may reset with the backend
											session.
										</p>
									</div>
									{isHydratingDetails ? (
										<span className="inline-flex items-center justify-center rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
											Loading saved details
										</span>
									) : null}
								</div>

								<div className="grid gap-3">
									{savedItems.map(({ id, restaurant }) =>
										restaurant ? (
											<article
												key={id}
												className="mapetite-panel grid gap-4 p-4 text-center md:grid-cols-[112px_minmax(0,1fr)_auto] md:items-center md:text-left"
											>
												<div className="mapetite-media-fallback mx-auto grid h-[96px] w-full max-w-[220px] grid-rows-[auto_1fr_auto] rounded-[12px] p-3 md:mx-0 md:h-[104px] md:w-[112px]">
													<strong className="text-[24px] font-semibold tracking-[-0.05em] text-[rgba(255,244,236,0.92)]">
														{getRestaurantInitials(restaurant)}
													</strong>
													<div />
													<span className="truncate text-[12px] text-[rgba(245,233,222,0.68)]">
														{getDisplayCategory(restaurant)}
													</span>
												</div>

												<div className="min-w-0">
													<div className="flex flex-wrap items-start justify-center gap-2 md:justify-between">
														<div>
															<h2 className="text-[clamp(1.6rem,2.4vw,2.15rem)] font-semibold leading-none tracking-[-0.05em] text-[var(--mapetite-text)]">
																{restaurant.name}
															</h2>
															<p className="mapetite-muted-copy mt-2 text-sm">
																{getDisplayCategory(restaurant)} ·{" "}
																{getLocationHint(restaurant)}
															</p>
														</div>
														{restaurant.rating != null ? (
															<span className="inline-flex items-center rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--mapetite-text-soft)]">
																{restaurant.rating.toFixed(1)} rating
															</span>
														) : null}
													</div>

													<div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
														<span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,236,220,0.09)] bg-white/[0.025] px-3 py-1.5 text-[12px] text-[var(--mapetite-text-soft)]">
															<Clock className="size-3" />
															{getHoursLabel(restaurant)}
														</span>
														{restaurant.reviewCount ? (
															<span className="rounded-full border border-[rgba(255,236,220,0.09)] bg-white/[0.025] px-3 py-1.5 text-[12px] text-[var(--mapetite-text-soft)]">
																{restaurant.reviewCount.toLocaleString()} reviews
															</span>
														) : null}
													</div>
												</div>

												<div className="grid gap-2 sm:grid-cols-3 md:w-[136px] md:grid-cols-1">
													<Button
														asChild
														className="mapetite-accent-button h-10 justify-center rounded-full px-4 text-[#20140d] shadow-none"
													>
														<Link
															to="/restaurants/$restaurantId"
															params={{ restaurantId: restaurant.id }}
														>
															View details
														</Link>
													</Button>
													<Button
														asChild
														variant="outline"
														className="mapetite-quiet-button h-10 justify-center rounded-full px-4 shadow-none"
													>
														<a
															href={buildDirectionsUrl(restaurant)}
															target="_blank"
															rel="noreferrer"
														>
															<Navigation className="mr-2 size-4" />
															Directions
														</a>
													</Button>
													<Button
														type="button"
														variant="outline"
														onClick={() => removeFavorite(restaurant.id)}
														disabled={isTogglingFavorite}
														className={cn(
															"mapetite-quiet-button h-10 justify-center rounded-full px-4 shadow-none",
															"border-[rgba(255,236,220,0.12)]",
														)}
													>
														<Trash2 className="mr-2 size-4" />
														Remove
													</Button>
												</div>
											</article>
										) : (
											<article
												key={id}
												className="mapetite-panel grid gap-4 p-5 text-center md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:text-left"
											>
												<div>
													<h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
														Saved place details unavailable
													</h2>
													<p className="mapetite-muted-copy mt-2 text-sm leading-6">
														This saved restaurant could not be reloaded from the
														current demo cache. You can remove it or search again.
													</p>
												</div>
												<Button
													type="button"
													variant="outline"
													onClick={() => removeFavorite(id)}
													disabled={isTogglingFavorite}
													className="mapetite-quiet-button rounded-full px-5 shadow-none"
												>
													<Trash2 className="mr-2 size-4" />
													Remove
												</Button>
											</article>
										),
									)}
								</div>
							</section>
						)}
					</main>
				</div>
			</div>

			<LogInModal open={isLogInOpen} onOpenChange={setIsLogInOpen} />
			<SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
		</Layout>
	);
}
