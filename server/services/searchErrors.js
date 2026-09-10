export class SearchProviderUnavailableError extends Error {
  constructor(message = "Restaurant providers are unavailable right now") {
    super(message);
    this.name = "SearchProviderUnavailableError";
    this.code = "SEARCH_UNAVAILABLE";
  }
}

export class SearchRequestTimeoutError extends Error {
  constructor(message = "Restaurant search timed out") {
    super(message);
    this.name = "SearchRequestTimeoutError";
    this.code = "SEARCH_TIMEOUT";
  }
}

export function withSearchTimeout(promise, timeoutMs) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new SearchRequestTimeoutError()), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}
