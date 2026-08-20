import {
	AuthApiError,
	getUserProfile,
	isAuthSessionError,
	logoutUser,
} from "@/lib/api/auth";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("auth API helpers", () => {
	it("marks profile 401 responses as stale auth session errors", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				new Response(
					JSON.stringify({
						status: "Failed",
						message: "Unauthorized - invalid or missing auth token",
					}),
					{ status: 401 },
				),
			),
		);

		await expect(getUserProfile("stale-token")).rejects.toMatchObject({
			name: "AuthApiError",
			status: 401,
		});

		try {
			await getUserProfile("stale-token");
		} catch (error) {
			expect(error).toBeInstanceOf(AuthApiError);
			expect(isAuthSessionError(error)).toBe(true);
		}
	});

	it("requests backend logout when a token exists", async () => {
		const fetchMock = vi.fn(async () =>
			new Response(JSON.stringify({ status: "Success" }), { status: 200 }),
		);
		vi.stubGlobal("fetch", fetchMock);

		await logoutUser("demo-token");

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/auth/logout",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer demo-token",
				}),
			}),
		);
	});

	it("skips backend logout when there is no token", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		await logoutUser(null);

		expect(fetchMock).not.toHaveBeenCalled();
	});
});
