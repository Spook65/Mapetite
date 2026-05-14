import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Utensils } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

const cityStarts = [
	{
		key: "tokyo",
		name: "Tokyo",
		country: "Japan",
		stageTag: "Late counters",
		stageNote:
			"Tighter shortlists, quieter counters, and stronger late options.",
		summary:
			"Begin here when the night leans toward compact dining rooms, quieter service, and a shortlist that narrows quickly.",
		focusTitle: "Tokyo keeps the shortlist tighter from the first result.",
		focusSubtitle: "Counter dining · late service · hidden bars",
		bestFor: "Counter dining and late reservations.",
		shortlistMood: "Compact, precise, and easy to narrow.",
		naturalNextMove: "Open details when one room feels worth the trip.",
		heroTitle: "Omakase, kaiseki, late-night counters",
		shortlistLabel: "3 places open late",
		tags: ["Omakase", "Ramen", "Izakaya"],
		restaurants: [
			{
				name: "Omakase Kuro",
				subtitle: "Counter dining · Shinjuku",
				rating: "4.8",
				detail:
					"Calm counter service, strong omakase pacing, and a late reservation window.",
				imageLabel: "Quiet counter seating · late service",
				meta: ["4.8 rating", "Omakase", "Shinjuku"],
			},
			{
				name: "Shio Atelier",
				subtitle: "Ramen · Nakameguro",
				rating: "4.6",
				detail:
					"Broth-led, compact, and easy to slot into a quieter evening plan.",
				imageLabel: "Open kitchen glow · neighborhood pace",
				meta: ["4.6 rating", "Ramen", "Nakameguro"],
			},
			{
				name: "Midnight Coal",
				subtitle: "Izakaya · Ebisu",
				rating: "4.7",
				detail:
					"Lively enough for a late table, but still focused on the room and the grill.",
				imageLabel: "Late service · charcoal counter",
				meta: ["4.7 rating", "Izakaya", "Ebisu"],
			},
		],
	},
	{
		key: "paris",
		name: "Paris",
		country: "France",
		stageTag: "Long lunches",
		stageNote: "Bistros, wine bars, and tasting rooms that reward a slower start.",
		summary:
			"Start in Paris when the plan needs dining rooms with more ceremony and a shortlist built around lingering.",
		focusTitle: "Paris opens into longer meals and stronger room character.",
		focusSubtitle: "Bistros · wine bars · tasting menus",
		bestFor: "Long lunches and wine-led evenings.",
		shortlistMood: "Layered, elegant, and easy to stretch into the night.",
		naturalNextMove: "Compare the room, then open details for the final call.",
		heroTitle: "Bistros, wine bars, tasting menus",
		shortlistLabel: "3 rooms worth lingering in",
		tags: ["Bistro", "Wine bar", "Tasting menu"],
		restaurants: [
			{
				name: "Maison Rive",
				subtitle: "Bistro · Saint-Germain",
				rating: "4.7",
				detail:
					"A confident room with classic pacing, strong staff guidance, and a deep wine list.",
				imageLabel: "Candlelit banquettes · late seating",
				meta: ["4.7 rating", "Bistro", "Saint-Germain"],
			},
			{
				name: "Verre Minuit",
				subtitle: "Wine bar · Le Marais",
				rating: "4.6",
				detail:
					"A tighter list built for glasses first, small plates second, and easy second stops.",
				imageLabel: "Glass pours · narrow room energy",
				meta: ["4.6 rating", "Wine bar", "Le Marais"],
			},
			{
				name: "Atelier Sept",
				subtitle: "Tasting menu · 7th arrondissement",
				rating: "4.8",
				detail:
					"More formal, more paced, and worth opening when the night needs a stronger centerpiece.",
				imageLabel: "Chef-led dining room · tasting pace",
				meta: ["4.8 rating", "Tasting menu", "7th arrondissement"],
			},
		],
	},
	{
		key: "london",
		name: "London",
		country: "United Kingdom",
		stageTag: "Dining rooms",
		stageNote:
			"Chef-led menus, polished dining rooms, and shortlist decisions that stay flexible.",
		summary:
			"Choose London when the plan may start formal but still wants options that can pivot between classic and newer rooms.",
		focusTitle: "London balances polished rooms with easier shortlist variety.",
		focusSubtitle: "Dining rooms · gastropubs · chef-led menus",
		bestFor: "Room-led dinners with range across neighborhoods.",
		shortlistMood: "Balanced, flexible, and easy to compare.",
		naturalNextMove: "Use the shortlist to narrow, then open details for confidence.",
		heroTitle: "Dining rooms and chef-led menus",
		shortlistLabel: "3 places with room-led appeal",
		tags: ["Dining room", "Gastropub", "Chef-led"],
		restaurants: [
			{
				name: "Lark & Ember",
				subtitle: "Dining room · Marylebone",
				rating: "4.7",
				detail:
					"A composed dining room that feels occasion-ready without forcing a heavy night.",
				imageLabel: "Warm room lighting · composed tables",
				meta: ["4.7 rating", "Dining room", "Marylebone"],
			},
			{
				name: "The Bramble House",
				subtitle: "Gastropub · Notting Hill",
				rating: "4.5",
				detail:
					"Relaxed enough for a quick decision, but still worth opening for menu confidence.",
				imageLabel: "Corner pub glow · wood bar finish",
				meta: ["4.5 rating", "Gastropub", "Notting Hill"],
			},
			{
				name: "Chapter One Table",
				subtitle: "Chef-led menu · Shoreditch",
				rating: "4.8",
				detail:
					"Sharper pacing and more deliberate courses when the shortlist needs a clear standout.",
				imageLabel: "Chef pass · evening tasting room",
				meta: ["4.8 rating", "Chef-led", "Shoreditch"],
			},
		],
	},
	{
		key: "dubai",
		name: "Dubai",
		country: "UAE",
		stageTag: "Rooftops",
		stageNote:
			"Hotel dining, rooftops, and bigger-room decisions with strong location context.",
		summary:
			"Begin in Dubai when the setting matters as much as the menu and the shortlist needs stronger location cues.",
		focusTitle: "Dubai turns the search toward rooms with bigger setting impact.",
		focusSubtitle: "Rooftops · hotel dining · tasting menus",
		bestFor: "Destination dinners and higher-context reservations.",
		shortlistMood: "Wide, visual, and easier to compare by setting.",
		naturalNextMove: "Open details once the room and route both feel right.",
		heroTitle: "Rooftops, hotel dining, tasting menus",
		shortlistLabel: "3 rooms with stronger setting pull",
		tags: ["Rooftop", "Hotel dining", "Tasting menu"],
		restaurants: [
			{
				name: "Astra Marina",
				subtitle: "Rooftop dining · Dubai Marina",
				rating: "4.7",
				detail:
					"A stronger route-and-room decision where the setting matters as much as the booking.",
				imageLabel: "Skyline terrace · marina lights",
				meta: ["4.7 rating", "Rooftop", "Dubai Marina"],
			},
			{
				name: "Palm Atelier",
				subtitle: "Hotel dining · Palm Jumeirah",
				rating: "4.6",
				detail:
					"Polished hotel service with enough calm to make the shortlist feel easy to trust.",
				imageLabel: "Lobby glow · waterfront dining",
				meta: ["4.6 rating", "Hotel dining", "Palm Jumeirah"],
			},
			{
				name: "Ember Room DXB",
				subtitle: "Tasting menu · DIFC",
				rating: "4.8",
				detail:
					"A sharper choice when the night calls for something more deliberate and worth the trip.",
				imageLabel: "Evening tasting room · city lights",
				meta: ["4.8 rating", "Tasting menu", "DIFC"],
			},
		],
	},
] as const;

