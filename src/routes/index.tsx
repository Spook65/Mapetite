import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Utensils } from "lucide-react";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

const cityCards = [
	{
		name: "Paris",
		note: "France",
		detail: "Bistros, wine bars, tasting menus",
	},
	{
		name: "Tokyo",
		note: "Japan",
		detail: "Omakase counters, kaiseki, izakaya",
	},
	{
		name: "London",
		note: "United Kingdom",
		detail: "Dining rooms, gastropubs, chef-led menus",
	},
	{
		name: "Dubai",
		note: "UAE",
		detail: "Hotel dining, rooftops, tasting menus",
	},
];

function LandingPage() {
	const navigate = useNavigate();

	const handleCityCardClick = (cityName: string) => {
		navigate({
			to: "/restaurants",
			search: { city: cityName },
		});
	};

	return (
		<Layout>
			<div className="container mx-auto px-4 py-8 md:px-8 md:py-10">
				<section className="mx-auto max-w-6xl">
					<div className="overflow-hidden rounded-xl border border-[oklch(0.31_0.03_45)] bg-[radial-gradient(circle_at_top_left,rgba(201,152,104,0.18),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(122,53,38,0.16),transparent_28%),linear-gradient(180deg,#181211_0%,#120f0f_48%,#0f0d0d_100%)] shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
						<div className="grid gap-8 px-5 py-6 md:px-8 md:py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
							<div className="pt-1 md:pt-3">
								<p className="text-sm text-[oklch(0.8_0.03_70)]">Mapetite</p>
								<h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[oklch(0.95_0.01_75)] sm:text-5xl md:text-6xl lg:text-[4.5rem] lg:leading-[0.94]">
									Discover restaurants worth planning around.
								</h1>
								<p className="mt-5 max-w-xl text-base leading-7 text-[oklch(0.76_0.02_70)] md:text-lg">
									Start from a city, state, or country and move straight into a
									more curated way to search.
								</p>

								<div className="mt-10 max-w-2xl rounded-lg border border-[oklch(0.35_0.03_45)] bg-[rgba(18,15,15,0.56)] p-4 backdrop-blur-[2px] md:p-5">
									<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[oklch(0.35_0.03_45)] bg-[rgba(248,239,225,0.06)] text-[oklch(0.82_0.07_65)]">
													<Utensils className="h-4 w-4" />
												</div>
												<div>
													<p className="text-sm font-medium text-[oklch(0.95_0.01_75)]">
														Restaurant search
													</p>
													<p className="mt-1 text-sm text-[oklch(0.72_0.02_70)]">
														City, state, or country
													</p>
												</div>
											</div>

											<div className="mt-4 flex flex-wrap gap-2">
												{cityCards.map((city) => (
													<Button
														key={city.name}
														type="button"
														variant="outline"
														size="sm"
														onClick={() => handleCityCardClick(city.name)}
														className="rounded-md border-[oklch(0.35_0.03_45)] bg-[rgba(248,239,225,0.05)] px-3 font-medium text-[oklch(0.92_0.01_75)] shadow-none hover:bg-[rgba(248,239,225,0.1)] hover:text-[oklch(0.98_0.01_75)]"
													>
														{city.name}
													</Button>
												))}
											</div>
										</div>

										<Button
											asChild
											size="lg"
											className="w-full bg-[oklch(0.82_0.07_65)] text-[oklch(0.14_0.01_40)] hover:bg-[oklch(0.86_0.06_65)] md:w-auto"
										>
											<Link to="/restaurants">Search restaurants</Link>
										</Button>
									</div>

									<p className="mt-4 border-t border-[oklch(0.29_0.02_45)] pt-4 text-sm leading-6 text-[oklch(0.72_0.02_70)]">
										Cuisine filters, ratings, favorites, and directions continue
										in the full search flow.
									</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr] lg:grid-cols-[1.08fr_0.92fr]">
								<button
									type="button"
									onClick={() => handleCityCardClick("Tokyo")}
									className="min-h-[16rem] rounded-lg border border-[oklch(0.32_0.03_45)] bg-[radial-gradient(circle_at_top,rgba(177,96,77,0.24),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5 text-left transition-colors hover:bg-[radial-gradient(circle_at_top,rgba(177,96,77,0.3),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] sm:row-span-2"
								>
									<p className="text-sm text-[oklch(0.78_0.03_70)]">Tokyo</p>
									<p className="mt-10 max-w-[10ch] text-2xl font-semibold leading-tight text-[oklch(0.95_0.01_75)]">
										Omakase, kaiseki, late-night counters
									</p>
									<p className="mt-4 text-sm leading-6 text-[oklch(0.72_0.02_70)]">
										Use Tokyo as your starting point.
									</p>
								</button>

								<button
									type="button"
									onClick={() => handleCityCardClick("Paris")}
									className="min-h-[7.5rem] rounded-lg border border-[oklch(0.32_0.03_45)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 text-left transition-colors hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
								>
									<p className="text-sm text-[oklch(0.78_0.03_70)]">Paris</p>
									<p className="mt-5 text-lg font-medium text-[oklch(0.95_0.01_75)]">
										Bistros and wine bars
									</p>
								</button>

								<button
									type="button"
									onClick={() => handleCityCardClick("London")}
									className="min-h-[7.5rem] rounded-lg border border-[oklch(0.32_0.03_45)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 text-left transition-colors hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
								>
									<p className="text-sm text-[oklch(0.78_0.03_70)]">London</p>
									<p className="mt-5 text-lg font-medium text-[oklch(0.95_0.01_75)]">
										Dining rooms and chef-led menus
									</p>
								</button>
							</div>
						</div>
					</div>
				</section>

				<section className="mx-auto mt-8 max-w-4xl md:mt-10">
					<div>
						<h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
							Browse cities
						</h2>
						<p className="mt-1 text-sm leading-6 text-muted-foreground">
							Quick entry points for common searches.
						</p>
					</div>

					<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{cityCards.map((city) => (
							<Card key={city.name} className="overflow-hidden border-border">
								<button
									type="button"
									onClick={() => handleCityCardClick(city.name)}
									className="flex h-full min-h-[10rem] w-full flex-col justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/30"
								>
									<div className="space-y-1">
										<p className="text-base font-medium text-foreground">
											{city.name}
										</p>
										<p className="text-sm text-muted-foreground">{city.note}</p>
									</div>
									<p className="text-sm leading-6 text-foreground/80">
										{city.detail}
									</p>
								</button>
							</Card>
						))}
					</div>
				</section>
			</div>

			<footer className="mt-12 border-t border-border bg-background">
				<div className="container mx-auto px-4 py-8 md:px-8 md:py-10">
					<div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
						<div className="max-w-sm">
							<p className="text-sm font-medium text-foreground">Mapetite</p>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Search restaurants by place, then move into the detail page for
								favorites, directions, and media.
							</p>
						</div>

						<div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
							<div className="space-y-2">
								<p className="font-medium text-foreground">Explore</p>
								<ul className="space-y-2 text-muted-foreground">
									<li>
										<Link to="/restaurants" className="transition-colors hover:text-foreground">
											Search
										</Link>
									</li>
								</ul>
							</div>
							<div className="space-y-2">
								<p className="font-medium text-foreground">Support</p>
								<ul className="space-y-2 text-muted-foreground">
									<li>
										<a
											href="mailto:info@mapetite.com"
											className="transition-colors hover:text-foreground"
										>
											info@mapetite.com
										</a>
									</li>
								</ul>
							</div>
							<div className="space-y-2">
								<p className="font-medium text-foreground">Company</p>
								<ul className="space-y-2 text-muted-foreground">
									<li>
										<a href="#about" className="transition-colors hover:text-foreground">
											About
										</a>
									</li>
								</ul>
							</div>
							<div className="space-y-2">
								<p className="font-medium text-foreground">Legal</p>
								<ul className="space-y-2 text-muted-foreground">
									<li>
										<a href="#privacy" className="transition-colors hover:text-foreground">
											Privacy
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>

					<div className="mt-8 flex flex-col gap-3 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
						<p>© 2026 Mapetite</p>
						<div className="flex gap-4">
							<a href="#instagram" className="transition-colors hover:text-foreground">
								Instagram
							</a>
							<a href="#linkedin" className="transition-colors hover:text-foreground">
								LinkedIn
							</a>
						</div>
					</div>
				</div>
			</footer>
		</Layout>
	);
}
