# Mapetite

Mapetite is a restaurant discovery app that helps users search by place, compare curated restaurant results, save favorites, and open detail pages with practical decision cues.

The goal is not to perfectly declare the single "best" restaurant. Mapetite helps people compare with less noise, find restaurants worth considering, and make a better dining decision from the data available.

## Product Positioning

Mapetite is built for broad restaurant discovery, not only date nights. It supports different dining contexts, from casual meals to special nights out, by focusing on practical signals that are available from the current provider stack:

- location and distance context
- restaurant-like category confidence
- rating and review confidence when available
- hours and open-now status when provider-backed
- website, phone, menu, and directions availability
- media coverage or honest fallback artwork
- favorites for keeping a shortlist

Future versions may add occasion-based recommendation modes such as first-date fit, casual dinner, group night, quick bite, and worth-the-trip searches. Those modes are roadmap items, not current ranking behavior.

## Features

- Place-based restaurant search by city, region, country, or coordinates.
- Geoapify primary provider with OSM/Overpass fallback.
- Normalized restaurant data so raw provider categories do not leak directly into the UI.
- Quality-weighted default ranking using restaurant-likeness, rating/review confidence, category relevance, location relevance, data completeness, and media trust.
- Category chips, price/rating/sort controls, favorites-only mode, and Show More batching.
- Open-now handling only when provider data explicitly supports it.
- Desktop selected restaurant preview rail.
- Mobile selected restaurant bottom bar.
- Detail pages with gallery fallback states, website/menu/call/directions actions, hours formatting, and save controls.
- Favorites backed by the app auth flow, with local snapshot rehydration for MVP resilience.
- Responsive mobile navigation and sticky mobile navbars.
- Credibility-safe landing page sample content that demonstrates product flow without pretending sample restaurants are live provider data.

## Current Ranking Philosophy

Mapetite's current best-match ranking favors restaurants that look useful and trustworthy given free/low-cost data:

- stronger restaurant/food category confidence
- provider-backed ratings and review counts when available
- weighted rating confidence instead of raw rating alone
- searched-location relevance and reasonable distance when available
- useful completeness signals such as address, valid coordinates, hours, website, phone, menu URL, and real media coverage
- penalties for weak names, suspicious/non-food categories, missing coordinates, and very low trust signals

Mapetite does not currently rank by romance, lighting, noise level, first-date fit, service pacing, or ambiance quality. Those signals would require richer data and are intentionally left for future product work.

## Tech Stack

Frontend:

- React
- TypeScript
- Vite / Rolldown Vite
- TanStack Router
- TanStack Query
- Zustand
- Tailwind CSS
- Radix/shadcn-style UI components
- Vitest

Backend:

- Node.js
- Express
- Geoapify
- OSM/Overpass fallback
- In-memory TTL caches for search, geocoding, detail, and media enrichment
- Optional MongoDB connection hooks
- Prisma/Postgres configuration for production-oriented persistence paths

Auth:

- MVP/dev auth is served by the Vite mock API plugin during local frontend development.
- Auth tokens are stored client-side in `localStorage` under `creao_auth_token`.
- This is sufficient for portfolio/MVP flows, but production auth still needs hardening, HTTPS, durable user storage, email verification, secure token/session handling, and deployment-specific review.

## Requirements

- Node `^20.19.0 || >=22.12.0`
- pnpm `>=10`
- Geoapify API key recommended for primary restaurant search
- Backend defaults to `127.0.0.1:5001`
- Frontend defaults to `127.0.0.1:3000` or the next available Vite port

## Local Setup

Install frontend dependencies from the repo root:

```sh
pnpm install --frozen-lockfile
```

Create local env files from the committed template:

```sh
cp .env.example .env
cp .env.example server/.env
```

Fill in any values you need locally. At minimum, set `GEOAPIFY_API_KEY` for primary Geoapify results. Without it, the backend falls back to OSM/Overpass where possible.

Start the backend:

```sh
cd server
pnpm install --frozen-lockfile
pnpm run dev
```

In another terminal, start the frontend from the repo root:

```sh
pnpm run dev
```

Open the frontend at `http://127.0.0.1:3000`. If that port is busy, Vite will choose the next available port.

## Commands

From the repo root:

```sh
pnpm run dev      # frontend dev server
pnpm run build    # typecheck + production frontend build
pnpm run test     # Vitest
pnpm run check    # typecheck + Radix Select lint check
```

From `server/`:

```sh
pnpm run dev      # backend with nodemon
pnpm run start    # backend with node
```

## Environment Variables

Use `.env.example` as the shared template. Do not commit real keys or secrets.

Frontend variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_RESTAURANTS_API_BASE_URL` | Optional locally | Backend base URL. Defaults to `http://127.0.0.1:5001`. Set this in production. |
| `VITE_AUTH_DEBUG` | Optional | Enables auth integration debug logging in development only when `true`. |
| `VITE_MOCK_API_DEBUG` | Optional | Enables Vite mock API debug logs when `true`. |
| `VITE_APP_CONFIG_DEBUG` | Optional | Enables app config debug logs in development only when `true`. |
| `TENANT_ID` | Optional | Used by Vite base path logic for hosted tenant-style paths. |
| `VITE_MCP_API_BASE_PATH` | Optional/legacy | Used by remaining generated MCP SDK helpers if those paths are exercised. |
| `VITE_API_BASE_PATH` | Optional/legacy | Used by remaining generated auth SDK helpers if those paths are exercised. |

