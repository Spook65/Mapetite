export class InMemoryTtlCache {
  constructor(options = {}) {
    this.defaultTtlMs = Number(options.defaultTtlMs) > 0 ? Number(options.defaultTtlMs) : 0;
    this.maxSize = Number(options.maxSize) > 0 ? Number(options.maxSize) : 500;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    // Refresh insertion order for simple LRU behavior.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key, value, options = {}) {
    const ttlMs =
      Number(options.ttlMs) > 0 ? Number(options.ttlMs) : this.defaultTtlMs;
    if (ttlMs <= 0) return;

    if (this.store.has(key)) {
      this.store.delete(key);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });

    this.pruneExpired();
    this.enforceMaxSize();
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  values() {
    this.pruneExpired();
    return Array.from(this.store.values()).map((entry) => entry.value);
  }

  pruneExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }

  enforceMaxSize() {
    while (this.store.size > this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey === undefined) break;
      this.store.delete(oldestKey);
    }
  }
}
