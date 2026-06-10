# Mapetite Privacy Baseline

This is a practical MVP privacy baseline, not a formal legal review.

## What Mapetite Collects

Mapetite can process the following data during normal MVP use:

- Name and email for local mock account flows.
- Passwords for local mock account flows. The mock API stores password hashes in memory, not raw passwords.
- Auth token stored in browser `localStorage` under `creao_auth_token`.
- Favorite restaurant IDs stored by the local mock API in memory and mirrored in frontend state.
- Search location input such as city, region, country, coordinates, and radius.
- Restaurant search/filter state stored in browser `localStorage` under `restaurant-search-storage`.

## Third-Party Provider Data

Restaurant search can send place-search context to third-party providers:

- Geoapify is the primary provider when `GEOAPIFY_API_KEY` is configured.
- OSM/Overpass is used as fallback.

Search requests may include city, region, country, coordinates, radius, and category context. Mapetite does not sell user data.

## Storage Notes

- Local MVP auth users, password hashes, auth tokens, and favorites are kept in Vite mock API memory during local development.
- Deployed portfolio demos can run the backend with `MAPETITE_STORAGE_MODE=memory`; memory mode is demo-only and does not provide durable account or favorite storage.
- Browser tokens and search state persist in `localStorage` until the user logs out, clears storage, or resets the browser.
- Backend restaurant search/detail/media caches are in memory and reset when the backend restarts.

## Data Accuracy and Honesty

Mapetite uses free/low-cost provider data. Restaurant data may be incomplete or stale. Menu links, websites, phone numbers, hours, photos, and open-now status only appear when available from provider or normalization logic. Fallback artwork is not presented as verified venue photography.

## Deletion and Production Readiness

For a portfolio demo, users can clear browser storage and restart local mock services to remove local MVP data.

Before serving real users, Mapetite should add:

- production auth and durable account storage
- account deletion/data export flow
- email verification and password reset
- deployment-specific privacy contact information
- reviewed GDPR/CCPA or other jurisdiction-specific requirements if applicable
