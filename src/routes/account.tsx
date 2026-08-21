import { LogInModal } from "@/components/auth/LogInModal";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/use-auth-api";
import { useFavorites } from "@/hooks/use-favorites";
import { getAccountInitials } from "@/lib/account-display";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, LogOut, Search, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/account")({
	component: AccountPage,
});

function AccountPage() {
	const { isAuthenticated, isLoading, profile, logout } = useAuthState();
	const [isLogInOpen, setIsLogInOpen] = useState(false);
	const [isSignUpOpen, setIsSignUpOpen] = useState(false);
	const { data: favoritesData, isLoading: isFavoritesLoading } = useFavorites({
		enabled: isAuthenticated,
	});

	const savedCount =
		favoritesData?.count ?? profile?.favorite_restaurant_ids?.length ?? 0;
	const displayName = profile?.name || "Mapetite user";
	const displayEmail = profile?.email || "Email unavailable";
	const initials = getAccountInitials(profile);

	return (
		<Layout>
			<div className="mapetite-page-shell min-h-full">
				<div className="mapetite-container px-4 py-4 md:px-6 md:py-6">
					<main className="grid gap-6 py-6 md:py-8">
						<div className="mx-auto grid w-full max-w-5xl gap-6">
							<div className="text-center">
								<div className="mapetite-eyebrow justify-center">Account</div>
								<h1 className="mt-3 text-[clamp(2.35rem,5vw,4.7rem)] font-semibold leading-[0.95] tracking-[-0.07em] text-[var(--mapetite-text)]">
									Your Mapetite account.
								</h1>
								<p className="mapetite-muted-copy mx-auto mt-4 max-w-2xl text-base leading-7">
									See your demo session, saved shortlist, and the account
									limitations that keep this MVP honest.
								</p>
							</div>

							{isLoading ? (
								<section className="mapetite-panel grid gap-4 px-6 py-12 text-center">
									<div className="mx-auto flex size-12 items-center justify-center rounded-[12px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.04)] text-[var(--mapetite-text)]">
										<UserRound className="size-5" />
									</div>
									<div>
										<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mapetite-text)]">
											Checking your demo session
										</h2>
										<p className="mapetite-muted-copy mx-auto mt-2 max-w-md text-sm leading-6">
											If the backend recently restarted, stale sessions are cleared
											automatically.
										</p>
									</div>
								</section>
							) : !isAuthenticated ? (
								<section className="mapetite-panel grid gap-5 px-6 py-12 text-center md:px-10">
									<div className="mx-auto flex size-14 items-center justify-center rounded-[14px] border border-[rgba(213,154,104,0.24)] bg-[var(--mapetite-accent-soft)] text-[var(--mapetite-text)]">
										<UserRound className="size-6" />
									</div>
									<div>
										<h2 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--mapetite-text)]">
											Sign in to manage saved places
										</h2>
										<p className="mapetite-muted-copy mx-auto mt-3 max-w-lg text-base leading-7">
											Create a demo account or log in to save restaurants and view
											your shortlist.
										</p>
									</div>
									<div className="mx-auto grid w-full max-w-sm gap-3 sm:flex sm:max-w-none sm:justify-center">
										<Button
											type="button"
											onClick={() => setIsLogInOpen(true)}
											className="mapetite-accent-button rounded-full px-6 text-[#20140d]"
										>
											Log In
										</Button>
										<Button
											type="button"
											onClick={() => setIsSignUpOpen(true)}
											variant="outline"
											className="mapetite-quiet-button rounded-full px-6 shadow-none"
										>
											Sign Up
										</Button>
										<Button
											asChild
											variant="ghost"
											className="rounded-full border border-[rgba(255,236,220,0.1)] bg-white/[0.02] px-5 text-[var(--mapetite-text-soft)] hover:bg-white/[0.05] hover:text-[var(--mapetite-text)]"
										>
											<Link to="/restaurants">
												<Search className="mr-2 size-4" />
												Search restaurants
											</Link>
										</Button>
									</div>
								</section>
							) : (
								<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
									<section className="mapetite-panel grid gap-6 px-6 py-7 md:px-8">
										<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
											<div className="flex size-16 shrink-0 items-center justify-center rounded-[18px] border border-[rgba(213,154,104,0.24)] bg-[linear-gradient(180deg,rgba(213,154,104,0.2),rgba(113,128,89,0.1))] text-xl font-semibold text-[var(--mapetite-text)]">
												{initials}
											</div>
											<div className="min-w-0">
												<p className="text-xs font-medium tracking-[0.14em] text-[var(--mapetite-text-faint)] uppercase">
													Signed in as
												</p>
												<h2 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--mapetite-text)]">
													{displayName}
												</h2>
												<p className="mapetite-muted-copy mt-2 break-all text-sm">
													{displayEmail}
												</p>
											</div>
										</div>

										<div className="grid gap-3 sm:grid-cols-2">
											<div className="rounded-[18px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.035)] p-5 text-center sm:text-left">
												<div className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--mapetite-text-soft)] sm:justify-start">
													<Heart className="size-4" />
													Saved places
												</div>
												<div className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[var(--mapetite-text)]">
													{isFavoritesLoading ? "..." : savedCount}
												</div>
												<p className="mapetite-muted-copy mt-2 text-sm leading-6">
													{savedCount === 1
														? "One restaurant in your demo shortlist."
														: "Restaurants saved to your demo shortlist."}
												</p>
											</div>

											<div className="rounded-[18px] border border-[var(--mapetite-border)] bg-[rgba(255,248,242,0.035)] p-5 text-center sm:text-left">
												<div className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--mapetite-text-soft)] sm:justify-start">
													<ShieldCheck className="size-4" />
													Session status
												</div>
												<div className="mt-3 text-lg font-semibold text-[var(--mapetite-text)]">
													Demo session active
												</div>
												<p className="mapetite-muted-copy mt-2 text-sm leading-6">
													Stale sessions are cleared automatically when the backend
													rejects them.
												</p>
											</div>
										</div>

										<div className="grid gap-3 sm:flex sm:flex-wrap">
											<Button
												asChild
												className="mapetite-accent-button rounded-full px-6 text-[#20140d]"
											>
												<Link to="/saved">
													<Heart className="mr-2 size-4" />
													View Saved Places
												</Link>
											</Button>
											<Button
												asChild
												variant="outline"
												className="mapetite-quiet-button rounded-full px-6 shadow-none"
											>
												<Link to="/restaurants">
													<Search className="mr-2 size-4" />
													Search restaurants
												</Link>
											</Button>
											<Button
												type="button"
												onClick={logout}
												variant="outline"
												className="mapetite-quiet-button rounded-full px-6 shadow-none"
											>
												<LogOut className="mr-2 size-4" />
												Log Out
											</Button>
										</div>
									</section>

									<aside className="mapetite-panel-soft grid content-start gap-4 px-6 py-6">
										<div>
											<div className="mapetite-eyebrow">Demo limitations</div>
											<h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--mapetite-text)]">
												Useful, but not production account management.
											</h2>
										</div>
										<div className="grid gap-3 text-sm leading-6 text-[var(--mapetite-text-soft)]">
											<p>
												This is a portfolio MVP demo account. In memory mode,
												accounts, sessions, and saved places may reset when the
												backend restarts.
											</p>
											<p>
												Demo auth does not include email verification, password
												reset, profile editing, or production-grade account
												recovery.
											</p>
										</div>
									</aside>
								</div>
							)}
						</div>
					</main>
				</div>
			</div>

			<LogInModal open={isLogInOpen} onOpenChange={setIsLogInOpen} />
			<SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
		</Layout>
	);
}
