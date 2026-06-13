import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MessageCircle, Star } from "lucide-react";

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
 */
export function ReviewSummary({
	overallRating = 0,
	totalReviews = 0,
	ratingBreakdown = emptyBreakdown,
	className,
}: ReviewSummaryProps) {
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
		<Card className={cn("border border-border shadow-none", className)}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<MessageCircle className="size-4 text-primary" />
					Guest reviews
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-5">
				<div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
					<div className="space-y-2 border-b border-border pb-4 text-center md:border-b-0 md:border-r md:pb-0 md:pr-5 md:text-left">
						<div className="flex items-baseline justify-center gap-2 md:justify-start">
							<span className="text-4xl font-semibold tracking-tight text-foreground">
								{overallRating.toFixed(1)}
							</span>
							<span className="text-sm text-muted-foreground">/ 5.0</span>
						</div>
						<div className="flex justify-center md:justify-start">
							{renderStars(overallRating, "md")}
						</div>
						<p className="text-sm text-muted-foreground">
							Based on {totalReviews.toLocaleString()} reviews
						</p>
					</div>

					<div className="space-y-2">
						{[5, 4, 3, 2, 1].map((stars) => {
							const count = ratingBreakdown[stars as keyof RatingBreakdown];
							const percentage = getPercentage(count);

							return (
								<div key={stars} className="flex items-center gap-3">
									<div className="flex w-14 items-center gap-1 text-sm text-foreground">
										<span>{stars}</span>
										<Star className="size-3.5 fill-primary text-primary" />
									</div>
									<Progress value={percentage} className="h-2 flex-1" />
									<span className="w-10 text-right text-sm text-muted-foreground">
										{count}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
