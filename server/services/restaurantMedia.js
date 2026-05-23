const IMAGE_TIMEOUT_MS = 6000;
const MAX_MEDIA_IMAGES = 6;
const WIKIMEDIA_COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const OPENVERSE_BASE_URL = "https://api.openverse.org/v1/images/";

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

function pickThemeKey(categories = [], name = "", brand = "") {
  const tokens = [
    ...categories.map(normalizeText),
    normalizeText(name),
    normalizeText(brand),
  ];

  const checks = [
    ["ramen", ["ramen", "udon", "soba", "noodle", "noodles"]],
    ["sushi", ["sushi", "japanese"]],
    ["burger", ["burger", "mcdonald", "wendys", "wendy", "burgerking", "fastfood"]],
    ["pizza", ["pizza"]],
    ["pasta", ["pasta", "italian"]],
    ["taco", ["taco", "mexican"]],
    ["chinese", ["chinese", "dumpling", "dimsum", "wok"]],
    ["indian", ["indian", "curry", "tandoor", "biryani"]],
    ["vegan", ["vegan"]],
    ["vegetarian", ["vegetarian"]],
    ["healthy", ["healthy", "salad", "bowl", "fresh"]],
    ["bakery", ["bakery", "pastry", "croissant", "bread"]],
    ["seafood", ["seafood", "fish", "oyster"]],
    ["cafe", ["cafe", "coffee", "espresso", "latte"]],
  ];

  for (const [key, needles] of checks) {
    if (tokens.some((token) => needles.some((needle) => token.includes(needle)))) {
      return key;
    }
  }

  return "default";
}

