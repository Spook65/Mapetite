import {
	getRestaurantMapCenter,
	getRestaurantMapPins,
	hasValidMapCoordinate,
	type RestaurantMapPin,
} from "@/lib/restaurant-map";
import type { Restaurant } from "@/store/restaurant-search-store";
import {
	LngLatBounds,
	Map as MapLibreMap,
	Marker,
	NavigationControl,
	Popup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPinned, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const DEFAULT_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const MAP_STYLE_URL =
	import.meta.env.VITE_MAP_STYLE_URL || DEFAULT_MAP_STYLE_URL;

interface SearchResultsMapProps {
	restaurants: Restaurant[];
	selectedRestaurantId: string | null;
	userLocation?: {
		latitude: number;
		longitude: number;
	} | null;
	onSelectRestaurant: (restaurantId: string) => void;
	onClose: () => void;
}

function buildPopupContent(pin: RestaurantMapPin) {
	const container = document.createElement("div");
	container.className = "mapetite-map-popup";

	const title = document.createElement("strong");
	title.textContent = pin.name;
	container.append(title);

	const meta = document.createElement("span");
	meta.textContent = [pin.category, pin.city].filter(Boolean).join(" · ");
	container.append(meta);

	if (pin.rating != null) {
		const rating = document.createElement("span");
		rating.textContent = `${pin.rating.toFixed(1)} rating`;
		container.append(rating);
	}

	if (pin.hoursLabel) {
		const hours = document.createElement("span");
		hours.textContent = pin.hoursLabel;
		container.append(hours);
	}

	const link = document.createElement("a");
	link.href = `/restaurants/${encodeURIComponent(pin.id)}`;
	link.textContent = "View details";
	container.append(link);

	return container;
}

function buildPopup(pin: RestaurantMapPin, closeButton = false) {
	return new Popup({
		className: "mapetite-restaurant-popup",
		closeButton,
		closeOnClick: false,
		maxWidth: "240px",
		offset: 18,
	})
		.setDOMContent(buildPopupContent(pin))
		.setLngLat([pin.longitude, pin.latitude]);
}

export function SearchResultsMap({
	restaurants,
	selectedRestaurantId,
	userLocation,
	onSelectRestaurant,
	onClose,
}: SearchResultsMapProps) {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const restaurantMarkersRef = useRef<globalThis.Map<string, Marker>>(
		new globalThis.Map(),
	);
	const userMarkerRef = useRef<Marker | null>(null);
	const popupRef = useRef<Popup | null>(null);
	const [isMapReady, setIsMapReady] = useState(false);
	const [mapError, setMapError] = useState<string | null>(null);
	const pins = useMemo(() => getRestaurantMapPins(restaurants), [restaurants]);
	const center = useMemo(() => getRestaurantMapCenter(pins), [pins]);
	const validUserLocation =
		userLocation &&
		hasValidMapCoordinate(userLocation.latitude, userLocation.longitude)
			? userLocation
			: null;
	const pinBoundsKey = pins
		.map((pin) => `${pin.id}:${pin.latitude}:${pin.longitude}`)
		.join("|");
	const userLocationKey = validUserLocation
		? `${validUserLocation.latitude}:${validUserLocation.longitude}`
		: "";

	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current || pins.length === 0 || !center) {
			return;
		}

		const map = new MapLibreMap({
			container: mapContainerRef.current,
			style: MAP_STYLE_URL,
			center: [center.longitude, center.latitude],
			zoom: pins.length === 1 ? 13 : 11,
			attributionControl: {
				compact: true,
			},
		});

		map.addControl(
			new NavigationControl({
				showCompass: false,
			}),
			"top-right",
		);
		const markMapReady = () => setIsMapReady(true);
		map.once("styledata", markMapReady);
		map.once("load", markMapReady);
		map.once("idle", markMapReady);
		map.on("error", () => {
			if (!map.isStyleLoaded()) {
				setMapError("Map could not load right now. Restaurant results are still available in the list.");
			}
			setIsMapReady(true);
		});
		mapRef.current = map;

		return () => {
			map.off("styledata", markMapReady);
			map.off("load", markMapReady);
			map.off("idle", markMapReady);
			popupRef.current?.remove();
			restaurantMarkersRef.current.forEach((marker) => marker.remove());
			restaurantMarkersRef.current.clear();
			userMarkerRef.current?.remove();
			userMarkerRef.current = null;
			map.remove();
			mapRef.current = null;
			setIsMapReady(false);
		};
	}, [center, pins.length]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map || pins.length === 0) return;

		restaurantMarkersRef.current.forEach((marker) => marker.remove());
		restaurantMarkersRef.current.clear();

		for (const pin of pins) {
			const markerElement = document.createElement("button");
			markerElement.type = "button";
			markerElement.className =
				pin.id === selectedRestaurantId
					? "mapetite-map-marker is-selected"
					: "mapetite-map-marker";
			markerElement.setAttribute("aria-label", `Select ${pin.name}`);
			const showPopup = (closeButton = false) => {
				popupRef.current?.remove();
				popupRef.current = buildPopup(pin, closeButton).addTo(map);
			};
			const closeHoverPopup = () => {
				if (pin.id === selectedRestaurantId) return;
				popupRef.current?.remove();
				popupRef.current = null;
			};
			markerElement.addEventListener("pointerenter", (event) => {
				if (event.pointerType === "touch") return;
				showPopup();
			});
			markerElement.addEventListener("pointerleave", (event) => {
				if (event.pointerType === "touch") return;
				closeHoverPopup();
			});
			markerElement.addEventListener("focus", () => showPopup());
			markerElement.addEventListener("blur", closeHoverPopup);
			markerElement.addEventListener("click", () => {
				onSelectRestaurant(pin.id);
				showPopup(true);
			});

			const marker = new Marker({
				element: markerElement,
				anchor: "bottom",
			})
				.setLngLat([pin.longitude, pin.latitude])
				.addTo(map);

			restaurantMarkersRef.current.set(pin.id, marker);
		}
		setIsMapReady(true);
	}, [pins, selectedRestaurantId, onSelectRestaurant]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;

		userMarkerRef.current?.remove();
		userMarkerRef.current = null;

		if (!validUserLocation) return;

		const markerElement = document.createElement("div");
		markerElement.className = "mapetite-map-user-marker";
		markerElement.setAttribute("role", "img");
		markerElement.setAttribute("aria-label", "Your location");
		markerElement.title = "Your location";

		const marker = new Marker({
			element: markerElement,
			anchor: "center",
		})
			.setLngLat([validUserLocation.longitude, validUserLocation.latitude])
			.addTo(map);

		userMarkerRef.current = marker;
	}, [userLocationKey]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map || pins.length === 0) return;

		if (pins.length === 1 && !validUserLocation) {
			map.easeTo({
				center: [pins[0].longitude, pins[0].latitude],
				zoom: 13,
				duration: 450,
			});
			return;
		}

		const bounds = new LngLatBounds();
		for (const pin of pins) {
			bounds.extend([pin.longitude, pin.latitude]);
		}
		if (validUserLocation) {
			bounds.extend([validUserLocation.longitude, validUserLocation.latitude]);
		}

		map.fitBounds(bounds, {
			padding: 54,
			maxZoom: 14,
			duration: 450,
		});
	}, [pinBoundsKey, pins, userLocationKey]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map || !selectedRestaurantId) return;

		const selectedPin = pins.find((pin) => pin.id === selectedRestaurantId);
		if (!selectedPin) return;

		map.easeTo({
			center: [selectedPin.longitude, selectedPin.latitude],
			duration: 350,
		});
		popupRef.current?.remove();
		popupRef.current = buildPopup(selectedPin, true).addTo(map);
	}, [selectedRestaurantId, pins]);

	return (
		<section
			className="mapetite-panel grid gap-3 overflow-hidden p-4 md:p-5"
			aria-label="Search results map"
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<div className="mapetite-eyebrow">
						Map view
					</div>
					<h2 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
						Current search results
					</h2>
					<p className="mapetite-muted-copy mt-1 text-sm leading-6">
						Showing {pins.length.toLocaleString()} mapped of{" "}
						{restaurants.length.toLocaleString()} results.
					</p>
				</div>
				<Button
					type="button"
					variant="ghost"
					onClick={onClose}
					className="rounded-full text-[var(--mapetite-text-soft)] hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
				>
					<X className="mr-2 size-4" />
					Hide map
				</Button>
			</div>

			{pins.length > 0 ? (
				<div className="mapetite-map-frame relative overflow-hidden rounded-[14px] border border-[rgba(255,236,220,0.08)] bg-[linear-gradient(180deg,rgba(255,248,242,0.035),rgba(255,248,242,0.01)),linear-gradient(145deg,rgba(183,177,118,0.12),rgba(16,13,10,0.42))]">
					<div
						ref={mapContainerRef}
						className="h-[320px] w-full md:h-[380px]"
					/>
					{!isMapReady && !mapError ? (
						<div className="pointer-events-none absolute inset-0 grid place-items-center bg-[rgba(16,14,12,0.54)] text-sm text-[var(--mapetite-text-soft)] backdrop-blur-[1px]">
							Preparing map…
						</div>
					) : null}
					{mapError ? (
						<div className="absolute inset-x-4 bottom-4 rounded-[12px] border border-[rgba(255,236,220,0.1)] bg-[rgba(16,14,12,0.88)] p-3 text-sm text-[var(--mapetite-text-soft)] backdrop-blur">
							{mapError}
						</div>
					) : null}
				</div>
			) : (
				<div className="grid min-h-[220px] place-items-center rounded-[14px] border border-[rgba(255,236,220,0.08)] bg-white/[0.02] p-6 text-center">
					<div>
						<div className="mx-auto flex size-12 items-center justify-center rounded-[12px] border border-[rgba(255,236,220,0.1)] bg-white/[0.025] text-[var(--mapetite-text-soft)]">
							<MapPinned className="size-5" />
						</div>
						<strong className="mt-4 block text-lg font-semibold text-[var(--mapetite-text)]">
							Map unavailable for these results
						</strong>
						<p className="mapetite-muted-copy mx-auto mt-2 max-w-md text-sm leading-6">
							The current listings did not include usable coordinates, so they
							stay in the shortlist without map pins.
						</p>
					</div>
				</div>
			)}

			<p className="text-sm leading-6 text-[var(--mapetite-text-faint)]">
				Some listings may not include coordinates and may not appear on the map.
				Map tiles are provided by OpenFreeMap/OpenStreetMap-compatible public
				tile data.
			</p>
		</section>
	);
}
