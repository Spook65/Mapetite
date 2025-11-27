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
 * Features dark theme with light floating card aesthetic and blue/teal accents
 */
export function ChefProfileSection({
	chefName = "Executive Chef",
	chefBio = "With over two decades of culinary excellence, our executive chef brings a passion for innovation and tradition to every dish. Trained in the finest kitchens across the globe, they masterfully blend contemporary techniques with time-honored recipes to create unforgettable dining experiences.",
	philosophy = "Food is not just sustenance—it is art, culture, and connection. Every ingredient tells a story, and every dish is crafted with intention, respect for tradition, and a commitment to excellence. We believe in sourcing the finest local and seasonal ingredients, honoring their natural flavors while elevating them through precision and creativity.",
	profileImage,
	className,
}: ChefProfileSectionProps) {
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
						<ChefHat className="h-5 w-5 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.5)]" />
					</div>
					<CardTitle className="text-2xl font-serif-display text-card-foreground">
						Meet the Chef
					</CardTitle>
				</div>
			</CardHeader>

			<CardContent className="space-y-6 relative z-10">
				{/* Chef Profile Layout */}
				<div className="flex flex-col md:flex-row gap-6">
					{/* Chef Image/Avatar */}
					<div className="flex-shrink-0">
						<div className="w-full md:w-48 h-48 rounded-sm border-2 border-primary/40 bg-gradient-to-br from-[oklch(0.92_0.015_70)] to-[oklch(0.88_0.02_65)] shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.2)] flex items-center justify-center relative overflow-hidden group">
							{profileImage ? (
								<img
									src={profileImage}
									alt={chefName}
									className="w-full h-full object-cover"
								/>
							) : (
								<>
									{/* Decorative pattern overlay */}
									<div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,oklch(0.85_0.02_70_/_0.15)_12px,oklch(0.85_0.02_70_/_0.15)_13px)] pointer-events-none" />
									{/* Icon placeholder */}
									<ChefHat className="h-20 w-20 text-primary/50 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.3)]" />
								</>
							)}
						</div>
					</div>

					{/* Chef Bio */}
					<div className="flex-1 space-y-3">
						<div>
							<h3 className="text-xl font-serif-display text-card-foreground mb-1 tracking-tight">
								{chefName}
							</h3>
							<div className="h-1 w-16 bg-gradient-to-r from-primary via-secondary to-transparent rounded-full shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.4)]" />
						</div>
						<p className="text-base font-serif-elegant text-card-foreground/80 leading-relaxed">
							{chefBio}
						</p>
					</div>
				</div>

				{/* Culinary Philosophy Section */}
				<div className="pt-6 border-t-2 border-primary/30 shadow-[0_-2px_20px_oklch(0.55_0.18_240_/_0.1)]">
					<div className="flex items-start gap-3 mb-4">
						{/* Quote icon with teal accent */}
						<div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-br from-secondary/40 to-secondary/20 border border-secondary/50 shadow-[0_0_12px_oklch(0.65_0.14_195_/_0.4)] flex-shrink-0 mt-1">
							<Quote className="h-4 w-4 text-secondary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.5)]" />
						</div>
						<div className="flex-1">
							<h4 className="text-lg font-serif-display text-card-foreground mb-3">
								Culinary Philosophy
							</h4>
							<div className="bg-[oklch(0.96_0.01_75)] border-l-4 border-secondary pl-6 pr-4 py-4 rounded-sm shadow-[0_0_15px_oklch(0.65_0.14_195_/_0.15)]">
								<p className="text-base font-serif-elegant text-card-foreground/90 leading-relaxed italic">
									"{philosophy}"
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Decorative bottom accent */}
				<div className="flex items-center justify-center gap-2 pt-4">
					<div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-primary/80 w-32 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.4)]" />
					<div className="w-2 h-2 rotate-45 border border-primary/80 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
					<div className="h-px bg-gradient-to-l from-transparent via-primary/60 to-primary/80 w-32 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.4)]" />
				</div>
			</CardContent>
		</Card>
	);
}
