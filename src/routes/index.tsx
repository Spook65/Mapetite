import { LogInModal } from "@/components/auth/LogInModal";
import { SignUpModal } from "@/components/auth/SignUpModal";
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
		stageTag: "Example flow",
		stageNote:
			"A sample flow for comparing compact rooms, counter formats, and quieter plans.",
		summary:
			"Begin here when the night leans toward compact dining rooms, quieter service, and a shortlist that narrows quickly.",
		focusTitle: "Tokyo keeps the shortlist tighter from the first result.",
		focusSubtitle: "Counter dining · ramen · izakaya",
		bestFor: "Counter dining and compact shortlist decisions.",
		shortlistMood: "Compact, precise, and easy to narrow.",
		naturalNextMove: "Open details when one room feels worth the trip.",
		heroTitle: "Counter dining, ramen, izakaya",
		shortlistLabel: "Example shortlist",
		tags: ["Omakase", "Ramen", "Izakaya"],
		restaurants: [
			{
				name: "Counter dining",
				subtitle: "Counter dining · Shinjuku",
				signal: "Focused",
				detail:
					"A sample decision card for comparing pacing, room size, and neighborhood fit.",
				imageLabel: "Preview artwork · counter-style context",
				meta: ["Omakase", "Shinjuku", "Preview"],
			},
			{
				name: "Ramen room",
				subtitle: "Ramen · Nakameguro",
				signal: "Compact",
				detail:
					"A sample card for a simpler stop where route, neighborhood, and timing matter more than ceremony.",
				imageLabel: "Preview artwork · neighborhood pace",
				meta: ["Ramen", "Nakameguro", "Preview"],
			},
			{
				name: "Izakaya option",
				subtitle: "Izakaya · Ebisu",
				signal: "Lively",
				detail:
					"A sample comparison point for a warmer, more social room in the shortlist.",
				imageLabel: "Preview artwork · charcoal counter mood",
				meta: ["Izakaya", "Ebisu", "Preview"],
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
		shortlistLabel: "Example shortlist",
		tags: ["Bistro", "Wine bar", "Tasting menu"],
		restaurants: [
			{
				name: "Bistro table",
				subtitle: "Bistro · Saint-Germain",
				signal: "Classic",
				detail:
					"A sample card for comparing room character, location, and a slower meal.",
				imageLabel: "Preview artwork · bistro room context",
				meta: ["Bistro", "Saint-Germain", "Preview"],
			},
			{
				name: "Wine bar",
				subtitle: "Wine bar · Le Marais",
				signal: "Flexible",
				detail:
					"A sample option for lighter plans, smaller plates, and easier second stops.",
				imageLabel: "Preview artwork · narrow room energy",
				meta: ["Wine bar", "Le Marais", "Preview"],
			},
			{
				name: "Tasting menu",
				subtitle: "Tasting menu · 7th arrondissement",
				signal: "Occasion",
				detail:
					"A sample card for when the night needs a more deliberate centerpiece.",
				imageLabel: "Preview artwork · tasting room pace",
				meta: ["Tasting menu", "7th arrondissement", "Preview"],
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
		shortlistLabel: "Example shortlist",
		tags: ["Dining room", "Gastropub", "Chef-led"],
		restaurants: [
			{
				name: "Dining room",
				subtitle: "Dining room · Marylebone",
				signal: "Polished",
				detail:
					"A sample card for an occasion-ready room without forcing a heavy night.",
				imageLabel: "Preview artwork · composed tables",
				meta: ["Dining room", "Marylebone", "Preview"],
			},
			{
				name: "Gastropub",
				subtitle: "Gastropub · Notting Hill",
				signal: "Relaxed",
				detail:
					"A sample option for relaxed pacing, neighborhood fit, and easier plans.",
				imageLabel: "Preview artwork · corner pub glow",
				meta: ["Gastropub", "Notting Hill", "Preview"],
			},
			{
				name: "Chef-led menu",
				subtitle: "Chef-led menu · Shoreditch",
				signal: "Focused",
				detail:
					"A sample card for sharper pacing when the shortlist needs a clearer standout.",
				imageLabel: "Preview artwork · chef pass context",
				meta: ["Chef-led", "Shoreditch", "Preview"],
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
		shortlistLabel: "Example shortlist",
		tags: ["Rooftop", "Hotel dining", "Tasting menu"],
		restaurants: [
			{
				name: "Rooftop setting",
				subtitle: "Rooftop dining · Dubai Marina",
				signal: "Scenic",
				detail:
					"A sample card for route-and-room decisions where the setting matters.",
				imageLabel: "Preview artwork · skyline terrace mood",
				meta: ["Rooftop", "Dubai Marina", "Preview"],
			},
			{
				name: "Hotel dining",
				subtitle: "Hotel dining · Palm Jumeirah",
				signal: "Composed",
				detail:
					"A sample option for calmer service, setting confidence, and easier comparison.",
				imageLabel: "Preview artwork · waterfront dining mood",
				meta: ["Hotel dining", "Palm Jumeirah", "Preview"],
			},
			{
				name: "Tasting room",
				subtitle: "Tasting menu · DIFC",
				signal: "Deliberate",
				detail:
					"A sample card for a more deliberate choice when the trip needs stronger context.",
				imageLabel: "Preview artwork · city-light dining mood",
				meta: ["Tasting menu", "DIFC", "Preview"],
			},
		],
	},
] as const;

function LandingPage() {
	const navigate = useNavigate();
	const [selectedCityKey, setSelectedCityKey] = useState<(typeof cityStarts)[number]["key"]>("tokyo");
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
		selectedCity.restaurants[selectedRestaurantIndex] ?? selectedCity.restaurants[0];
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
						onClick={(e) => e.stopPropagation()}
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
										Search start
									</a>
									<a
										href="#experience"
										onClick={closeMobileMenu}
										className="block rounded-[10px] px-3 py-2.5 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
									>
										Experience
									</a>
									<a
										href="#city-starts"
										onClick={closeMobileMenu}
										className="block rounded-[10px] px-3 py-2.5 text-sm text-[var(--mapetite-text-soft)] transition-colors hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]"
									>
										City starts
									</a>
								</div>
								</div>

								<div className="mt-6 space-y-2 border-t border-[var(--mapetite-border)] pt-4">
									{isAuthenticated ? (
										<>
											<div className="rounded-[10px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] p-3">
												<p className="text-xs text-[var(--mapetite-text-faint)]">
													Signed in as
												</p>
												<p className="mt-1 text-sm font-medium text-[var(--mapetite-text)]">
													{firstName}
												</p>
											</div>
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
						<a href="#discover" className="whitespace-nowrap transition-colors hover:text-[var(--mapetite-text)]">
							Discover
						</a>
						<a href="#search" className="whitespace-nowrap transition-colors hover:text-[var(--mapetite-text)]">
							Search start
						</a>
						<a href="#experience" className="hidden whitespace-nowrap transition-colors hover:text-[var(--mapetite-text)] xl:inline">
							Experience
						</a>
						<a href="#city-starts" className="whitespace-nowrap transition-colors hover:text-[var(--mapetite-text)]">
							City starts
						</a>
					</div>
					<div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
						{isAuthenticated ? (
							<>
								<span className="hidden text-sm text-[var(--mapetite-text-soft)] xl:inline">
									{firstName}
								</span>
								<div
									className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.04)] text-sm font-medium text-[var(--mapetite-text)]"
									aria-label="User profile"
								>
									{userInitial}
								</div>
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
					className="scroll-mt-32 py-10 md:py-14 lg:py-16"
				>
					<div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:gap-12">
						<div className="mapetite-section-stack items-center text-center md:items-stretch md:text-left">
							<div className="mapetite-eyebrow justify-center md:justify-start">
								Restaurant discovery, built around place
							</div>
							<div className="grid justify-items-center md:justify-items-start">
								<h1 className="max-w-[10ch] text-5xl font-semibold tracking-[-0.06em] text-[var(--mapetite-text)] sm:text-6xl lg:text-[5rem] lg:leading-[0.94]">
									Find restaurants worth crossing the city for.
								</h1>
								<p className="mapetite-muted-copy mt-5 max-w-xl text-lg leading-8">
									Start with a city, open a shortlist that fits the night, and go
									deeper only when a restaurant feels worth the trip.
								</p>
							</div>

							<div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row md:flex-wrap md:items-center">
								<Button
									asChild
									size="lg"
									className="mapetite-accent-button w-full max-w-[350px] rounded-[10px] px-6 md:w-auto md:max-w-none"
								>
									<Link to="/restaurants">Search restaurants</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="mapetite-quiet-button w-full max-w-[350px] rounded-[10px] px-6 md:w-auto md:max-w-none"
								>
									<a href="#experience">See how it opens</a>
								</Button>
								<p className="mapetite-faint-copy basis-full text-center text-sm md:text-left">
									Opens the full search page. City starts are separate.
								</p>
							</div>
						</div>

						<div className="grid gap-4">
							<div className="mapetite-panel overflow-hidden p-5 md:p-6">
								<div className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
									Sample city flow
								</div>
								<div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
									<strong className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
										{selectedCity.name}, {selectedCity.country}
									</strong>
									<div className="inline-flex w-fit items-center rounded-full border border-[var(--mapetite-border)] bg-white/[0.05] px-3 py-1 text-[13px] leading-5 text-[var(--mapetite-text-soft)]">
										{selectedCity.stageTag}
									</div>
								</div>

								<div className="mt-5 grid gap-3 sm:grid-cols-3">
									{selectedCity.restaurants.map((restaurant, index) => (
										<button
											key={restaurant.name}
											type="button"
											onClick={() => setSelectedRestaurantIndex(index)}
											aria-pressed={selectedRestaurantIndex === index}
											className={cn(
												"rounded-[10px] border px-4 py-3 text-left transition-colors",
												selectedRestaurantIndex === index
													? "border-[var(--mapetite-border-strong)] bg-[var(--mapetite-accent-soft)]"
													: "border-[var(--mapetite-border)] bg-black/10 hover:bg-white/[0.04]",
											)}
										>
											<strong className="block text-sm font-medium text-[var(--mapetite-text)]">
												{restaurant.name}
											</strong>
											<span className="mapetite-muted-copy mt-1 block text-sm">
												{restaurant.subtitle} · {restaurant.signal}
											</span>
										</button>
									))}
								</div>

								<div className="mt-5 flex flex-wrap gap-2">
									<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.05] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
										Favorite-ready
									</div>
									<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.05] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
										Detail context
									</div>
									<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.05] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
										Route-aware
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
							</div>

							<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-5">
								<div className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
									Shortlist preview
								</div>
								<div className="mt-4 space-y-3">
									{selectedCity.restaurants.map((restaurant, index) => (
										<button
											key={restaurant.name}
											type="button"
											onClick={() => setSelectedRestaurantIndex(index)}
											aria-pressed={selectedRestaurantIndex === index}
											className={cn(
												"flex w-full items-center justify-between gap-4 rounded-[10px] border px-4 py-3 text-left transition-colors",
												selectedRestaurantIndex === index
													? "border-[var(--mapetite-border-strong)] bg-[var(--mapetite-accent-soft)]"
													: "border-[var(--mapetite-border)] bg-white/[0.03] hover:bg-white/[0.06]",
											)}
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
												{restaurant.signal}
											</div>
										</button>
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
											{selectedCity.restaurants.length} sample cards
										</div>
									</div>
									<div className="mt-4 space-y-3">
										{selectedCity.restaurants.map((restaurant, index) => (
											<button
												key={restaurant.name}
												type="button"
												onClick={() => setSelectedRestaurantIndex(index)}
												aria-pressed={selectedRestaurantIndex === index}
												className={cn(
													"w-full rounded-[10px] border px-4 py-3 text-left transition-colors",
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
														<span className="mapetite-muted-copy text-sm">
															{restaurant.subtitle}
														</span>
													</div>
													<div className="text-sm font-medium text-[var(--mapetite-text)]">
														{restaurant.signal}
													</div>
												</div>
											</button>
										))}
									</div>
								</div>

								<div className="rounded-[12px] border border-[var(--mapetite-border)] bg-black/10 p-4">
									<div className="flex items-center justify-between gap-3">
										<span className="mapetite-faint-copy text-xs uppercase tracking-[0.14em]">
											Example detail
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
											Favorite from search
										</div>
										<div className="rounded-full border border-[var(--mapetite-border)] bg-white/[0.04] px-3 py-1.5 text-sm text-[var(--mapetite-text-soft)]">
											Directions in detail
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
										onClick={() => handleSelectCity(city.key)}
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

			<SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
			<LogInModal open={isLogInOpen} onOpenChange={setIsLogInOpen} />
		</div>
	);
}
