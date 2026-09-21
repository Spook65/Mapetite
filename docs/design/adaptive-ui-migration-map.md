# Adaptive UI Migration Map

## Decision

Keep the Apple-inspired adaptive direction. Do not migrate its static markup literally. The production app already has stronger behavior than the prototype, so the safe path is to introduce a shared visual system first and move structure only after state ownership and viewport behavior are proven.

The source of truth for behavior is `mapetite-functionality-inventory.md`. This document defines sequence, placement, and release gates.

## Foundation status and safe opt-in

Phase 1 is implemented in `src/styles.css`, and the first non-default visual experiment is available on restaurant result cards:

- `.mapetite-adaptive-scope` owns all `--mapetite-adaptive-*` variables.
- Optional visual primitives are available only inside that scope.
- `/restaurants?ui=adaptive-card` applies the scope to individual result-card articles. The default `/restaurants` route, layout, map, modal, selected preview, detail, Saved, and Account surfaces do not opt in.
- Existing `:root`, legacy `--mapetite-*` tokens, Tailwind theme values, global focus rules, and MapLibre styling remain the active production system.
- No adaptive grid or pane ratio is applied; layout variables are contracts for later phases only.

Opt-in rules:

1. Select one low-risk, non-structural surface with existing behavior and tests.
2. Add `.mapetite-adaptive-scope` at the smallest coherent wrapper.
3. Add only the primitive classes needed by that surface. The result-card preview keeps legacy utility classes only for shared dimensions and rollback safety; adaptive classes own its visible preview treatment. Do not extend that temporary overlap without review.
4. Capture before/after desktop and 390-pixel screenshots and verify focus, contrast, overflow, CLS, and route behavior.
5. Roll back by removing the scope/primitive classes and the validated query value. No global token restoration, backend change, local-storage cleanup, or state rollback should be necessary.

## Result-card preview experiment

| Concern | Contract |
| --- | --- |
| Activation | Explicit `ui=adaptive-card` query value only |
| Persistence | None; refresh without the query returns to the default cards |
| Scope | One class boundary per result-card article |
| Behavior | Existing selection, detail, save/unsave, signed-out save handling, directions, image failure, and keyboard handling stay in place |
| Data | Existing real search results only; no API request or cache key includes the UI flag |
| Media | Existing image branch; adaptive CSS-only initial and `Photo unavailable` fallback when media is missing or fails |
| Mobile | Existing single-column card flow and two-column action grid, with scoped `min-width: 0`, stable 132-pixel media, and full-width controls |
| Rollback | Remove the route query parser branch and adaptive conditional classes, then remove preview-only CSS |

The experiment is a design-review surface, not a rollout flag. It must not be persisted, advertised as a user preference, or expanded to route-level styling until desktop/mobile visual review is approved.

Accent may style only the primary action, selected map pin, focus emphasis, or a small selected-state detail. It must not style generic cards, passive chips, page backgrounds, navigation decoration, map surfaces, success states, or ordinary borders.

## Migration classifications

- **Keep as-is for now:** preserve markup, state, and behavior while tokens are introduced around it.
- **Migrate visually first:** change only tokens/classes and verify no semantic or state change.
- **Migrate structurally later:** move controls or panes only after visual migration and interaction tests pass.
- **Needs prototype refinement first:** the adaptive concept does not yet cover enough real combinations.
- **Do not migrate yet:** defer until the core web shell is stable or a wrapper-specific need is proven.

## Area-by-area map

