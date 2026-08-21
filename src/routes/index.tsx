import { LogInModal } from "@/components/auth/LogInModal";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { MapetiteFooter } from "@/components/MapetiteFooter";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/use-auth-api";
import { cn } from "@/lib/utils";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Home,
	LogIn,
	LogOut,
	Menu,
	UserPlus,
	UserRound,
	Utensils,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

const cityStarts = [
	{
		key: "tokyo",
		name: "Tokyo",
		country: "Japan",
		tone: "Counter dining, ramen, izakaya",
		summary:
			"Compact rooms, sharper route decisions, and a shortlist that narrows quickly.",
		restaurants: [
			{
				name: "Counter dining",
				subtitle: "Omakase · Shinjuku",
				signal: "Focused",
				detail: "Compare location context, timing, and whether the listing feels worth opening.",
				meta: ["Omakase", "Shinjuku", "Route context"],
			},
			{
				name: "Ramen room",
				subtitle: "Ramen · Nakameguro",
				signal: "Compact",
				detail: "A simpler stop where timing, distance, and neighborhood context matter most.",
				meta: ["Ramen", "Nakameguro", "Quick compare"],
			},
			{
				name: "Izakaya option",
				subtitle: "Izakaya · Ebisu",
				signal: "Lively",
				detail: "A flexible option when the route and timing can stretch a little.",
				meta: ["Izakaya", "Ebisu", "Save-ready"],
			},
		],
	},
	{
		key: "paris",
		name: "Paris",
		country: "France",
		tone: "Bistros, wine bars, tasting menus",
		summary:
			"Longer meals, stronger room character, and options that reward a slower start.",
		restaurants: [
			{
				name: "Bistro table",
				subtitle: "Bistro · Saint-Germain",
				signal: "Classic",
				detail: "Use location, category, and listed-hours context before opening details.",
				meta: ["Bistro", "Saint-Germain", "Hours listed"],
			},
			{
				name: "Wine bar",
				subtitle: "Wine bar · Le Marais",
				signal: "Flexible",
				detail: "A lighter plan where route and website context can help narrow the list.",
				meta: ["Wine bar", "Le Marais", "Website"],
			},
			{
				name: "Tasting menu",
				subtitle: "Tasting menu · 7th",
				signal: "Occasion",
				detail: "A more deliberate option when the listing details need a closer look.",
				meta: ["Tasting", "Occasion", "Directions"],
			},
		],
	},
	{
		key: "london",
		name: "London",
		country: "United Kingdom",
		tone: "Dining rooms, gastropubs, chef-led menus",
		summary:
			"Polished dining rooms and flexible neighborhood choices without the list getting noisy.",
		restaurants: [
			{
				name: "Dining room",
				subtitle: "Modern British · Marylebone",
				signal: "Polished",
				detail: "A higher-intent listing where reviews and route context matter.",
				meta: ["Dining room", "Marylebone", "Reviews"],
			},
			{
				name: "Gastropub",
				subtitle: "Gastropub · Notting Hill",
				signal: "Relaxed",
				detail: "A neighborhood option when route and listed hours matter most.",
				meta: ["Gastropub", "Notting Hill", "Route"],
			},
			{
				name: "Chef-led menu",
				subtitle: "Chef-led · Shoreditch",
				signal: "Focused",
				detail: "A sharper shortlist candidate when one listing needs a closer comparison.",
				meta: ["Chef-led", "Shoreditch", "Details"],
			},
		],
	},
	{
		key: "dubai",
		name: "Dubai",
		country: "UAE",
		tone: "Rooftops, hotel dining, destination rooms",
		summary:
			"Bigger settings and stronger location context when the room matters as much as the food.",
		restaurants: [
			{
				name: "Rooftop setting",
				subtitle: "Rooftop · Dubai Marina",
				signal: "Scenic",
				detail: "A route-and-location decision where the listing context carries extra weight.",
				meta: ["Rooftop", "Marina", "Compare"],
			},
			{
				name: "Hotel dining",
				subtitle: "Hotel dining · Palm Jumeirah",
				signal: "Composed",
				detail: "A calmer listing to compare through address, website, and route details.",
				meta: ["Hotel dining", "Palm", "Save"],
			},
			{
				name: "Tasting room",
				subtitle: "Tasting menu · DIFC",
				signal: "Deliberate",
				detail: "A more intentional pick when the shortlist needs a clear comparison point.",
				meta: ["Tasting", "DIFC", "Directions"],
			},
		],
	},
] as const;

