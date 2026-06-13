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

/**
 * SignatureMenu - Displays signature dishes with styling and estimated pricing
 */
export function SignatureMenu({
	dishes = [],
	pricingNote,
	className,
}: SignatureMenuProps) {
	if (!dishes.length) {
		return (
			<Card className={cn("border border-border shadow-none", className)}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<UtensilsCrossed className="size-4 text-primary" />
						Signature dishes
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					Menu data is not available for this restaurant yet.
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn("border border-border shadow-none", className)}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<UtensilsCrossed className="size-4 text-primary" />
					Signature dishes
				</CardTitle>
				{pricingNote && (
					<p className="text-sm text-muted-foreground">{pricingNote}</p>
				)}
			</CardHeader>

			<CardContent className="space-y-3">
				{dishes.map((dish, index) => (
					<div
						key={`${dish.name}-${index}`}
						className={cn(
							"rounded-md border border-border p-4",
							dish.featured ? "bg-muted/60" : "bg-card",
						)}
					>
						{dish.featured && (
							<Badge variant="outline" className="mb-3">
								<Sparkles className="size-3" />
								Featured
							</Badge>
						)}

						<div className="flex items-start justify-between gap-4 mb-3">
							<div className="flex-1">
								<h4 className="text-base font-semibold tracking-tight text-foreground mb-1">
									{dish.name}
								</h4>
								{dish.tags && dish.tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-2">
										{dish.tags.map((tag) => (
											<Badge key={tag} variant="outline">
												{tag}
											</Badge>
										))}
									</div>
								)}
							</div>

							<div className="flex items-center gap-1 rounded-md border border-border px-3 py-1 text-foreground">
								<DollarSign className="size-4 text-primary" />
								<span className="text-sm font-medium">{dish.price}</span>
							</div>
						</div>

						<p className="text-sm leading-relaxed text-muted-foreground">
							{dish.description}
						</p>
					</div>
				))}

				<div className="mt-4 border-t border-border pt-4">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								Estimated Price Range
							</p>
							<p className="text-xs text-muted-foreground">
								{dishes.length > 0 &&
									`$${Math.min(...dishes.map((d) => d.price))} - $${Math.max(...dishes.map((d) => d.price))} per dish`}
							</p>
						</div>
						<div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
							<DollarSign className="size-4 text-primary" />
							<span className="text-sm font-medium text-foreground">
								{dishes.length} Signature Dishes
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
