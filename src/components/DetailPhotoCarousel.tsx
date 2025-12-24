import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DetailPhotoCarouselProps {
	/** Array of image URLs */
	images?: string[];
	/** Restaurant name for alt text */
	restaurantName: string;
	className?: string;
}

export function DetailPhotoCarousel({
	images = [],
	restaurantName,
	className,
}: DetailPhotoCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	const generatedImages =
		images.length > 0
			? images
			: Array.from({ length: 5 }).map(
					(_, i) =>
						`https://picsum.photos/seed/${encodeURIComponent(
							`${restaurantName}-${i}`,
						)}/1280/720`,
				);

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
