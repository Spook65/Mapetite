import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChefHat, Quote } from "lucide-react";

interface ChefProfileSectionProps {
	/** Chef's name */
	chefName?: string;
	/** Chef's biography */
	chefBio?: string;
	/** Chef's culinary philosophy */
	philosophy?: string;
	/** Chef's profile image URL (optional) */
	profileImage?: string;
	className?: string;
}

/**
 * ChefProfileSection - Displays chef biography and culinary philosophy
 */
export function ChefProfileSection({
	chefName = "Executive Chef",
	chefBio = "With over two decades of culinary excellence, our executive chef brings a passion for innovation and tradition to every dish. Trained in the finest kitchens across the globe, they masterfully blend contemporary techniques with time-honored recipes to create unforgettable dining experiences.",
	philosophy = "Food is not just sustenance—it is art, culture, and connection. Every ingredient tells a story, and every dish is crafted with intention, respect for tradition, and a commitment to excellence. We believe in sourcing the finest local and seasonal ingredients, honoring their natural flavors while elevating them through precision and creativity.",
	profileImage,
	className,
}: ChefProfileSectionProps) {
	return (
		<Card className={cn("border border-border shadow-none", className)}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<ChefHat className="size-4 text-primary" />
					Meet the chef
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="flex flex-col md:flex-row gap-6">
					<div className="flex-shrink-0">
						<div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted md:w-40">
							{profileImage ? (
								<img
									src={profileImage}
									alt={chefName}
									className="h-full w-full object-cover"
								/>
							) : (
								<ChefHat className="size-10 text-muted-foreground" />
							)}
						</div>
					</div>

					<div className="flex-1 space-y-3">
						<div>
							<h3 className="text-lg font-semibold tracking-tight text-foreground">
								{chefName}
							</h3>
						</div>
						<p className="text-sm leading-relaxed text-muted-foreground md:text-base">
							{chefBio}
						</p>
					</div>
				</div>

				<div className="border-t border-border pt-5">
					<div className="flex items-start gap-3 mb-4">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
							<Quote className="size-4 text-primary" />
						</div>
						<div className="flex-1">
							<h4 className="mb-3 text-sm font-medium text-foreground">
								Culinary philosophy
							</h4>
							<div className="rounded-md border border-border p-4">
								<p className="text-sm leading-relaxed text-muted-foreground italic">
									"{philosophy}"
								</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
