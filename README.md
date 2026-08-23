# Mapetite

Mapetite is a full-stack restaurant discovery MVP that helps users search by
city, compare cleaner restaurant options, save a shortlist, and open detail
pages with practical context before deciding where to go.

It is not trying to be Google Maps, Yelp, or an official restaurant data source.
The project focuses on a smaller product promise:

> Search a place, compare useful restaurant signals, and show missing or
> uncertain public data honestly instead of filling gaps with fake claims.

## Live Demo

- Frontend: [https://mapetite-nine.vercel.app](https://mapetite-nine.vercel.app)
- Backend health check: [https://mapetite-y04j.onrender.com/health](https://mapetite-y04j.onrender.com/health)

The deployed app is a portfolio MVP demo. Accounts and saved places may reset
because the demo backend can run in memory mode.

## Why This Project Matters

Mapetite is designed as a serious CS/internship portfolio project, not just a
restaurant-themed landing page. It demonstrates:

- a separated React/Vite frontend and Express backend deployment
- provider/open-data integration with Geoapify and OSM/Overpass fallback
- backend place validation so fake or ambiguous city searches do not silently
  resolve to unrelated locations
- data normalization from raw provider JSON into app-specific restaurant objects
- ranking signals based on rating confidence, review depth, category relevance,
  location quality, and listing completeness
- honest UI labels for hours, menus, photos, cuisine hints, and unavailable data
- demo auth/saved-place behavior, CORS, rate limits, security headers, and privacy notes

## Core Features

- City, state/province/region, country, and coordinate-based restaurant search.
- Backend place validation for known city/region/country combinations.
- Clear invalid-place and ambiguous-place responses.
- Geoapify as the primary restaurant/location provider.
- OSM/Overpass fallback when primary provider data is unavailable or thin.
- Normalized restaurant cards with rating, review count, cuisine/category,
  hours status, route, save, and detail actions.
- Optional MapLibre map view for the current search results when listings
  include usable coordinates.
- "Prioritize open" soft ordering that moves confirmed or likely-open places up
  without hiding every restaurant when hours data is incomplete.
- Detail pages with practical actions: directions, save, website, menu, and
  phone when those fields are available.
- Real menu links only when provider/open-data fields explicitly include a menu
  URL.
- Photo galleries when venue photos are available, plus honest no-photo states
  when verified venue photos are unavailable.
- Category-based cuisine hints that are labeled as hints, not verified menu
  items.
- Demo registration/login/logout and saved-place behavior backed by the
  Express demo favorites API in memory mode.
- Saved Places page for viewing, opening, getting directions to, and removing
  saved restaurants from a demo shortlist.
- Demo Account page for viewing session identity, saved-place count, logout, and
  MVP account limitations.
- Responsive landing, search, selected-preview, and detail-page layouts.
- Footer attribution, MVP disclosure, privacy baseline, and optional feedback
  link.

## Tech Stack

Frontend:

- React
- TypeScript
- Vite / Rolldown Vite
- TanStack Router
- TanStack Query
- Zustand
- Tailwind CSS
- Radix/shadcn-style UI primitives
- Vitest

Backend:

- Node.js
- Express
- Geoapify
- OpenStreetMap / Overpass fallback
- Countries States Cities Database-derived compact place index
- In-memory TTL caches for search, geocoding, detail, and media enrichment
- Memory-mode demo auth/saved places
- Optional Mongo connection hook and database-mode configuration path

Deployment:

- Vercel for the static frontend
- Render for the Express backend

## Architecture

```text
User
  |
  v
Vercel React frontend
  |
  | REST API calls
  v
Render Express backend
  |
  | place validation, provider search, normalization, caching
  v
Geoapify primary provider + OSM/Overpass fallback
```

Repository map:

```text
src/
  routes/                 React route pages for landing, search, and detail
  components/             Layout, footer, auth modal, and UI pieces
  lib/api/                Frontend API clients for restaurants, auth, favorites
  store/                  Zustand restaurant search state

server/
  routes/                 Express routes for restaurants, auth, health, maps
  services/               Provider, catalog, ranking, hours, media, validation
  data/                   Compact backend-only place validation index
  config/                 Environment and logging helpers
```

Key files:

- `src/routes/index.tsx` - landing page and product preview
- `src/routes/restaurants.tsx` - search form, filters, result cards, selected preview
- `src/routes/restaurants/$restaurantId.tsx` - restaurant detail page
- `src/lib/api/restaurants.ts` - frontend restaurant API client
- `src/store/restaurant-search-store.ts` - persisted search/filter UI state
- `server/routes/restaurants.js` - search/detail route handling
- `server/services/placeValidation.js` - city/region/country validation
- `server/services/restaurantCatalog.js` - provider orchestration, normalization, ranking, cache
- `server/services/geoapifyProvider.js` - Geoapify search/detail normalization
- `server/services/restaurantHours.js` - conservative hours-status labeling
- `server/routes/demoAuth.js` - memory-mode demo auth/favorites API

## Data Pipeline

1. The user enters a place such as "Stockton, California, United States".
2. The backend validates and canonicalizes that place against a compact
   backend-only location index.
3. Invalid places return `PLACE_NOT_FOUND`; ambiguous places return
   `PLACE_AMBIGUOUS` with suggestions instead of silently guessing.
4. The backend searches Geoapify first.
5. If needed, the backend can use OSM/Overpass fallback data.
6. Raw provider JSON is normalized into Mapetite restaurant objects.
7. The catalog layer deduplicates, scores, ranks, and caches the result set.
8. The frontend renders results with honest labels for available, unavailable,
   and uncertain data.
9. Detail pages load normalized restaurant data by ID and show practical actions
   and missing-data states.

In plain English: provider data can be incomplete, so Mapetite separates "we
have this data" from "we do not know" instead of inventing missing content.

## Ranking and Data Quality

Mapetite's default ranking is not an official quality score. It is a practical
MVP ranking that favors listings that are more useful for a search experience.

Signals include:

- restaurant/category confidence
- rating and review-count confidence
- searched-location relevance
- coordinate/address completeness
- website, phone, menu URL, and hours availability
- photo/media availability
- penalties for weak names, suspicious non-food categories, missing coordinates,
  or very low data-completeness signals

The app does not rank by ambience, noise level, service quality, romance,
authenticity, or local popularity because those signals are not available from
the current provider stack.

## Hours and Open Status

Mapetite treats hours carefully:

- `Open now` / `Closed now` are used when provider data explicitly confirms
  status.
- `Likely open` / `Closed based on listed hours` can be used for simple
  same-hours schedules that Mapetite can safely evaluate in the restaurant
  location's timezone.
- `Hours listed` is used when hours exist but the schedule is too complex or
  uncertain for the lightweight parser.
- `Hours unavailable` is used when the current data source does not provide
  usable hours.
- `Prioritize open` is soft ordering, not a hard filter. Restaurants with
  incomplete hours remain visible lower in the list.

Users should still confirm hours before going, especially when provider/open
data is incomplete or stale.

## Menus, Photos, and Cuisine Hints

Mapetite avoids fake certainty:

- Menu links appear only when provider/open-data fields explicitly include a
  menu URL, such as menu-specific OSM-style fields.
- Generic restaurant websites are not converted into menu links.
- Cuisine hints are generated from normalized category/cuisine labels and are
  not verified menu items.
- Verified venue photos are shown when available.
- Fallback artwork and no-photo states are clearly treated as fallback UI, not
  real venue photography.

## Known MVP Limitations

- Public provider/open-data coverage varies by city and country.
- Some restaurants may lack hours, photos, phone numbers, menu URLs, websites,
  ratings, or review depth.
- Complex hours schedules are intentionally conservative until a production
  parser such as `opening_hours.js` is evaluated.
- The compact place index is not a full global autocomplete database.
- Demo auth/saved places in `MAPETITE_STORAGE_MODE=memory` reset when the backend
  restarts.
- Auth tokens are stored in browser `localStorage`, which is acceptable for a
  demo but should be revisited before serving real users.
- There is no claimed-business flow, owner verification, moderation tooling, or
  official restaurant data partnership.
- Mapetite is not a replacement for official restaurant websites, Google Maps,
  Yelp, OpenTable, or Resy.
- This repository includes privacy/security baseline notes, not formal legal
  compliance review.

## Privacy and Security Baseline

See [PRIVACY.md](./PRIVACY.md) for the MVP privacy baseline.

Current safeguards and boundaries:

- Backend secrets such as `GEOAPIFY_API_KEY`, `DATABASE_URL`, and Mongo URLs stay
  server-side in environment variables.
- The frontend uses `VITE_RESTAURANTS_API_BASE_URL` and `VITE_API_BASE_PATH` to
  target the deployed backend.
- The Express backend disables `x-powered-by`, sends basic security headers, and
  limits JSON request bodies to 1 MB.
- Production deployments should set `CORS_ORIGIN` to the deployed frontend URL.
- The backend includes lightweight in-memory rate limiting for `/api` and
  restaurant search routes.
- Demo passwords are hashed with Node crypto `scrypt` before being stored in the
  memory-mode demo auth map.
- Memory-mode accounts, sessions, saved places, and caches reset on backend restart.
- The frontend clears stale demo auth locally when the backend reports an invalid
  or expired session, so users are not left appearing signed in after a restart.

Before real users, Mapetite would need production auth, durable storage, email
verification, password reset, account deletion/export, token/session review, and
deployment-specific legal/privacy review.

## Local Development

Requirements:

- Node `^20.19.0 || >=22.12.0`
- pnpm `>=10`
- Geoapify API key recommended for primary provider results

Install frontend dependencies from the repo root:

```sh
pnpm install --frozen-lockfile
```

Create local env files from the committed template:

```sh
cp .env.example .env
cp .env.example server/.env
```

Set `GEOAPIFY_API_KEY` for primary Geoapify results. Without it, the backend
warns and falls back to OSM/Overpass where possible.

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

Open the frontend at `http://127.0.0.1:3000`. If that port is busy, Vite may use
the next available port.

## Commands

From the repo root:

```sh
pnpm run dev              # frontend dev server
pnpm run build            # typecheck + production frontend build
pnpm run test             # Vitest test suite
pnpm run check            # read-only typecheck + Radix Select lint check
pnpm run lint:radix:fix   # autofix Radix Select lint issues
pnpm run format           # Biome write/format pass
```

From `server/`:

```sh
pnpm run dev              # backend with nodemon
pnpm run start            # backend with node
```

## Environment Variables

Use `.env.example` as the shared template. Do not commit real keys or secrets.

Frontend variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_RESTAURANTS_API_BASE_URL` | Required in production | Backend base URL for restaurant search/detail. Defaults to `http://127.0.0.1:5001` in development. |
| `VITE_API_BASE_PATH` | Required for deployed demo auth | Auth/saved-place API base URL. Leave blank for local Vite mock auth. Set to the Render backend URL for the deployed portfolio demo. |
| `VITE_FEEDBACK_URL` | Optional | External form URL used by the footer's "Send feedback" link. Hidden when empty. |
| `VITE_MAP_STYLE_URL` | Optional | MapLibre style URL for the optional search results map. Defaults to OpenFreeMap's no-token Liberty style for clearer roads/labels. Use `https://tiles.openfreemap.org/styles/dark` for a moodier dark override. |
| `VITE_AUTH_DEBUG` | Optional | Auth integration debug logging when explicitly enabled. Keep `false` in deployed demos. |
| `VITE_MOCK_API_DEBUG` | Optional | Vite mock API debug logs when explicitly enabled. Keep `false` in deployed demos. |
| `VITE_APP_CONFIG_DEBUG` | Optional | App config debug logs when explicitly enabled. Keep `false` in deployed demos. |
| `VITE_MCP_API_BASE_PATH` | Optional/legacy | Used by remaining generated MCP SDK helpers if those paths are exercised. |
| `TENANT_ID` | Optional | Used by Vite base-path logic for hosted tenant-style paths. |

Backend variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `MAPETITE_STORAGE_MODE` | Recommended | Use `memory` for portfolio/MVP demo deployments. Use `database` only when persistent storage is configured. Defaults to `memory`. |
| `GEOAPIFY_API_KEY` | Recommended | Primary restaurant/geocoding provider. If missing, search falls back to OSM/Overpass where possible. |
| `HOST` | Optional | Defaults to `127.0.0.1`. Use `0.0.0.0` on Render-style hosts. |
| `PORT` | Optional | Defaults to `5001`. |
| `CORS_ORIGIN` | Recommended in production | Comma-separated frontend origins allowed by the backend. |
| `RATE_LIMIT_WINDOW_MS` | Optional | Backend API rate-limit window. Defaults to 15 minutes. |
| `RATE_LIMIT_MAX` | Optional | General `/api` requests per IP per window. Defaults to `300`. |
| `SEARCH_RATE_LIMIT_MAX` | Optional | `/api/restaurants/search` requests per IP per window. Defaults to `60`. |
| `DATABASE_URL` | Required only for `MAPETITE_STORAGE_MODE=database` | Prisma/Postgres connection. Not required for memory-mode portfolio demos. |
| `MONGODB_URI` / `MONGO_URI` | Optional | Optional Mongo connection hook. The app logs a warning and continues if unavailable in database mode. |
| `MAPETITE_SEARCH_DEBUG` | Optional | Backend search diagnostics when `true`. Keep `false` in deployed demos. |
| `SEARCH_DEBUG` | Optional | Legacy alias for backend search diagnostics. Keep `false` in deployed demos. |

## Deployment

Recommended portfolio deployment:

- Frontend: Vercel
- Backend: Render, Railway, Fly.io, or another Node/Express host

Vercel frontend settings:

```text
Framework preset: Vite
Build command: pnpm run build
Output directory: dist
```

Vercel environment:

```text
VITE_RESTAURANTS_API_BASE_URL=https://your-backend-url
VITE_API_BASE_PATH=https://your-backend-url
VITE_FEEDBACK_URL=https://your-feedback-form-url   # optional
VITE_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty   # optional; dark override: https://tiles.openfreemap.org/styles/dark
```

Backend environment for a Render demo:

```text
NODE_ENV=production
MAPETITE_STORAGE_MODE=memory
GEOAPIFY_API_KEY=...
HOST=0.0.0.0
CORS_ORIGIN=https://your-vercel-url
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
SEARCH_RATE_LIMIT_MAX=60
MAPETITE_SEARCH_DEBUG=false
SEARCH_DEBUG=false
```

Notes:

- Do not convert the current Express backend to Vercel serverless functions for
  this MVP deployment.
- The committed `vercel.json` rewrites route requests to `index.html` so direct
  visits to frontend routes work on Vercel.
- `DATABASE_URL` is not required for `MAPETITE_STORAGE_MODE=memory`.
- Memory-mode demo accounts, saved places, and in-memory caches reset on backend
  restart.
- The backend health route is `GET /health`.

## Verification

Automated checks from the repo root:

```sh
pnpm run check
pnpm run build
pnpm run test
```

Manual smoke tests that represent the current MVP:

- Search `Stockton, California, United States`.
- Search `San Diego, California, United States`.
- Search `fakecity` and confirm a clean place-not-found message.
- Search `Springfield` and confirm an ambiguous-place response.
- Toggle `Prioritize open` and confirm results are reordered, not hidden by
  default.
- Open a restaurant detail page.
- Confirm Save/Saved works while logged in.
- Open Saved Places and confirm saved restaurants can be viewed and removed.
- Confirm Directions opens a route URL.
- Confirm website/menu actions appear only when those links exist.
- Confirm no-photo and failed-photo states do not look like verified venue
  photos.

## Data Attribution

- Restaurant and location data: OpenStreetMap contributors and Geoapify-powered
  provider data where available.
- Optional map tiles/style: OpenFreeMap Liberty by default, with
  OpenStreetMap/OpenMapTiles attribution visible in the map control.
  `VITE_MAP_STYLE_URL` can point to another MapLibre-compatible style, and
  OpenFreeMap Dark is the documented moody override.
- Place validation data: [Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database),
  licensed under ODbL v1.0.

The compact `server/data/placeIndex.json` is backend-only and intended for MVP
validation coverage. A future production pass should generate it from upstream
data with a repeatable import script instead of relying on manual additions.

## Screenshots

No screenshot files are currently committed.

Recommended portfolio screenshots to add later:

- Landing page, desktop
- Search results, desktop
- Search results, mobile with selected sticky card
- Restaurant detail page, desktop
- Restaurant detail page, mobile
- No-photo/detail fallback state

## Portfolio Highlights

Use these points when explaining the project:

- Built a full-stack restaurant discovery MVP with React, TypeScript, Vite,
  Node.js, Express, and public provider/open-data sources.
- Designed a provider normalization pipeline that converts raw Geoapify/OSM data
  into consistent restaurant objects with ranking, data-completeness signals,
  hours labels, media fallback states, and menu-link validation.
- Implemented backend place validation so invalid or ambiguous city searches do
  not silently geocode to unrelated locations.
- Reworked "Open Now" into a data-honest "Prioritize open" experience that keeps
  restaurants visible when provider hours are incomplete.
- Shipped responsive search/detail flows with Saved Places, selected previews,
  a Saved Places shortlist, demo auth, route actions, no-photo states, and
  honest missing-data copy.
- Deployed a separated Vercel frontend and Render Express backend with CORS,
  rate limiting, security headers, environment-based configuration, and health
  checks.

## Roadmap

Small, realistic next steps:

- Generate the compact place index from upstream data with a repeatable script.
- Evaluate `opening_hours.js` for richer OSM schedule parsing.
- Add durable production auth and persistent saved-place snapshots.
- Add screenshots and short demo GIFs for the portfolio page.
- Expand automated backend tests around provider normalization and place
  validation.
- Add optional location autocomplete without shipping a massive city database to
  the frontend.
