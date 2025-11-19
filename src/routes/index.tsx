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
			<div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
				{/* Hero Section */}
				<div className="mb-8 md:mb-16 text-center">
					<div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-sm border-2 border-primary/40 bg-gradient-to-r from-primary/15 to-secondary/10 px-4 md:px-5 py-2 md:py-2.5 shadow-md">
						<Sparkles className="h-3 md:h-4 w-3 md:w-4 text-primary stroke-[2.5]" />
						<span className="text-xs md:text-sm font-serif-elegant tracking-wider text-primary uppercase">
							Premium Dining Discovery
						</span>
					</div>
					<h1 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif-display tracking-tight text-[oklch(0.2_0.03_145)]">
						Discover Your Next
						<br />
						<span className="bg-gradient-to-r from-primary via-[oklch(0.6_0.1_60)] to-secondary bg-clip-text text-transparent">
							Culinary Adventure
						</span>
					</h1>
					<p className="mx-auto mb-6 md:mb-8 max-w-2xl text-base md:text-xl font-serif-elegant leading-relaxed text-[oklch(0.35_0.03_145)] px-4">
						Explore world-class restaurants across the globe. Find the perfect
						dining experience with our premium search and discovery platform.
					</p>
				</div>

				{/* Trust Banner - Trusted by Leading Culinary Experts */}
				<div className="mb-8 md:mb-16">
					<div className="mx-auto max-w-5xl rounded-sm border-2 border-primary/20 bg-gradient-to-br from-[oklch(0.97_0.012_75)] to-[oklch(0.95_0.015_70)] px-4 md:px-8 py-6 md:py-8 shadow-md relative overflow-hidden">
						{/* Subtle texture overlay */}
						<div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,oklch(0.85_0.02_70_/_0.1)_2px,oklch(0.85_0.02_70_/_0.1)_3px)]" />

						<div className="relative z-10">
							<p className="mb-4 md:mb-6 text-center text-xs md:text-sm font-serif-elegant tracking-widest text-[oklch(0.4_0.03_145)] uppercase">
								Trusted by Leading Culinary Experts
							</p>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 items-center">
								{/* Logo Placeholder 1 */}
								<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
									<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider text-center">
										CHEF CO
									</span>
								</div>
								{/* Logo Placeholder 2 */}
								<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
									<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider text-center">
										GASTRO GUILD
									</span>
								</div>
								{/* Logo Placeholder 3 */}
								<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
									<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider text-center">
										CULINARY ARTS
									</span>
								</div>
								{/* Logo Placeholder 4 */}
								<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
									<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider text-center">
										EPICURE
									</span>
								</div>
								{/* Logo Placeholder 5 */}
								<div className="w-full h-16 rounded-sm border border-primary/20 bg-[oklch(0.96_0.01_75)] flex items-center justify-center group hover:border-primary/40 transition-all hover:shadow-md">
									<span className="text-xs font-serif-elegant text-[oklch(0.45_0.03_145)] tracking-wider text-center">
										FINE DINE
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main CTA Card - Restaurant Search */}
				<div className="mx-auto mb-8 md:mb-16 max-w-4xl">
					<Link to="/restaurants" className="cursor-pointer">
						<Card className="group cursor-pointer border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.98_0.01_75)] via-[oklch(0.96_0.012_75)] to-[oklch(0.94_0.015_70)] transition-all hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/20 shadow-ornate relative overflow-hidden">
							{/* Subtle texture overlay */}
							<div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.85_0.02_70_/_0.1)_10px,oklch(0.85_0.02_70_/_0.1)_11px)]" />

							<CardHeader className="pb-4 relative z-10">
								<div className="mb-4 flex items-center justify-between">
									<div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-sm bg-gradient-to-br from-primary via-[oklch(0.6_0.1_60)] to-secondary shadow-lg border-2 border-primary/40">
										<Utensils className="h-6 w-6 md:h-8 md:w-8 text-[oklch(0.16_0.02_145)] stroke-[2.5]" />
									</div>
									<ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-primary transition-transform group-hover:translate-x-2 stroke-[2.5]" />
								</div>
								<CardTitle className="text-2xl md:text-3xl font-serif-display text-[oklch(0.2_0.03_145)]">
									Restaurant Search
								</CardTitle>
								<CardDescription className="text-sm md:text-base font-serif-elegant text-[oklch(0.35_0.03_145)]">
									Find amazing restaurants by location, cuisine, and more
								</CardDescription>
							</CardHeader>
							<CardContent className="relative z-10">
								<div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
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
										className="w-full cursor-pointer bg-gradient-to-r from-primary via-[oklch(0.6_0.1_60)] to-secondary text-[oklch(0.16_0.02_145)] shadow-lg shadow-primary/30 hover:shadow-primary/50 border-2 border-primary/40 font-serif-elegant text-base tracking-wide transition-all hover:scale-[1.02]"
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
				<div className="mt-8 md:mt-16 rounded-sm border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.97_0.012_75)] to-[oklch(0.94_0.015_70)] p-6 md:p-10 shadow-ornate relative overflow-hidden">
					{/* Ornate corner decorations */}
					<div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/40" />
					<div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/40" />
					<div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/40" />
					<div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/40" />

					{/* Subtle texture */}
					<div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,oklch(0.85_0.02_70_/_0.15)_2px,oklch(0.85_0.02_70_/_0.15)_3px)]" />

					<div className="grid gap-6 md:gap-8 grid-cols-2 md:grid-cols-4 relative z-10">
						<div className="text-center">
							<p className="text-3xl md:text-4xl lg:text-5xl font-serif-display text-primary drop-shadow-[0_2px_8px_oklch(0.65_0.12_70_/_0.3)]">
								195
							</p>
							<p className="mt-2 md:mt-3 text-xs md:text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wide">
								Countries Covered
							</p>
						</div>
						<div className="text-center">
							<p className="text-3xl md:text-4xl lg:text-5xl font-serif-display text-secondary drop-shadow-[0_2px_8px_oklch(0.45_0.08_35_/_0.3)]">
								1000+
							</p>
							<p className="mt-2 md:mt-3 text-xs md:text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wide">
								Cities Available
							</p>
						</div>
						<div className="text-center">
							<p className="text-3xl md:text-4xl lg:text-5xl font-serif-display text-primary drop-shadow-[0_2px_8px_oklch(0.65_0.12_70_/_0.3)]">
								50K+
							</p>
							<p className="mt-2 md:mt-3 text-xs md:text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wide">
								Restaurant Listings
							</p>
						</div>
						<div className="text-center">
							<p className="text-3xl md:text-4xl lg:text-5xl font-serif-display text-secondary drop-shadow-[0_2px_8px_oklch(0.45_0.08_35_/_0.3)]">
								4.8★
							</p>
							<p className="mt-2 md:mt-3 text-xs md:text-sm font-serif-elegant text-[oklch(0.35_0.03_145)] tracking-wide">
								Average Rating
							</p>
						</div>
					</div>
				</div>

				{/* Explore Trending Destinations Section */}
				<div className="mt-12 md:mt-20">
					<div className="mb-6 md:mb-8 text-center px-4">
						<h2 className="text-2xl md:text-3xl lg:text-4xl font-serif-display text-[oklch(0.2_0.03_145)] mb-2 md:mb-3">
							Curator's Picks
						</h2>
						<p className="text-sm md:text-base font-serif-elegant text-[oklch(0.4_0.03_145)] max-w-2xl mx-auto">
							Explore world-class dining destinations handpicked by our culinary
							experts
						</p>
					</div>

					{/* Horizontal Scrollable Container */}
					<div className="relative">
						{/* Gradient fade on edges - Hidden on mobile for better scroll UX */}
						<div className="hidden md:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[oklch(0.94_0.015_75)] to-transparent z-10 pointer-events-none" />
						<div className="hidden md:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[oklch(0.94_0.015_75)] to-transparent z-10 pointer-events-none" />

						<div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 md:mx-0 px-4 md:px-0">
							<div className="flex gap-4 md:gap-6 px-2 min-w-max">
								{/* Paris Card */}
								<div className="group cursor-pointer w-72 md:w-80 flex-shrink-0">
									<div className="relative overflow-hidden rounded-sm border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.96_0.012_75)] to-[oklch(0.94_0.015_70)] shadow-md transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]">
										{/* Image Placeholder */}
										<div className="relative h-64 overflow-hidden bg-gradient-to-br from-[oklch(0.85_0.03_70)] to-[oklch(0.75_0.05_60)]">
											{/* Overlay texture */}
											<div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.65_0.08_70_/_0.15)_10px,oklch(0.65_0.08_70_/_0.15)_11px)]" />

											{/* Elegant overlay on hover */}
											<div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.02_145_/_0.6)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* City name overlay */}
											<div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
												<h3 className="text-3xl font-serif-display text-white drop-shadow-lg">
													Paris
												</h3>
												<p className="text-sm font-serif-elegant text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
													The City of Light
												</p>
											</div>

											{/* Decorative corner accents */}
											<div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											<div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>

										{/* Card Footer */}
										<div className="p-5 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_75)]">
											<div className="flex items-center justify-between">
												<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)]">
													125+ Restaurants
												</span>
												<ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 stroke-[2.5]" />
											</div>
										</div>
									</div>
								</div>

								{/* Tokyo Card */}
								<div className="group cursor-pointer w-72 md:w-80 flex-shrink-0">
									<div className="relative overflow-hidden rounded-sm border-2 border-secondary/30 bg-gradient-to-br from-[oklch(0.96_0.012_75)] to-[oklch(0.94_0.015_70)] shadow-md transition-all duration-300 hover:border-secondary hover:shadow-2xl hover:shadow-secondary/20 hover:scale-[1.02]">
										{/* Image Placeholder */}
										<div className="relative h-64 overflow-hidden bg-gradient-to-br from-[oklch(0.75_0.08_350)] to-[oklch(0.65_0.1_340)]">
											{/* Overlay texture */}
											<div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.55_0.08_350_/_0.15)_10px,oklch(0.55_0.08_350_/_0.15)_11px)]" />

											{/* Elegant overlay on hover */}
											<div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.02_145_/_0.6)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* City name overlay */}
											<div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
												<h3 className="text-3xl font-serif-display text-white drop-shadow-lg">
													Tokyo
												</h3>
												<p className="text-sm font-serif-elegant text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
													Culinary Innovation
												</p>
											</div>

											{/* Decorative corner accents */}
											<div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											<div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>

										{/* Card Footer */}
										<div className="p-5 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_75)]">
											<div className="flex items-center justify-between">
												<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)]">
													200+ Restaurants
												</span>
												<ArrowRight className="h-5 w-5 text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 stroke-[2.5]" />
											</div>
										</div>
									</div>
								</div>

								{/* London Card */}
								<div className="group cursor-pointer w-72 md:w-80 flex-shrink-0">
									<div className="relative overflow-hidden rounded-sm border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.96_0.012_75)] to-[oklch(0.94_0.015_70)] shadow-md transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]">
										{/* Image Placeholder */}
										<div className="relative h-64 overflow-hidden bg-gradient-to-br from-[oklch(0.7_0.08_120)] to-[oklch(0.6_0.1_140)]">
											{/* Overlay texture */}
											<div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.6_0.08_120_/_0.15)_10px,oklch(0.6_0.08_120_/_0.15)_11px)]" />

											{/* Elegant overlay on hover */}
											<div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.02_145_/_0.6)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* City name overlay */}
											<div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
												<h3 className="text-3xl font-serif-display text-white drop-shadow-lg">
													London
												</h3>
												<p className="text-sm font-serif-elegant text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
													Historic Elegance
												</p>
											</div>

											{/* Decorative corner accents */}
											<div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											<div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>

										{/* Card Footer */}
										<div className="p-5 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_75)]">
											<div className="flex items-center justify-between">
												<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)]">
													180+ Restaurants
												</span>
												<ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 stroke-[2.5]" />
											</div>
										</div>
									</div>
								</div>

								{/* Dubai Card */}
								<div className="group cursor-pointer w-72 md:w-80 flex-shrink-0">
									<div className="relative overflow-hidden rounded-sm border-2 border-secondary/30 bg-gradient-to-br from-[oklch(0.96_0.012_75)] to-[oklch(0.94_0.015_70)] shadow-md transition-all duration-300 hover:border-secondary hover:shadow-2xl hover:shadow-secondary/20 hover:scale-[1.02]">
										{/* Image Placeholder */}
										<div className="relative h-64 overflow-hidden bg-gradient-to-br from-[oklch(0.8_0.06_50)] to-[oklch(0.7_0.08_40)]">
											{/* Overlay texture */}
											<div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.7_0.06_50_/_0.15)_10px,oklch(0.7_0.06_50_/_0.15)_11px)]" />

											{/* Elegant overlay on hover */}
											<div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.02_145_/_0.6)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* City name overlay */}
											<div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
												<h3 className="text-3xl font-serif-display text-white drop-shadow-lg">
													Dubai
												</h3>
												<p className="text-sm font-serif-elegant text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
													Modern Luxury
												</p>
											</div>

											{/* Decorative corner accents */}
											<div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											<div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>

										{/* Card Footer */}
										<div className="p-5 bg-gradient-to-br from-[oklch(0.98_0.01_75)] to-[oklch(0.96_0.012_75)]">
											<div className="flex items-center justify-between">
												<span className="text-sm font-serif-elegant text-[oklch(0.35_0.03_145)]">
													90+ Restaurants
												</span>
												<ArrowRight className="h-5 w-5 text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 stroke-[2.5]" />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Used By Section - Footer */}
				<div className="mt-12 md:mt-20 pt-8 md:pt-16 border-t-2 border-primary/20">
					<div className="text-center mb-6 md:mb-10 px-4">
						<h2 className="text-2xl md:text-3xl font-serif-display text-[oklch(0.2_0.03_145)] mb-2 md:mb-3">
							Used by High-Profile Companies
						</h2>
						<p className="text-sm md:text-base font-serif-elegant text-[oklch(0.4_0.03_145)]">
							Trusted by leading organizations worldwide for premium dining
							experiences
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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

			{/* Professional Footer - Full Width with Muted Deep Aubergine Background */}
			<footer className="relative mt-16 md:mt-24 bg-gradient-to-b from-[oklch(0.18_0.05_310)] to-[oklch(0.12_0.04_310)] border-t-2 border-primary/30">
				<div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-10">
						{/* Company Info */}
						<div className="space-y-5">
							<h3 className="text-xl font-serif-display text-white tracking-wide">
								Mapetite
							</h3>
							<p className="text-sm font-serif-elegant text-white/90 leading-relaxed">
								Discover exquisite restaurants worldwide with our premium dining
								discovery platform.
							</p>
						</div>

						{/* About Section */}
						<div className="space-y-5">
							<h4 className="text-base font-serif-elegant text-white tracking-wide uppercase">
								About
							</h4>
							<ul className="space-y-3">
								<li>
									<a
										href="#about-us"
										className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href="#our-story"
										className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
									>
										Our Story
									</a>
								</li>
								<li>
									<a
										href="#team"
										className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
									>
										Team
									</a>
								</li>
							</ul>
						</div>

						{/* Legal Section */}
						<div className="space-y-5">
							<h4 className="text-base font-serif-elegant text-white tracking-wide uppercase">
								Legal
							</h4>
							<ul className="space-y-3">
								<li>
									<a
										href="#privacy-policy"
										className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
									>
										Privacy Policy
									</a>
								</li>
								<li>
									<a
										href="#terms-of-service"
										className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
									>
										Terms of Service
									</a>
								</li>
								<li>
									<a
										href="#cookies"
										className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
									>
										Cookie Policy
									</a>
								</li>
							</ul>
						</div>

						{/* Contact Section */}
						<div className="space-y-5">
							<h4 className="text-base font-serif-elegant text-white tracking-wide uppercase">
								Contact
							</h4>
							<ul className="space-y-3">
								<li>
									<a
										href="mailto:info@mapetite.com"
										className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
									>
										info@mapetite.com
									</a>
								</li>
								<li>
									<a
										href="#support"
										className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
									>
										Support Center
									</a>
								</li>
								<li>
									<a
										href="#contact-us"
										className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
									>
										Contact Us
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t-2 border-white/20">
						<div className="flex flex-col md:flex-row justify-between items-center gap-4">
							<p className="text-sm font-serif-elegant text-white/90">
								© 2024 Mapetite. All rights reserved.
							</p>
							<div className="flex gap-6">
								<a
									href="#facebook"
									className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
								>
									Facebook
								</a>
								<a
									href="#twitter"
									className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
								>
									Twitter
								</a>
								<a
									href="#instagram"
									className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
								>
									Instagram
								</a>
								<a
									href="#linkedin"
									className="text-sm font-serif-elegant text-[oklch(0.65_0.08_50)] hover:text-secondary transition-colors cursor-pointer"
								>
									LinkedIn
								</a>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</Layout>
	);
}
