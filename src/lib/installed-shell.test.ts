import {
	getInstalledDestination,
	getInstalledNavigationSearch,
	getInstalledRouteSearch,
	getInstalledShellSearch,
	isInstalledPresentation,
	isInstalledPresentationSearch,
	isInstalledShellSearch,
} from "@/lib/installed-shell";
import { describe, expect, it } from "vitest";

describe("installed shell routing", () => {
	it("activates only for the explicit installed-shell query", () => {
		expect(isInstalledShellSearch("?ui=installed-shell")).toBe(true);
		expect(isInstalledShellSearch("?ui=adaptive-shell")).toBe(false);
		expect(isInstalledShellSearch("")).toBe(false);
	});

	it("keeps normal and adaptive browser presentations outside the installed shell", () => {
		expect(
			isInstalledPresentation({ ui: undefined, isNativePlatform: false }),
		).toBe(false);
		expect(
			isInstalledPresentation({
				ui: "adaptive-shell",
				isNativePlatform: false,
			}),
		).toBe(false);
	});

	it("activates browser preview and native canonical routes", () => {
		expect(
			isInstalledPresentation({
				ui: "installed-shell",
				isNativePlatform: false,
			}),
		).toBe(true);
		expect(
			isInstalledPresentation({ ui: undefined, isNativePlatform: true }),
		).toBe(true);
		expect(
			isInstalledPresentation({ ui: "anything", isNativePlatform: true }),
		).toBe(true);
		expect(isInstalledPresentationSearch("?city=Stockton", true)).toBe(true);
	});

	it("derives top-level destinations from the current route", () => {
		expect(getInstalledDestination("/restaurants")).toBe("search");
		expect(getInstalledDestination("/restaurants/example")).toBe("search");
		expect(getInstalledDestination("/saved")).toBe("saved");
		expect(getInstalledDestination("/account")).toBe("account");
		expect(getInstalledDestination("/")).toBeNull();
	});

	it("adds installed presentation without discarding route search values", () => {
		expect(getInstalledShellSearch({ city: "Stockton" })).toEqual({
			city: "Stockton",
			ui: "installed-shell",
		});
	});

	it("preserves preview queries but keeps native route search canonical", () => {
		expect(
			getInstalledNavigationSearch("?ui=installed-shell", {
				city: "Stockton",
			}),
		).toEqual({ city: "Stockton", ui: "installed-shell" });
		expect(getInstalledNavigationSearch("", { city: "Stockton" })).toEqual({
			city: "Stockton",
		});
		expect(getInstalledRouteSearch(undefined, { city: "Stockton" })).toEqual({
			city: "Stockton",
		});
	});
});
