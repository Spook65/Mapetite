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

	if (
		tokens.some((token) => token.includes("ramen") || token.includes("noodle"))
	) {
		return { label: "Ramen", emoji: "🍜", colors: ["#0ea5e9", "#14b8a6"] };
	}

	if (
		tokens.some(
			(token) => token.includes("burger") || token.includes("fastfood"),
		)
	) {
		return { label: "Burger", emoji: "🍔", colors: ["#f97316", "#ef4444"] };
	}

	if (
		tokens.some((token) => token.includes("pizza") || token.includes("italian"))
	) {
		return { label: "Italian", emoji: "🍕", colors: ["#ef4444", "#f97316"] };
	}

	if (
		tokens.some((token) => token.includes("taco") || token.includes("mexican"))
	) {
		return { label: "Tacos", emoji: "🌮", colors: ["#f59e0b", "#84cc16"] };
	}

	if (
		tokens.some(
			(token) => token.includes("sushi") || token.includes("japanese"),
		)
	) {
		return { label: "Sushi", emoji: "🍣", colors: ["#3b82f6", "#06b6d4"] };
	}

	if (
		tokens.some(
			(token) => token.includes("vegetarian") || token.includes("healthy"),
		)
	) {
		return { label: "Fresh", emoji: "🥗", colors: ["#22c55e", "#14b8a6"] };
	}

	if (
		tokens.some((token) => token.includes("cafe") || token.includes("coffee"))
	) {
		return { label: "Cafe", emoji: "☕", colors: ["#a16207", "#f59e0b"] };
	}

	return { label: "Dining", emoji: "🍽️", colors: ["#0ea5e9", "#14b8a6"] };
}

function buildFallbackArtworkUrl(
	restaurantName: string,
	categories: string[] = [],
) {
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
			<text x="92" y="610" font-size="58" font-weight="700" font-family="Inter, Arial, sans-serif" fill="#ffffff">Gallery unavailable</text>
			<text x="92" y="670" font-size="34" font-weight="500" font-family="Inter, Arial, sans-serif" fill="#ffffff" fill-opacity="0.92">${restaurantName} • ${theme.label}</text>
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
				"overflow-hidden border border-border shadow-none",
				className,
			)}
		>
			<div>
				<div className="relative aspect-[16/9] overflow-hidden bg-muted">
					<img
						src={displayImages[currentIndex]}
						alt={`${restaurantName} photo ${currentIndex + 1}`}
						className="absolute inset-0 h-full w-full object-cover"
						loading="lazy"
						referrerPolicy="no-referrer"
					/>

					{totalImages > 1 && (
						<>
							<Button
								variant="outline"
								size="icon"
								onClick={handlePrevious}
								className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90"
							>
								<ChevronLeft className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={handleNext}
								className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90"
							>
								<ChevronRight className="size-4" />
							</Button>
						</>
					)}

					<div className="absolute bottom-3 left-3 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground">
						{currentIndex + 1} / {totalImages}
					</div>

					{imageAttributions[currentIndex]?.length ? (
						<div className="absolute bottom-3 right-3 max-w-[70%] rounded-md border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground">
							Photo credit: {imageAttributions[currentIndex].join(", ")}
						</div>
					) : null}
				</div>

				{totalImages > 1 && (
					<div className="border-t border-border p-3">
						<div className="flex gap-2 overflow-x-auto pb-1">
							{displayImages.map((img, index) => (
								<button
									key={index}
									type="button"
									onClick={() => goToSlide(index)}
									className={cn(
										"h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border transition-colors",
										currentIndex === index
											? "border-primary"
											: "border-border hover:border-muted-foreground",
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
