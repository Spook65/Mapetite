const IMAGE_TIMEOUT_MS = 6000;
const MAX_MEDIA_IMAGES = 6;

const CUISINE_THEMES = {
  ramen: { label: "Ramen", emoji: "🍜", colors: ["#0ea5e9", "#14b8a6"] },
  noodles: { label: "Noodles", emoji: "🍜", colors: ["#0ea5e9", "#14b8a6"] },
  sushi: { label: "Sushi", emoji: "🍣", colors: ["#3b82f6", "#06b6d4"] },
  japanese: { label: "Japanese", emoji: "🍣", colors: ["#3b82f6", "#06b6d4"] },
  burger: { label: "Burger", emoji: "🍔", colors: ["#f97316", "#fb7185"] },
  fastfood: { label: "Fast Food", emoji: "🍟", colors: ["#f97316", "#ef4444"] },
  pizza: { label: "Pizza", emoji: "🍕", colors: ["#ef4444", "#f97316"] },
  pasta: { label: "Pasta", emoji: "🍝", colors: ["#ef4444", "#f59e0b"] },
  italian: { label: "Italian", emoji: "🍝", colors: ["#ef4444", "#f59e0b"] },
  taco: { label: "Tacos", emoji: "🌮", colors: ["#f59e0b", "#84cc16"] },
  mexican: { label: "Mexican", emoji: "🌮", colors: ["#f59e0b", "#84cc16"] },
  chinese: { label: "Chinese", emoji: "🥡", colors: ["#f43f5e", "#f97316"] },
  indian: { label: "Indian", emoji: "🍛", colors: ["#f97316", "#f59e0b"] },
  vegetarian: { label: "Vegetarian", emoji: "🥗", colors: ["#22c55e", "#14b8a6"] },
  vegan: { label: "Vegan", emoji: "🥗", colors: ["#22c55e", "#14b8a6"] },
  healthy: { label: "Healthy", emoji: "🥗", colors: ["#22c55e", "#0ea5e9"] },
  cafe: { label: "Cafe", emoji: "☕", colors: ["#a16207", "#f59e0b"] },
  bakery: { label: "Bakery", emoji: "🥐", colors: ["#f59e0b", "#fb923c"] },
  seafood: { label: "Seafood", emoji: "🦞", colors: ["#0ea5e9", "#06b6d4"] },
  default: { label: "Dining", emoji: "🍽️", colors: ["#0ea5e9", "#14b8a6"] },
};

const imageCache = new Map();

