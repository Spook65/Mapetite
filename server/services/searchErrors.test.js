import { describe, expect, it, vi } from "vitest";
import {
  SearchRequestTimeoutError,
  withSearchTimeout,
} from "./searchErrors.js";

describe("withSearchTimeout", () => {
  it("returns a search result that completes before the deadline", async () => {
    await expect(withSearchTimeout(Promise.resolve("ok"), 100)).resolves.toBe("ok");
  });

  it("rejects a stalled search with a structured timeout error", async () => {
    vi.useFakeTimers();
    const result = withSearchTimeout(new Promise(() => {}), 100);
    const expectation = expect(result).rejects.toBeInstanceOf(
      SearchRequestTimeoutError,
    );

    await vi.advanceTimersByTimeAsync(100);
    await expectation;
    vi.useRealTimers();
  });
});
