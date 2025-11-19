import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Menu, Search, Utensils, X } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	const location = useLocation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const navItems = [
		{ path: "/", label: "Home", icon: Home },
		{ path: "/restaurants", label: "Restaurants", icon: Utensils },
	];

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	return (
		<div className="flex min-h-screen w-full overflow-x-hidden">
			{/* Left Sidebar - Curated Explorer's Journal Style - Hidden on mobile */}
			<aside className="hidden md:flex w-72 flex-shrink-0 border-r-2 border-primary/20 bg-sidebar relative texture-linen">
				{/* Subtle wood grain overlay */}
				<div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_0%,oklch(0.3_0.04_150)_50%,transparent_100%)] bg-[length:3px_100%]" />

				<div className="flex h-full flex-col relative z-10">
					{/* Logo/Brand - Engraved Plate Style */}
					<div className="border-b-2 border-primary/30 p-8 bg-gradient-to-b from-sidebar to-[oklch(0.14_0.015_145)]">
						<Link to="/" className="block">
							{/* Ornamental frame */}
							<div className="border-2 border-primary/40 rounded-sm p-4 bg-[oklch(0.12_0.01_145)] shadow-ornate">
								<div className="flex items-center gap-4">
									{/* Etched icon with gold accent */}
									<div className="flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-primary via-[oklch(0.6_0.1_60)] to-[oklch(0.55_0.08_50)] shadow-lg border border-primary/50">
										<Utensils className="h-8 w-8 text-[oklch(0.16_0.02_145)] stroke-[2.5]" />
									</div>
									<div>
										<h1 className="text-2xl font-serif-display text-primary tracking-wide">
											Mapetite
										</h1>
										<p className="text-xs text-primary/70 font-serif-elegant tracking-wider uppercase">
											Curated Dining
										</p>
									</div>
								</div>
							</div>
						</Link>
					</div>

					{/* Navigation - Elegant Journal Entries */}
					<nav className="flex-1 p-6">
						<div className="space-y-3">
							{navItems.map((item) => {
								const Icon = item.icon;
								const isActive = location.pathname === item.path;

								return (
									<Link
										key={item.path}
										to={item.path}
										className={cn(
											"flex items-center gap-4 rounded-sm px-5 py-4 text-base font-serif-elegant transition-all duration-200",
											"border-l-4 relative overflow-hidden group",
											isActive
												? "bg-gradient-to-r from-primary/20 to-primary/5 border-primary text-primary shadow-md"
												: "border-transparent text-sidebar-foreground/70 hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
										)}
									>
										{/* Subtle etched background pattern on hover */}
										<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,oklch(0.65_0.12_70_/_0.05)_0%,transparent_70%)]" />

										<Icon
											className={cn(
												"h-6 w-6 relative z-10 transition-all",
												isActive
													? "stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.65_0.12_70_/_0.4)]"
													: "stroke-[2]",
											)}
										/>
										<span className="relative z-10 tracking-wide">
											{item.label}
										</span>

										{/* Active indicator ornament */}
										{isActive && (
											<div className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.65_0.12_70)]" />
										)}
									</Link>
								);
							})}
						</div>
					</nav>

					{/* Footer - Journal Signature */}
					<div className="border-t-2 border-primary/30 p-6">
						<div className="rounded-sm border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.14_0.015_145)] to-[oklch(0.18_0.02_145)] p-5 shadow-layered">
							{/* Decorative corner ornaments */}
							<div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/50" />
							<div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/50" />
							<div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/50" />
							<div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/50" />

							<p className="text-sm font-serif-elegant text-primary/90 leading-relaxed">
								Discover exquisite restaurants worldwide
							</p>
							<p className="mt-2 text-xs text-primary/60 tracking-wider uppercase font-medium">
								Est. 2024 · Premium Dining
							</p>
						</div>
					</div>
				</div>
			</aside>

			{/* Mobile Overlay Menu */}
			{isMobileMenuOpen && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: Overlay background for modal - intentional click-to-dismiss UX pattern
				<div
					className="md:hidden fixed inset-0 z-50 bg-black/50"
					onClick={closeMobileMenu}
				>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: Prevents click propagation to overlay - intentional UX pattern */}
					<aside
						className="absolute top-0 right-0 h-full w-80 max-w-[85vw] border-l-2 border-primary/20 bg-sidebar shadow-2xl animate-in slide-in-from-right"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Subtle wood grain overlay */}
						<div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_0%,oklch(0.3_0.04_150)_50%,transparent_100%)] bg-[length:3px_100%]" />

						<div className="flex h-full flex-col relative z-10">
							{/* Mobile Menu Header */}
							<div className="border-b-2 border-primary/30 p-6 bg-gradient-to-b from-sidebar to-[oklch(0.14_0.015_145)]">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-serif-display text-primary tracking-wide">
										Menu
									</h2>
									<button
										type="button"
										onClick={closeMobileMenu}
										className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
									>
										<X className="h-5 w-5 text-primary" />
									</button>
								</div>
								<div className="border-2 border-primary/40 rounded-sm p-4 bg-[oklch(0.12_0.01_145)] shadow-ornate">
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-primary via-[oklch(0.6_0.1_60)] to-[oklch(0.55_0.08_50)] shadow-lg border border-primary/50">
											<Utensils className="h-6 w-6 text-[oklch(0.16_0.02_145)] stroke-[2.5]" />
										</div>
										<div>
											<h1 className="text-xl font-serif-display text-primary tracking-wide">
												Mapetite
											</h1>
											<p className="text-xs text-primary/70 font-serif-elegant tracking-wider uppercase">
												Curated Dining
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Mobile Navigation */}
							<nav className="flex-1 p-6">
								<div className="space-y-3">
									{navItems.map((item) => {
										const Icon = item.icon;
										const isActive = location.pathname === item.path;

										return (
											<Link
												key={item.path}
												to={item.path}
												onClick={closeMobileMenu}
												className={cn(
													"flex items-center gap-4 rounded-sm px-5 py-4 text-base font-serif-elegant transition-all duration-200",
													"border-l-4 relative overflow-hidden group",
													isActive
														? "bg-gradient-to-r from-primary/20 to-primary/5 border-primary text-primary shadow-md"
														: "border-transparent text-sidebar-foreground/70 hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
												)}
											>
												<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,oklch(0.65_0.12_70_/_0.05)_0%,transparent_70%)]" />

												<Icon
													className={cn(
														"h-6 w-6 relative z-10 transition-all",
														isActive
															? "stroke-[2.5] drop-shadow-[0_0_8px_oklch(0.65_0.12_70_/_0.4)]"
															: "stroke-[2]",
													)}
												/>
												<span className="relative z-10 tracking-wide">
													{item.label}
												</span>

												{isActive && (
													<div className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.65_0.12_70)]" />
												)}
											</Link>
										);
									})}
								</div>
							</nav>

							{/* Mobile Footer */}
							<div className="border-t-2 border-primary/30 p-6">
								<div className="rounded-sm border-2 border-primary/30 bg-gradient-to-br from-[oklch(0.14_0.015_145)] to-[oklch(0.18_0.02_145)] p-5 shadow-layered relative">
									<div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/50" />
									<div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/50" />
									<div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/50" />
									<div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/50" />

									<p className="text-sm font-serif-elegant text-primary/90 leading-relaxed">
										Discover exquisite restaurants worldwide
									</p>
									<p className="mt-2 text-xs text-primary/60 tracking-wider uppercase font-medium">
										Est. 2024 · Premium Dining
									</p>
								</div>
							</div>
						</div>
					</aside>
				</div>
			)}

			{/* Main Content - Warm Parchment Background with Vertical Gradient */}
			<div className="flex flex-1 flex-col bg-gradient-to-b from-[oklch(0.97_0.008_75)] to-[oklch(0.95_0.012_65)] relative min-w-0 overflow-x-hidden">
				{/* Extremely subtle parchment/paper texture - fine grain */}
				<div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,oklch(0.82_0.015_65)_1px,oklch(0.82_0.015_65)_1.5px)]" />
				<div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,oklch(0.85_0.012_68)_1px,oklch(0.85_0.012_68)_1.5px)]" />

				{/* Ultra-subtle organic noise pattern - simulates paper fiber */}
				<div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_20%_30%,oklch(0.88_0.01_70)_0%,transparent_1px),radial-gradient(circle_at_60%_70%,oklch(0.86_0.01_68)_0%,transparent_1px),radial-gradient(circle_at_40%_50%,oklch(0.87_0.01_72)_0%,transparent_1px)] bg-[length:4px_4px]" />

				{/* Very subtle vignette - maintains depth without darkening */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.92_0.01_70_/_0.08)_100%)]" />

				{/* Top Navigation Bar - Subtle Journal Header */}
				<header className="border-b-2 border-primary/20 bg-gradient-to-b from-[oklch(0.96_0.015_75)] to-[oklch(0.94_0.015_75)] shadow-sm relative z-10">
					<div className="flex h-16 items-center justify-between px-4 md:px-8">
						<div className="flex items-center gap-3 md:gap-4">
							<Search className="h-5 w-5 text-primary/60" />
							<span className="text-sm md:text-base font-serif-elegant text-foreground tracking-wide">
								{location.pathname === "/"
									? "Welcome, Explorer"
									: "Restaurant Search"}
							</span>
						</div>

						<div className="flex items-center gap-4">
							{/* Mobile Hamburger Menu Button */}
							<button
								type="button"
								onClick={() => setIsMobileMenuOpen(true)}
								className="md:hidden h-10 w-10 flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-md"
								aria-label="Open menu"
							>
								<Menu className="h-5 w-5 text-[oklch(0.16_0.02_145)]" />
							</button>
							<div className="hidden md:block h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary shadow-md border-2 border-primary/30" />
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-auto relative z-10 w-full">
					{children}
				</main>
			</div>
		</div>
	);
}