function stableHash(value) {
  return String(value)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function titleCase(value) {
  return String(value)
    .replace(/[_-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function pickTheme(categories = [], name = "", brand = "") {
  const tokens = [
    ...categories.map(normalizeText),
    normalizeText(name),
    normalizeText(brand),
  ];

  if (
    tokens.some((token) =>
      ["ramen", "udon", "soba", "noodle", "noodles"].some((needle) =>
        token.includes(needle),
      ),
    )
  ) {
    return CUISINE_THEMES.ramen;
  }

  if (tokens.some((token) => token.includes("sushi") || token.includes("japanese"))) {
    return CUISINE_THEMES.sushi;
  }

  if (
    tokens.some((token) =>
      ["burger", "mcdonald", "wendys", "wendy", "burgerking", "fastfood", "fastfoodrestaurant"].some(
        (needle) => token.includes(needle),
      ),
    )
  ) {
    return CUISINE_THEMES.burger;
  }

  if (tokens.some((token) => token.includes("pizza"))) {
    return CUISINE_THEMES.pizza;
  }

  if (tokens.some((token) => token.includes("pasta") || token.includes("italian"))) {
    return CUISINE_THEMES.italian;
  }

  if (tokens.some((token) => token.includes("taco") || token.includes("mexican"))) {
    return CUISINE_THEMES.taco;
  }

  if (tokens.some((token) => token.includes("chinese"))) {
    return CUISINE_THEMES.chinese;
  }

  if (tokens.some((token) => token.includes("indian"))) {
    return CUISINE_THEMES.indian;
  }

  if (tokens.some((token) => token.includes("vegan"))) {
    return CUISINE_THEMES.vegan;
  }

  if (tokens.some((token) => token.includes("vegetarian"))) {
    return CUISINE_THEMES.vegetarian;
  }

  if (tokens.some((token) => token.includes("healthy") || token.includes("salad"))) {
    return CUISINE_THEMES.healthy;
  }

  if (tokens.some((token) => token.includes("bakery") || token.includes("pastry"))) {
    return CUISINE_THEMES.bakery;
  }

  if (tokens.some((token) => token.includes("seafood") || token.includes("fish"))) {
    return CUISINE_THEMES.seafood;
  }

  if (tokens.some((token) => token.includes("cafe") || token.includes("coffee"))) {
    return CUISINE_THEMES.cafe;
  }

  return CUISINE_THEMES.default;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildCuisineArtworkUrl({ categories = [], name = "", brand = "" } = {}) {
  const theme = pickTheme(categories, name, brand);
  const hash = stableHash([categories.join("|"), name, brand].filter(Boolean).join("|"));
  const colors = theme.colors;
  const header = titleCase(categories.find((category) => category && category !== "Restaurant") || theme.label);
  const caption = name || theme.label;
  const accent = hash % 2 === 0 ? "0.12" : "0.16";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${escapeXml(caption)}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="${accent}" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <rect width="1200" height="900" rx="48" fill="url(#glow)" />
      <circle cx="195" cy="175" r="128" fill="#ffffff" fill-opacity="0.12" />
      <circle cx="1015" cy="210" r="150" fill="#ffffff" fill-opacity="0.10" />
      <circle cx="935" cy="700" r="180" fill="#000000" fill-opacity="0.08" />
      <text x="110" y="255" font-size="150" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${theme.emoji}</text>
      <text x="110" y="730" font-size="62" font-weight="700" font-family="Inter, Arial, sans-serif" fill="#ffffff" fill-opacity="0.96">${escapeXml(header)}</text>
      <text x="110" y="790" font-size="36" font-weight="500" font-family="Inter, Arial, sans-serif" fill="#ffffff" fill-opacity="0.92">${escapeXml(caption)}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeUrl(candidate, baseUrl) {
  if (!candidate) return null;

  const trimmed = String(candidate).trim();
  if (!trimmed) return null;

  if (/^data:/i.test(trimmed)) {
    return null;
  }

  try {
    return new URL(trimmed, baseUrl || undefined).toString();
  } catch {
    return null;
  }
}

function isUsefulImageUrl(url) {
  if (!url) return false;

  const value = String(url).toLowerCase();
  if (!/^https?:\/\//.test(value)) return false;
  if (/\.(svg|ico)(?:[?#].*)?$/.test(value)) return false;

  return ![
    "logo",
    "icon",
    "favicon",
    "sprite",
    "avatar",
    "placeholder",
    "map",
    "google",
    "staticmap",
  ].some((needle) => value.includes(needle));
}

function collectMatches(regex, text) {
  return Array.from(text.matchAll(regex), (match) => match[1]).filter(Boolean);
}

function walkJsonForImages(value, output = []) {
  if (!value) return output;

  if (Array.isArray(value)) {
    for (const item of value) {
      walkJsonForImages(item, output);
    }
    return output;
  }

  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (typeof nested === "string") {
        if (["image", "photo", "photos", "thumbnailUrl", "contentUrl"].includes(key)) {
          output.push(nested);
        }
      } else if (Array.isArray(nested)) {
        if (["image", "photo", "photos"].includes(key)) {
          output.push(...nested.filter((item) => typeof item === "string"));
        }
        walkJsonForImages(nested, output);
      } else if (nested && typeof nested === "object") {
        walkJsonForImages(nested, output);
      }
    }
  }

  return output;
}

function extractImagesFromHtml(html, baseUrl) {
  const candidates = [];

  const metaPatterns = [
    /<meta[^>]+(?:property|name)=["'](?:og:image:secure_url|og:image|twitter:image:src|twitter:image|image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<link[^>]+rel=["'](?:image_src|apple-touch-icon|apple-touch-icon-precomposed)["'][^>]+href=["']([^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of metaPatterns) {
    candidates.push(...collectMatches(pattern, html));
  }

  const jsonLdMatches = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    (match) => match[1].trim(),
  );

  for (const block of jsonLdMatches) {
    try {
      const parsed = JSON.parse(block.replace(/<!--|-->/g, ""));
      candidates.push(...walkJsonForImages(parsed));
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  }

  const imgPatterns = [
    /<img[^>]+(?:data-src|data-original|src)=["']([^"']+)["'][^>]*>/gi,
    /<source[^>]+srcset=["']([^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of imgPatterns) {
    const matches = collectMatches(pattern, html);
    for (const match of matches) {
      const pick = String(match)
        .split(",")
        .map((part) => part.trim().split(/\s+/)[0])
        .filter(Boolean)
        .pop();
      if (pick) candidates.push(pick);
    }
  }

  const normalized = [];
  for (const candidate of candidates) {
    const url = normalizeUrl(candidate, baseUrl);
    if (!url || !isUsefulImageUrl(url)) continue;
    if (!normalized.includes(url)) normalized.push(url);
  }

  return normalized;
}

function extractCandidateLinksFromHtml(html, baseUrl) {
  const hrefMatches = Array.from(
    html.matchAll(
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    ),
    (match) => ({ href: match[1], text: match[2] || "" }),
  );

  const keywords = ["gallery", "photos", "photo", "menu", "food", "dining", "about"];
  const origin = new URL(baseUrl).origin;
  const candidates = [];

  for (const { href, text } of hrefMatches) {
    const absolute = normalizeUrl(href, baseUrl);
    if (!absolute) continue;

    try {
      const parsed = new URL(absolute);
      if (parsed.origin !== origin) continue;
      const combined = `${parsed.pathname} ${text}`.toLowerCase();
      if (keywords.some((keyword) => combined.includes(keyword))) {
        candidates.push(absolute);
      }
    } catch {
      // Ignore malformed urls.
    }
  }

  return [...new Set(candidates)].slice(0, 4);
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mapetite/1.0 (restaurant discovery)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDirectImageUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mapetite/1.0 (restaurant discovery)",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return null;
    }

    return url;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchRestaurantImagesFromPage(pageUrl) {
  if (!pageUrl) return [];

  const absolute = normalizeUrl(pageUrl);
  if (!absolute) return [];

  const directImage = await fetchDirectImageUrl(absolute);
  if (directImage) {
    return [directImage];
  }

  const html = await fetchText(absolute);
  if (!html) return [];

  const images = extractImagesFromHtml(html, absolute);
  if (images.length > 0) {
    return images;
  }

  const candidateLinks = extractCandidateLinksFromHtml(html, absolute);
  for (const link of candidateLinks) {
    const linkedHtml = await fetchText(link);
    if (!linkedHtml) continue;
    const linkedImages = extractImagesFromHtml(linkedHtml, link);
    if (linkedImages.length > 0) {
      return linkedImages;
    }
  }

  return [];
}

function buildSearchQuery({
  name = "",
  street = "",
  city = "",
  state = "",
  country = "",
  brand = "",
} = {}) {
  return [name, brand, street, city, state, country]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildMediaCacheKey(options = {}) {
  return [
    options.placeId || "",
    options.website || "",
    options.name || "",
    options.street || "",
    options.city || "",
    options.state || "",
    options.country || "",
  ]
    .map((part) => String(part).trim().toLowerCase())
    .join("|");
}

async function fetchDuckDuckGoResults(query) {
  if (!query) return [];

  const url = new URL("https://duckduckgo.com/html/");
  url.searchParams.set("q", query);

  const html = await fetchText(url.toString());
  if (!html) return [];

  const hrefs = collectMatches(
    /<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/gi,
    html,
  );

  return hrefs
    .map((href) => {
      try {
        const parsed = new URL(href, "https://duckduckgo.com");
        const uddg = parsed.searchParams.get("uddg");
        return uddg ? decodeURIComponent(uddg) : parsed.toString();
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export function buildRestaurantArtworkUrl(options = {}) {
  return buildCuisineArtworkUrl(options);
}

export async function resolveRestaurantImages(options = {}) {
  const cacheKey = buildMediaCacheKey(options);
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  const {
    website,
    name,
    brand,
    street,
    city,
    state,
    country,
    placeId,
  } = options;

  const query = buildSearchQuery({
    name,
    brand,
    street,
    city,
    state,
    country,
  });

  const seeds = [];
  if (website) {
    seeds.push(website);
  }

  if (query) {
    const searchResults = await fetchDuckDuckGoResults(query);
    seeds.push(...searchResults.slice(0, 3));
  }

  if (placeId && website && seeds.length === 0) {
    seeds.push(website);
  }

  const images = [];
  const seen = new Set();

  for (const seed of seeds) {
    if (images.length >= MAX_MEDIA_IMAGES) break;

    const pageImages = await fetchRestaurantImagesFromPage(seed);
    for (const image of pageImages) {
      if (!image || seen.has(image)) continue;
      seen.add(image);
      images.push(image);
      if (images.length >= MAX_MEDIA_IMAGES) break;
    }
  }

  imageCache.set(cacheKey, images);
  return images;
}