function LandingPage() {
	const navigate = useNavigate();
	const [selectedCityKey, setSelectedCityKey] = useState<(typeof cityStarts)[number]["key"]>("tokyo");

	const selectedCity = useMemo(
		() =>
			cityStarts.find((city) => city.key === selectedCityKey) ?? cityStarts[0],
		[selectedCityKey],
	);

	const featuredRestaurant = selectedCity.restaurants[0];

	const handleCityStart = (cityName: string) => {
		navigate({
			to: "/restaurants",
			search: { city: cityName },
		});
	};

	return (
		<div className="mapetite-page-shell">
			<div className="mapetite-container px-4 py-6 md:px-6 md:py-8">
				<nav className="mapetite-panel-soft sticky top-14 z-20 mb-8 hidden items-center justify-between gap-4 px-5 py-3 backdrop-blur md:flex">
					<div className="flex items-center gap-3 text-sm font-medium text-[var(--mapetite-text)]">
						<div className="flex size-9 items-center justify-center rounded-[10px] border border-[var(--mapetite-border-strong)] bg-[linear-gradient(180deg,rgba(213,154,104,0.2),rgba(180,108,67,0.08))]">
							<Utensils className="size-4" />
						</div>
						<span>Mapetite</span>
					</div>
					<div className="flex items-center gap-5 text-sm text-[var(--mapetite-text-soft)]">
						<a href="#discover" className="transition-colors hover:text-[var(--mapetite-text)]">
							Discover
						</a>
						<a href="#search" className="transition-colors hover:text-[var(--mapetite-text)]">
							Search start
						</a>
						<a href="#experience" className="transition-colors hover:text-[var(--mapetite-text)]">
							Experience
						</a>
						<a href="#city-starts" className="transition-colors hover:text-[var(--mapetite-text)]">
							City starts
						</a>
					</div>
					<Button
						asChild
						size="sm"
						className="mapetite-accent-button rounded-[10px] px-4 text-sm"
					>
						<Link to="/restaurants">Open search</Link>
					</Button>
				</nav>

				<section
					id="discover"
					className="scroll-mt-32 py-10 md:py-14 lg:py-16"
				>
					<div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:gap-12">
						<div className="mapetite-section-stack">
							<div className="mapetite-eyebrow">
								Restaurant discovery, built around place
							</div>
							<div>
								<h1 className="max-w-[10ch] text-5xl font-semibold tracking-[-0.06em] text-[var(--mapetite-text)] sm:text-6xl lg:text-[5rem] lg:leading-[0.94]">
									Find restaurants worth crossing the city for.
								</h1>
								<p className="mapetite-muted-copy mt-5 max-w-xl text-lg leading-8">
									Start with a city, open a shortlist that fits the night, and go
									deeper only when a restaurant feels worth the trip.
								</p>
							</div>

							<div className="flex flex-wrap items-center gap-3">
								<Button
									asChild
									size="lg"
									className="mapetite-accent-button rounded-[10px] px-6"
								>
									<Link to="/restaurants">Search restaurants</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="mapetite-quiet-button rounded-[10px] px-6"
								>
									<a href="#experience">See how it opens</a>
								</Button>
								<p className="mapetite-faint-copy basis-full text-sm">
									Opens the full search page. City starts are separate.
								</p>
							</div>
						</div>

						<div className="grid gap-4">
							<div className="mapetite-panel overflow-hidden p-5 md:p-6">
								<div className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
									Tonight starts in {selectedCity.name}
								</div>
								<div className="mt-4 flex items-center justify-between gap-4">
									<strong className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
										{selectedCity.name}, {selectedCity.country}
									</strong>
									<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.05] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
										{selectedCity.stageTag}
									</div>
								</div>

								<div className="mt-5 grid gap-3 sm:grid-cols-3">
									{selectedCity.restaurants.map((restaurant) => (
										<div
											key={restaurant.name}
											className="rounded-[10px] border border-[var(--mapetite-border)] bg-black/10 px-4 py-3"
										>
											<strong className="block text-sm font-medium text-[var(--mapetite-text)]">
												{restaurant.name}
											</strong>
											<span className="mapetite-muted-copy mt-1 block text-sm">
												{restaurant.subtitle} · {restaurant.rating}
											</span>
										</div>
									))}
								</div>

								<div className="mt-5 flex flex-wrap gap-2">
									<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.05] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
										Save favorite
									</div>
									<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.05] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
										Open details
									</div>
									<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.05] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
										Get directions
									</div>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="mapetite-panel-soft p-5">
									<strong className="text-base font-medium text-[var(--mapetite-text)]">
										Start with place
									</strong>
									<p className="mapetite-muted-copy mt-2 text-sm leading-6">
										Pick the city first, then open the shortlist.
									</p>
								</div>
								<div className="mapetite-panel-soft p-5">
									<strong className="text-base font-medium text-[var(--mapetite-text)]">
										Decide with less noise
									</strong>
									<p className="mapetite-muted-copy mt-2 text-sm leading-6">
										Details, favorites, and directions stay close when one place
										stands out.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section
					id="search"
					className="scroll-mt-32 py-10 md:py-14 lg:py-16"
				>
					<div className="mapetite-panel p-5 md:p-7">
						<div className="grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)] lg:items-end">
							<div>
								<div className="mapetite-eyebrow">Start with a place</div>
								<h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)] md:text-4xl">
									Search from a city that fits the night.
								</h2>
							</div>
							<p className="mapetite-muted-copy max-w-md text-sm leading-7 lg:justify-self-end">
								Choose a city start if you want to begin from a place instead of a
								blank search.
							</p>
						</div>

						<div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_auto]">
							<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-5">
								<div className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
									Starting point
								</div>
								<strong className="mt-2 block text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
									{selectedCity.name}, {selectedCity.country}
								</strong>
								<span className="mapetite-muted-copy mt-2 block text-sm leading-6">
									{selectedCity.stageNote}
								</span>
								<div className="mt-5 flex flex-wrap gap-2.5">
									{cityStarts.map((city) => (
										<button
											key={city.key}
											type="button"
											onClick={() => setSelectedCityKey(city.key)}
											aria-pressed={selectedCityKey === city.key}
											className={cn(
												"rounded-full border px-4 py-2 text-sm font-medium transition-colors",
												selectedCityKey === city.key
													? "border-[var(--mapetite-border-strong)] bg-[var(--mapetite-accent-soft)] text-[var(--mapetite-text)]"
													: "border-[var(--mapetite-border)] bg-white/[0.03] text-[var(--mapetite-text-soft)] hover:bg-white/[0.06] hover:text-[var(--mapetite-text)]",
											)}
										>
											{city.name}
										</button>
									))}
								</div>
							</div>

							<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-5">
								<div className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
									Shortlist preview
								</div>
								<div className="mt-4 space-y-3">
									{selectedCity.restaurants.map((restaurant) => (
										<div
											key={restaurant.name}
											className="flex items-center justify-between gap-4 rounded-[10px] border border-[var(--mapetite-border)] bg-white/[0.03] px-4 py-3"
										>
											<div>
												<strong className="block text-sm font-medium text-[var(--mapetite-text)]">
													{restaurant.name}
												</strong>
												<span className="mapetite-muted-copy text-sm">
													{restaurant.subtitle}
												</span>
											</div>
											<div className="rounded-full border border-[var(--mapetite-border)] px-2.5 py-1 text-sm text-[var(--mapetite-text-soft)]">
												{restaurant.rating}
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="flex flex-col justify-between gap-3 xl:w-[220px]">
								<Button
									type="button"
									size="lg"
									onClick={() => handleCityStart(selectedCity.name)}
									className="mapetite-accent-button h-auto min-h-12 rounded-[10px] px-5 py-3 text-base"
								>
									Use this city start
								</Button>
								<p className="mapetite-faint-copy text-sm leading-6">
									For a city-led search if that shortcut flow is supported.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section
					id="experience"
					className="scroll-mt-32 py-10 md:py-14 lg:py-16"
				>
					<div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-start">
						<div className="mapetite-section-stack">
							<div className="mapetite-eyebrow">From city to table</div>
							<h2 className="max-w-md text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)] md:text-4xl">
								Pick a place, keep the shortlist close, and open details when the
								choice becomes real.
							</h2>
							<p className="mapetite-muted-copy max-w-md text-base leading-7">
								A quick preview of what opens after search, without rebuilding the
								restaurant page here.
							</p>

							<div className="space-y-3">
								{[
									["1", "Choose a city", "Let the city set the tone."],
									[
										"2",
										"Open a shortlist",
										"Compare a few strong options without losing the list.",
									],
									[
										"3",
										"Go deeper when one place stands out",
										"Save it, check directions, and decide.",
									],
								].map(([step, title, copy]) => (
									<div
										key={step}
										className="mapetite-panel-soft flex gap-4 p-4"
									>
										<div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--mapetite-border)] bg-[var(--mapetite-accent-soft)] text-sm font-semibold text-[var(--mapetite-text)]">
											{step}
										</div>
										<div>
											<strong className="block text-sm font-medium text-[var(--mapetite-text)]">
												{title}
											</strong>
											<p className="mapetite-muted-copy mt-1 text-sm leading-6">
												{copy}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="mapetite-panel overflow-hidden p-5 md:p-6">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<strong className="text-xl font-semibold tracking-[-0.03em] text-[var(--mapetite-text)]">
									{selectedCity.name} shortlist
								</strong>
								<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.04] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
									{selectedCity.shortlistLabel}
								</div>
							</div>

							<div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
								<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
									<div className="flex items-center justify-between gap-3">
										<span className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
											Shortlist
										</span>
										<div className="rounded-full border border-[var(--mapetite-border)] px-2.5 py-1 text-xs text-[var(--mapetite-text-soft)]">
											{selectedCity.restaurants.length} restaurants
										</div>
									</div>
									<div className="mt-4 space-y-3">
										{selectedCity.restaurants.map((restaurant, index) => (
											<div
												key={restaurant.name}
												className={cn(
													"rounded-[10px] border px-4 py-3 transition-colors",
													index === 0
														? "border-[var(--mapetite-border-strong)] bg-[var(--mapetite-accent-soft)]"
														: "border-[var(--mapetite-border)] bg-white/[0.03]",
												)}
											>
												<div className="flex items-start justify-between gap-3">
													<div>
														<strong className="block text-sm font-medium text-[var(--mapetite-text)]">
															{restaurant.name}
														</strong>
														<span className="mapetite-muted-copy text-sm">
															{restaurant.subtitle}
														</span>
													</div>
													<div className="text-sm font-medium text-[var(--mapetite-text)]">
														{restaurant.rating}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
									<div className="flex items-center justify-between gap-3">
										<span className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
											Restaurant detail
										</span>
										<div className="rounded-full border border-[var(--mapetite-border)] px-2.5 py-1 text-xs text-[var(--mapetite-text-soft)]">
											{selectedCity.name}
										</div>
									</div>

									<div className="mapetite-media-fallback mt-4 flex min-h-[190px] items-end rounded-[12px] p-4">
										<span className="text-sm text-[var(--mapetite-text-soft)]">
											{featuredRestaurant.imageLabel}
										</span>
									</div>

									<h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--mapetite-text)]">
										{featuredRestaurant.name}
									</h3>
									<p className="mapetite-muted-copy mt-2 text-sm leading-7">
										{featuredRestaurant.detail}
									</p>

									<div className="mt-4 flex flex-wrap gap-2">
										{featuredRestaurant.meta.map((item) => (
											<div
												key={item}
												className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.04] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]"
											>
												{item}
											</div>
										))}
									</div>

									<div className="mt-5 flex flex-wrap gap-2">
										<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.04] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
											Save favorite
										</div>
										<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.04] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
											Get directions
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section
					id="city-starts"
					className="scroll-mt-32 py-10 md:py-14 lg:py-16"
				>
					<div className="grid gap-8 lg:grid-cols-[minmax(0,0.54fr)_minmax(0,0.46fr)]">
						<div className="mapetite-section-stack">
							<div className="mapetite-eyebrow">City starting points</div>
							<h2 className="max-w-md text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)] md:text-4xl">
								Each city changes the tone of the search.
							</h2>
							<p className="mapetite-muted-copy max-w-lg text-base leading-7">
								City starts stay separate from the blank search entry.
							</p>

							<div className="grid gap-3 sm:grid-cols-2">
								{cityStarts.map((city) => (
									<button
										key={city.key}
										type="button"
										onClick={() => setSelectedCityKey(city.key)}
										className={cn(
											"rounded-[12px] border p-4 text-left transition-colors",
											selectedCityKey === city.key
												? "border-[var(--mapetite-border-strong)] bg-[var(--mapetite-accent-soft)]"
												: "border-[var(--mapetite-border)] bg-white/[0.03] hover:bg-white/[0.05]",
										)}
									>
										<p className="text-base font-medium text-[var(--mapetite-text)]">
											{city.name}
										</p>
										<p className="mapetite-faint-copy mt-1 text-sm">
											{city.country}
										</p>
										<p className="mapetite-muted-copy mt-4 text-sm leading-6">
											{city.heroTitle}
										</p>
									</button>
								))}
							</div>
						</div>

						<div className="mapetite-panel p-5 md:p-6">
							<div className="mapetite-eyebrow">Selected start</div>
							<strong className="mt-4 block text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
								{selectedCity.name}, {selectedCity.country}
							</strong>
							<p className="mapetite-muted-copy mt-3 text-base leading-7">
								{selectedCity.summary}
							</p>

							<div className="mt-6 space-y-3">
								{[
									["Best for", selectedCity.bestFor],
									["Shortlist mood", selectedCity.shortlistMood],
									["Natural next move", selectedCity.naturalNextMove],
								].map(([label, value]) => (
									<div
										key={label}
										className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4"
									>
										<span className="mapetite-faint-copy block text-xs uppercase tracking-[0.14em]">
											{label}
										</span>
										<strong className="mt-2 block text-sm font-medium leading-6 text-[var(--mapetite-text)]">
											{value}
										</strong>
									</div>
								))}
							</div>

							<div className="mt-6 rounded-[12px] border border-[var(--mapetite-border)] bg-white/[0.03] p-4">
								<strong className="block text-lg font-medium text-[var(--mapetite-text)]">
									{selectedCity.focusTitle}
								</strong>
								<p className="mapetite-faint-copy mt-2 text-sm">
									{selectedCity.focusSubtitle}
								</p>
								<div className="mt-4 flex flex-wrap gap-2">
									{selectedCity.tags.map((tag) => (
										<div
											key={tag}
											className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.04] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]"
										>
											{tag}
										</div>
									))}
								</div>
								<div className="mt-5">
									<Button
										type="button"
										variant="outline"
										onClick={() => handleCityStart(selectedCity.name)}
										className="mapetite-quiet-button rounded-[10px] px-5"
									>
										Use this city start
									</Button>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="py-12 md:py-16">
					<div className="mapetite-panel mx-auto max-w-4xl px-6 py-8 text-center md:px-10 md:py-10">
						<div className="mapetite-eyebrow justify-center">
							Open the full search
						</div>
						<h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)] md:text-4xl">
							Start with the city. Let the shortlist make the next decision
							easier.
						</h2>
						<p className="mapetite-muted-copy mx-auto mt-4 max-w-2xl text-base leading-7">
							Open the full search page, or begin with a city start when the
							night already has a direction.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<Button
								asChild
								size="lg"
								className="mapetite-accent-button rounded-[10px] px-6"
							>
								<Link to="/restaurants">
									Search restaurants
									<ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
