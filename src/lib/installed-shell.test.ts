import {
	getInstalledDestination,
	getInstalledShellSearch,
	isInstalledShellSearch,
} from "@/lib/installed-shell";
import { describe, expect, it } from "vitest";

describe("installed shell routing", () => {
	it("activates only for the explicit installed-shell query", () => {
		expect(isInstalledShellSearch("?ui=installed-shell")).toBe(true);
		expect(isInstalledShellSearch("?ui=adaptive-shell")).toBe(false);
		expect(isInstalledShellSearch("")).toBe(false);
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
});
