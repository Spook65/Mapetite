import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DollarSign, Sparkles, UtensilsCrossed } from "lucide-react";

interface SignatureDish {
	/** Dish name */
	name: string;
	/** Dish description */
	description: string;
	/** Price in dollars */
	price: number;
	/** Optional dietary tags */
	tags?: string[];
	/** Is this dish featured/recommended? */
	featured?: boolean;
}

interface SignatureMenuProps {
	/** Array of signature dishes */
	dishes?: SignatureDish[];
	/** Optional pricing note */
	pricingNote?: string;
	className?: string;
}

// Mock signature dishes for fallback
const mockDishes: SignatureDish[] = [
	{
		name: "Pan-Seared Scallops",
		description:
			"Succulent diver scallops with cauliflower purée, crispy prosciutto, and truffle beurre blanc",
		price: 48,
		tags: ["Gluten-Free"],
		featured: true,
	},
	{
		name: "Wagyu Beef Tenderloin",
		description:
			"Japanese A5 wagyu with roasted bone marrow, heirloom carrots, and red wine reduction",
		price: 125,
		tags: ["Chef's Specialty"],
		featured: true,
	},
	{
		name: "Lobster Risotto",
		description:
			"Arborio rice with Maine lobster, saffron, peas, and aged Parmigiano-Reggiano",
		price: 62,
		tags: ["Signature"],
	},
	{
		name: "Wild Mushroom Tart",
		description:
			"Puff pastry with foraged mushrooms, goat cheese, thyme, and balsamic glaze",
		price: 32,
		tags: ["Vegetarian", "Seasonal"],
	},
	{
		name: "Dover Sole Meunière",
		description:
			"Whole dover sole filleted tableside, brown butter, lemon, and fresh herbs",
		price: 78,
		tags: ["Classic"],
	},
];

/**
 * SignatureMenu - Displays signature dishes with styling and estimated pricing
 * Features dark theme with light floating card aesthetic and blue/teal accents
 */
export function SignatureMenu({
	dishes = mockDishes,
	pricingNote = "Prices are estimates and may vary by season and availability",
	className,
}: SignatureMenuProps) {
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
						<UtensilsCrossed className="h-5 w-5 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.5)]" />
					</div>
					<CardTitle className="text-2xl font-serif-display text-card-foreground">
						Signature Dishes
					</CardTitle>
				</div>
				{pricingNote && (
					<p className="text-sm font-serif-elegant text-card-foreground/70 ml-13">
						{pricingNote}
					</p>
				)}
			</CardHeader>

			<CardContent className="space-y-4 relative z-10">
				{dishes.map((dish, index) => (
					<div
						key={`${dish.name}-${index}`}
						className={cn(
							"group relative p-5 rounded-sm transition-all",
							dish.featured
								? "bg-gradient-to-r from-[oklch(0.96_0.01_75)] to-[oklch(0.95_0.015_80)] border-2 border-secondary/40 shadow-[0_0_20px_oklch(0.65_0.14_195_/_0.2)] hover:shadow-[0_0_25px_oklch(0.65_0.14_195_/_0.3)]"
								: "bg-[oklch(0.96_0.01_75)] border-2 border-primary/30 shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.1)] hover:shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.15)] hover:border-primary/40",
						)}
					>
						{/* Featured badge */}
						{dish.featured && (
							<div className="absolute -top-2 -right-2">
								<div className="flex items-center gap-1 px-3 py-1 rounded-sm bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)] border border-primary/60">
									<Sparkles className="h-3 w-3 fill-current" />
									<span className="text-xs font-serif-elegant font-semibold">
										Featured
									</span>
								</div>
							</div>
						)}

						{/* Dish Header */}
						<div className="flex items-start justify-between gap-4 mb-3">
							<div className="flex-1">
								<h4 className="text-lg font-serif-display text-card-foreground mb-1 tracking-tight">
									{dish.name}
								</h4>
								{dish.tags && dish.tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-2">
										{dish.tags.map((tag) => (
											<Badge
												key={tag}
												variant="secondary"
												className="text-xs font-serif-elegant font-medium px-2 py-0.5 border border-primary/20 shadow-sm"
											>
												{tag}
											</Badge>
										))}
									</div>
								)}
							</div>

							{/* Price with teal accent */}
							<div className="flex items-center gap-1 px-3 py-1 rounded-sm bg-gradient-to-br from-secondary/30 to-secondary/10 border border-secondary/40 shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.3)] flex-shrink-0">
								<DollarSign className="h-4 w-4 text-secondary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.4)]" />
								<span className="text-lg font-serif-elegant font-bold text-secondary drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.4)]">
									{dish.price}
								</span>
							</div>
						</div>

						{/* Dish Description */}
						<p className="text-sm font-serif-elegant text-card-foreground/80 leading-relaxed">
							{dish.description}
						</p>

						{/* Decorative accent line */}
						<div className="mt-4 flex items-center gap-2">
							<div
								className={cn(
									"h-px flex-1 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.3)]",
									dish.featured
										? "bg-gradient-to-r from-secondary/60 to-transparent"
										: "bg-gradient-to-r from-primary/50 to-transparent",
								)}
							/>
						</div>
					</div>
				))}

				{/* Pricing Summary Footer */}
				<div className="pt-6 mt-6 border-t-2 border-primary/30 shadow-[0_-2px_20px_oklch(0.55_0.18_240_/_0.1)]">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="space-y-1">
							<p className="text-sm font-serif-elegant font-semibold text-card-foreground">
								Estimated Price Range
							</p>
							<p className="text-xs font-serif-elegant text-card-foreground/70">
								{dishes.length > 0 &&
									`$${Math.min(...dishes.map((d) => d.price))} - $${Math.max(...dishes.map((d) => d.price))} per dish`}
							</p>
						</div>
						<div className="flex items-center gap-2 px-4 py-2 rounded-sm bg-[oklch(0.96_0.01_75)] border-2 border-primary/30 shadow-[0_0_12px_oklch(0.55_0.18_240_/_0.15)]">
							<DollarSign className="h-5 w-5 text-secondary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.4)]" />
							<span className="text-sm font-serif-elegant font-semibold text-card-foreground">
								{dishes.length} Signature Dishes
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
