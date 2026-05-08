import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DetailPhotoCarouselProps {
	/** Array of image URLs */
	images?: string[];
	/** Attribution strings for each image */
	imageAttributions?: string[][];
	/** Restaurant categories for fallback artwork */
	categories?: string[];
	/** Restaurant name for alt text */
	restaurantName: string;
	className?: string;
}

function normalizeText(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function pickFallbackTheme(categories: string[] = [], restaurantName = "") {
	const tokens = [...categories, restaurantName].map(normalizeText);

	if (tokens.some((token) => token.includes("ramen") || token.includes("noodle"))) {
		return { label: "Ramen", emoji: "🍜", colors: ["#0ea5e9", "#14b8a6"] };
	}

	if (tokens.some((token) => token.includes("burger") || token.includes("fastfood"))) {
		return { label: "Burger", emoji: "🍔", colors: ["#f97316", "#ef4444"] };
	}

	if (tokens.some((token) => token.includes("pizza") || token.includes("italian"))) {
		return { label: "Italian", emoji: "🍕", colors: ["#ef4444", "#f97316"] };
	}

	if (tokens.some((token) => token.includes("taco") || token.includes("mexican"))) {
		return { label: "Tacos", emoji: "🌮", colors: ["#f59e0b", "#84cc16"] };
	}

	if (tokens.some((token) => token.includes("sushi") || token.includes("japanese"))) {
		return { label: "Sushi", emoji: "🍣", colors: ["#3b82f6", "#06b6d4"] };
	}

	if (tokens.some((token) => token.includes("vegetarian") || token.includes("healthy"))) {
		return { label: "Fresh", emoji: "🥗", colors: ["#22c55e", "#14b8a6"] };
	}

	if (tokens.some((token) => token.includes("cafe") || token.includes("coffee"))) {
		return { label: "Cafe", emoji: "☕", colors: ["#a16207", "#f59e0b"] };
	}

	return { label: "Dining", emoji: "🍽️", colors: ["#0ea5e9", "#14b8a6"] };
}

function buildFallbackArtworkUrl(restaurantName: string, categories: string[] = []) {
	const theme = pickFallbackTheme(categories, restaurantName);
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
			<defs>
				<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="${theme.colors[0]}" />
					<stop offset="100%" stop-color="${theme.colors[1]}" />
				</linearGradient>
			</defs>
			<rect width="1280" height="720" rx="40" fill="url(#bg)" />
			<circle cx="180" cy="150" r="120" fill="#ffffff" fill-opacity="0.14" />
			<circle cx="1080" cy="170" r="150" fill="#ffffff" fill-opacity="0.12" />
			<text x="92" y="250" font-size="150" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${theme.emoji}</text>
			<text x="92" y="600" font-size="62" font-weight="700" font-family="Inter, Arial, sans-serif" fill="#ffffff">No gallery photos yet</text>
			<text x="92" y="660" font-size="36" font-weight="500" font-family="Inter, Arial, sans-serif" fill="#ffffff" fill-opacity="0.92">${restaurantName} • ${theme.label}</text>
		</svg>
	`.trim();

	return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function DetailPhotoCarousel({
	images = [],
	imageAttributions = [],
	categories = [],
	restaurantName,
	className,
}: DetailPhotoCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	const generatedImages =
		images.length > 0
			? images
			: [buildFallbackArtworkUrl(restaurantName, categories)];

	const displayImages = generatedImages;
	const totalImages = displayImages.length;

	const handlePrevious = () => {
		setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
	};

	const handleNext = () => {
		setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
	};

	const goToSlide = (index: number) => {
		setCurrentIndex(index);
	};

	return (
		<Card
			className={cn(
				"border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.2),0_6px_20px_black] hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.3),0_8px_24px_black] transition-all relative overflow-hidden",
				className,
			)}
		>
			{/* Subtle glowing texture overlay */}
			<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.55_0.18_240_/_0.2)_10px,oklch(0.55_0.18_240_/_0.2)_11px)] pointer-events-none z-0" />

			<div className="relative z-10">
				{/* Main Image Display Area */}
				<div className="relative aspect-[16/9] bg-gradient-to-br from-[oklch(0.15_0.04_250)] to-[oklch(0.12_0.045_250)] overflow-hidden">
						<img
							src={displayImages[currentIndex]}
							alt={`${restaurantName} photo ${currentIndex + 1}`}
						className="absolute inset-0 h-full w-full object-cover"
						loading="lazy"
						referrerPolicy="no-referrer"
					/>

					{/* Navigation Arrows */}
					{totalImages > 1 && (
						<>
							<Button
								variant="ghost"
								size="icon"
								onClick={handlePrevious}
								className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-sm bg-card/90 border-2 border-primary/40 hover:bg-card hover:border-primary/60 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.3)] backdrop-blur-sm transition-all"
							>
								<ChevronLeft className="h-6 w-6 text-primary drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleNext}
								className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-sm bg-card/90 border-2 border-primary/40 hover:bg-card hover:border-primary/60 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.3)] backdrop-blur-sm transition-all"
							>
								<ChevronRight className="h-6 w-6 text-primary drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
							</Button>
						</>
					)}

					{/* Image Counter */}
					<div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-sm bg-card/90 border-2 border-primary/40 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.3)] backdrop-blur-sm">
						<span className="text-sm font-serif-elegant font-semibold text-card-foreground">
							{currentIndex + 1} / {totalImages}
						</span>
					</div>

					{/* Attribution */}
					{imageAttributions[currentIndex]?.length ? (
						<div className="absolute bottom-16 left-4 right-4 md:left-6 md:right-6">
							<div className="rounded-sm bg-card/90 border border-primary/30 px-3 py-2 shadow-[0_0_12px_oklch(0.55_0.18_240_/_0.18)] backdrop-blur-sm">
								<p className="text-[10px] md:text-xs text-card-foreground/70 font-serif-elegant">
									Photo credit: {imageAttributions[currentIndex].join(", ")}
								</p>
							</div>
						</div>
					) : null}
				</div>

				{/* Thumbnail Navigation */}
				{totalImages > 1 && (
					<div className="p-4 bg-card/50 backdrop-blur-sm border-t-2 border-primary/30">
						<div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent pb-2">
							{displayImages.map((img, index) => (
								<button
									key={index}
									type="button"
									onClick={() => goToSlide(index)}
									className={cn(
										"flex-shrink-0 w-20 h-20 rounded-sm border-2 transition-all overflow-hidden bg-gradient-to-br from-[oklch(0.92_0.015_70)] to-[oklch(0.88_0.02_65)] relative group",
										currentIndex === index
											? "border-primary shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)] scale-105"
											: "border-primary/30 hover:border-primary/50 hover:shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.2)]",
									)}
								>
									<img
										src={img}
										alt={`${restaurantName} thumbnail ${index + 1}`}
										className="h-full w-full object-cover"
										loading="lazy"
										referrerPolicy="no-referrer"
									/>
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</Card>
	);
}
