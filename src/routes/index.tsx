import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Utensils } from "lucide-react";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

const cityCards = [
	{
		name: "Paris",
		note: "France",
		count: "125+ restaurants",
	},
	{
		name: "Tokyo",
		note: "Japan",
		count: "200+ restaurants",
	},
	{
		name: "London",
		note: "United Kingdom",
		count: "180+ restaurants",
	},
	{
		name: "Dubai",
		note: "UAE",
		count: "90+ restaurants",
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
					<div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
						<div className="pt-1 md:pt-4">
							<h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem] lg:leading-[0.95]">
								Discover restaurants worth planning around.
								<span className="mt-1 block text-foreground/90">
									Start from any place.
								</span>
							</h1>
							<p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
								Search by city, state, or country, then narrow results by
								cuisine, rating, and the details that matter.
							</p>

							<div className="mt-8 flex items-center gap-3">
								<div className="h-px w-10 bg-border" />
								<p className="text-sm leading-6 text-muted-foreground">
									Start with a city, then refine when the list opens.
								</p>
							</div>

							<div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
								<span className="text-foreground">Paris</span>
								<span>Tokyo</span>
								<span>London</span>
								<span>Dubai</span>
							</div>
						</div>

						<Card className="overflow-hidden border-border/80 bg-card shadow-sm">
							<div className="border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] px-5 py-4 md:px-7 md:py-5">
								<p className="text-sm font-medium text-foreground">
									Restaurant search
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									Start with a place and move straight into the full search
									flow.
								</p>
							</div>
							<CardContent className="p-5 md:p-7">
								<div className="rounded-lg border border-border bg-background/60 px-4 py-4">
									<div className="flex items-start gap-3">
										<div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 text-primary">
											<MapPin className="h-4 w-4" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-xs text-muted-foreground">Location</p>
											<p className="mt-1 text-base font-medium text-foreground">
												City, state, or country
											</p>
										</div>
									</div>
								</div>

								<div className="mt-4 flex flex-wrap gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => handleCityCardClick("Paris")}
										className="rounded-md border-border bg-background/60 px-3 font-medium text-foreground shadow-none hover:bg-muted/40"
									>
										Paris
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => handleCityCardClick("Tokyo")}
										className="rounded-md border-border bg-background/60 px-3 font-medium text-foreground shadow-none hover:bg-muted/40"
									>
										Tokyo
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => handleCityCardClick("London")}
										className="rounded-md border-border bg-background/60 px-3 font-medium text-foreground shadow-none hover:bg-muted/40"
									>
										London
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => handleCityCardClick("Dubai")}
										className="rounded-md border-border bg-background/60 px-3 font-medium text-foreground shadow-none hover:bg-muted/40"
									>
										Dubai
									</Button>
								</div>

								<div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
									<p className="max-w-xs text-sm leading-6 text-muted-foreground">
										Use a city shortcut or jump to the search page when you’re
										ready.
									</p>
									<Button asChild size="lg" className="w-full sm:w-auto">
										<Link to="/restaurants">Search restaurants</Link>
									</Button>
									</div>
							</CardContent>
						</Card>
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
									<p className="text-sm text-foreground/80">Open search</p>
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
