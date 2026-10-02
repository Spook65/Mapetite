import { Capacitor } from "@capacitor/core";

export const INSTALLED_SHELL_UI = "installed-shell" as const;

export type InstalledDestination = "search" | "saved" | "account";

export function getInstalledShellSearch<
	TSearch extends Record<string, unknown> = Record<string, never>,
>(search?: TSearch) {
	return {
		...search,
		ui: INSTALLED_SHELL_UI,
	} as TSearch & { ui: typeof INSTALLED_SHELL_UI };
}

export function isInstalledShellSearch(searchStr: string) {
	return new URLSearchParams(searchStr).get("ui") === INSTALLED_SHELL_UI;
}

export function isInstalledPresentation({
	ui,
	isNativePlatform = Capacitor.isNativePlatform(),
}: {
	ui?: unknown;
	isNativePlatform?: boolean;
}) {
	return (
		isNativePlatform || (ui !== "adaptive-shell" && ui !== "adaptive-card")
	);
}

export function isInstalledPresentationSearch(
	searchStr: string,
	isNativePlatform?: boolean,
) {
	return isInstalledPresentation({
		ui: new URLSearchParams(searchStr).get("ui"),
		isNativePlatform,
	});
}

export function getInstalledNavigationSearch<
	TSearch extends Record<string, unknown> = Record<string, never>,
>(searchStr: string, search?: TSearch) {
	return isInstalledShellSearch(searchStr)
		? getInstalledShellSearch(search)
		: search;
}

export function getInstalledRouteSearch<
	TSearch extends Record<string, unknown> = Record<string, never>,
>(ui: unknown, search?: TSearch) {
	return ui === INSTALLED_SHELL_UI ? getInstalledShellSearch(search) : search;
}

export function getInstalledDestination(
	pathname: string,
): InstalledDestination | null {
	if (pathname.startsWith("/restaurants")) return "search";
	if (pathname.startsWith("/saved")) return "saved";
	if (pathname.startsWith("/account")) return "account";
	return null;
}
