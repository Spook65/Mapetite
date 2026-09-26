import { LogInModal } from "@/components/auth/LogInModal";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { MapetiteFooter } from "@/components/MapetiteFooter";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthState } from "@/hooks/use-auth-api";
import { getAccountFirstName, getAccountInitials } from "@/lib/account-display";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Home,
	Heart,
	LogIn,
	LogOut,
	Menu,
	UserPlus,
	UserRound,
	Utensils,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	const location = useLocation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSignUpOpen, setIsSignUpOpen] = useState(false);
	const [isLogInOpen, setIsLogInOpen] = useState(false);
	const shouldRestoreMenuFocusRef = useRef(true);
	const shouldRestoreFocusAfterAuthRef = useRef(false);
	const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);

	// Get authentication state
	const { isAuthenticated, profile, logout } = useAuthState();

	// Get user display data
	const userInitials = getAccountInitials(profile);
	const firstName = getAccountFirstName(profile);

	const navItems = [
		{ path: "/", label: "Home", icon: Home },
		{ path: "/restaurants", label: "Search", icon: Utensils },
		{ path: "/saved", label: "Saved", icon: Heart },
	];
	const mobileNavItems = isAuthenticated
		? [...navItems, { path: "/account", label: "Account", icon: UserRound }]
		: navItems;
	const currentSectionLabel =
		location.pathname === "/"
			? "Home"
			: location.pathname.startsWith("/account")
				? "Account"
			: location.pathname.startsWith("/saved")
				? "Saved"
			: location.pathname.startsWith("/restaurants/")
				? "Detail"
				: "Search";
	const isAdaptiveShellPreview =
		new URLSearchParams(location.searchStr).get("ui") === "adaptive-shell";

	const closeMobileMenu = () => setIsMobileMenuOpen(false);
	const closeMobileMenuForTransition = () => {
		shouldRestoreMenuFocusRef.current = false;
		setIsMobileMenuOpen(false);
	};
	const handleMobileMenuOpenChange = (open: boolean) => {
		if (open) shouldRestoreMenuFocusRef.current = true;
		setIsMobileMenuOpen(open);
	};
	const restoreMenuFocusAfterAuth = () => {
		if (!shouldRestoreFocusAfterAuthRef.current) return;
		shouldRestoreFocusAfterAuthRef.current = false;
		requestAnimationFrame(() => mobileMenuTriggerRef.current?.focus());
	};

	useEffect(() => {
		const desktopMedia = window.matchMedia("(min-width: 768px)");
		const closeAtDesktop = (event: MediaQueryListEvent) => {
			if (event.matches) closeMobileMenuForTransition();
		};
		desktopMedia.addEventListener("change", closeAtDesktop);
		return () => desktopMedia.removeEventListener("change", closeAtDesktop);
	}, []);

	return (
		<Dialog open={isMobileMenuOpen} onOpenChange={handleMobileMenuOpenChange}>
			<div className="mapetite-layout mapetite-page-shell flex min-h-screen w-full overflow-x-clip text-[var(--mapetite-text)]">
				<DialogContent
					aria-modal="true"
					showCloseButton={false}
					overlayClassName="mapetite-layout-mobile-overlay md:hidden"
					onCloseAutoFocus={(event) => {
						if (!shouldRestoreMenuFocusRef.current) {
							event.preventDefault();
							shouldRestoreMenuFocusRef.current = true;
						}
					}}
					className="mapetite-layout-mobile-drawer top-0 right-0 bottom-0 left-auto h-dvh w-80 max-w-[85vw] translate-x-0 translate-y-0 gap-0 rounded-none border-y-0 border-r-0 border-l border-[var(--mapetite-border)] bg-[#16110e] p-0 shadow-none md:hidden"
				>
					<DialogTitle className="sr-only">Navigation</DialogTitle>
					<DialogDescription className="sr-only">
						Primary navigation and account actions.
					</DialogDescription>
					<div className="flex h-full flex-col">
							<div className="flex items-center justify-between border-b border-[var(--mapetite-border)] p-4">
								<div className="flex items-center gap-3">
									<div className="mapetite-layout-brand-mark flex size-9 items-center justify-center rounded-[10px] border border-[rgba(213,154,104,0.24)] bg-[linear-gradient(180deg,rgba(213,154,104,0.2),rgba(180,108,67,0.08))] text-[var(--mapetite-text)]">
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
								<DialogClose asChild>
									<button
										type="button"
										className="inline-flex size-9 items-center justify-center rounded-[10px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)] transition-colors hover:bg-[rgba(255,248,242,0.08)]"
										aria-label="Close menu"
									>
										<X className="size-4" />
									</button>
								</DialogClose>
							</div>

							<nav className="flex-1 px-3 py-4">
								<div className="space-y-1">
									{mobileNavItems.map((item) => {
										const Icon = item.icon;
										const isActive = location.pathname === item.path;

										return (
											<Link
												key={item.path}
												to={item.path}
												search={
													item.path === "/restaurants" && isAdaptiveShellPreview
														? { ui: "adaptive-shell" }
														: undefined
												}
												onClick={closeMobileMenuForTransition}
												aria-current={isActive ? "page" : undefined}
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
											<Link
												to="/account"
												onClick={closeMobileMenuForTransition}
												className="block rounded-[10px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] p-3 transition-colors hover:bg-[rgba(255,248,242,0.07)]"
											>
												<p className="text-xs text-[var(--mapetite-text-faint)]">
													Signed in as
												</p>
												<p className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--mapetite-text)]">
													<UserRound className="size-4" />
													<span>{firstName}</span>
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
													shouldRestoreFocusAfterAuthRef.current = true;
													closeMobileMenuForTransition();
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
													shouldRestoreFocusAfterAuthRef.current = true;
													closeMobileMenuForTransition();
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
				</DialogContent>

				<div className="flex min-w-0 flex-1 flex-col">
				<header className="mapetite-layout-header sticky top-0 z-10">
					<div className="mapetite-layout-header-container mapetite-container px-4 pt-4 pb-6 md:px-6 md:pt-8 md:pb-8">
						<div className="mapetite-layout-app-bar mapetite-panel-soft flex items-center justify-between gap-4 px-5 py-3 backdrop-blur md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
							<div className="flex min-w-0 items-center gap-6 md:justify-self-start">
								<Link to="/" className="flex min-w-0 items-center gap-3">
									<div className="mapetite-layout-brand-mark flex size-9 items-center justify-center rounded-[10px] border border-[rgba(213,154,104,0.24)] bg-[linear-gradient(180deg,rgba(213,154,104,0.2),rgba(180,108,67,0.08))] text-[var(--mapetite-text)]">
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
											: item.path === "/saved"
												? location.pathname === item.path
											: location.pathname === item.path ||
												location.pathname.startsWith("/restaurants/");

									return (
										<Link
											key={item.path}
											to={item.path}
											search={
												item.path === "/restaurants" && isAdaptiveShellPreview
													? { ui: "adaptive-shell" }
													: undefined
											}
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
										<Link
											to="/account"
											className={cn(
												"inline-flex items-center gap-2 rounded-[10px] border px-2 py-1.5 text-sm transition-colors",
												location.pathname.startsWith("/account")
													? "border-[rgba(213,154,104,0.28)] bg-[rgba(213,154,104,0.1)] text-[var(--mapetite-text)]"
													: "border-transparent text-[var(--mapetite-text-soft)] hover:border-[rgba(255,236,220,0.1)] hover:bg-[rgba(255,248,242,0.05)] hover:text-[var(--mapetite-text)]",
											)}
											aria-label="Open account"
										>
											<span>{firstName}</span>
											<span className="inline-flex size-9 items-center justify-center rounded-[10px] border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.04)] text-sm font-medium text-[var(--mapetite-text)]">
												{userInitials}
											</span>
										</Link>
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

								<DialogTrigger asChild>
									<button
										ref={mobileMenuTriggerRef}
										type="button"
										className="mapetite-layout-menu-button inline-flex size-9 items-center justify-center rounded-[10px] border border-[rgba(255,236,220,0.12)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)] md:hidden"
										aria-label="Open menu"
									>
										<Menu className="size-4" />
									</button>
								</DialogTrigger>
							</div>
						</div>
					</div>
				</header>

				<main className="mapetite-layout-main min-w-0 flex-1">
					{children}
				</main>
				<MapetiteFooter />
			</div>

			<SignUpModal
				open={isSignUpOpen}
				onOpenChange={(open) => {
					setIsSignUpOpen(open);
					if (!open) restoreMenuFocusAfterAuth();
				}}
			/>
			<LogInModal
				open={isLogInOpen}
				onOpenChange={(open) => {
					setIsLogInOpen(open);
					if (!open) restoreMenuFocusAfterAuth();
				}}
			/>
			</div>
		</Dialog>
	);
}
