import { afterEach, describe, expect, it, vi } from "vitest";
import { enrichSearchRestaurants } from "./restaurantCatalog.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.useRealTimers();
});

describe("search restaurant media enrichment", () => {
  it("returns within the shared media deadline when websites stall", async () => {
    vi.useFakeTimers();
    globalThis.fetch = vi.fn((_url, options = {}) =>
      new Promise((_, reject) => {
        options.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      }),
    );
    const restaurants = [
      {
        id: "deadline-test",
        name: "Deadline Test Cafe",
        website: "https://deadline.example.test",
        categories: ["Cafe"],
        address: { city: "London" },
        galleryImageUrls: [],
      },
    ];
    const enrichment = enrichSearchRestaurants(restaurants, {
      limit: 1,
      timeoutMs: 50,
    });

    await vi.advanceTimersByTimeAsync(50);

    await expect(enrichment).resolves.toEqual(restaurants);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("only starts media work for the configured number of results", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "text/html; charset=utf-8",
      },
      text: async () => "<html><body>No restaurant images</body></html>",
    });
    const restaurants = ["one", "two", "three"].map((id) => ({
      id: `limit-${id}`,
      name: `Limit ${id}`,
      website: `https://${id}.example.test`,
      categories: ["Restaurant"],
      address: { city: "Stockton" },
      galleryImageUrls: [],
    }));

    await enrichSearchRestaurants(restaurants, { limit: 1, timeoutMs: 500 });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
