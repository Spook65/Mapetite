export function createRateLimiter({
  windowMs,
  maxRequests,
  keyPrefix = "global",
  errorCode = "RATE_LIMITED",
  message = "Too many requests. Please wait before trying again.",
  skip,
}) {
  const hits = new Map();

  return (req, res, next) => {
    if (skip?.(req)) return next();

    const now = Date.now();
    if (hits.size > 1000) {
      for (const [storedKey, storedHit] of hits) {
        if (storedHit.resetAt <= now) {
          hits.delete(storedKey);
        }
      }
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        error: errorCode,
        message,
        retryAfterSeconds,
      });
    }

    hits.set(key, current);
    return next();
  };
}
