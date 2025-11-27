import { LogInModal } from "@/components/auth/LogInModal";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/use-auth-api";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Home,
	LogIn,
	LogOut,
	Menu,
	Search,
	User,
	UserPlus,
	Utensils,
	X,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
	children: React.ReactNode;
}

/**
 * Extract user initials from full name
 * @param name - User's full name
 * @returns Initials (e.g., "JD" for "John Doe")
 */
function getUserInitials(name: string): string {
	const nameParts = name.trim().split(/\s+/);
	if (nameParts.length === 0) return "U";
	if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
	// Get first and last name initials
	const firstInitial = nameParts[0].charAt(0).toUpperCase();
	const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
	return `${firstInitial}${lastInitial}`;
}

/**
 * Extract first name from full name
 * @param name - User's full name
 * @returns First name
 */
function getFirstName(name: string): string {
	return name.trim().split(/\s+/)[0];
}

export function Layout({ children }: LayoutProps) {
	const location = useLocation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSignUpOpen, setIsSignUpOpen] = useState(false);
	const [isLogInOpen, setIsLogInOpen] = useState(false);

	// Get authentication state
	const { isAuthenticated, profile, logout } = useAuthState();

	// Get user display data
	const userInitials = profile?.name ? getUserInitials(profile.name) : "U";
	const firstName = profile?.name ? getFirstName(profile.name) : "User";

	const navItems = [
		{ path: "/", label: "Home", icon: Home },
		{ path: "/restaurants", label: "Restaurants", icon: Utensils },
	];

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	return (
		<div className="flex min-h-screen w-full overflow-x-hidden bg-background">
			{/* Left Sidebar - Ultra-Premium Dark Theme - Hidden on mobile */}
			<aside className="hidden md:flex w-72 flex-shrink-0 border-r-2 border-primary/30 bg-sidebar relative shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.15)]">
				{/* Subtle dark texture overlay with blue glow */}
				<div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_40%,oklch(0.55_0.18_240_/_0.1)_0%,transparent_50%)]" />

				<div className="flex h-full flex-col relative z-10">
					{/* Logo/Brand - Premium Dark Style with Glow */}
					<div className="border-b-2 border-primary/30 p-8 bg-gradient-to-b from-sidebar to-[oklch(0.10_0.045_250)]">
						<Link to="/" className="block">
							{/* Glowing ornamental frame */}
							<div className="border-2 border-primary/50 rounded-sm p-4 bg-[oklch(0.10_0.045_250)] shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.3),0_4px_12px_black]">
								<div className="flex items-center gap-4">
									{/* Icon with blue/teal gradient and glow */}
									<div className="flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-primary via-secondary to-primary shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.6)] border-2 border-primary/60">
										<Utensils className="h-8 w-8 text-white stroke-[2.5] drop-shadow-[0_0_8px_white]" />
									</div>
									<div>
										<h1 className="text-2xl font-serif-display text-white tracking-wide drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.5)]">
											Mapetite
										</h1>
										<p className="text-xs text-secondary font-serif-elegant tracking-wider uppercase drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.4)]">
											Curated Dining
										</p>
									</div>
								</div>
							</div>
						</Link>
					</div>

					{/* Navigation - Premium Dark with Glowing Effects */}
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
												? "bg-gradient-to-r from-primary/25 to-primary/10 border-primary text-white shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)]"
												: "border-transparent text-white/70 hover:border-secondary hover:bg-gradient-to-r hover:from-secondary/15 hover:to-secondary/5 hover:text-white",
										)}
									>
										{/* Glowing background pattern on hover */}
										<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,oklch(0.65_0.14_195_/_0.08)_0%,transparent_70%)]" />

										<Icon
											className={cn(
												"h-6 w-6 relative z-10 transition-all",
												isActive
													? "stroke-[2.5] drop-shadow-[0_0_12px_oklch(0.55_0.18_240_/_0.8)] text-primary"
													: "stroke-[2] group-hover:text-secondary group-hover:drop-shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.6)]",
											)}
										/>
										<span className="relative z-10 tracking-wide">
											{item.label}
										</span>

										{/* Active indicator with strong glow */}
										{isActive && (
											<div className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.8),0_0_20px_oklch(0.55_0.18_240_/_0.4)]" />
										)}
									</Link>
								);
							})}
						</div>
					</nav>

					{/* Footer - Premium Dark Signature */}
					<div className="border-t-2 border-primary/30 p-6">
						<div className="rounded-sm border-2 border-primary/40 bg-gradient-to-br from-[oklch(0.10_0.045_250)] to-[oklch(0.16_0.045_245)] p-5 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.2)] relative">
							{/* Decorative glowing corner ornaments */}
							<div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/70 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
							<div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary/70 shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]" />
							<div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary/70 shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]" />
							<div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/70 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />

							<p className="text-sm font-serif-elegant text-white leading-relaxed">
								Discover exquisite restaurants worldwide
							</p>
							<p className="mt-2 text-xs text-secondary tracking-wider uppercase font-medium drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.4)]">
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
					className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
					onClick={closeMobileMenu}
				>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: Prevents click propagation to overlay - intentional UX pattern */}
					<aside
						className="absolute top-0 right-0 h-full w-80 max-w-[85vw] border-l-2 border-primary/40 bg-sidebar shadow-[0_0_40px_oklch(0.55_0.18_240_/_0.3)] animate-in slide-in-from-right"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Subtle dark texture with blue glow */}
						<div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_40%,oklch(0.55_0.18_240_/_0.15)_0%,transparent_50%)]" />

						<div className="flex h-full flex-col relative z-10">
							{/* Mobile Menu Header */}
							<div className="border-b-2 border-primary/30 p-6 bg-gradient-to-b from-sidebar to-[oklch(0.10_0.045_250)]">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-serif-display text-white tracking-wide drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.4)]">
										Menu
									</h2>
									<button
										type="button"
										onClick={closeMobileMenu}
										className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/30 hover:bg-primary/40 transition-colors shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)]"
									>
										<X className="h-5 w-5 text-white drop-shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.8)]" />
									</button>
								</div>
								<div className="border-2 border-primary/50 rounded-sm p-4 bg-[oklch(0.10_0.045_250)] shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.3)]">
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-primary via-secondary to-primary shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.6)] border-2 border-primary/60">
											<Utensils className="h-6 w-6 text-white stroke-[2.5] drop-shadow-[0_0_8px_white]" />
										</div>
										<div>
											<h1 className="text-xl font-serif-display text-white tracking-wide drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.5)]">
												Mapetite
											</h1>
											<p className="text-xs text-secondary font-serif-elegant tracking-wider uppercase drop-shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.4)]">
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
														? "bg-gradient-to-r from-primary/25 to-primary/10 border-primary text-white shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.3)]"
														: "border-transparent text-white/70 hover:border-secondary hover:bg-gradient-to-r hover:from-secondary/15 hover:to-secondary/5 hover:text-white",
												)}
											>
												<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,oklch(0.65_0.14_195_/_0.08)_0%,transparent_70%)]" />

												<Icon
													className={cn(
														"h-6 w-6 relative z-10 transition-all",
														isActive
															? "stroke-[2.5] drop-shadow-[0_0_12px_oklch(0.55_0.18_240_/_0.8)] text-primary"
															: "stroke-[2] group-hover:text-secondary group-hover:drop-shadow-[0_0_10px_oklch(0.65_0.14_195_/_0.6)]",
													)}
												/>
												<span className="relative z-10 tracking-wide">
													{item.label}
												</span>

												{isActive && (
													<div className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.8),0_0_20px_oklch(0.55_0.18_240_/_0.4)]" />
												)}
											</Link>
										);
									})}

									{/* Mobile Auth Buttons & Profile */}
									<div className="pt-4 border-t-2 border-primary/30 space-y-3">
										{isAuthenticated ? (
											<>
												{/* Mobile Profile Section */}
												<div className="rounded-sm border-2 border-primary/40 bg-gradient-to-br from-[oklch(0.10_0.045_250)] to-[oklch(0.16_0.045_245)] p-4 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.2)]">
													<div className="flex items-center gap-4">
														{/* Profile Icon */}
														<button
															type="button"
															onClick={() => {
																closeMobileMenu();
																// TODO: Future feature - open profile picture upload modal
																console.log(
																	"Profile icon clicked - future feature: upload profile picture",
																);
															}}
															className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-primary text-white font-serif-display text-base font-semibold shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.5)] hover:shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.7)] border-2 border-primary/60 transition-all hover:scale-105 cursor-pointer"
															aria-label="User profile"
															title="Click to change profile picture (coming soon)"
														>
															{userInitials}
														</button>

														{/* Welcome Message */}
														<div className="flex-1">
															<p className="text-sm font-serif-elegant text-white/70 tracking-wide">
																Welcome back,
															</p>
															<p className="text-base font-serif-display text-white tracking-wide">
																{firstName}
															</p>
														</div>
													</div>
												</div>

												{/* Logout Button */}
												<Button
													onClick={() => {
														closeMobileMenu();
														logout();
													}}
													variant="outline"
													className="cursor-pointer w-full border-primary/40 bg-transparent hover:bg-primary/10 text-white hover:text-white font-serif-elegant tracking-wide transition-all hover:border-primary hover:shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)]"
												>
													<LogOut className="mr-2 h-4 w-4" />
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
													className="cursor-pointer w-full border-primary/40 bg-transparent hover:bg-primary/10 text-white hover:text-white font-serif-elegant tracking-wide transition-all hover:border-primary hover:shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)]"
												>
													<LogIn className="mr-2 h-4 w-4" />
													Log In
												</Button>
												<Button
													onClick={() => {
														closeMobileMenu();
														setIsSignUpOpen(true);
													}}
													className="cursor-pointer w-full bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)] hover:shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.6)] border-2 border-primary/60 font-serif-elegant tracking-wide transition-all hover:scale-[1.02]"
												>
													<UserPlus className="mr-2 h-4 w-4" />
													Sign Up
												</Button>
											</>
										)}
									</div>
								</div>
							</nav>

							{/* Mobile Footer */}
							<div className="border-t-2 border-primary/30 p-6">
								<div className="rounded-sm border-2 border-primary/40 bg-gradient-to-br from-[oklch(0.10_0.045_250)] to-[oklch(0.16_0.045_245)] p-5 shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.2)] relative">
									<div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/70 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />
									<div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary/70 shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]" />
									<div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary/70 shadow-[0_0_8px_oklch(0.65_0.14_195_/_0.5)]" />
									<div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/70 shadow-[0_0_8px_oklch(0.55_0.18_240_/_0.5)]" />

									<p className="text-sm font-serif-elegant text-white leading-relaxed">
										Discover exquisite restaurants worldwide
									</p>
									<p className="mt-2 text-xs text-secondary tracking-wider uppercase font-medium drop-shadow-[0_0_6px_oklch(0.65_0.14_195_/_0.4)]">
										Est. 2024 · Premium Dining
									</p>
								</div>
							</div>
						</div>
					</aside>
				</div>
			)}

			{/* Main Content - Deep Midnight Navy Background */}
			<div className="flex flex-1 flex-col bg-background relative min-w-0 overflow-x-hidden">
				{/* Subtle dark texture with blue undertone */}
				<div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,oklch(0.15_0.04_245)_2px,oklch(0.15_0.04_245)_2.5px)]" />
				<div className="absolute inset-0 opacity-[0.02] bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,oklch(0.14_0.04_250)_2px,oklch(0.14_0.04_250)_2.5px)]" />

				{/* Ambient blue/teal glow effects */}
				<div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_30%,oklch(0.55_0.18_240_/_0.15)_0%,transparent_40%),radial-gradient(circle_at_80%_70%,oklch(0.65_0.14_195_/_0.1)_0%,transparent_40%)]" />

				{/* Subtle vignette for depth */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.08_0.045_250_/_0.3)_100%)]" />

				{/* Top Navigation Bar - Premium Dark Header */}
				<header className="border-b-2 border-primary/30 bg-gradient-to-b from-[oklch(0.14_0.04_250)] to-[oklch(0.14_0.04_250)] shadow-[0_4px_20px_oklch(0.55_0.18_240_/_0.15)] relative z-10">
					<div className="flex h-16 items-center justify-between px-4 md:px-8">
						<div className="flex items-center gap-3 md:gap-4">
							<Search className="h-5 w-5 text-primary drop-shadow-[0_0_10px_oklch(0.55_0.18_240_/_0.6)]" />
							<span className="text-sm md:text-base font-serif-elegant text-white tracking-wide">
								{location.pathname === "/"
									? "Welcome, Explorer"
									: "Restaurant Search"}
							</span>
						</div>

						<div className="flex items-center gap-3">
							{/* Auth Buttons & Profile - Hidden on mobile */}
							<div className="hidden md:flex items-center gap-3">
								{isAuthenticated ? (
									<>
										{/* Welcome Message */}
										<span className="text-sm font-serif-elegant text-white/90 tracking-wide">
											Welcome, {firstName}
										</span>

										{/* Profile Icon with Initials */}
										<button
											type="button"
											onClick={() => {
												// TODO: Future feature - open profile picture upload modal
												console.log(
													"Profile icon clicked - future feature: upload profile picture",
												);
											}}
											className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-primary text-white font-serif-display text-sm font-semibold shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.5)] hover:shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.7)] border-2 border-primary/60 transition-all hover:scale-105 cursor-pointer"
											aria-label="User profile"
											title="Click to change profile picture (coming soon)"
										>
											{userInitials}
										</button>

										{/* Logout Button */}
										<Button
											onClick={logout}
											variant="outline"
											size="sm"
											className="cursor-pointer border-primary/40 bg-transparent hover:bg-primary/10 text-white hover:text-white font-serif-elegant tracking-wide transition-all hover:border-primary hover:shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)]"
										>
											<LogOut className="mr-2 h-4 w-4" />
											Log Out
										</Button>
									</>
								) : (
									<>
										<Button
											onClick={() => setIsLogInOpen(true)}
											variant="outline"
											size="sm"
											className="cursor-pointer border-primary/40 bg-transparent hover:bg-primary/10 text-white hover:text-white font-serif-elegant tracking-wide transition-all hover:border-primary hover:shadow-[0_0_15px_oklch(0.55_0.18_240_/_0.4)]"
										>
											<LogIn className="mr-2 h-4 w-4" />
											Log In
										</Button>
										<Button
											onClick={() => setIsSignUpOpen(true)}
											size="sm"
											className="cursor-pointer bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.4)] hover:shadow-[0_0_30px_oklch(0.55_0.18_240_/_0.6)] border-2 border-primary/60 font-serif-elegant tracking-wide transition-all hover:scale-[1.02]"
										>
											<UserPlus className="mr-2 h-4 w-4" />
											Sign Up
										</Button>
									</>
								)}
							</div>

							{/* Mobile Hamburger Menu Button */}
							<button
								type="button"
								onClick={() => setIsMobileMenuOpen(true)}
								className="md:hidden h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary hover:opacity-90 transition-opacity shadow-[0_0_20px_oklch(0.55_0.18_240_/_0.5)]"
								aria-label="Open menu"
							>
								<Menu className="h-5 w-5 text-white drop-shadow-[0_0_8px_white]" />
							</button>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-auto relative z-10 w-full">
					{children}
				</main>
			</div>

			{/* Auth Modals */}
			<SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
			<LogInModal open={isLogInOpen} onOpenChange={setIsLogInOpen} />
		</div>
	);
}
