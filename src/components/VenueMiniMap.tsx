import { hasValidMapCoordinate } from "@/lib/restaurant-map";
import type { Restaurant } from "@/store/restaurant-search-store";
import {
	Map as MapLibreMap,
	Marker,
	NavigationControl,
	Popup,
	setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useRef, useState } from "react";

const DEFAULT_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const MAP_STYLE_URL =
	import.meta.env.VITE_MAP_STYLE_URL || DEFAULT_MAP_STYLE_URL;
const TRANSPARENT_STYLE_IMAGE = {
	width: 1,
	height: 1,
	data: new Uint8Array([0, 0, 0, 0]),
};

setWorkerUrl(maplibreWorkerUrl);

interface VenueMiniMapProps {
	restaurant: Restaurant;
}

function buildVenuePopupContent(restaurant: Restaurant) {
	const container = document.createElement("div");
	container.className = "mapetite-map-popup";

	const title = document.createElement("strong");
	title.textContent = restaurant.name;
	container.append(title);

	const meta = document.createElement("span");
	meta.textContent = [restaurant.categories?.[0], restaurant.address?.city]
		.filter(Boolean)
		.join(" · ");
	container.append(meta);

	if (Number.isFinite(restaurant.rating)) {
		const rating = document.createElement("span");
		rating.textContent = `${restaurant.rating.toFixed(1)} rating`;
		container.append(rating);
	}

	if (restaurant.hoursStatus?.label) {
		const hours = document.createElement("span");
		hours.textContent = restaurant.hoursStatus.label;
		container.append(hours);
	}

	return container;
}

export function VenueMiniMap({ restaurant }: VenueMiniMapProps) {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const markerRef = useRef<Marker | null>(null);
	const popupRef = useRef<Popup | null>(null);
	const [isMapReady, setIsMapReady] = useState(false);
	const [mapError, setMapError] = useState<string | null>(null);
	const hasCoordinates = hasValidMapCoordinate(
		restaurant.latitude,
		restaurant.longitude,
	);

	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current || !hasCoordinates) {
			return;
		}

		const center: [number, number] = [
			restaurant.longitude,
			restaurant.latitude,
		];
		const map = new MapLibreMap({
			container: mapContainerRef.current,
			style: MAP_STYLE_URL,
			center,
			zoom: 15,
			attributionControl: {
				compact: true,
			},
		});
		map.setMissingStyleImageResolver((id) => {
			if (!map.hasImage(id)) {
				map.addImage(id, TRANSPARENT_STYLE_IMAGE);
			}
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
				setMapError("Map could not load right now. Directions are still available.");
			}
			setIsMapReady(true);
		});

		const markerElement = document.createElement("button");
		markerElement.type = "button";
		markerElement.className = "mapetite-map-marker is-selected";
		markerElement.setAttribute("aria-label", `Show ${restaurant.name} on map`);
		markerElement.title = restaurant.name;

		const popup = new Popup({
			className: "mapetite-restaurant-popup",
			closeButton: true,
			closeOnClick: false,
			focusAfterOpen: false,
			maxWidth: "220px",
			offset: 18,
		})
			.setDOMContent(buildVenuePopupContent(restaurant))
			.setLngLat(center);

		const showPopup = () => {
			popup.addTo(map);
		};
		markerElement.addEventListener("click", showPopup);
		markerElement.addEventListener("keydown", (event) => {
			if (event.key !== "Enter" && event.key !== " ") return;
			event.preventDefault();
			showPopup();
		});

		const marker = new Marker({
			element: markerElement,
			anchor: "bottom",
		})
			.setLngLat(center)
			.addTo(map);

		mapRef.current = map;
		markerRef.current = marker;
		popupRef.current = popup;

		return () => {
			map.off("styledata", markMapReady);
			map.off("load", markMapReady);
			map.off("idle", markMapReady);
			popupRef.current?.remove();
			popupRef.current = null;
			markerRef.current?.remove();
			markerRef.current = null;
			map.remove();
			mapRef.current = null;
			setIsMapReady(false);
		};
	}, [
		hasCoordinates,
		restaurant.address?.city,
		restaurant.categories,
		restaurant.hoursStatus?.label,
		restaurant.latitude,
		restaurant.longitude,
		restaurant.name,
		restaurant.rating,
	]);

	if (!hasCoordinates) {
		return null;
	}

	return (
		<div className="mapetite-map-frame relative overflow-hidden rounded-[14px] border border-[rgba(255,236,220,0.08)] bg-[linear-gradient(180deg,rgba(255,248,242,0.035),rgba(255,248,242,0.01)),linear-gradient(145deg,rgba(183,177,118,0.12),rgba(16,13,10,0.42))]">
			<div ref={mapContainerRef} className="h-[280px] w-full md:h-[320px]" />
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
	);
}