const howItWorks = [
	{
		step: "01",
		title: "Pick a place",
		copy: "Start from the city, region, or country that frames the night.",
	},
	{
		step: "02",
		title: "Compare cleaner results",
		copy: "Mapetite normalizes provider data before it becomes a shortlist.",
	},
	{
		step: "03",
		title: "Decide with context",
		copy: "Use cuisine, hours, ratings, route, and saved places when a place stands out.",
	},
] as const;

function LandingPage() {
	const navigate = useNavigate();
	const [selectedCityKey, setSelectedCityKey] =
		useState<(typeof cityStarts)[number]["key"]>("tokyo");
	const [selectedRestaurantIndex, setSelectedRestaurantIndex] = useState(0);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSignUpOpen, setIsSignUpOpen] = useState(false);
	const [isLogInOpen, setIsLogInOpen] = useState(false);
	const { isAuthenticated, profile, logout } = useAuthState();

	const selectedCity = useMemo(
		() =>
			cityStarts.find((city) => city.key === selectedCityKey) ?? cityStarts[0],
		[selectedCityKey],
	);

	const featuredRestaurant =
		selectedCity.restaurants[selectedRestaurantIndex] ??
		selectedCity.restaurants[0];
	const firstName = profile?.name ? profile.name.trim().split(/\s+/)[0] : "User";
	const userInitial = profile?.name
		? profile.name.trim().charAt(0).toUpperCase()
		: "U";

	const handleCityStart = (cityName: string) => {
		navigate({
			to: "/restaurants",
			search: { city: cityName },
		});
	};

	const handleSelectCity = (cityKey: (typeof cityStarts)[number]["key"]) => {
		setSelectedCityKey(cityKey);
		setSelectedRestaurantIndex(0);
	};

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	return (
		<div className="mapetite-page-shell">
			{isMobileMenuOpen && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: Overlay background for modal - intentional click-to-dismiss UX pattern
				<div
					className="fixed inset-0 z-50 bg-black/50 md:hidden"
					onClick={closeMobileMenu}
				>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: Prevents click propagation to overlay - intentional UX pattern */}
					<aside
						className="absolute right-0 top-0 h-full w-80 max-w-[85vw] border-l border-[var(--mapetite-border)] bg-[#16110e]"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex h-full flex-col">
							<div className="flex items-center justify-between border-b border-[var(--mapetite-border)] p-4">
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-[10px] border border-[rgba(213,154,104,0.24)] bg-[linear-gradient(180deg,rgba(213,154,104,0.2),rgba(180,108,67,0.08))] text-[var(--mapetite-text)]">
										<Utensils className="size-4" />
									</div>
									<div>
										<h2 className="text-sm font-medium text-[var(--mapetite-text)]">
											Mapetite
										</h2>
										<p className="text-xs text-[var(--mapetite-text-faint)]">
											Restaurant discovery
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={closeMobileMenu}
									className="inline-flex size-9 items-center justify-center rounded-[10px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)] transition-colors hover:bg-[rgba(255,248,242,0.08)]"
								>
									<X className="size-4" />
								</button>
							</div>

							<nav className="flex-1 px-3 py-4">
								<div className="space-y-1">
									<Link
										to="/"
										onClick={closeMobileMenu}
										className="flex items-center gap-3 rounded-[10px] border border-[rgba(213,154,104,0.24)] bg-[rgba(213,154,104,0.12)] px-3 py-2.5 text-sm text-[var(--mapetite-text)] transition-colors"
									>
										<Home className="size-4" />
										<span>Home</span>
									</Link>
									<Link
										to="/restaurants"
										onClick={closeMobileMenu}
										className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
									>
										<Utensils className="size-4" />
										<span>Search restaurants</span>
									</Link>
								</div>

								<div className="mt-6 border-t border-[var(--mapetite-border)] pt-4">
									<p className="px-3 text-[11px] font-medium tracking-[0.14em] text-[var(--mapetite-text-faint)] uppercase">
										Explore landing
									</p>
									<div className="mt-2 space-y-1">
										<a
											href="#discover"
											onClick={closeMobileMenu}
											className="block rounded-[10px] px-3 py-2.5 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
										>
											Discover
										</a>
										<a
											href="#search"
											onClick={closeMobileMenu}
											className="block rounded-[10px] px-3 py-2.5 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
										>
											Search preview
										</a>
										<a
											href="#experience"
											onClick={closeMobileMenu}
											className="block rounded-[10px] px-3 py-2.5 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
										>
											How it works
										</a>
										<a
											href="#city-starts"
											onClick={closeMobileMenu}
											className="block rounded-[10px] px-3 py-2.5 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
										>
											Start searching
										</a>
									</div>
								</div>

								<div className="mt-6 space-y-2 border-t border-[var(--mapetite-border)] pt-4">
									{isAuthenticated ? (
										<>
											<Link
												to="/account"
												onClick={closeMobileMenu}
												className="block rounded-[10px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] p-3 transition-colors hover:bg-[rgba(255,248,242,0.07)]"
											>
												<p className="text-xs text-[var(--mapetite-text-faint)]">
													Signed in as
												</p>
												<p className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--mapetite-text)]">
													<UserRound className="size-4" />
													<span>{firstName}</span>
													<span className="text-[var(--mapetite-text-faint)]">
														· Account
													</span>
												</p>
											</Link>
											<Button
												onClick={() => {
													closeMobileMenu();
													logout();
												}}
												variant="outline"
												className="mapetite-quiet-button w-full rounded-[10px]"
											>
												<LogOut className="mr-2 size-4" />
												Log Out
											</Button>
										</>
									) : (
										<>
											<Button
												onClick={() => {
													closeMobileMenu();
													setIsLogInOpen(true);
												}}
												variant="outline"
												className="mapetite-quiet-button w-full rounded-[10px]"
											>
												<LogIn className="mr-2 size-4" />
												Log In
											</Button>
											<Button
												onClick={() => {
													closeMobileMenu();
													setIsSignUpOpen(true);
												}}
												className="mapetite-accent-button w-full rounded-[10px] text-[#20140d]"
											>
												<UserPlus className="mr-2 size-4" />
												Sign Up
											</Button>
										</>
									)}
								</div>
							</nav>
						</div>
					</aside>
				</div>
			)}

			<header className="sticky top-0 z-10 md:hidden">
				<div className="mapetite-container px-4 pt-4 pb-6">
					<div className="mapetite-panel-soft flex items-center justify-between gap-4 px-5 py-3 backdrop-blur">
						<div className="flex min-w-0 items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-[10px] border border-[var(--mapetite-border-strong)] bg-[linear-gradient(180deg,rgba(213,154,104,0.2),rgba(180,108,67,0.08))] text-[var(--mapetite-text)]">
								<Utensils className="size-4" />
							</div>
							<span className="truncate text-sm font-medium text-[var(--mapetite-text)]">
								Mapetite
							</span>
						</div>
						<button
							type="button"
							onClick={() => setIsMobileMenuOpen(true)}
							className="inline-flex size-9 items-center justify-center rounded-[10px] border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)]"
							aria-label="Open menu"
						>
							<Menu className="size-4" />
						</button>
					</div>
				</div>
			</header>

			<div className="mapetite-container px-4 pb-6 md:px-6 md:pt-2 md:pb-8">
				<nav className="mapetite-panel-soft sticky top-14 z-20 mb-8 hidden items-center justify-between gap-3 px-4 py-3 backdrop-blur md:flex xl:gap-4 xl:px-5">
					<div className="flex shrink-0 items-center gap-3 whitespace-nowrap text-sm font-medium text-[var(--mapetite-text)]">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--mapetite-border-strong)] bg-[linear-gradient(180deg,rgba(213,154,104,0.2),rgba(180,108,67,0.08))]">
							<Utensils className="size-4" />
						</div>
						<span>Mapetite</span>
					</div>
					<div className="hidden min-w-0 items-center gap-3 text-sm text-[var(--mapetite-text-soft)] lg:flex xl:gap-5">
						<a
							href="#discover"
							className="whitespace-nowrap transition-colors hover:text-[var(--mapetite-text)]"
						>
							Discover
						</a>
						<a
							href="#search"
							className="whitespace-nowrap transition-colors hover:text-[var(--mapetite-text)]"
						>
							Preview
						</a>
						<a
							href="#experience"
							className="hidden whitespace-nowrap transition-colors hover:text-[var(--mapetite-text)] xl:inline"
						>
							How it works
						</a>
						<a
							href="#city-starts"
							className="whitespace-nowrap transition-colors hover:text-[var(--mapetite-text)]"
						>
							Start
						</a>
					</div>
					<div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
						{isAuthenticated ? (
							<>
								<Link
									to="/account"
									className="inline-flex items-center gap-2 rounded-[10px] border border-transparent px-2 py-1.5 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:border-[rgba(255,236,220,0.1)] hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
									aria-label="Open account"
								>
									<span className="hidden xl:inline">Account</span>
									<span className="hidden xl:inline">{firstName}</span>
									<span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.04)] text-sm font-medium text-[var(--mapetite-text)]">
										{userInitial}
									</span>
								</Link>
								<Button
									onClick={logout}
									variant="outline"
									size="sm"
									className="mapetite-quiet-button rounded-[10px] whitespace-nowrap"
								>
									<LogOut className="mr-2 size-4" />
									Log Out
								</Button>
							</>
						) : (
							<>
								<Button
									onClick={() => setIsLogInOpen(true)}
									size="sm"
									variant="ghost"
									className="rounded-[10px] whitespace-nowrap text-[var(--mapetite-text-soft)] hover:bg-transparent hover:text-[var(--mapetite-text)]"
								>
									Log In
								</Button>
								<Button
									onClick={() => setIsSignUpOpen(true)}
									size="sm"
									className="mapetite-accent-button rounded-[10px] px-4 whitespace-nowrap text-[#20140d]"
								>
									Sign Up
								</Button>
							</>
						)}
						<Button
							asChild
							size="sm"
							className="mapetite-accent-button rounded-[10px] px-4 text-sm whitespace-nowrap"
						>
							<Link to="/restaurants">Open search</Link>
						</Button>
					</div>
				</nav>

				<section
					id="discover"
					className="scroll-mt-32 py-8 text-center md:py-16 lg:py-20"
				>
					<div className="mx-auto grid max-w-4xl justify-items-center">
						<div className="mapetite-eyebrow justify-center">
							Restaurant discovery, built around place
						</div>
						<h1 className="mt-5 max-w-4xl text-[clamp(3rem,13vw,5rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-[var(--mapetite-text)] md:text-[5.9rem]">
							Find restaurants by city, without the noise.
						</h1>
						<p className="mapetite-muted-copy mt-6 max-w-2xl text-lg leading-8 md:text-xl md:leading-9">
							Search a place, compare a cleaner shortlist, and open details only
							when a restaurant feels worth the trip.
						</p>
						<div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
							<Button
								asChild
								size="lg"
								className="mapetite-accent-button w-full max-w-[340px] rounded-[10px] px-7 sm:w-auto"
							>
								<Link to="/restaurants">Search restaurants</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="lg"
								className="mapetite-quiet-button w-full max-w-[340px] rounded-[10px] px-7 sm:w-auto"
							>
								<a href="#search">Preview the flow</a>
							</Button>
						</div>
					</div>
				</section>

				<section id="search" className="scroll-mt-32 py-8 md:py-12">
					<div className="mapetite-panel overflow-hidden p-5 md:p-7 lg:p-8">
						<div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-start">
							<div className="mapetite-section-stack text-center lg:text-left">
								<div className="mapetite-eyebrow justify-center lg:justify-start">
									Product preview
								</div>
								<h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)] md:text-4xl">
									Start with a city. Let the shortlist get quieter.
								</h2>
								<p className="mapetite-muted-copy text-base leading-7">
									Mapetite keeps search practical: normalized categories, useful
									context, and actions close enough to decide.
								</p>
								<div className="flex flex-wrap justify-center gap-2 lg:justify-start">
									{cityStarts.map((city) => (
										<button
											key={city.key}
											type="button"
											onClick={() => handleSelectCity(city.key)}
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
								<Button
									type="button"
									size="lg"
									onClick={() => handleCityStart(selectedCity.name)}
									className="mapetite-accent-button mx-auto w-full max-w-[340px] rounded-[10px] px-6 lg:mx-0 lg:w-auto"
								>
									Search {selectedCity.name}
									<ArrowRight className="ml-2 size-4" />
								</Button>
							</div>

							<div className="rounded-[16px] border border-[var(--mapetite-border)] bg-black/15 p-4 md:p-5">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
									<div>
										<p className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
											{selectedCity.name}, {selectedCity.country}
										</p>
										<strong className="mt-2 block text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											{selectedCity.tone}
										</strong>
									</div>
									<p className="mapetite-muted-copy max-w-sm text-sm leading-6">
										{selectedCity.summary}
									</p>
								</div>

								<div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
									<div className="space-y-3">
										{selectedCity.restaurants.map((restaurant, index) => (
											<button
												key={restaurant.name}
												type="button"
												onClick={() => setSelectedRestaurantIndex(index)}
												aria-pressed={selectedRestaurantIndex === index}
												className={cn(
													"w-full rounded-[12px] border px-4 py-3 text-left transition-colors",
													selectedRestaurantIndex === index
														? "border-[var(--mapetite-border-strong)] bg-[var(--mapetite-accent-soft)]"
														: "border-[var(--mapetite-border)] bg-white/[0.03] hover:bg-white/[0.06]",
												)}
											>
												<div className="flex items-start justify-between gap-3">
													<div>
														<strong className="block text-sm font-medium text-[var(--mapetite-text)]">
															{restaurant.name}
														</strong>
														<span className="mapetite-muted-copy mt-1 block text-sm">
															{restaurant.subtitle}
														</span>
													</div>
													<span className="rounded-full border border-[var(--mapetite-border)] px-2.5 py-1 text-xs text-[var(--mapetite-text-soft)]">
														{restaurant.signal}
													</span>
												</div>
											</button>
										))}
									</div>

									<div className="rounded-[14px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.035)] p-4">
										<div className="mapetite-media-fallback flex min-h-[190px] items-end rounded-[12px] p-4">
											<span className="text-sm text-[var(--mapetite-text-soft)]">
												Public listing preview
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
												<span
													key={item}
													className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.04] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]"
												>
													{item}
												</span>
											))}
										</div>
										<div className="mt-5 grid gap-2 sm:grid-cols-2">
											<div className="rounded-[10px] border border-[var(--mapetite-border)] px-3 py-2 text-center text-sm text-[var(--mapetite-text-soft)]">
												Save
											</div>
											<div className="rounded-[10px] border border-[var(--mapetite-border)] px-3 py-2 text-center text-sm text-[var(--mapetite-text-soft)]">
												Directions
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section id="experience" className="scroll-mt-32 py-8 md:py-12">
					<div className="mx-auto max-w-5xl">
						<div className="text-center">
							<div className="mapetite-eyebrow justify-center">How it works</div>
							<h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)] md:text-4xl">
								Three steps, fewer distractions.
							</h2>
						</div>

						<div className="mt-6 grid gap-4 md:grid-cols-3">
							{howItWorks.map((item) => (
								<div key={item.step} className="mapetite-panel-soft p-5">
									<span className="mapetite-faint-copy text-xs font-medium tracking-[0.14em] uppercase">
										{item.step}
									</span>
									<strong className="mt-4 block text-lg font-medium text-[var(--mapetite-text)]">
										{item.title}
									</strong>
									<p className="mapetite-muted-copy mt-2 text-sm leading-6">
										{item.copy}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section id="city-starts" className="scroll-mt-32 py-10 md:py-16">
					<div className="mapetite-panel mx-auto max-w-4xl px-6 py-8 text-center md:px-10 md:py-10">
						<div className="mapetite-eyebrow justify-center">
							Ready to search your city?
						</div>
						<h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)] md:text-4xl">
							Open Mapetite and build a better shortlist.
						</h2>
						<p className="mapetite-muted-copy mx-auto mt-4 max-w-2xl text-base leading-7">
							Use live provider data where available, with honest fallbacks when
							coverage is limited.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<Button
								asChild
								size="lg"
								className="mapetite-accent-button rounded-[10px] px-6"
							>
								<Link to="/restaurants">
									Start searching
									<ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
						</div>
					</div>
				</section>
			</div>
			<MapetiteFooter />

			<SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
			<LogInModal open={isLogInOpen} onOpenChange={setIsLogInOpen} />
		</div>
	);
}
