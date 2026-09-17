# Mapetite UI Refresh Prototypes

## Safety Boundary

The prototypes live in `docs/design/ui-refresh-prototypes.html`. They are standalone static mockups and are not imported by the React application, Vite entry point, generated route tree, or production build.

- Current branch at the start of this pass: `main`.
- Recommended branch: `ui-prototypes/search-refresh`.
- The branch could not be created in this environment because Git metadata is read-only and the ref lock could not be written. No existing refs were removed or changed.
- No backend, provider, ranking, validation, map, directions, auth, saved-place, autocomplete, or recent-search code was changed.
- The prototypes make no API, storage, geolocation, analytics, or authentication calls.

Open the design lab while the local Vite server is running:

```text
http://localhost:3000/docs/design/ui-refresh-prototypes.html
```

## 1. Design Goals

1. Give Mapetite a recognizable food-guide identity without sacrificing the current practical search workflow.
2. Preserve every important control: city, region, country, autocomplete position, recent searches, location action, filters, sort, saved-only, map, refresh, result actions, selected comparison, and detail navigation.
3. Use espresso, restrained sage, and apricot with stronger typographic hierarchy rather than adding more decoration.
4. Keep mobile layouts single-column, stable, and free of horizontal overflow.
5. Treat motion as optional polish, never as navigation or content structure.

## 2. Prototype A: Editorial Guide

The Editorial Guide turns the shortlist into a premium food-guide composition:

- Large, stable result media and confident serif headings.
- A selected comparison panel that reads like a concise decision note rather than a duplicate card.
- Compact evidence rows for rating, hours, address, photos, menu gaps, and directions.
- A small detail-page direction strip showing how the same hierarchy could continue into restaurant details.
- Search, recent searches, filters, sort, saved-only, map, refresh, save, directions, and detail navigation remain visible.

This is the strongest brand direction. It is meaningfully different from generic search dashboards while remaining compatible with the existing product model.

## 3. Prototype B: Bento Discovery

The Bento Discovery direction organizes the desktop search experience into explicit functional zones:

- Search and location actions.
- Recent searches.
- A single consolidated control row.
- Compact results.
- Map context.
- Selected restaurant comparison.

It is the clearest operational layout and scales well on desktop. On mobile, the grid collapses to one column in task order. The risk is that it can feel like a polished SaaS dashboard rather than a restaurant guide if the editorial typography and warm materials are removed.

## 4. Prototype C: Cinematic Landing Only

The Cinematic Landing raises first-glance impact without changing the search application:

- Layered CSS gradients provide atmosphere without external images, canvas, WebGL, or particles.
- Decorative movement uses slow `transform` animation only.
- Open search remains the primary CTA.
- Home, Search, Saved, login, signup, and footer/data links remain represented.
- The prototype keeps a fixed media aspect ratio and avoids content insertion above the hero.

This direction should remain landing-only. Its atmospheric treatment would compete with dense search and detail data if applied throughout the app.

## 5. Dependencies Used Or Avoided

No dependencies were added.

| Tool or pattern | Decision | Reason |
| --- | --- | --- |
| Motion / Motion.dev | Avoided for prototype | Existing CSS transitions cover opacity and transform exploration with zero bundle impact. Motion could be reconsidered only if production orchestration becomes difficult. |
| Anime.js | Avoided | No animation need justifies a second runtime. |
| Kokonut UI | Inspiration only | Small layout and surface ideas were recreated directly; no registry component or copied event logic was introduced. |
| Particles / WebGL | Avoided | High performance and accessibility risk for little product value. |
| EvilCharts | Avoided | Search and restaurant details do not need charts. |
| Remote fonts, scripts, or images | Avoided | The prototype is self-contained and reviewable offline. |

If Motion is proposed later, review `motion` as the single animation dependency. Before approval, measure its production chunk impact, verify reduced-motion behavior, and compare against the existing CSS-only alternative. Do not add Anime.js alongside it.

## 6. Security And Privacy Review

- No remote scripts or copied obfuscated code.
- No `eval`, `new Function`, dynamic script insertion, or HTML injection.
- No `dangerouslySetInnerHTML` because the prototype is plain static HTML.
- No analytics, tracking, IP geolocation, precise location, local storage, cookies, or browser history access.
- No provider calls or full place-index data.
- Prototype buttons are visual except for explicit links to existing local app routes and external directions/data-attribution examples.
- Production migration must reuse existing safe React handlers and URL helpers rather than copying placeholder links.

## 7. Accessibility And Motion

- Prototype switcher uses tabs with `aria-selected`, `aria-controls`, and left/right keyboard navigation.
- Focus indicators remain visible on links, buttons, inputs, and selects.
- Controls retain at least 42px height in most contexts.
- Essential text is not animated.
- Motion is limited to opacity and transforms.
- `prefers-reduced-motion: reduce` disables meaningful animation duration and smooth scrolling.
- There is no scroll-jacking, autoplay media, hover-only information, or color-only selected state.

## 8. Performance And CLS Safeguards

- All media-like surfaces reserve space with `aspect-ratio` before paint.
- Prototype navigation has a stable minimum height.
- No asynchronous content is inserted above results.
- Decorative gradients are CSS-only and require no network request.
- The cinematic blobs animate transforms instead of layout properties.
- Mobile removes card rotation and uses a single-column layout.
- No prototype file is imported into the production application bundle.

## 9. What Should Not Move Into Production

- Static sample restaurant data and placeholder controls.
- Prototype Google Maps coordinates and links.
- The standalone tab-switching script.
- Cinematic motion outside the landing page.
- Dashboard density from Bento without user testing at tablet widths.
- Serif typography on every control or dense metadata surface.
- Any future particles, WebGL, charting, or animation library without a measured user need.

## 10. Recommended Direction

Use **Editorial Guide** as the primary direction, borrowing the Bento prototype's consolidated control row and desktop information grouping. Use **Cinematic Landing** only as an optional landing-page treatment.

Why:

- Editorial Guide creates the clearest Mapetite identity.
- It improves comparison hierarchy without turning public listing signals into recommendations.
- It maps cleanly onto current result and detail data.
- It can be migrated incrementally without changing backend or state behavior.
- Bento's control organization solves density, while Editorial prevents the product from feeling generic.

## 11. Migration Plan If Approved

1. Create or switch to `ui-prototypes/search-refresh` in a Git environment with writable metadata.
2. Extract only visual tokens and layout primitives from the winning prototype.
3. Apply the consolidated control row to the existing search route without changing handlers or store semantics.
4. Restyle one existing result card and the selected comparison panel behind a temporary local feature flag.
5. Verify autocomplete, recent searches, filters, map, save, directions, and sticky behavior before expanding the treatment.
6. Apply the editorial hierarchy to one detail-page section at a time.
7. Consider the cinematic landing treatment separately after measuring LCP, CLS, reduced motion, and mobile battery impact.
8. Remove the feature flag only after desktop/mobile regression checks and the complete test suite pass.
