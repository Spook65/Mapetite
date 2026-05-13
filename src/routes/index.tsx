import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Search, Star, Utensils } from "lucide-react";

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
					<div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
						<div className="pt-1 md:pt-4">
							<h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
								Find the right restaurant,
								<span className="block">starting from any place.</span>
							</h1>
							<p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
								Search by city, state, or country, then narrow results by
								cuisine, rating, and the details that matter.
							</p>

							<div className="mt-8 grid gap-5 border-t border-border pt-5 sm:grid-cols-3">
								<div className="space-y-2">
									<p className="text-sm font-medium text-foreground">Location</p>
									<p className="text-sm leading-6 text-muted-foreground">
										Start with a city, state, or country.
									</p>
								</div>
								<div className="space-y-2">
									<p className="text-sm font-medium text-foreground">Filters</p>
									<p className="text-sm leading-6 text-muted-foreground">
										Narrow by cuisine, rating, and more.
									</p>
								</div>
								<div className="space-y-2">
									<p className="text-sm font-medium text-foreground">Details</p>
									<p className="text-sm leading-6 text-muted-foreground">
										Open photos, favorites, and directions.
									</p>
								</div>
							</div>
						</div>

						<Card className="border-border/80 bg-card shadow-sm">
							<CardContent className="p-5 md:p-7">
								<div className="flex items-start gap-4">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 text-foreground">
										<Utensils className="h-5 w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-lg font-medium text-foreground">
											Restaurant search
										</p>
										<p className="mt-1 text-sm leading-6 text-muted-foreground">
											Open the search page with the filters already built into
											the app.
										</p>
									</div>
								</div>

								<div className="mt-6 space-y-3">
									<div className="flex gap-3 rounded-md border border-border bg-background/40 p-3.5">
										<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 text-primary">
											<MapPin className="h-4 w-4" />
										</div>
										<div>
											<p className="text-sm font-medium text-foreground">
												Start with a place
											</p>
											<p className="mt-1 text-sm leading-6 text-muted-foreground">
												City, state, or country.
											</p>
										</div>
									</div>
									<div className="flex gap-3 rounded-md border border-border bg-background/40 p-3.5">
										<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 text-secondary">
											<Search className="h-4 w-4" />
										</div>
										<div>
											<p className="text-sm font-medium text-foreground">
												Refine the list
											</p>
											<p className="mt-1 text-sm leading-6 text-muted-foreground">
												Use the filters already in the app.
											</p>
										</div>
									</div>
									<div className="flex gap-3 rounded-md border border-border bg-background/40 p-3.5">
										<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 text-primary">
											<Star className="h-4 w-4" />
										</div>
										<div>
											<p className="text-sm font-medium text-foreground">
												View details
											</p>
											<p className="mt-1 text-sm leading-6 text-muted-foreground">
												Open photos, directions, and saved places.
											</p>
										</div>
									</div>
								</div>

								<div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
									<p className="text-sm leading-6 text-muted-foreground">
										Best started from a city, state, or country.
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
									className="flex h-full w-full flex-col items-start gap-4 p-4 text-left transition-colors hover:bg-muted/30"
								>
									<div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/30 text-primary">
										<MapPin className="h-4 w-4" />
									</div>
									<div className="w-full">
										<p className="text-base font-medium text-foreground">
											{city.name}
										</p>
										<p className="mt-1 text-sm text-muted-foreground">
											{city.note}
										</p>
										<p className="mt-3 text-sm text-foreground/80">
											{city.count}
										</p>
									</div>
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