function buildCuisineProfile(categories = [], name = "", brand = "") {
  const themeKey = pickThemeKey(categories, name, brand);
  const theme = CUISINE_THEMES[themeKey] || CUISINE_THEMES.default;

  const searchTermsByKey = {
    ramen: ["ramen", "noodles", "udon", "soba", "gallery", "food"],
    sushi: ["sushi", "japanese", "gallery", "food"],
    burger: ["burger", "fast food", "gallery", "grill", "food"],
    pizza: ["pizza", "pizzeria", "gallery", "food"],
    pasta: ["pasta", "italian", "gallery", "food"],
    taco: ["tacos", "mexican", "gallery", "food"],
    chinese: ["chinese", "dumplings", "dim sum", "gallery", "food"],
    indian: ["indian", "curry", "gallery", "food"],
    vegan: ["vegan", "gallery", "food"],
    vegetarian: ["vegetarian", "gallery", "food"],
    healthy: ["healthy", "salad", "bowls", "gallery", "food"],
    bakery: ["bakery", "pastry", "gallery", "food"],
    seafood: ["seafood", "fish", "oyster", "gallery", "food"],
    cafe: ["cafe", "coffee", "espresso", "gallery", "food"],
    default: ["restaurant", "gallery", "food"],
  };

  const pageKeywordsByKey = {
    ramen: ["ramen", "noodles", "gallery", "photos", "food", "dining"],
    sushi: ["sushi", "omakase", "gallery", "photos", "food", "dining"],
    burger: ["burger", "fries", "gallery", "photos", "food", "dining"],
    pizza: ["pizza", "gallery", "photos", "food", "dining"],
    pasta: ["pasta", "gallery", "photos", "food", "dining"],
    taco: ["tacos", "gallery", "photos", "food", "dining"],
    chinese: ["gallery", "photos", "food", "dining", "dim sum"],
    indian: ["gallery", "photos", "food", "dining", "curry"],
    vegan: ["gallery", "photos", "food", "dining", "vegan"],
    vegetarian: ["gallery", "photos", "food", "dining", "vegetarian"],
    healthy: ["gallery", "photos", "food", "dining", "salad"],
    bakery: ["gallery", "photos", "food", "dining", "pastry"],
    seafood: ["gallery", "photos", "food", "dining", "seafood"],
    cafe: ["gallery", "photos", "food", "dining", "coffee"],
    default: ["gallery", "photos", "food", "dining"],
  };

  return {
    themeKey,
    theme,
    searchTerms: searchTermsByKey[themeKey] || searchTermsByKey.default,
    pageKeywords: pageKeywordsByKey[themeKey] || pageKeywordsByKey.default,
  };
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
  const profile = buildCuisineProfile(categories, name, brand);
  const theme = profile.theme;
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
  if (/\.(svg|ico|gif)(?:[?#].*)?$/.test(value)) return false;
  if (value.includes(".pdf")) return false;
  if (value.includes("%3csvg") || value.includes("<svg")) return false;

  try {
    const parsed = new URL(url);
    if (parsed.pathname.includes("/_next/image")) return false;

    const proxiedUrl =
      parsed.searchParams.get("url") ||
      parsed.searchParams.get("img_url") ||
      parsed.searchParams.get("image_url");
    if (proxiedUrl && /^https?:\/\//i.test(proxiedUrl)) {
      return false;
    }
  } catch {
    return false;
  }

  return ![
    "logo",
    "icon",
    "favicon",
    "sprite",
    "avatar",
    "placeholder",
    "food_default",
    "map",
    "google",
    "staticmap",
    "allmenus.com/static/",
    "facebook",
    "instagram",
    "insta",
    "grubhub",
    "menupix.com/152x152",
    "152x152.png",
    "order-with-grubhub",
    "report",
    "r0lgodlh",
    "thumbnail",
    "thumb",
    "menu",
    "menus",
    "appetizer",
    "dessert",
    "drinks",
    "cocktail",
    "wine-list",
    "wine_menu",
    "drink-menu",
    "food-menu",
    "screenshot",
    "screen-shot",
    "shop-now",
    "order-now",
    "stars_",
    "star0",
    "star1",
    "star2",
    "star3",
    "star4",
    "star5",
    "log.gif",
  ].some((needle) => value.includes(needle));
}

function collectMatches(regex, text) {
  return Array.from(text.matchAll(regex), (match) => match[1]).filter(Boolean);
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
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

function hasKeywordMatch(value, keywords = []) {
  const text = String(value || "").toLowerCase();
  return keywords.some((keyword) => text.includes(String(keyword).toLowerCase()));
}

const NEGATIVE_MEDIA_KEYWORDS = [
  "menu",
  "appetizer",
  "appetizers",
  "dessert",
  "desserts",
  "drinks",
  "drink list",
  "cocktail",
  "cocktails",
  "wine list",
  "thumbnail",
  "thumb",
  "screenshot",
  "screen shot",
  "poster",
  "flyer",
  "promo",
  "advert",
  "shop now",
  "order now",
  "delivery app",
  "gift card",
  "pdf",
  "yelp",
];

function scoreImageCandidate(candidate, profile = {}) {
  const url = String(candidate.url || "");
  const alt = String(candidate.alt || "");
  const title = String(candidate.title || "");
  const text = `${url} ${alt} ${title}`.toLowerCase();
  let score = 0;

  if (candidate.sameHost) score += 3;
  if (candidate.fromMeta) score += 3;
  if (candidate.fromJsonLd) score += 2;
  if (hasKeywordMatch(text, profile.searchTerms)) score += 4;
  if (hasKeywordMatch(text, profile.pageKeywords)) score += 2;
  if (hasKeywordMatch(text, [profile.theme?.label, profile.themeKey])) score += 2;
  if (hasKeywordMatch(text, ["hero", "gallery", "food", "dish", "interior", "dining", "room", "space"])) {
    score += 1;
  }
  if (hasKeywordMatch(text, NEGATIVE_MEDIA_KEYWORDS)) {
    score -= 18;
  }
  if (hasKeywordMatch(text, ["logo", "icon", "favicon", "sprite", "avatar", "placeholder"])) {
    score -= 100;
  }
  if (hasKeywordMatch(text, ["map", "street", "directions", "location"])) {
    score -= 12;
  }
  if (/\.(webp|jpg|jpeg|png)(?:[?#].*)?$/.test(url.toLowerCase())) {
    score += 1;
  }

  return score;
}

function scoreOpenverseCandidate(candidate, profile = {}, query = "") {
  const url = String(candidate.url || candidate.thumbnail || "");
  const title = String(candidate.title || "");
  const creator = String(candidate.creator || "");
  const landing = String(candidate.foreignLandingUrl || candidate.foreign_landing_url || "");
  const description = String(candidate.description || "");
  const text = `${url} ${title} ${creator} ${landing} ${description}`.toLowerCase();
  let score = 0;

  if (query && text.includes(query.toLowerCase().replace(/\s+/g, " ").trim())) {
    score += 8;
  }

  if (hasKeywordMatch(text, [profile.theme?.label, profile.themeKey])) {
    score += 3;
  }

  if (hasKeywordMatch(text, profile.searchTerms)) {
    score += 4;
  }

  if (hasKeywordMatch(text, ["restaurant", "dining", "food", "dish", "interior", "chef"])) {
    score += 1;
  }
  if (hasKeywordMatch(text, NEGATIVE_MEDIA_KEYWORDS)) {
    score -= 18;
  }

  if (hasKeywordMatch(text, ["logo", "icon", "favicon", "avatar", "map", "illustration"])) {
    score -= 100;
  }

  return score;
}

function extractOpenverseImageCandidates(payload, profile = {}, query = "") {
  const results = Array.isArray(payload?.results) ? payload.results : [];

  return results
    .map((result) => {
      const url = result?.url || result?.thumbnail || "";
      if (!url || !isUsefulImageUrl(url)) {
        return null;
      }

      const candidate = {
        url,
        title: result?.title || "",
        creator: result?.creator || "",
        thumbnail: result?.thumbnail || "",
        foreignLandingUrl: result?.foreign_landing_url || "",
        description: result?.description || "",
      };

      return {
        ...candidate,
        score: scoreOpenverseCandidate(candidate, profile, query),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

function scoreWikimediaCandidate(candidate, profile = {}, query = "") {
  const url = String(candidate.url || candidate.thumbnail || "");
  const title = String(candidate.title || "");
  const landing = String(candidate.descriptionUrl || "");
  const description = String(candidate.description || "");
  const credit = String(candidate.credit || "");
  const author = String(candidate.author || "");
  const text = `${url} ${title} ${landing} ${description} ${credit} ${author}`.toLowerCase();
  let score = 0;

  if (query && text.includes(query.toLowerCase().replace(/\s+/g, " ").trim())) {
    score += 8;
  }

  if (hasKeywordMatch(text, [profile.theme?.label, profile.themeKey])) {
    score += 3;
  }

  if (hasKeywordMatch(text, profile.searchTerms)) {
    score += 4;
  }

  if (hasKeywordMatch(text, ["restaurant", "dining", "food", "dish", "interior", "chef"])) {
    score += 1;
  }
  if (hasKeywordMatch(text, NEGATIVE_MEDIA_KEYWORDS)) {
    score -= 18;
  }

  if (hasKeywordMatch(text, ["logo", "icon", "favicon", "avatar", "map", "illustration"])) {
    score -= 100;
  }

  return score;
}

function extractWikimediaImageCandidates(payload, profile = {}, query = "") {
  const pages = Object.values(payload?.query?.pages || {});

  return pages
    .map((page) => {
      const imageInfo = Array.isArray(page?.imageinfo) ? page.imageinfo[0] : null;
      const url = imageInfo?.thumburl || imageInfo?.url || "";
      if (!url || !isUsefulImageUrl(url)) {
        return null;
      }

      const ext = imageInfo?.extmetadata || {};
      const candidate = {
        url,
        title: page?.title || "",
        descriptionUrl: imageInfo?.descriptionurl || "",
        description: stripHtml(ext.ImageDescription?.value || ""),
        credit: stripHtml(ext.Credit?.value || ""),
        author: stripHtml(ext.Artist?.value || ""),
        license: stripHtml(ext.LicenseShortName?.value || ""),
      };

      return {
        ...candidate,
        score: scoreWikimediaCandidate(candidate, profile, query),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

function extractImageCandidatesFromHtml(html, baseUrl, profile = {}) {
  const candidates = [];
  const base = new URL(baseUrl);
  const origin = base.origin;

  const metaPatterns = [
    /<meta[^>]+(?:property|name)=["'](?:og:image:secure_url|og:image|twitter:image:src|twitter:image|image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<link[^>]+rel=["'](?:image_src|apple-touch-icon|apple-touch-icon-precomposed)["'][^>]+href=["']([^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of metaPatterns) {
    for (const match of html.matchAll(pattern)) {
      candidates.push({
        url: match[1],
        fromMeta: true,
        sameHost: true,
      });
    }
  }

  const jsonLdMatches = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    (match) => match[1].trim(),
  );

  for (const block of jsonLdMatches) {
    try {
      const parsed = JSON.parse(block.replace(/<!--|-->/g, ""));
      for (const image of walkJsonForImages(parsed)) {
        candidates.push({
          url: image,
          fromJsonLd: true,
        });
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  }

  const imgPatterns = [
    /<img\b([^>]+)>/gi,
    /<source\b([^>]+)>/gi,
  ];

  for (const pattern of imgPatterns) {
    for (const match of html.matchAll(pattern)) {
      const attrs = match[1] || "";
      const srcMatch =
        attrs.match(/\b(?:data-src|data-original|src)=["']([^"']+)["']/i) ||
        attrs.match(/\bsrcset=["']([^"']+)["']/i);
      if (!srcMatch) continue;

      const pick = String(srcMatch[1])
        .split(",")
        .map((part) => part.trim().split(/\s+/)[0])
        .filter(Boolean)
        .pop();

      if (!pick) continue;

      const alt = (attrs.match(/\balt=["']([^"']*)["']/i) || [])[1] || "";
      const title = (attrs.match(/\btitle=["']([^"']*)["']/i) || [])[1] || "";
      candidates.push({
        url: pick,
        alt,
        title,
        sameHost: true,
      });
    }
  }

  const normalized = [];
  for (const candidate of candidates) {
    const url = normalizeUrl(candidate.url, baseUrl);
    if (!url || !isUsefulImageUrl(url)) continue;

    const parsed = new URL(url);
    normalized.push({
      url,
      alt: candidate.alt || "",
      title: candidate.title || "",
      sameHost: candidate.sameHost || parsed.origin === origin,
      fromMeta: Boolean(candidate.fromMeta),
      fromJsonLd: Boolean(candidate.fromJsonLd),
    });
  }

  return normalized
    .map((candidate) => ({ ...candidate, score: scoreImageCandidate(candidate, profile) }))
    .filter((candidate) => candidate.score >= 2)
    .sort((a, b) => b.score - a.score);
}

function extractCandidateLinksFromHtml(html, baseUrl, profile = {}) {
  const hrefMatches = Array.from(
    html.matchAll(
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    ),
    (match) => ({ href: match[1], text: match[2] || "" }),
  );

  const keywords = ["gallery", "photos", "photo", "food", "dining", "about", "inside", "space"];
  const origin = new URL(baseUrl).origin;
  const candidates = [];

  for (const { href, text } of hrefMatches) {
    const absolute = normalizeUrl(href, baseUrl);
    if (!absolute) continue;

    try {
      const parsed = new URL(absolute);
      if (parsed.origin !== origin) continue;
      const combined = `${parsed.pathname} ${text}`.toLowerCase();
      const matched =
        keywords.some((keyword) => combined.includes(keyword)) ||
        profile.pageKeywords.some((keyword) => combined.includes(String(keyword).toLowerCase()));
      if (matched) {
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

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "Mapetite/1.0 (restaurant discovery)",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
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

async function fetchRestaurantImagesFromPage(pageUrl, profile = buildCuisineProfile()) {
  if (!pageUrl) return [];

  const absolute = normalizeUrl(pageUrl);
  if (!absolute) return [];

  const directImage = await fetchDirectImageUrl(absolute);
  if (directImage && isUsefulImageUrl(directImage)) {
    return [directImage];
  }

  const html = await fetchText(absolute);
  if (!html) return [];

  const images = extractImageCandidatesFromHtml(html, absolute, profile);
  if (images.length > 0) {
    return images.map((image) => image.url || image).slice(0, MAX_MEDIA_IMAGES);
  }

  const candidateLinks = extractCandidateLinksFromHtml(html, absolute, profile);
  for (const link of candidateLinks) {
    const linkedHtml = await fetchText(link);
    if (!linkedHtml) continue;
    const linkedImages = extractImageCandidatesFromHtml(linkedHtml, link, profile);
    if (linkedImages.length > 0) {
      return linkedImages.map((image) => image.url || image).slice(0, MAX_MEDIA_IMAGES);
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
} = {}, profile = {}) {
  return [name, brand, street, city, state, country, ...(profile.searchTerms || [])]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildOpenverseQueries(options = {}, profile = buildCuisineProfile()) {
  const exactName = String(options.name || "").trim();
  const brand = String(options.brand || "").trim();
  const street = String(options.street || "").trim();
  const city = String(options.city || "").trim();
  const state = String(options.state || "").trim();
  const country = String(options.country || "").trim();
  const cuisineTerms = [
    profile.theme?.label,
    ...(profile.searchTerms || []),
  ].filter(Boolean);

  const queries = [
    [exactName, street, city, state, country].filter(Boolean).join(" "),
    [exactName, brand, city, state].filter(Boolean).join(" "),
    [exactName, brand, city, state, ...cuisineTerms].filter(Boolean).join(" "),
    [exactName, city, state, ...cuisineTerms].filter(Boolean).join(" "),
    [brand, city, state, ...cuisineTerms].filter(Boolean).join(" "),
  ]
    .map((query) => query.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return [...new Set(queries)];
}

function buildWikimediaQueries(options = {}, profile = buildCuisineProfile()) {
  const exactName = String(options.name || "").trim();
  const brand = String(options.brand || "").trim();
  const street = String(options.street || "").trim();
  const city = String(options.city || "").trim();
  const state = String(options.state || "").trim();
  const country = String(options.country || "").trim();
  const cuisineTerms = [
    profile.theme?.label,
    ...(profile.searchTerms || []),
  ].filter(Boolean);

  const queries = [
    [exactName, city, state, country].filter(Boolean).join(" "),
    [exactName, street, city, state].filter(Boolean).join(" "),
    [exactName, brand, city, state].filter(Boolean).join(" "),
    [exactName, brand, city, state, ...cuisineTerms].filter(Boolean).join(" "),
    [exactName, city, state, ...cuisineTerms].filter(Boolean).join(" "),
    [brand, city, state, ...cuisineTerms].filter(Boolean).join(" "),
  ]
    .map((query) => query.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return [...new Set(queries)];
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
    options.themeKey || "",
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

async function fetchOpenverseImages(query, profile = buildCuisineProfile()) {
  if (!query) return [];

  const url = new URL(OPENVERSE_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("page_size", "12");

  const payload = await fetchJson(url.toString());
  if (!payload) return [];

  const candidates = extractOpenverseImageCandidates(payload, profile, query);
  return candidates.map((candidate) => candidate.url).slice(0, MAX_MEDIA_IMAGES);
}

async function fetchWikimediaCommonsMedia(query, profile = buildCuisineProfile()) {
  if (!query) return [];

  const url = new URL(WIKIMEDIA_COMMONS_API_URL);
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "12");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|extmetadata");
  url.searchParams.set("iiurlwidth", "1600");
  url.searchParams.set("format", "json");

  const payload = await fetchJson(url.toString());
  if (!payload) return [];

  const candidates = extractWikimediaImageCandidates(payload, profile, query);
  return candidates.slice(0, MAX_MEDIA_IMAGES);
}

export function buildRestaurantArtworkUrl(options = {}) {
  return buildCuisineArtworkUrl(options);
}

export async function resolveRestaurantMedia(options = {}) {
  const profile = buildCuisineProfile(
    options.categories || [],
    options.name || "",
    options.brand || "",
  );
  const cacheKey = buildMediaCacheKey({ ...options, themeKey: profile.themeKey });
  const cached = imageCache.get(cacheKey);
  if (cached) {
    return cached;
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

  const images = [];
  const attributions = [];
  const seen = new Set();

  const seeds = [];
  if (website) {
    seeds.push(website);
  }

  for (const seed of [...new Set(seeds)]) {
    if (images.length >= MAX_MEDIA_IMAGES) break;

    const pageImages = await fetchRestaurantImagesFromPage(seed, profile);
    for (const image of pageImages) {
      if (!image || seen.has(image)) continue;
      seen.add(image);
      images.push(image);
      attributions.push([]);
      if (images.length >= MAX_MEDIA_IMAGES) break;
    }
  }

  const media = { images, attributions };
  imageCache.set(cacheKey, media);
  return media;
}

export async function resolveRestaurantImages(options = {}) {
  const media = await resolveRestaurantMedia(options);
  return media.images;
}
