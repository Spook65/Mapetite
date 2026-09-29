import { describe, expect, it } from "vitest";
import {
	shouldShowInstalledQualifiers,
	shouldShowInstalledSearchEntry,
} from "./installed-search";

describe("installed Search presentation", () => {
	it("shows entry for a fresh search and hides it for existing results", () => {
		expect(
			shouldShowInstalledSearchEntry({ hasResults: false, isEditing: false }),
		).toBe(true);
		expect(
			shouldShowInstalledSearchEntry({ hasResults: true, isEditing: false }),
		).toBe(false);
		expect(
			shouldShowInstalledSearchEntry({ hasResults: true, isEditing: true }),
		).toBe(true);
	});

	it("defaults qualifiers from existing values but permits presentation collapse", () => {
		expect(
			shouldShowInstalledQualifiers({ country: "", isDisclosed: null, region: "" }),
		).toBe(false);
		expect(
			shouldShowInstalledQualifiers({
				country: "United States",
				isDisclosed: null,
				region: "California",
			}),
		).toBe(true);
		expect(
			shouldShowInstalledQualifiers({
				country: "United States",
				isDisclosed: false,
				region: "California",
			}),
		).toBe(false);
	});
});
