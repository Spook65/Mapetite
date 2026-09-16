import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeRestaurantMediaUrl,
  resolveRestaurantMedia,
} from "./restaurantMedia.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("restaurant media URL normalization", () => {
  it("keeps HTTPS image URLs", () => {
    expect(normalizeRestaurantMediaUrl("https://example.com/photo.jpg")).toBe(
      "https://example.com/photo.jpg",
    );
  });

  it("upgrades HTTP image URLs to HTTPS on the same host and path", () => {
    expect(normalizeRestaurantMediaUrl("http://example.com/photo.jpg?size=large")).toBe(
      "https://example.com/photo.jpg?size=large",
    );
  });

  it("resolves relative media URLs against an HTTPS page URL", () => {
    expect(normalizeRestaurantMediaUrl("/photos/hero.jpg", "https://example.com/menu")).toBe(
      "https://example.com/photos/hero.jpg",
    );
  });

  it.each([
    "javascript:alert(1)",
    "data:image/svg+xml,<svg></svg>",
    "file:///tmp/photo.jpg",
    "blob:https://example.com/photo",
    "not a url",
  ])("rejects unsafe or invalid media URL: %s", (url) => {
    expect(normalizeRestaurantMediaUrl(url)).toBeNull();
  });
});

describe("restaurant media fetching", () => {
  it("reads an HTML restaurant page with one network request", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "text/html; charset=utf-8",
      },
      text: async () =>
        '<html><head><meta property="og:image" content="https://images.example.test/restaurant.jpg"></head></html>',
    });

    const media = await resolveRestaurantMedia({
      placeId: "single-fetch-test",
      website: "https://restaurant.example.test",
      name: "Single Fetch Cafe",
      city: "Stockton",
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(media.images).toContain("https://images.example.test/restaurant.jpg");
  });

  it("does not cache an aborted lookup as missing media", async () => {
    globalThis.fetch = vi.fn((_url, options = {}) =>
      new Promise((_, reject) => {
        options.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      }),
    );
    const controller = new AbortController();
    const options = {
      placeId: "aborted-media-test",
      website: "https://aborted.example.test",
      name: "Abort Test Cafe",
      city: "Modesto",
    };
    const abortedLookup = resolveRestaurantMedia({
      ...options,
      signal: controller.signal,
    });

    controller.abort();
    await expect(abortedLookup).resolves.toEqual({ images: [], attributions: [] });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "image/jpeg",
      },
    });

    await expect(resolveRestaurantMedia(options)).resolves.toEqual({
      images: ["https://aborted.example.test/"],
      attributions: [[]],
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