| Area | Current production contract | Adaptive destination | Disposition | Gate before movement |
| --- | --- | --- | --- | --- |
| Landing | Web marketing route with CTA, preview, auth navigation, and attribution | Lightweight web entry; installed app bypasses it after optional first-run education | **Keep as-is for now**; visual migration late | App-shell route is stable and TestFlight entry behavior is defined |
| Global header | Stable sticky route/auth navigation across app routes | Safe-area-aware app bar; desktop may use a compact sidebar/header | **Migrate visually first**, **structurally later** | Same route access, auth actions, sticky height, keyboard order, and footer reachability |
| Search form | Inline City/Region/Country fields, autocomplete, explicit location, Clear all, Search | Collapsed search command; sheet on compact, anchored popover/side panel when wide | **Needs prototype refinement first** | Real keyboard, combobox focus, validation errors, location permission, and Clear all tested in one transient surface |
| Autocomplete | Accessible combobox with global context, debounce/abort, loading, keyboard, paused, unavailable, and no-match states | Attached to search sheet/popover, internally scroll-capped | **Migrate structurally later** | ARIA behavior, active descendant, Enter/Escape, click/tap, 429 state, and mobile keyboard viewport pass |
| Recent searches | Browser-local chips/rows, count badges, clear action, quick examples | Compact section inside Search; optional quiet list-pane shortcut when Search is closed | **Migrate visually first** | No coordinate persistence, no overflow, counts remain labeled, clear remains discoverable |
| Restore last search | Quiet restore card plus honest stale label/background refresh | Slim results-pane banner/row | **Migrate visually first** | TTL/version rejection, filters/counts/map consistency, refresh failure copy |
| Filters and sort | Shared store with mobile sheet and desktop panel; one active constraint model | One Filters command; compact sheet and wide popover/side panel; Sort appears once | **Migrate visually first**, **structurally later** | Empty price means Any price, active count is accurate, defaults are not chips, saved-only auth behavior works |
| Search toolbar | Sort, saved-only, map, refresh, filters, and state copy currently share several rows | One stable command row with Filters, Sort, Map, Refresh and concise state | **Needs prototype refinement first** | Narrow labels, disabled/loading states, no duplicated Sort, no horizontal overflow |
| Results header | City/area title, found/matching/shown count, mapped count, stale state | List-pane header with secondary count line and contextual banners | **Migrate visually first** | City-scope copy, restored state, matching count, mapped count, and saved-only count remain distinct |
| Result cards | Image/fallback, evidence, facts, city-scope, actions, selected state | Compact content-first rows/cards with stable media and one-line evidence | **Migrate visually first** | Missing rating/hours/price/address/photo combinations, long names, saved feedback, and action availability tested |
| Selected preview | Mobile sticky card and desktop comparison panel | Safe-area bottom place sheet on compact; decision panel on wide layouts | **Needs prototype refinement first**, then **migrate structurally later** | Selection cleared on filtering, close never moves camera, all action disabled/auth states, Dynamic Type |
| Search map | Optional current-visible-results map with origin/user markers, safe popups, and stable camera | Primary content surface on wide screens; explicit Map state on compact | **Keep behavior as-is**; style container visually later | No camera teleport, marker persistence, Show all only intentional fit, popup safety, map unavailable state |
| Detail route | Canonical route with gallery, evidence, mini-map, planning links, save/directions | Canonical route remains; wide app may add a non-canonical preview pane | **Migrate visually later**; **do not replace route** | Deep-link/back behavior, missing-data states, one-pin map, external-link safety |
| Saved route | Auth-gated route, saved count, hydrated cards, stale-detail fallback, remove/directions | Saved destination in app navigation using adaptive card system | **Migrate visually after results cards** | Signed-in/out/loading, missing detail, reset disclosure, count and removal consistency |
| Account route | Profile, saved count, demo session limits, navigation, logout | Account destination/panel with same disclosures | **Keep as-is for now** | Auth/session state and demo limitation copy retained |
| Auth modals | Login/sign-up invoked from header, Saved, and save actions | Compact sheet/modal; wide popover/modal | **Do not migrate yet** | App shell and saved action feedback stable; focus trap and keyboard behavior specified |
| System states | Toasts, inline statuses, loading skeletons, and route empty/error states | Contextual surface-local banners/cards, not a global documentation grid | **Migrate visually first** | Each state appears in its actual owner surface and recovery action remains available |
| Footer/attribution | Data attribution, demo limitation, trademark disclaimer, feedback link | Web footer plus compact About/Data surface in installed app | **Keep as-is for now** | Legal/data attribution path is reachable in every distribution mode |

## Adaptive placement matrix

| State/control | Compact phone | Expanded/tablet | Desktop |
| --- | --- | --- | --- |
| Search command | Stable app-bar command; opens bottom sheet | Toolbar command; opens anchored panel without hiding list/map | Toolbar command; opens anchored popover/side panel |
| Filters/sort | One bottom sheet; only transient surface active | One anchored panel | One anchored popover/side panel |
| Recent/quick examples | Inside Search; optionally one compact recent shortcut | Inside Search panel | Inside Search panel |
| Results | Primary scroll surface | Left/list pane | Left/list pane |
| Map | Explicit Map toggle/state | Persistent flexible center/right pane | Persistent center pane |
| Selected place | Bottom sheet above content with safe-area inset | Right pane or map-attached card, not both at full detail | Right evidence/decision pane |
| Detail | Pushed route | Canonical route; optional preview after selection | Canonical route or non-canonical preview pane with a clear Open details action |
| Saved/Account | App-bar destinations/routes | App-bar/sidebar destinations | App-bar/sidebar destinations |
| Errors and loading | Local to Search, Results, Map, or Saved owner | Same owner surface | Same owner surface |

## Shared-state contract

The layout may adapt; ownership may not fork.

1. `restaurant-search-store` remains the only owner of location, restaurant result data, category/price/rating/open refinement, sort, and mobile-filter intent until a deliberate state refactor is separately approved.
2. Route-local state may continue to own autocomplete visibility, transient notices, selected restaurant, map-open state, and explicit user location.
3. The visible filtered list remains the input to result count, mapped count, card rendering, selection validity, and map pins.
4. Recent searches and last-search snapshots continue through `recent-search-cache`; adaptive surfaces consume those helpers rather than duplicate storage.
5. Favorites continue through authenticated favorite IDs plus existing local display snapshots; Saved-only is a view, not a second favorites system.
6. Search, Filters, and Selected Place share one compact-sheet coordinator. Opening one dismisses or replaces the other without losing underlying state.
7. Wide popovers do not create duplicate controls in the page body. The toolbar command and active panel are one control system.

