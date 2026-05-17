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
		{ path: "/restaurants", label: "Search", icon: Utensils },
	];
	const currentSectionLabel =
		location.pathname === "/"
			? "Home"
			: location.pathname.startsWith("/restaurants/")
				? "Detail"
				: "Search";

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	return (
		<div className="mapetite-canvas-bg flex min-h-screen w-full overflow-x-clip text-[var(--mapetite-text)]">
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
											{currentSectionLabel}
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
									{navItems.map((item) => {
										const Icon = item.icon;
										const isActive = location.pathname === item.path;

										return (
											<Link
												key={item.path}
												to={item.path}
												onClick={closeMobileMenu}
												className={cn(
													"flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
													isActive
														? "border border-[rgba(213,154,104,0.24)] bg-[rgba(213,154,104,0.12)] text-[var(--mapetite-text)]"
														: "text-[var(--mapetite-text-soft)] hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]",
												)}
											>
												<Icon className="size-4" />
												<span>{item.label}</span>
											</Link>
										);
									})}
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

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-10">
					<div className="mapetite-container px-4 pt-4 pb-6 md:px-6 md:pt-8 md:pb-8">
						<div className="mapetite-panel-soft flex items-center justify-between gap-4 px-5 py-3 backdrop-blur md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
							<div className="flex min-w-0 items-center gap-6 md:justify-self-start">
								<Link to="/" className="flex min-w-0 items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-[10px] border border-[rgba(213,154,104,0.24)] bg-[linear-gradient(180deg,rgba(213,154,104,0.2),rgba(180,108,67,0.08))] text-[var(--mapetite-text)]">
										<Utensils className="size-4" />
									</div>
									<div className="min-w-0">
										<h1 className="truncate text-sm font-medium text-[var(--mapetite-text)]">
											Mapetite
										</h1>
									</div>
								</Link>
							</div>

							<nav className="hidden items-center justify-center gap-5 md:flex md:justify-self-center">
								{navItems.map((item) => {
									const isActive =
										item.path === "/"
											? location.pathname === item.path
											: location.pathname === item.path ||
												location.pathname.startsWith("/restaurants/");

									return (
										<Link
											key={item.path}
											to={item.path}
											className={cn(
												"text-sm transition-colors",
												isActive
													? "text-[var(--mapetite-text)]"
													: "text-[var(--mapetite-text-soft)] hover:text-[var(--mapetite-text)]",
											)}
										>
											<span>{item.label}</span>
										</Link>
									);
								})}
							</nav>

							<div className="flex items-center gap-2 md:justify-self-end">
								<div className="hidden items-center gap-2 md:flex">
								{isAuthenticated ? (
									<>
										<span className="text-sm text-[var(--mapetite-text-soft)]">
											{firstName}
										</span>
										<button
											type="button"
											onClick={() => {
												console.log(
												"Profile icon clicked - future feature: upload profile picture",
											);
										}}
											className="inline-flex size-9 items-center justify-center rounded-[10px] border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.04)] text-sm font-medium text-[var(--mapetite-text)]"
											aria-label="User profile"
											title="Click to change profile picture (coming soon)"
										>
											{userInitials}
										</button>
										<Button
											onClick={logout}
											variant="outline"
											size="sm"
											className="mapetite-quiet-button rounded-[10px]"
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
											className="rounded-[10px] text-[var(--mapetite-text-soft)] hover:bg-transparent hover:text-[var(--mapetite-text)]"
										>
											Log In
										</Button>
										<Button
											onClick={() => setIsSignUpOpen(true)}
											size="sm"
											className="mapetite-accent-button rounded-[10px] px-4 text-[#20140d]"
										>
											Sign Up
										</Button>
									</>
								)}
								</div>

								<button
									type="button"
									onClick={() => setIsMobileMenuOpen(true)}
									className="inline-flex size-9 items-center justify-center rounded-[10px] border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)] md:hidden"
									aria-label="Open menu"
								>
									<Menu className="size-4" />
								</button>
							</div>
						</div>
					</div>
				</header>

				<main className="min-w-0 flex-1">
					{children}
				</main>
			</div>

			<SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
			<LogInModal open={isLogInOpen} onOpenChange={setIsLogInOpen} />
		</div>
	);
}
