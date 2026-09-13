import { describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rateLimiter.js";

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

describe("createRateLimiter", () => {
  it("allows requests within the configured window", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 2 });
    const next = vi.fn();

    limiter({ ip: "127.0.0.1", socket: {} }, createResponse(), next);
    limiter({ ip: "127.0.0.1", socket: {} }, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("returns a structured 429 response after the limit", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      maxRequests: 1,
      errorCode: "PLACE_SUGGEST_RATE_LIMITED",
      message: "Suggestions paused. You can still search.",
    });
    const response = createResponse();

    limiter({ ip: "127.0.0.1", socket: {} }, createResponse(), vi.fn());
    limiter({ ip: "127.0.0.1", socket: {} }, response, vi.fn());

    expect(response.statusCode).toBe(429);
    expect(response.headers["Retry-After"]).toBe("60");
    expect(response.body).toEqual({
      error: "PLACE_SUGGEST_RATE_LIMITED",
      message: "Suggestions paused. You can still search.",
      retryAfterSeconds: 60,
    });
  });

  it("does not count requests skipped by route policy", () => {
    const next = vi.fn();
    const limiter = createRateLimiter({
      windowMs: 60_000,
      maxRequests: 1,
      skip: (request) => request.path === "/places/suggest",
    });

    limiter({ path: "/places/suggest" }, createResponse(), next);
    limiter({ path: "/places/suggest" }, createResponse(), next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});
