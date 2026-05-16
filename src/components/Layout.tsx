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
		{ path: "/restaurants", label: "Restaurants", icon: Utensils },
	];
	const currentSectionLabel =
		location.pathname === "/"
			? "Home"
			: location.pathname.startsWith("/restaurants/")
				? "Restaurant detail"
				: "Restaurant search";

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	return (
		<div className="flex min-h-screen w-full overflow-x-hidden bg-background text-foreground">
			{isMobileMenuOpen && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: Overlay background for modal - intentional click-to-dismiss UX pattern
				<div
					className="fixed inset-0 z-50 bg-black/50 md:hidden"
					onClick={closeMobileMenu}
				>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: Prevents click propagation to overlay - intentional UX pattern */}
					<aside
						className="absolute right-0 top-0 h-full w-80 max-w-[85vw] border-l border-border bg-sidebar"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex h-full flex-col">
							<div className="flex items-center justify-between border-b border-border p-4">
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-md border border-border bg-background">
										<Utensils className="size-4 text-primary" />
									</div>
									<div>
										<h2 className="text-sm font-semibold text-sidebar-foreground">
											Mapetite
										</h2>
										<p className="text-xs text-sidebar-foreground/70">
											Menu
										</p>
									</div>
								</div>
								<button
									type="button"
									onClick={closeMobileMenu}
									className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-sidebar-foreground transition-colors hover:bg-muted"
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
													"flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
													isActive
														? "bg-sidebar-accent text-sidebar-accent-foreground"
														: "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
												)}
											>
												<Icon className="size-4" />
												<span>{item.label}</span>
											</Link>
										);
									})}
								</div>

								<div className="mt-6 space-y-2 border-t border-border pt-4">
									{isAuthenticated ? (
										<>
											<div className="rounded-md border border-border bg-background p-3">
												<p className="text-xs text-muted-foreground">
													Signed in as
												</p>
												<p className="mt-1 text-sm font-medium text-foreground">
													{firstName}
												</p>
											</div>
											<Button
												onClick={() => {
													closeMobileMenu();
													logout();
												}}
												variant="outline"
												className="w-full"
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
												className="w-full"
											>
												<LogIn className="mr-2 size-4" />
												Log In
											</Button>
											<Button
												onClick={() => {
													closeMobileMenu();
													setIsSignUpOpen(true);
												}}
												className="w-full"
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

			<div className="flex min-w-0 flex-1 flex-col bg-background">
				<header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
					<div className="flex h-14 items-center justify-between px-4 md:px-6">
						<div className="flex min-w-0 items-center gap-4">
							<Link to="/" className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-md border border-border bg-background">
									<Utensils className="size-5 text-primary" />
								</div>
								<div className="min-w-0">
									<h1 className="truncate text-base font-semibold tracking-tight text-foreground">
										Mapetite
									</h1>
									<p className="truncate text-sm text-muted-foreground">
										{currentSectionLabel}
									</p>
								</div>
							</Link>

							<nav className="hidden items-center gap-1 md:flex">
								{navItems.map((item) => {
									const Icon = item.icon;
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
												"flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
												isActive
													? "bg-muted text-foreground"
													: "text-muted-foreground hover:bg-muted hover:text-foreground",
											)}
										>
											<Icon className="size-4" />
											<span>{item.label}</span>
										</Link>
									);
								})}
							</nav>
						</div>

						<div className="flex items-center gap-2">
							<div className="hidden items-center gap-2 md:flex">
								{isAuthenticated ? (
									<>
										<span className="text-sm text-muted-foreground">
											{firstName}
										</span>
										<button
											type="button"
											onClick={() => {
												console.log(
													"Profile icon clicked - future feature: upload profile picture",
												);
											}}
											className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-sm font-medium text-foreground"
											aria-label="User profile"
											title="Click to change profile picture (coming soon)"
										>
											{userInitials}
										</button>
										<Button onClick={logout} variant="outline" size="sm">
											<LogOut className="mr-2 size-4" />
											Log Out
										</Button>
									</>
								) : (
									<>
										<Button
											onClick={() => setIsLogInOpen(true)}
											variant="outline"
											size="sm"
										>
											<LogIn className="mr-2 size-4" />
											Log In
										</Button>
										<Button onClick={() => setIsSignUpOpen(true)} size="sm">
											<UserPlus className="mr-2 size-4" />
											Sign Up
										</Button>
									</>
								)}
							</div>

							<button
								type="button"
								onClick={() => setIsMobileMenuOpen(true)}
								className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground md:hidden"
								aria-label="Open menu"
							>
								<Menu className="size-4" />
							</button>
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
