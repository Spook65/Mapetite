import { describe, expect, it } from "vitest";
import { normalizeRestaurantMediaUrl } from "./restaurantMedia.js";

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
