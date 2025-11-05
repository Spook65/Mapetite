import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	MapPin,
	Search,
	Sparkles,
	Star,
	Utensils,
} from "lucide-react";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

function LandingPage() {
	return (
		<Layout>
			<div className="container mx-auto px-8 py-16">
				{/* Hero Section */}
				<div className="mb-16 text-center">
					<div className="mb-6 inline-flex items-center gap-2 rounded-sm border-2 border-primary/40 bg-gradient-to-r from-primary/15 to-secondary/10 px-5 py-2.5 shadow-md">
						<Sparkles className="h-4 w-4 text-primary stroke-[2.5]" />
						<span className="text-sm font-serif-elegant tracking-wider text-primary uppercase">
							Premium Dining Discovery
						</span>
					</div>
					<h1 className="mb-6 text-6xl font-serif-display tracking-tight text-[oklch(0.2_0.03_145)]">
						Discover Your Next
						<br />
						<span className="bg-gradient-to-r from-primary via-[oklch(0.6_0.1_60)] to-secondary bg-clip-text text-transparent">
							Culinary Adventure
						</span>
					</h1>
					<p className="mx-auto mb-8 max-w-2xl text-xl font-serif-elegant leading-relaxed text-[oklch(0.35_0.03_145)]">
						Explore world-class restaurants across the globe. Find the perfect
						dining experience with our premium search and discovery platform.
					</p>
				</div>

				{/* Trust Banner - Trusted by Leading Culinary Experts */}
				<div className="mb-16">
					<div className="mx-auto max-w-5xl rounded-sm border-2 border-primary/20 bg-gradient-to-br from-[oklch(0.97_0.012_75)] to-[oklch(0.95_0.015_70)] px-8 py-8 shadow-md relative overflow-hidden">
						{/* Subtle texture overlay */}
						<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,oklch(0.85_0.02_70_/_0.1)_2px,oklch(0.85_0.02_70_/_0.1)_3px)]" />

						<div className="relative z-10">
							<p className="mb-6 text-center text-sm font-serif-elegant tracking-widest text-[oklch(0.4_0.03_145)] uppercase">
								Trusted by Leading Culinary Experts
							</p>
							<div className="grid grid-cols-5 gap-6 items-center">
								{/* Logo Placeholder 1 */}
								<div className="flex items-center justify-center">
									<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
										<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider">
											CHEF CO
										</span>
									</div>
								</div>
								{/* Logo Placeholder 2 */}
								<div className="flex items-center justify-center">
									<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
										<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider">
											GASTRO GUILD
										</span>
									</div>
								</div>
								{/* Logo Placeholder 3 */}
								<div className="flex items-center justify-center">
									<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
										<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider">
											CULINARY ARTS
										</span>
									</div>
								</div>
								{/* Logo Placeholder 4 */}
								<div className="flex items-center justify-center">
									<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
										<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider">
											EPICURE
										</span>
									</div>
								</div>
								{/* Logo Placeholder 5 */}
								<div className="flex items-center justify-center">
									<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
										<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider">
											FINE DINE
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main CTA Card - Restaurant Search */}
				<div className="mx-auto mb-16 max-w-4xl">
					<Link to="/restaurants">
						<Card className="group cursor-pointer border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.98_0.01_75)] via-[oklch(0.96_0.012_75)] to-[oklch(0.94_0.015_70)] transition-all hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/20 shadow-ornate relative overflow-hidden">
							{/* Subtle texture overlay */}
							<div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.85_0.02_70_/_0.1)_10px,oklch(0.85_0.02_70_/_0.1)_11px)]" />

							<CardHeader className="pb-4 relative z-10">
								<div className="mb-4 flex items-center justify-between">
									<div className="flex h-16 w-16 items-center justify-center rounded-sm bg-gradient-to-br from-primary via-[oklch(0.6_0.1_60)] to-secondary shadow-lg border-2 border-primary/40">
										<Utensils className="h-8 w-8 text-[oklch(0.16_0.02_145)] stroke-[2.5]" />
									</div>
									<ArrowRight className="h-8 w-8 text-primary transition-transform group-hover:translate-x-2 stroke-[2.5]" />
								</div>
								<CardTitle className="text-3xl font-serif-display text-[oklch(0.2_0.03_145)]">
									Restaurant Search
								</CardTitle>
								<CardDescription className="text-base font-serif-elegant text-[oklch(0.35_0.03_145)]">
									Find amazing restaurants by location, cuisine, and more
								</CardDescription>
							</CardHeader>
							<CardContent className="relative z-10">
								<div className="grid gap-4 sm:grid-cols-3">
									<div className="flex items-center gap-3 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] p-4 shadow-sm">
										<MapPin className="h-5 w-5 text-primary stroke-[2.5]" />
										<div>
											<p className="text-sm font-serif-elegant font-semibold text-[oklch(0.2_0.03_145)]">
												195 Countries
											</p>
											<p className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)]">
												Global coverage
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3 rounded-sm border border-secondary/20 bg-[oklch(0.96_0.01_75)] p-4 shadow-sm">
										<Search className="h-5 w-5 text-secondary stroke-[2.5]" />
										<div>
											<p className="text-sm font-serif-elegant font-semibold text-[oklch(0.2_0.03_145)]">
												Smart Filters
											</p>
											<p className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)]">
												Advanced search
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] p-4 shadow-sm">
										<Star className="h-5 w-5 text-primary stroke-[2.5]" />
										<div>
											<p className="text-sm font-serif-elegant font-semibold text-[oklch(0.2_0.03_145)]">
												Top Rated
											</p>
											<p className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)]">
												Curated picks
											</p>
										</div>
									</div>
								</div>
								<div className="mt-6">
									<Button
										size="lg"
										className="w-full bg-gradient-to-r from-primary via-[oklch(0.6_0.1_60)] to-secondary text-[oklch(0.16_0.02_145)] shadow-lg shadow-primary/30 hover:shadow-primary/50 border-2 border-primary/40 font-serif-elegant text-base tracking-wide transition-all hover:scale-[1.02]"
									>
										Start Exploring
										<ArrowRight className="ml-2 h-5 w-5 stroke-[2.5]" />
									</Button>
								</div>
							</CardContent>
						</Card>
					</Link>
				</div>

				{/* Features Grid */}
				<div className="grid gap-6 md:grid-cols-3">
					<Card className="border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.95_0.012_75)] shadow-md relative overflow-hidden">
						<div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_70_/_0.1)_8px,oklch(0.85_0.02_70_/_0.1)_9px)]" />
						<CardHeader className="relative z-10">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40">
								<MapPin className="h-6 w-6 text-primary stroke-[2.5]" />
							</div>
							<CardTitle className="text-xl font-serif-display text-[oklch(0.2_0.03_145)]">
								Global Search
							</CardTitle>
							<CardDescription className="font-serif-elegant text-[oklch(0.35_0.03_145)]">
								Search restaurants across 195 countries with detailed location
								filtering
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-2 border-secondary/30 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.95_0.012_70)] shadow-md relative overflow-hidden">
						<div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_60_/_0.1)_8px,oklch(0.85_0.02_60_/_0.1)_9px)]" />
						<CardHeader className="relative z-10">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br from-secondary/30 to-secondary/10 border border-secondary/40">
								<Star className="h-6 w-6 text-secondary stroke-[2.5]" />
							</div>
							<CardTitle className="text-xl font-serif-display text-[oklch(0.2_0.03_145)]">
								Smart Ratings
							</CardTitle>
							<CardDescription className="font-serif-elegant text-[oklch(0.35_0.03_145)]">
								Filter by ratings, reviews, and price range to find your perfect
								match
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.95_0.012_75)] shadow-md relative overflow-hidden">
						<div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_70_/_0.1)_8px,oklch(0.85_0.02_70_/_0.1)_9px)]" />
						<CardHeader className="relative z-10">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40">
								<Sparkles className="h-6 w-6 text-primary stroke-[2.5]" />
							</div>
							<CardTitle className="text-xl font-serif-display text-[oklch(0.2_0.03_145)]">
								Premium Experience
							</CardTitle>
							<CardDescription className="font-serif-elegant text-[oklch(0.35_0.03_145)]">
								Discover curated dining experiences with detailed information
								and reviews
							</CardDescription>
						</CardHeader>
					</Card>
				</div>

				{/* Stats Section */}
				<div className="mt-16 rounded-sm border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.97_0.012_75)] to-[oklch(0.94_0.015_70)] p-10 shadow-ornate relative overflow-hidden">
					{/* Ornate corner decorations */}
					<div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/40" />
					<div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/40" />
					<div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/40" />
					<div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/40" />

					{/* Subtle texture */}
					<div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,oklch(0.85_0.02_70_/_0.15)_2px,oklch(0.85_0.02_70_/_0.15)_3px)]" />

					<div className="grid gap-8 md:grid-cols-4 relative z-10">
						<div className="text-center">
							<p className="text-5xl font-serif-display text-primary drop-shadow-[0_2px_8px_oklch(0.65_0.12_70_/_0.3)]">
								195
							</p>
							<p className="mt-3 text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wide">
								Countries Covered
							</p>
						</div>
						<div className="text-center">
							<p className="text-5xl font-serif-display text-secondary drop-shadow-[0_2px_8px_oklch(0.45_0.08_35_/_0.3)]">
								1000+
							</p>
							<p className="mt-3 text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wide">
								Cities Available
							</p>
						</div>
						<div className="text-center">
							<p className="text-5xl font-serif-display text-primary drop-shadow-[0_2px_8px_oklch(0.65_0.12_70_/_0.3)]">
								50K+
							</p>
							<p className="mt-3 text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wide">
								Restaurant Listings
							</p>
						</div>
						<div className="text-center">
							<p className="text-5xl font-serif-display text-secondary drop-shadow-[0_2px_8px_oklch(0.45_0.08_35_/_0.3)]">
								4.8★
							</p>
							<p className="mt-3 text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wide">
								Average Rating
							</p>
						</div>
					</div>
				</div>

				{/* Used By Section - Footer */}
				<div className="mt-20 pt-16 border-t-2 border-primary/20">
					<div className="text-center mb-10">
						<h2 className="text-3xl font-serif-display text-[oklch(0.2_0.03_145)] mb-3">
							Used by High-Profile Companies
						</h2>
						<p className="text-base font-serif-elegant text-[oklch(0.4_0.03_145)]">
							Trusted by leading organizations worldwide for premium dining
							experiences
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{/* Company Logo 1 */}
						<div className="rounded-sm border-2 border-primary/20 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_75)] p-8 flex items-center justify-center hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_70_/_0.1)_8px,oklch(0.85_0.02_70_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wider relative z-10">
								LUXE HOTELS
							</span>
						</div>

						{/* Company Logo 2 */}
						<div className="rounded-sm border-2 border-secondary/20 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_70)] p-8 flex items-center justify-center hover:border-secondary/40 hover:shadow-lg transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_60_/_0.1)_8px,oklch(0.85_0.02_60_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wider relative z-10">
								GRAND RESORTS
							</span>
						</div>

						{/* Company Logo 3 */}
						<div className="rounded-sm border-2 border-primary/20 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_75)] p-8 flex items-center justify-center hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_70_/_0.1)_8px,oklch(0.85_0.02_70_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wider relative z-10">
								PLATINUM TRAVEL
							</span>
						</div>

						{/* Company Logo 4 */}
						<div className="rounded-sm border-2 border-secondary/20 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_70)] p-8 flex items-center justify-center hover:border-secondary/40 hover:shadow-lg transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_60_/_0.1)_8px,oklch(0.85_0.02_60_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wider relative z-10">
								ELITE CONCIERGE
							</span>
						</div>

						{/* Company Logo 5 */}
						<div className="rounded-sm border-2 border-primary/20 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_75)] p-8 flex items-center justify-center hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_70_/_0.1)_8px,oklch(0.85_0.02_70_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wider relative z-10">
								PREMIER CORP
							</span>
						</div>

						{/* Company Logo 6 */}
						<div className="rounded-sm border-2 border-secondary/20 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_70)] p-8 flex items-center justify-center hover:border-secondary/40 hover:shadow-lg transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_60_/_0.1)_8px,oklch(0.85_0.02_60_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wider relative z-10">
								VISTA GROUP
							</span>
						</div>

						{/* Company Logo 7 */}
						<div className="rounded-sm border-2 border-primary/20 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_75)] p-8 flex items-center justify-center hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_70_/_0.1)_8px,oklch(0.85_0.02_70_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wider relative z-10">
								ROYAL EVENTS
							</span>
						</div>

						{/* Company Logo 8 */}
						<div className="rounded-sm border-2 border-secondary/20 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_70)] p-8 flex items-center justify-center hover:border-secondary/40 hover:shadow-lg transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.85_0.02_60_/_0.1)_8px,oklch(0.85_0.02_60_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wider relative z-10">
								ZENITH CO
							</span>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
