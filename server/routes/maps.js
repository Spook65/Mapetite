import express from "express";
import env from "../config/env.js";

const router = express.Router();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildPlaceholderSvg(label, subtitle) {
  const safeLabel = String(label || "Map unavailable");
  const safeSubtitle = String(subtitle || "");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#e2e8f0" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </linearGradient>
      </defs>
      <rect width="1280" height="800" fill="url(#bg)" />
      <g fill="#0f172a" fill-opacity="0.12">
        <circle cx="220" cy="170" r="90" />
        <circle cx="1060" cy="230" r="130" />
        <circle cx="900" cy="650" r="160" />
      </g>
      <text x="640" y="390" text-anchor="middle" font-size="54" font-family="Arial, sans-serif" fill="#0f172a">${safeLabel}</text>
      <text x="640" y="455" text-anchor="middle" font-size="26" font-family="Arial, sans-serif" fill="#334155">${safeSubtitle}</text>
    </svg>
  `.trim();
}

router.get("/static", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const variant = Number(req.query.variant || 0);
  const zoom = clamp(Number(req.query.zoom || 0) || 15.8 + variant * 0.18, 1, 20);
  const width = clamp(Number(req.query.width || 1200), 240, 4096);
  const height = clamp(Number(req.query.height || 800), 240, 4096);
  const style = typeof req.query.style === "string" ? req.query.style : "osm-bright";
  const markerColor =
    typeof req.query.markerColor === "string" ? req.query.markerColor : "%230ea5e9";
  const label = typeof req.query.label === "string" ? req.query.label : "Mapetite";
  const subtitle =
    Number.isFinite(lat) && Number.isFinite(lon)
      ? `${lat.toFixed(4)}, ${lon.toFixed(4)}`
      : "";

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    const svg = buildPlaceholderSvg(label, subtitle);
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(svg);
  }

  if (!env.geoapifyApiKey) {
    const svg = buildPlaceholderSvg(label, subtitle);
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(svg);
  }

  const url = new URL("https://maps.geoapify.com/v1/staticmap");
  url.searchParams.set("apiKey", env.geoapifyApiKey);
  url.searchParams.set("style", style);
  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  url.searchParams.set("center", `lonlat:${lon},${lat}`);
  url.searchParams.set("zoom", String(zoom));
  url.searchParams.set("format", "jpeg");
  url.searchParams.set(
    "marker",
    `lonlat:${lon},${lat};color:${markerColor};size:large`,
  );

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Static map request failed (${response.status})`);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(buffer);
  } catch (error) {
    console.warn("[maps] static map fallback used", error);
    const svg = buildPlaceholderSvg(label, subtitle);
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(svg);
  }
});

export default router;