## Reversible migration sequence

### Phase 0: documentation and baselines

- Keep the current production UI unchanged.
- Capture current route screenshots at compact, tablet, and desktop widths.
- Record keyboard order, focus behavior, key counts, mobile overflow, CLS, and map-camera checks.
- Treat the functionality inventory as the acceptance matrix.

### Phase 1: adaptive tokens only

- **Foundation implemented with one explicit preview:** namespaced light-adaptive color, spacing, radius, elevation, motion, media-ratio, pane, and control-size tokens exist under `.mapetite-adaptive-scope`.
- Optional surface, card, result-card, place-card, button, chip, toolbar, sheet, banner, and media-fallback primitives exist under the same scope.
- Existing dark tokens are not replaced globally. Only result cards explicitly opened with `?ui=adaptive-card` opt in.
- This visual experiment keeps DOM order and handlers intact and must verify contrast, screenshots, check/build/test, and no layout shift before broader use.
- Rollback is removal of the scope/query branch plus the result-preview-only CSS. The foundation block can be deleted only after every opt-in has been removed.

### Phase 2: primitives, still no layout movement

- Restyle buttons, fields, chips, cards, banners, and fallbacks under the opt-in scope.
- Keep route DOM order and handlers unchanged.
- Add visual regression checks for disabled, focus, selected, loading, and missing-data states.
- Rollback is class/token removal, not behavior reversal.

### Phase 3: result cards and results header

- The query-param card preview begins this phase without changing the default UI; a default migration still requires design approval.
- Preserve exact action handlers, evidence helpers, city-scope labels, image fallback, and stable aspect ratios.
- Validate compact card height and Dynamic Type before selected-place work.

### Phase 4: selected place

- Introduce the compact bottom place sheet and wide decision panel behind the same selection state.
- Retain close semantics, filter invalidation, directions/save/detail actions, and map-camera invariants.
- Do not add the wide detail preview yet.

### Phase 5: map/list shell

- Place the existing `SearchResultsMap` component into adaptive panes without changing internals.
- Resize only at shell boundaries; test MapLibre resize behavior and preserved user camera.
- Keep compact map behind an explicit toggle.

### Phase 6: Search and Filters commands

- Move existing fields and controls into one compact-sheet coordinator and wide anchored panels.
- Preserve autocomplete ARIA and all search/filter semantics.
- This is the highest interaction-risk phase and should be independently releasable.

### Phase 7: Saved and Account surfaces

- Apply established cards, banners, and shell navigation.
- Keep route/auth logic intact.

### Phase 8: detail and landing

- Restyle the canonical detail route after search/saved primitives are stable.
- Restyle the web landing last.
- Add a Capacitor/TestFlight wrapper only after the web adaptive shell is stable and mobile behavior is proven.

## Prototype refinement required before production

- Show missing rating, review count, hours, price, address, distance, and directions independently rather than only complete sample data.
- Define sheet replacement behavior when Search, Filters, and Selected Place compete on compact screens.
- Demonstrate keyboard-open geometry and autocomplete scrolling at 390 by 844 and with larger text.
- Clarify whether an expanded map card or right decision pane owns full selected-place actions; do not render both at equal weight.
- Replace documentation-style state galleries with contextual states inside Search, Results, Map, Saved, and Detail surfaces.
- Define active/pressed/disabled/focus visuals for every toolbar icon and text action.
- Validate footer/about attribution access in installed-app mode.
- Define navigation/back behavior for Search sheet, selected sheet, detail route, and external directions in a wrapper.

## Do not migrate yet

- Static prototype device frames, stage labels, continuity diagrams, state labs, or explanatory design copy.
- Three-pane detail preview as a replacement for the canonical detail route.
- Native-only navigation abstractions before a wrapper is approved.
- New animation libraries, blur-heavy materials, remote fonts, or new image assets.
- Any new persistence, provider behavior, ranking, place validation, routing, analytics, or location behavior.
- A wholesale rewrite of `restaurants.tsx`; extraction should follow proven visual boundaries and separate tests.

## Release gates for every phase

- No feature row in the inventory loses its owner or recovery action.
- `git diff --check`, type/lint checks, production build, and full tests pass.
- Compact width at 390 pixels has no horizontal overflow.
- Keyboard-only search, autocomplete, filters, route actions, and sheet dismissal remain usable.
- Focus is visible and restored sensibly after a sheet/popover closes.
- Reduced-motion behavior is retained.
- Search counts, filter semantics, selection validity, and map pins use the same visible dataset.
- Map selection and popup actions do not move the camera unless Show all is invoked.
- No automatic geolocation, tracking, API, provider, ranking, or auth changes are introduced.

## First safe production step

The namespaced adaptive token foundation is complete, and the low-risk result-card preview is the first explicit opt-in. Keep it query-gated until its real-data, fallback, selected, signed-in/out, keyboard, desktop, and 390-pixel states are approved. The next step is review and refinement, not another surface migration. Do not proceed to the search sheet, selected-place behavior, map shell, route layout, or three-pane structure; those areas still wait for interaction and viewport proof.
