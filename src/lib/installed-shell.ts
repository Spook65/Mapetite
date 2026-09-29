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

export function getInstalledDestination(
	pathname: string,
): InstalledDestination | null {
	if (pathname.startsWith("/restaurants")) return "search";
	if (pathname.startsWith("/saved")) return "saved";
	if (pathname.startsWith("/account")) return "account";
	return null;
}
