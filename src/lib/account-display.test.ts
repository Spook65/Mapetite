import { describe, expect, it } from "vitest";
import { getAccountFirstName, getAccountInitials } from "@/lib/account-display";

describe("account display helpers", () => {
	it("uses first and last initials for full names", () => {
		expect(getAccountInitials({ name: "Brandon Hann" })).toBe("BH");
	});

	it("uses one initial for single names", () => {
		expect(getAccountInitials({ name: "Brandon" })).toBe("B");
	});

	it("falls back to email when name is missing", () => {
		expect(getAccountInitials({ email: "brandon@example.com" })).toBe("B");
	});

	it("returns a safe fallback when account data is missing", () => {
		expect(getAccountInitials(null)).toBe("U");
		expect(getAccountFirstName(null)).toBe("User");
	});
});
