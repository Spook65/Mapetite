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
		heroTitle: "Long lunches and late wine bars",
	},
	{
		name: "Tokyo",
		note: "Japan",
		detail: "Omakase counters, kaiseki, izakaya",
		heroTitle: "Omakase, kaiseki, late-night counters",
	},
	{
		name: "London",
		note: "United Kingdom",
		detail: "Dining rooms, gastropubs, chef-led menus",
		heroTitle: "Dining rooms and chef-led menus",
	},
	{
		name: "Dubai",
		note: "UAE",
		detail: "Hotel dining, rooftops, tasting menus",
		heroTitle: "Rooftops, hotel dining, tasting menus",
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
					<div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#1a1412_0%,#120f0f_52%,#0f0d0d_100%)] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(198,144,88,0.22),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(132,56,38,0.2),transparent_24%),radial-gradient(circle_at_60%_86%,rgba(255,255,255,0.04),transparent_26%)]" />
						<div className="pointer-events-none absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent,transparent_calc(100%-1px),rgba(255,255,255,0.06)_calc(100%-1px)),linear-gradient(180deg,transparent,transparent_calc(100%-1px),rgba(255,255,255,0.04)_calc(100%-1px))]" />
						<div className="relative grid gap-8 px-5 py-6 md:px-8 md:py-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
							<div className="flex min-h-full flex-col justify-between pt-1 md:pt-3">
								<div>
									<p className="text-sm tracking-[0.08em] text-[oklch(0.8_0.03_70)]">
										Mapetite
									</p>
									<h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-[oklch(0.95_0.01_75)] sm:text-5xl md:text-6xl lg:text-[4.8rem] lg:leading-[0.92]">
										Discover restaurants worth planning around.
									</h1>
									<p className="mt-6 max-w-xl text-base leading-7 text-[oklch(0.76_0.02_70)] md:text-lg">
										Start from a city, state, or country, then step into a
										more curated search flow built for choosing where to go.
									</p>
								</div>

								<div className="mt-10 rounded-[22px] border border-[oklch(0.35_0.03_45)] bg-[rgba(18,15,15,0.54)] p-4 backdrop-blur-[3px] md:p-5">
									<div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
										<div className="min-w-0">
											<div className="flex items-center gap-3">
												<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[oklch(0.35_0.03_45)] bg-[rgba(248,239,225,0.06)] text-[oklch(0.82_0.07_65)]">
													<Utensils className="h-4 w-4" />
												</div>
												<div>
													<p className="text-sm font-medium text-[oklch(0.95_0.01_75)]">
														Restaurant search
													</p>
													<p className="mt-1 text-sm text-[oklch(0.72_0.02_70)]">
														Choose a place to begin
													</p>
												</div>
											</div>

											<div className="mt-5 flex flex-wrap gap-2.5">
												{cityCards.map((city) => (
													<Button
														key={city.name}
														type="button"
														variant="outline"
														size="sm"
														onClick={() => handleCityCardClick(city.name)}
														className="rounded-full border-[oklch(0.35_0.03_45)] bg-[rgba(248,239,225,0.05)] px-3.5 font-medium text-[oklch(0.92_0.01_75)] shadow-none transition-colors hover:bg-[rgba(248,239,225,0.12)] hover:text-[oklch(0.98_0.01_75)]"
													>
														{city.name}
													</Button>
												))}
											</div>
										</div>

										<Button
											asChild
											size="lg"
											className="w-full rounded-full bg-[oklch(0.82_0.07_65)] px-6 text-[oklch(0.14_0.01_40)] transition-colors hover:bg-[oklch(0.86_0.06_65)] md:w-auto"
										>
											<Link to="/restaurants">Search restaurants</Link>
										</Button>
									</div>

									<div className="mt-5 grid gap-3 border-t border-[oklch(0.29_0.02_45)] pt-4 text-sm text-[oklch(0.72_0.02_70)] sm:grid-cols-3">
										<p>Search by place.</p>
										<p>Refine when the list opens.</p>
										<p>Open details and decide where to go.</p>
									</div>
								</div>
							</div>

							<div className="grid gap-3 lg:relative lg:min-h-[30rem] lg:block">
								<button
									type="button"
									onClick={() => handleCityCardClick("Tokyo")}
									className="min-h-[14rem] rounded-[24px] border border-[oklch(0.33_0.03_45)] bg-[radial-gradient(circle_at_top,rgba(177,96,77,0.26),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-6 text-left shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-1 lg:absolute lg:inset-x-0 lg:top-0 lg:min-h-[18rem]"
								>
									<p className="text-sm text-[oklch(0.78_0.03_70)]">Tokyo</p>
									<p className="mt-12 max-w-[11ch] text-3xl font-semibold leading-tight text-[oklch(0.95_0.01_75)]">
										{cityCards[1].heroTitle}
									</p>
									<p className="mt-4 max-w-xs text-sm leading-6 text-[oklch(0.72_0.02_70)]">
										Begin with Tokyo if you want a tightly curated opening move.
									</p>
								</button>

								<button
									type="button"
									onClick={() => handleCityCardClick("Paris")}
									className="rounded-[20px] border border-[oklch(0.33_0.03_45)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-4 text-left transition-transform duration-200 hover:-translate-y-1 lg:absolute lg:left-0 lg:top-[15.5rem] lg:w-[54%]"
								>
									<p className="text-sm text-[oklch(0.78_0.03_70)]">Paris</p>
									<p className="mt-6 text-lg font-medium text-[oklch(0.95_0.01_75)]">
										{cityCards[0].heroTitle}
									</p>
								</button>

								<button
									type="button"
									onClick={() => handleCityCardClick("London")}
									className="rounded-[20px] border border-[oklch(0.33_0.03_45)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-4 text-left transition-transform duration-200 hover:-translate-y-1 lg:absolute lg:right-0 lg:top-[15.5rem] lg:w-[42%]"
								>
									<p className="text-sm text-[oklch(0.78_0.03_70)]">London</p>
									<p className="mt-6 text-lg font-medium leading-snug text-[oklch(0.95_0.01_75)]">
										{cityCards[2].heroTitle}
									</p>
								</button>

								<button
									type="button"
									onClick={() => handleCityCardClick("Dubai")}
									className="rounded-[20px] border border-[oklch(0.33_0.03_45)] bg-[linear-gradient(180deg,rgba(198,144,88,0.08),rgba(255,255,255,0.015))] p-4 text-left transition-transform duration-200 hover:-translate-y-1 lg:absolute lg:bottom-0 lg:right-4 lg:w-[62%]"
								>
									<p className="text-sm text-[oklch(0.78_0.03_70)]">Dubai</p>
									<p className="mt-6 text-lg font-medium text-[oklch(0.95_0.01_75)]">
										{cityCards[3].heroTitle}
									</p>
								</button>
							</div>
						</div>
					</div>
				</section>

				<section className="mx-auto mt-8 max-w-5xl md:mt-10">
					<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
						<div>
							<h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
								Browse cities
							</h2>
							<p className="mt-1 text-sm leading-6 text-muted-foreground">
								Quick entry points for common searches.
							</p>
						</div>
						<p className="text-sm text-muted-foreground">
							Choose a destination and jump directly into search.
						</p>
					</div>

					<div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{cityCards.map((city) => (
							<Card
								key={city.name}
								className="overflow-hidden border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]"
							>
								<button
									type="button"
									onClick={() => handleCityCardClick(city.name)}
									className="flex h-full min-h-[11rem] w-full flex-col justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/30"
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
