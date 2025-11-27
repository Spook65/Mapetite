import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
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
	const navigate = useNavigate();

	const handleCityCardClick = (cityName: string) => {
		// Navigate to restaurants page with city as search parameter
		navigate({
			to: "/restaurants",
			search: { city: cityName },
		});
	};

	return (
		<Layout>
			<div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
				{/* Hero Section */}
				<div className="mb-8 md:mb-16 text-center">
					<div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-sm border-2 border-primary/60 bg-gradient-to-r from-primary/25 to-secondary/20 px-4 md:px-5 py-2 md:py-2.5 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)]">
						<Sparkles className="h-3 md:h-4 w-3 md:w-4 text-primary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.8)]" />
						<span className="text-xs md:text-sm font-serif-elegant tracking-wider text-white uppercase drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.5)]">
							Premium Dining Discovery
						</span>
					</div>
					<h1 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif-display tracking-tight text-[oklch(0.14_0.04_250)]">
						Discover Your Next
						<br />
						<span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent drop-shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)]">
							Culinary Adventure
						</span>
					</h1>
					<p className="mx-auto mb-6 md:mb-8 max-w-2xl text-base md:text-xl font-serif-elegant leading-relaxed text-[oklch(0.18_0.035_250)] px-4">
						Explore world-class restaurants across the globe. Find the perfect
						dining experience with our premium search and discovery platform.
					</p>
				</div>

				{/* Trust Banner - Trusted by Leading Culinary Experts - Floating Light Module */}
				<div className="mb-8 md:mb-16">
					<div className="mx-auto max-w-5xl rounded-sm border-2 border-primary/30 bg-card px-4 md:px-8 py-6 md:py-8 shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.2),0_8px_24px_black] relative overflow-hidden">
						{/* Subtle glowing border effect */}
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,oklch(0.55_0.18_240_/_0.3)_2px,oklch(0.55_0.18_240_/_0.3)_3px)]" />

						<div className="relative z-10">
							<p className="mb-4 md:mb-6 text-center text-xs md:text-sm font-serif-elegant tracking-widest text-card-foreground/70 uppercase">
								Trusted by Leading Culinary Experts
							</p>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 items-center">
								{/* Logo Placeholder 1 */}
								<div className="w-full h-16 rounded-sm border border-primary/30 bg-[oklch(0.96_0.008_250)] flex items-center justify-center group hover:border-primary/60 transition-all hover:shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)]">
									<span className="text-xs font-serif-elegant text-card-foreground tracking-wider text-center">
										CHEF CO
									</span>
								</div>
								{/* Logo Placeholder 2 */}
								<div className="w-full h-16 rounded-sm border border-secondary/30 bg-[oklch(0.96_0.008_250)] flex items-center justify-center group hover:border-secondary/60 transition-all hover:shadow-[0_0_15px_oklch(0.65_0.14_195_/_0.3)]">
									<span className="text-xs font-serif-elegant text-card-foreground tracking-wider text-center">
										GASTRO GUILD
									</span>
								</div>
								{/* Logo Placeholder 3 */}
								<div className="w-full h-16 rounded-sm border border-primary/30 bg-[oklch(0.96_0.008_250)] flex items-center justify-center group hover:border-primary/60 transition-all hover:shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)]">
									<span className="text-xs font-serif-elegant text-card-foreground tracking-wider text-center">
										CULINARY ARTS
									</span>
								</div>
								{/* Logo Placeholder 4 */}
								<div className="w-full h-16 rounded-sm border border-secondary/30 bg-[oklch(0.96_0.008_250)] flex items-center justify-center group hover:border-secondary/60 transition-all hover:shadow-[0_0_15px_oklch(0.65_0.14_195_/_0.3)]">
									<span className="text-xs font-serif-elegant text-card-foreground tracking-wider text-center">
										EPICURE
									</span>
								</div>
								{/* Logo Placeholder 5 */}
								<div className="w-full h-16 rounded-sm border border-primary/30 bg-[oklch(0.96_0.008_250)] flex items-center justify-center group hover:border-primary/60 transition-all hover:shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)]">
									<span className="text-xs font-serif-elegant text-card-foreground tracking-wider text-center">
										FINE DINE
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main CTA Card - Restaurant Search - Floating Light Module */}
				<div className="mx-auto mb-8 md:mb-16 max-w-4xl">
					<Link to="/restaurants" className="cursor-pointer">
						<Card className="group cursor-pointer border-2 border-primary/40 bg-card transition-all hover:border-primary hover:shadow-[0_0_40px_oklch(0.55_0.18_240_/_0.4),0_12px_32px_black] shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.25),0_8px_24px_black] relative overflow-hidden">
							{/* Glowing texture overlay */}
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0.55_0.18_240_/_0.2)_10px,oklch(0.55_0.18_240_/_0.2)_11px)]" />

							<CardHeader className="pb-4 relative z-10">
								<div className="mb-4 flex items-center justify-between">
									<div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-sm bg-gradient-to-br from-primary via-secondary to-primary shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.5)] border-2 border-primary/50">
										<Utensils className="h-6 w-6 md:h-8 md:w-8 text-white stroke-[2.5] drop-shadow-[0_0_8px_white]" />
									</div>
									<ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-primary transition-transform group-hover:translate-x-2 stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.6)]" />
								</div>
								<CardTitle className="text-2xl md:text-3xl font-serif-display text-card-foreground">
									Restaurant Search
								</CardTitle>
								<CardDescription className="text-sm md:text-base font-serif-elegant text-card-foreground/70">
									Find amazing restaurants by location, cuisine, and more
								</CardDescription>
							</CardHeader>
							<CardContent className="relative z-10">
								<div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
									<div className="flex items-center gap-3 rounded-sm border border-primary/30 bg-[oklch(0.96_0.008_250)] p-4 shadow-sm">
										<MapPin className="h-5 w-5 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.4)]" />
										<div>
											<p className="text-sm font-serif-elegant font-semibold text-card-foreground">
												195 Countries
											</p>
											<p className="text-xs font-serif-elegant text-card-foreground/60">
												Global coverage
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3 rounded-sm border border-secondary/30 bg-[oklch(0.96_0.008_250)] p-4 shadow-sm">
										<Search className="h-5 w-5 text-secondary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.4)]" />
										<div>
											<p className="text-sm font-serif-elegant font-semibold text-card-foreground">
												Smart Filters
											</p>
											<p className="text-xs font-serif-elegant text-card-foreground/60">
												Advanced search
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3 rounded-sm border border-primary/30 bg-[oklch(0.96_0.008_250)] p-4 shadow-sm">
										<Star className="h-5 w-5 text-primary stroke-[2.5] drop-shadow-[0_0_6px_oklch(0.55_0.18_240_/_0.4)]" />
										<div>
											<p className="text-sm font-serif-elegant font-semibold text-card-foreground">
												Top Rated
											</p>
											<p className="text-xs font-serif-elegant text-card-foreground/60">
												Curated picks
											</p>
										</div>
									</div>
								</div>
								<div className="mt-6">
									<Button
										size="lg"
										className="w-full cursor-pointer bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.5)] hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.7)] border-2 border-primary/60 font-serif-elegant text-base tracking-wide transition-all hover:scale-[1.02]"
									>
										Start Exploring
										<ArrowRight className="ml-2 h-5 w-5 stroke-[2.5]" />
									</Button>
								</div>
							</CardContent>
						</Card>
					</Link>
				</div>

				{/* Features Grid - Floating Light Modules */}
				<div className="grid gap-6 md:grid-cols-3">
					<Card className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.2),0_6px_20px_black] hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.3),0_8px_24px_black] transition-all relative overflow-hidden">
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.15)_8px,oklch(0.55_0.18_240_/_0.15)_9px)]" />
						<CardHeader className="relative z-10">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary/50 shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)]">
								<MapPin className="h-6 w-6 text-primary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.6)]" />
							</div>
							<CardTitle className="text-xl font-serif-display text-card-foreground">
								Global Search
							</CardTitle>
							<CardDescription className="font-serif-elegant text-card-foreground/70">
								Search restaurants across 195 countries with detailed location
								filtering
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-2 border-secondary/40 bg-card shadow-[0_0_25px_oklch(0.65_0.14_195_/_0.2),0_6px_20px_black] hover:shadow-[0_0_35px_oklch(0.65_0.14_195_/_0.3),0_8px_24px_black] transition-all relative overflow-hidden">
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.65_0.14_195_/_0.15)_8px,oklch(0.65_0.14_195_/_0.15)_9px)]" />
						<CardHeader className="relative z-10">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br from-secondary/40 to-secondary/20 border-2 border-secondary/50 shadow-[0_0_15px_oklch(0.65_0.14_195_/_0.4)]">
								<Star className="h-6 w-6 text-secondary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.6)]" />
							</div>
							<CardTitle className="text-xl font-serif-display text-card-foreground">
								Smart Ratings
							</CardTitle>
							<CardDescription className="font-serif-elegant text-card-foreground/70">
								Filter by ratings, reviews, and price range to find your perfect
								match
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.2),0_6px_20px_black] hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.3),0_8px_24px_black] transition-all relative overflow-hidden">
						<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.15)_8px,oklch(0.55_0.18_240_/_0.15)_9px)]" />
						<CardHeader className="relative z-10">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary/50 shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)]">
								<Sparkles className="h-6 w-6 text-primary stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.6)]" />
							</div>
							<CardTitle className="text-xl font-serif-display text-card-foreground">
								Premium Experience
							</CardTitle>
							<CardDescription className="font-serif-elegant text-card-foreground/70">
								Discover curated dining experiences with detailed information
								and reviews
							</CardDescription>
						</CardHeader>
					</Card>
				</div>

				{/* Stats Section - Floating Light Module */}
				<div className="mt-8 md:mt-12 rounded-sm border-2 border-primary/40 bg-card p-4 md:p-6 shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.25),0_8px_24px_black] relative overflow-hidden">
					{/* Glowing ornate corner decorations */}
					<div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/60 shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.4)]" />
					<div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-secondary/60 shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.4)]" />
					<div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-secondary/60 shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.4)]" />
					<div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/60 shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.4)]" />

					{/* Subtle glowing texture */}
					<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,oklch(0.55_0.18_240_/_0.2)_2px,oklch(0.55_0.18_240_/_0.2)_3px)]" />

					<div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4 relative z-10">
						<div className="text-center">
							<p className="text-3xl md:text-4xl lg:text-5xl font-serif-display text-primary drop-shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.5)]">
								195
							</p>
							<p className="mt-1 md:mt-2 text-xs md:text-sm font-serif-elegant text-card-foreground/70 tracking-wide">
								Countries Covered
							</p>
						</div>
						<div className="text-center">
							<p className="text-3xl md:text-4xl lg:text-5xl font-serif-display text-secondary drop-shadow-[0_0_15px_oklch(0.65_0.14_195_/_0.5)]">
								1000+
							</p>
							<p className="mt-1 md:mt-2 text-xs md:text-sm font-serif-elegant text-card-foreground/70 tracking-wide">
								Cities Available
							</p>
						</div>
						<div className="text-center">
							<p className="text-3xl md:text-4xl lg:text-5xl font-serif-display text-primary drop-shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.5)]">
								50K+
							</p>
							<p className="mt-1 md:mt-2 text-xs md:text-sm font-serif-elegant text-card-foreground/70 tracking-wide">
								Restaurant Listings
							</p>
						</div>
						<div className="text-center">
							<p className="text-3xl md:text-4xl lg:text-5xl font-serif-display text-secondary drop-shadow-[0_0_15px_oklch(0.65_0.14_195_/_0.5)]">
								4.8★
							</p>
							<p className="mt-1 md:mt-2 text-xs md:text-sm font-serif-elegant text-card-foreground/70 tracking-wide">
								Average Rating
							</p>
						</div>
					</div>
				</div>

				{/* Explore Trending Destinations Section */}
				<div className="mt-8 md:mt-12">
					<div className="mb-4 md:mb-6 text-center px-4">
						<h2 className="text-2xl md:text-3xl lg:text-4xl font-serif-display text-[oklch(0.18_0.035_250)] mb-1 md:mb-2">
							Curator's Picks
						</h2>
						<p className="text-sm md:text-base font-serif-elegant text-[oklch(0.22_0.03_250)] max-w-2xl mx-auto">
							Explore world-class dining destinations handpicked by our culinary
							experts
						</p>
					</div>

					{/* Horizontal Scrollable Container */}
					<div className="relative">
						<div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 md:mx-0 px-4 md:px-0">
							<div className="flex gap-4 md:gap-6 px-2 min-w-max">
								{/* Paris Card */}
								<div
									className="group cursor-pointer w-72 md:w-80 flex-shrink-0"
									onClick={() => handleCityCardClick("Paris")}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											handleCityCardClick("Paris");
										}
									}}
									// biome-ignore lint/a11y/useSemanticElements: Complex card component with custom styling not suitable for semantic button
									role="button"
									tabIndex={0}
								>
									<div className="relative overflow-hidden rounded-sm border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.2),0_6px_20px_black] transition-all duration-300 hover:border-primary hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.4),0_8px_24px_black] hover:scale-[1.02]">
										{/* Background Image with Dark Overlay */}
										<div className="relative h-64 overflow-hidden">
											{/* Background Image */}
											<div
												className="absolute inset-0 bg-cover bg-center"
												style={{
													backgroundImage:
														"url('http://googleusercontent.com/image_collection/image_retrieval/1330806874776151130_0')",
												}}
											/>

											{/* Dark Overlay - Deep Midnight Navy/Black */}
											<div className="absolute inset-0 bg-[oklch(0.14_0.04_250)]/60" />

											{/* Elegant overlay on hover */}
											<div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.04_250)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* City name overlay */}
											<div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
												<h3 className="text-3xl font-serif-display text-white drop-shadow-[0_0_10px_black]">
													Paris
												</h3>
												<p className="text-sm font-serif-elegant text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
													The City of Light
												</p>
											</div>

											{/* Decorative glowing corner accents */}
											<div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary/70 shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											<div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-secondary/70 shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>

										{/* Card Footer - Light Cream */}
										<div className="p-5 bg-card border-t border-primary/20">
											<div className="flex items-center justify-between">
												<span className="text-sm font-serif-elegant text-card-foreground">
													125+ Restaurants
												</span>
												<ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
											</div>
										</div>
									</div>
								</div>

								{/* Tokyo Card */}
								<div
									className="group cursor-pointer w-72 md:w-80 flex-shrink-0"
									onClick={() => handleCityCardClick("Tokyo")}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											handleCityCardClick("Tokyo");
										}
									}}
									// biome-ignore lint/a11y/useSemanticElements: Complex card component with custom styling not suitable for semantic button
									role="button"
									tabIndex={0}
								>
									<div className="relative overflow-hidden rounded-sm border-2 border-secondary/40 bg-card shadow-[0_0_25px_oklch(0.65_0.14_195_/_0.2),0_6px_20px_black] transition-all duration-300 hover:border-secondary hover:shadow-[0_0_35px_oklch(0.65_0.14_195_/_0.4),0_8px_24px_black] hover:scale-[1.02]">
										{/* Background Image with Dark Overlay */}
										<div className="relative h-64 overflow-hidden">
											{/* Background Image */}
											<div
												className="absolute inset-0 bg-cover bg-center"
												style={{
													backgroundImage:
														"url('http://googleusercontent.com/image_collection/image_retrieval/580180491417338745_0')",
												}}
											/>

											{/* Dark Overlay - Deep Midnight Navy/Black */}
											<div className="absolute inset-0 bg-[oklch(0.14_0.04_250)]/60" />

											{/* Elegant overlay on hover */}
											<div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.04_250)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* City name overlay */}
											<div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
												<h3 className="text-3xl font-serif-display text-white drop-shadow-[0_0_10px_black]">
													Tokyo
												</h3>
												<p className="text-sm font-serif-elegant text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
													Culinary Innovation
												</p>
											</div>

											{/* Decorative glowing corner accents */}
											<div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-secondary/70 shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											<div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary/70 shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>

										{/* Card Footer - Light Cream */}
										<div className="p-5 bg-card border-t border-secondary/20">
											<div className="flex items-center justify-between">
												<span className="text-sm font-serif-elegant text-card-foreground">
													200+ Restaurants
												</span>
												<ArrowRight className="h-5 w-5 text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]" />
											</div>
										</div>
									</div>
								</div>

								{/* London Card */}
								<div
									className="group cursor-pointer w-72 md:w-80 flex-shrink-0"
									onClick={() => handleCityCardClick("London")}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											handleCityCardClick("London");
										}
									}}
									// biome-ignore lint/a11y/useSemanticElements: Complex card component with custom styling not suitable for semantic button
									role="button"
									tabIndex={0}
								>
									<div className="relative overflow-hidden rounded-sm border-2 border-primary/40 bg-card shadow-[0_0_25px_oklch(0.55_0.18_240_/_0.2),0_6px_20px_black] transition-all duration-300 hover:border-primary hover:shadow-[0_0_35px_oklch(0.55_0.18_240_/_0.4),0_8px_24px_black] hover:scale-[1.02]">
										{/* Background Image with Dark Overlay */}
										<div className="relative h-64 overflow-hidden">
											{/* Placeholder Background Image */}
											<div
												className="absolute inset-0 bg-cover bg-center"
												style={{
													backgroundImage:
														"url('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop')",
												}}
											/>

											{/* Dark Overlay - Deep Midnight Navy/Black */}
											<div className="absolute inset-0 bg-[oklch(0.14_0.04_250)]/60" />

											{/* Elegant overlay on hover */}
											<div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.04_250)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* City name overlay */}
											<div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
												<h3 className="text-3xl font-serif-display text-white drop-shadow-[0_0_10px_black]">
													London
												</h3>
												<p className="text-sm font-serif-elegant text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
													Historic Elegance
												</p>
											</div>

											{/* Decorative glowing corner accents */}
											<div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary/70 shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											<div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-secondary/70 shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>

										{/* Card Footer - Light Cream */}
										<div className="p-5 bg-card border-t border-primary/20">
											<div className="flex items-center justify-between">
												<span className="text-sm font-serif-elegant text-card-foreground">
													180+ Restaurants
												</span>
												<ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
											</div>
										</div>
									</div>
								</div>

								{/* Dubai Card */}
								<div
									className="group cursor-pointer w-72 md:w-80 flex-shrink-0"
									onClick={() => handleCityCardClick("Dubai")}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											handleCityCardClick("Dubai");
										}
									}}
									// biome-ignore lint/a11y/useSemanticElements: Complex card component with custom styling not suitable for semantic button
									role="button"
									tabIndex={0}
								>
									<div className="relative overflow-hidden rounded-sm border-2 border-secondary/40 bg-card shadow-[0_0_25px_oklch(0.65_0.14_195_/_0.2),0_6px_20px_black] transition-all duration-300 hover:border-secondary hover:shadow-[0_0_35px_oklch(0.65_0.14_195_/_0.4),0_8px_24px_black] hover:scale-[1.02]">
										{/* Background Image with Dark Overlay */}
										<div className="relative h-64 overflow-hidden">
											{/* Placeholder Background Image */}
											<div
												className="absolute inset-0 bg-cover bg-center"
												style={{
													backgroundImage:
														"url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop')",
												}}
											/>

											{/* Dark Overlay - Deep Midnight Navy/Black */}
											<div className="absolute inset-0 bg-[oklch(0.14_0.04_250)]/60" />

											{/* Elegant overlay on hover */}
											<div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.04_250)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* City name overlay */}
											<div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
												<h3 className="text-3xl font-serif-display text-white drop-shadow-[0_0_10px_black]">
													Dubai
												</h3>
												<p className="text-sm font-serif-elegant text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
													Modern Luxury
												</p>
											</div>

											{/* Decorative glowing corner accents */}
											<div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-secondary/70 shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											<div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary/70 shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>

										{/* Card Footer - Light Cream */}
										<div className="p-5 bg-card border-t border-secondary/20">
											<div className="flex items-center justify-between">
												<span className="text-sm font-serif-elegant text-card-foreground">
													90+ Restaurants
												</span>
												<ArrowRight className="h-5 w-5 text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]" />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Used By Section - Footer */}
				<div className="mt-12 md:mt-20 pt-8 md:pt-16 border-t-2 border-primary/30">
					<div className="text-center mb-6 md:mb-10 px-4">
						<h2 className="text-2xl md:text-3xl font-serif-display text-white mb-2 md:mb-3 drop-shadow-[0_0_12px_oklch(0.55_0.18_240_/_0.3)]">
							Used by High-Profile Companies
						</h2>
						<p className="text-sm md:text-base font-serif-elegant text-white/80">
							Trusted by leading organizations worldwide for premium dining
							experiences
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
						{/* Company Logo 1 */}
						<div className="rounded-sm border-2 border-primary/30 bg-card p-8 flex items-center justify-center hover:border-primary/60 hover:shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.3)] transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.1)_8px,oklch(0.55_0.18_240_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-card-foreground tracking-wider relative z-10">
								LUXE HOTELS
							</span>
						</div>

						{/* Company Logo 2 */}
						<div className="rounded-sm border-2 border-secondary/30 bg-card p-8 flex items-center justify-center hover:border-secondary/60 hover:shadow-[0_0_20px_oklch(0.65_0.14_195_/_0.3)] transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.65_0.14_195_/_0.1)_8px,oklch(0.65_0.14_195_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-card-foreground tracking-wider relative z-10">
								GRAND RESORTS
							</span>
						</div>

						{/* Company Logo 3 */}
						<div className="rounded-sm border-2 border-primary/30 bg-card p-8 flex items-center justify-center hover:border-primary/60 hover:shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.3)] transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.1)_8px,oklch(0.55_0.18_240_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-card-foreground tracking-wider relative z-10">
								PLATINUM TRAVEL
							</span>
						</div>

						{/* Company Logo 4 */}
						<div className="rounded-sm border-2 border-secondary/30 bg-card p-8 flex items-center justify-center hover:border-secondary/60 hover:shadow-[0_0_20px_oklch(0.65_0.14_195_/_0.3)] transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.65_0.14_195_/_0.1)_8px,oklch(0.65_0.14_195_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-card-foreground tracking-wider relative z-10">
								ELITE CONCIERGE
							</span>
						</div>

						{/* Company Logo 5 */}
						<div className="rounded-sm border-2 border-primary/30 bg-card p-8 flex items-center justify-center hover:border-primary/60 hover:shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.3)] transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.1)_8px,oklch(0.55_0.18_240_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-card-foreground tracking-wider relative z-10">
								PREMIER CORP
							</span>
						</div>

						{/* Company Logo 6 */}
						<div className="rounded-sm border-2 border-secondary/30 bg-card p-8 flex items-center justify-center hover:border-secondary/60 hover:shadow-[0_0_20px_oklch(0.65_0.14_195_/_0.3)] transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.65_0.14_195_/_0.1)_8px,oklch(0.65_0.14_195_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-card-foreground tracking-wider relative z-10">
								VISTA GROUP
							</span>
						</div>

						{/* Company Logo 7 */}
						<div className="rounded-sm border-2 border-primary/30 bg-card p-8 flex items-center justify-center hover:border-primary/60 hover:shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.3)] transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.55_0.18_240_/_0.1)_8px,oklch(0.55_0.18_240_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-card-foreground tracking-wider relative z-10">
								ROYAL EVENTS
							</span>
						</div>

						{/* Company Logo 8 */}
						<div className="rounded-sm border-2 border-secondary/30 bg-card p-8 flex items-center justify-center hover:border-secondary/60 hover:shadow-[0_0_20px_oklch(0.65_0.14_195_/_0.3)] transition-all group relative overflow-hidden">
							<div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,oklch(0.65_0.14_195_/_0.1)_8px,oklch(0.65_0.14_195_/_0.1)_9px)]" />
							<span className="text-sm font-serif-elegant text-card-foreground tracking-wider relative z-10">
								ZENITH CO
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Professional Footer - Deep Midnight Navy with Glowing Accents */}
			<footer className="relative mt-16 md:mt-24 bg-gradient-to-b from-[oklch(0.14_0.04_250)] to-[oklch(0.10_0.045_250)] border-t-2 border-primary/40 shadow-[0_-4px_30px_oklch(0.55_0.18_240_/_0.15)]">
				<div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-10">
						{/* Company Info */}
						<div className="space-y-5">
							<h3 className="text-xl font-serif-display text-white tracking-wide drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.3)]">
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
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href="#our-story"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Our Story
									</a>
								</li>
								<li>
									<a
										href="#team"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
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
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Privacy Policy
									</a>
								</li>
								<li>
									<a
										href="#terms-of-service"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Terms of Service
									</a>
								</li>
								<li>
									<a
										href="#cookies"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
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
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										info@mapetite.com
									</a>
								</li>
								<li>
									<a
										href="#support"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Support Center
									</a>
								</li>
								<li>
									<a
										href="#contact-us"
										className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
									>
										Contact Us
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t-2 border-primary/30">
						<div className="flex flex-col md:flex-row justify-between items-center gap-4">
							<p className="text-sm font-serif-elegant text-white/90">
								© 2024 Mapetite. All rights reserved.
							</p>
							<div className="flex gap-6">
								<a
									href="#facebook"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
								>
									Facebook
								</a>
								<a
									href="#twitter"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
								>
									Twitter
								</a>
								<a
									href="#instagram"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
								>
									Instagram
								</a>
								<a
									href="#linkedin"
									className="text-sm font-serif-elegant text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)] transition-all cursor-pointer"
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
