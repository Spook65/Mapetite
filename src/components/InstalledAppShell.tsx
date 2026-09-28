import { MapetiteFooter } from "@/components/MapetiteFooter";
import {
	getInstalledDestination,
	INSTALLED_SHELL_UI,
	type InstalledDestination,
} from "@/lib/installed-shell";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { Heart, Search, UserRound } from "lucide-react";

interface InstalledAppShellProps {
	children: React.ReactNode;
}

const destinations: Array<{
	id: InstalledDestination;
	label: string;
	path: "/restaurants" | "/saved" | "/account";
	icon: typeof Search;
}> = [
	{ id: "search", label: "Search", path: "/restaurants", icon: Search },
	{ id: "saved", label: "Saved", path: "/saved", icon: Heart },
	{ id: "account", label: "Account", path: "/account", icon: UserRound },
];

export function InstalledAppShell({ children }: InstalledAppShellProps) {
	const location = useLocation();
	const activeDestination = getInstalledDestination(location.pathname);

	return (
		<div
			className="mapetite-installed-shell mapetite-page-shell"
			data-installed-destination={activeDestination ?? undefined}
		>
			<main className="mapetite-installed-shell-main min-w-0 flex-1">
				{children}
			</main>
			<MapetiteFooter />

			<nav
				className="mapetite-installed-bottom-nav"
				aria-label="Installed app primary navigation"
			>
				<div className="mapetite-installed-bottom-nav-inner">
					{destinations.map((destination) => {
						const Icon = destination.icon;
						const isActive = activeDestination === destination.id;

						return (
							<Link
								key={destination.id}
								to={destination.path}
								search={{ ui: INSTALLED_SHELL_UI }}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"mapetite-installed-bottom-nav-link",
									isActive && "is-active",
								)}
							>
								<Icon aria-hidden="true" />
								<span>{destination.label}</span>
							</Link>
						);
					})}
				</div>
			</nav>
		</div>
	);
}
