import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MessageCircle, Star, ThumbsUp } from "lucide-react";

interface UserReview {
	/** Review ID */
	id: string;
	/** Author name */
	author: string;
	/** Rating out of 5 */
	rating: number;
	/** Review comment */
	comment: string;
	/** Date of review */
	date: string;
	/** Number of helpful votes */
	helpfulCount?: number;
}

interface RatingBreakdown {
	/** Number of 5-star reviews */
	5: number;
	/** Number of 4-star reviews */
	4: number;
	/** Number of 3-star reviews */
	3: number;
	/** Number of 2-star reviews */
	2: number;
	/** Number of 1-star reviews */
	1: number;
}

interface ReviewSummaryProps {
	/** Overall rating (0-5) */
	overallRating?: number;
	/** Total number of reviews */
	totalReviews?: number;
	/** Rating breakdown by stars */
	ratingBreakdown?: RatingBreakdown;
	/** Array of user reviews to display */
	reviews?: UserReview[];
	/** Maximum number of reviews to display */
	maxReviews?: number;
	className?: string;
}

// Mock data for fallback
const emptyBreakdown: RatingBreakdown = {
	5: 0,
	4: 0,
	3: 0,
	2: 0,
	1: 0,
};

/**
 * ReviewSummary - Displays rating breakdown and user reviews
 * Features dark theme with light floating card aesthetic and blue/teal accents
 */
export function ReviewSummary({
	overallRating = 0,
	totalReviews = 0,
	ratingBreakdown = emptyBreakdown,
	reviews = [],
	maxReviews = 4,
	className,
}: ReviewSummaryProps) {
	const displayedReviews = reviews.slice(0, maxReviews);
	const hasReviews = totalReviews > 0 && reviews.length > 0;

	// Calculate percentage for each rating
	const getPercentage = (count: number) => {
		return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
	};

	// Render star rating
	const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
		const sizeClasses = {
			sm: "h-3.5 w-3.5",
			md: "h-5 w-5",
			lg: "h-8 w-8",
		};

		const stars = Array.from({ length: 5 }, (_, i) => i);

		return (
			<div className="flex items-center gap-1">
				{stars.map((i) => (
					<Star
						key={`star-${Math.random()}-${i}`}
						className={cn(
							sizeClasses[size],
							i < Math.floor(rating)
								? "fill-secondary text-secondary drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]"
								: i < rating
									? "fill-secondary/50 text-secondary drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.3)]"
									: "fill-muted text-muted",
						)}
					/>
				))}
			</div>
		);
	};

	return (
		<Card
			className={cn(
				"border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.2),0_6px_20px_black] hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.3),0_8px_24px_black] transition-all relative overflow-hidden",
				className,
			)}
		>
			{/* Subtle glowing texture overlay */}
			<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.55_0.18_240_/_0.15)_10px,oklch(0.55_0.18_240_/_0.15)_11px)] pointer-events-none z-0" />

			<CardHeader className="relative z-10">
				<div className="flex items-center gap-3 mb-2">
					{/* Ornate icon frame with glow */}
					<div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary/50 shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)]">
						<MessageCircle className="h-5 w-5 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.5)]" />
					</div>
					<CardTitle className="text-2xl font-serif-display text-card-foreground">
						Guest Reviews
					</CardTitle>
				</div>
			</CardHeader>

			<CardContent className="space-y-6 relative z-10">
				{/* Overall Rating Summary */}
				<div className="flex flex-col md:flex-row gap-6 p-6 rounded-sm bg-gradient-to-r from-[oklch(0.96_0.01_75)] to-[oklch(0.95_0.015_80)] border-2 border-secondary/40 shadow-[0_0_20px_oklch(0.65_0.14_195_/_0.2)]">
					{/* Overall Score */}
					<div className="flex-shrink-0 text-center md:text-left md:border-r-2 md:border-primary/30 md:pr-6">
						<div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
							<span className="text-5xl font-serif-display font-bold text-secondary drop-shadow-[0_0_12px_oklch(0.65_0.14_195_/_0.5)]">
								{overallRating.toFixed(1)}
							</span>
							<span className="text-xl font-serif-elegant text-card-foreground/70">
								/ 5.0
							</span>
						</div>
						{renderStars(overallRating, "lg")}
						<p className="text-sm font-serif-elegant text-card-foreground/70 mt-3">
							Based on {totalReviews.toLocaleString()} reviews
						</p>
					</div>

					{/* Rating Breakdown */}
					<div className="flex-1 space-y-2">
						{[5, 4, 3, 2, 1].map((stars) => {
							const count = ratingBreakdown[stars as keyof RatingBreakdown];
							const percentage = getPercentage(count);

							return (
								<div key={stars} className="flex items-center gap-3">
									<div className="flex items-center gap-1 w-16 flex-shrink-0">
										<span className="text-sm font-serif-elegant font-semibold text-card-foreground">
											{stars}
										</span>
										<Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
									</div>
									<Progress
										value={percentage}
										className="h-2 flex-1 bg-[oklch(0.92_0.01_70)]"
									/>
									<span className="text-sm font-serif-elegant text-card-foreground/70 w-12 text-right">
										{count}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Individual Reviews */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<h4 className="text-lg font-serif-display text-card-foreground">
							Recent Reviews
						</h4>
						<Badge
							variant="secondary"
							className="font-serif-elegant font-medium px-2 py-0.5 border border-primary/20"
						>
							{displayedReviews.length} of {totalReviews}
						</Badge>
					</div>

					{hasReviews ? (
						displayedReviews.map((review) => (
							<div
								key={review.id}
								className="p-5 rounded-sm bg-[oklch(0.96_0.01_75)] border-2 border-primary/30 shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.1)] hover:shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.15)] hover:border-primary/40 transition-all"
							>
								{/* Review Header */}
								<div className="flex flex-wrap items-start justify-between gap-4 mb-3">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<span className="font-serif-elegant font-semibold text-base text-card-foreground">
												{review.author}
											</span>
											<span className="text-xs font-serif-elegant text-card-foreground/60">
												{new Date(review.date).toLocaleDateString("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
											</span>
										</div>
										{renderStars(review.rating, "sm")}
									</div>
								</div>

								{/* Review Comment */}
								<p className="text-sm font-serif-elegant text-card-foreground/80 leading-relaxed mb-3">
									{review.comment}
								</p>

								{/* Review Footer */}
								{review.helpfulCount !== undefined && (
									<div className="flex items-center gap-2 pt-3 border-t border-primary/20">
										<ThumbsUp className="h-3.5 w-3.5 text-primary/70" />
										<span className="text-xs font-serif-elegant text-card-foreground/60">
											{review.helpfulCount}{" "}
											{review.helpfulCount === 1 ? "person" : "people"} found this
											helpful
										</span>
									</div>
								)}
							</div>
						))
					) : (
						<p className="text-sm text-card-foreground/70">
							No reviews available yet.
						</p>
					)}
				</div>

				{/* View More Reviews CTA */}
				{reviews.length > maxReviews && (
					<div className="pt-4 border-t-2 border-primary/30 text-center">
						<button
							type="button"
							className="text-base font-serif-elegant font-semibold text-primary hover:text-secondary transition-colors drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.4)] hover:drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]"
						>
							View All {totalReviews} Reviews →
						</button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