Backend variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `GEOAPIFY_API_KEY` | Recommended | Primary restaurant/geocoding provider. If missing, search falls back to OSM/Overpass where possible. |
| `PORT` | Optional | Defaults to `5001`. |
| `HOST` | Optional | Defaults to `127.0.0.1`. |
| `CORS_ORIGIN` | Recommended in production | Comma-separated frontend origins allowed by the backend. Leave unset for permissive local MVP behavior. |
| `DATABASE_URL` | Required in production | Prisma/Postgres connection. Local MVP flows can run without invoking Prisma, but production config requires it. |
| `MONGODB_URI` / `MONGO_URI` | Optional | Optional Mongo connection. The app logs a warning and continues if unavailable. |
| `MAPETITE_SEARCH_DEBUG` | Optional | Backend search diagnostics when `true`. |
| `SEARCH_DEBUG` | Optional | Legacy alias for backend search diagnostics. |

## Data Sources

- Geoapify is the primary restaurant and location provider.
- OSM/Overpass is the fallback when Geoapify is unavailable or returns too little usable data.
- Geoapify's primary search cap is separate from the OSM fallback cap.
- OSM fallback is capped to the top 100 results after normalization, filtering, deduplication, and ranking so large cities do not send thousands of results to the frontend.
- In-memory TTL caches reduce repeated provider calls:
  - search results: 1 hour for successful results, 10 minutes for empty/negative results
  - geocode/location: 24 hours for successful results, 10 minutes for misses
  - detail objects: 6 hours
  - media enrichment: 24 hours for successful results, 1 hour for no-image results
- When cache TTL expires, Mapetite recomputes a fresh ranked result set from providers. It does not paginate through result 101+ yet.

## Data Honesty and Limitations

Mapetite uses free/low-cost provider data, so coverage varies by city and country.

Known MVP limitations:

- Some restaurants may lack website, phone, menu, hours, photos, or review depth.
- Fallback artwork is used when verified venue photos are unavailable.
- Menu links appear only when a reliable `menuUrl` is available.
- Website and call actions appear only when data is available.
- Hours are displayed when provider data exists.
- Open-now claims are only trusted when the provider explicitly supplies open-now status.
- Ratings/reviews can be incomplete or derived depending on provider data.
- Free Geoapify/OSM coverage will not match paid Yelp or Google Places coverage.
- The landing preview content is sample/product-flow content, not live provider restaurant data.
- First-date/date-night ranking and occasion modes are not implemented yet.
- Backend favorites still benefit from stronger future snapshot persistence; the MVP uses frontend local snapshots to help rehydrate favorites across searches.

## Authentication Notes

Local development uses the Vite mock API plugin for registration, login, profile, and favorite flows. This lets the MVP demonstrate auth and favorites without requiring a production auth provider.

Important production gaps:

- Replace mock auth with a production auth service or hardened backend auth.
- Store users and sessions durably.
- Add email verification and password reset flows.
- Serve only over HTTPS.
- Review token lifetime, storage, refresh, logout, and CSRF/CORS behavior before real users.

## Privacy and Security Baseline

See [PRIVACY.md](./PRIVACY.md) for the MVP privacy baseline.

Current release-readiness notes:

- The app stores auth tokens in browser `localStorage`; this is acceptable for an MVP demo but should be revisited for production users.
- The backend sends basic security headers and limits JSON request bodies to 1 MB.
- Production deployments should set `CORS_ORIGIN` instead of relying on permissive local CORS.
- Do not expose `GEOAPIFY_API_KEY`, `DATABASE_URL`, or other backend secrets to the frontend.
- A development-only JWT diagnostic route exists at `/jwt-debug`, but it does not expose token details in production builds.

## Deployment Notes

- The frontend and backend can be deployed separately.
- Set `VITE_RESTAURANTS_API_BASE_URL` in the frontend deployment to point at the deployed backend.
- Configure `GEOAPIFY_API_KEY` on the backend deployment for primary provider results.
- Configure `DATABASE_URL` for production backend environments.
- Configure `CORS_ORIGIN` to allow the deployed frontend origin before serving real users. The backend is permissive only when `CORS_ORIGIN` is unset.
- In-memory caches reset when the backend restarts. Use a persistent cache later if refresh stability becomes important.
- Production auth/storage needs hardening before real users.
- Free provider data quality varies by region; this is acceptable for MVP/portfolio, but should be documented in demos.

## Future Roadmap

- Occasion-based recommendation modes:
  - first-date fit
  - casual dinner
  - group night
  - quick bite
  - worth the trip
- Backend favorite restaurant snapshots.
- Production auth and email verification.
- Persistent database-backed cache.
- Admin/manual restaurant overrides.
- Richer media/menu provider integrations.
- Optional paid provider support later.
- Deployment hardening.
- Location autocomplete and place suggestions.
