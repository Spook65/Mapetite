# Mapetite Visual Direction Lab: Round Four

## Safety Boundary

The fourth-round work lives only in `docs/design/ui-refresh-prototypes.html` and this document. The prototype is a standalone static comparison lab. It is not imported by the React application, generated route tree, Vite entry point, backend, or production bundle.

- No production route, search, provider, ranking, validation, autocomplete, cache, map, directions, authentication, saved-place, account, or sticky-header code changed.
- No dependencies, lockfiles, remote fonts, remote images, external styles, remote scripts, analytics, iframes, APIs, storage, authentication, geolocation, cookies, or browser-history access were added.
- Restaurant names, ratings, counts, photos, map marks, and actions are static placeholder content used only to compare visual systems.
- Review locally at `http://localhost:3000/docs/design/ui-refresh-prototypes.html` while Vite is running.

## 1. Why Round One Was Rejected

Round one was too dark, brown, formal, and editorial. Espresso panels, large serif display type, ornamental framing, and dramatic atmosphere made Mapetite feel like a luxury archive or spirits guide. Presentation carried more weight than search, food, listing evidence, and practical actions.

## 2. Why Round Two Was Rejected

Round two corrected the darkness but overused rounded cards, pills, pastel blocks, oversized display type, emoji categories, and illustrated food motifs. It felt cheerful but too bubbly and toy-like for a trustworthy restaurant-discovery product.

## 3. Why Round Three Is Still Not Enough

Round three introduced useful restraint but converged too quickly on one visual system:

- Olive, terracotta, warm-white surfaces, and the same card geometry appeared across all three directions.
- Large horizontal cards and repeated bordered panels still felt chunky.
- The Advanced Product direction approached a familiar SaaS dashboard pattern.
- CSS food placeholders were more mature, but imagery was not always the organizing principle.
- The three concepts felt like layout variants rather than different brand and product positions.
- The work answered “how should the current UI be polished?” before fully exploring “what should Mapetite feel like?”

Round four therefore starts with breadth: eight compact systems using identical information, followed by three larger finalists.

## 4. Research And Design Inspiration Takeaways

The lab applies general principles associated with strong interface, branding, product, food, travel, map, and mobile work. It does not copy any source layout or code.

| Area | Principle extracted for Mapetite |
| --- | --- |
| SaaS and product | Use alignment, hierarchy, and predictable control groups, but avoid default dashboard chrome and excessive boxed panels. |
| Interface systems | Give search, result, selected state, and detail context clearly different jobs. Repetition should communicate state, not duplicate content. |
| Branding | A recognizable product can come from type rhythm, image treatment, and restrained color behavior rather than a loud logo or decorative theme. |
| Typography | Use a practical sans-serif foundation, compact labels, controlled weights, and occasional restrained editorial contrast. |
| Motion | Animate only opacity and transform when useful. The static prototype does not need a motion library or layout animation. |
| Food and drink | Favor stable, close-crop photographic composition and warm natural color relationships. Avoid icons and literal cartoon plates. |
| Travel and hospitality | Treat region, city, route, and “plan your visit” context as part of the experience without implying concierge verification. |
| Maps and search | Connect list selection and spatial context in one visual system. Keep map use optional on mobile and scoped to current results. |
| Mobile apps | Prioritize scan speed, reachable actions, compact filters, stable cards, and one-column flow without making every control a pill. |

The fixed design questions were:

1. What should the hero feel like?
2. How should search controls look?
3. How should restaurant cards feel?
4. How should map and list comparison work?
5. What typography feels mature without becoming boring?
6. What image treatment makes food feel appetizing?
7. How can the product feel advanced without hurting usability?

## 5. Eight Visual Direction Tiles

### 1. Minimal Concierge

A calm hospitality-inspired product. Off-white surfaces, controlled green, refined buttons, quiet dividers, and photo-first cards make the interface feel attentive without luxury theater.

### 2. Map-First Explorer

A spatial search product where list, map, selected place, and mapped count behave as one workspace. Marketing recedes and practical comparison becomes the visual identity.

### 3. Photo-Led Food Guide

The most appetizing direction. Stable food imagery leads cards and detail views while ratings, hours, location, and directions remain immediately available.

### 4. Modern Student Local

A fast, approachable, mobile-conscious product with efficient cards and direct language. It is friendly through clarity and pace rather than bright colors or childish illustration.

### 5. Premium Travel Finder

A location-aware direction influenced by thoughtful travel tools. Region and country context, neighborhood cues, and visit planning receive more visual attention.

### 6. Editorial Lite

Small editorial accents create guidance without turning the product into a magazine. “Why consider it” evidence adds voice while typography and imagery remain restrained.

### 7. Advanced Product UI

A crisp, denser system with explicit toolbar, mapped-count, list-selection, and inspector states. It tests product sophistication while avoiding generic enterprise decoration.

### 8. Warm Minimal Mobile App

A deliberately narrow, one-thumb interpretation. Search summary, compact cards, selected state, and actions remain reachable without oversized bubbles or horizontal scrolling.

Every tile includes a miniature landing hero, search control, result card, selected-place panel, detail preview, mobile impression, and mood keywords.

## 6. Three Expanded Finalists

### Minimal Concierge

The expanded version uses a controlled hospitality voice, calm result cards, and a concise selected panel. The detail preview leads with practical public listing information. It is the strongest brand foundation because it feels trustworthy, warm, and distinct without depending on one feature.

### Map-First Explorer

The expanded workspace gives list and map equal legitimacy. Compact rows preserve browsing density, numbered pins clarify correspondence, and the selected card floats within map context. On narrow screens the list and map stack, preserving the existing optional-map principle.

### Photo-Led Food Guide

The expanded direction uses a high-impact food image field on landing, stable image-led result cards, and a darker detail moment reserved for “Plan your visit.” It feels most restaurant-specific but would require disciplined media fallback treatment in production.

## 7. Security And Dependency Decisions

No dependency was added.

| Item | Decision | Reason |
| --- | --- | --- |
| Motion, Anime.js, particles, WebGL, charts | Avoided | The design questions can be answered with static HTML and CSS. |
| Remote fonts, images, scripts, or styles | Avoided | The prototype remains local, inspectable, and free of third-party execution. |
| Inspiration-site code | Not copied | Only spacing, hierarchy, card rhythm, type restraint, and image-composition principles were used. |
| Analytics and tracking | Avoided | A design comparison lab should collect no behavior. |
| APIs, authentication, storage, or location | Avoided | Production state and private data are outside the prototype boundary. |

The prototype contains no `eval`, `new Function`, dynamic script insertion, unsafe HTML injection, provider-controlled markup, or external asset request.

## 8. Accessibility And Performance Safeguards

- The lab navigation uses tabs with `aria-selected`, `aria-controls`, Home/End, and left/right arrow-key support.
- Buttons retain visible focus states.
- Statuses are written in text rather than encoded by color alone.
- Text and controls maintain sufficient contrast against their surfaces.
- CSS image fields reserve stable dimensions.
- Responsive grids use `minmax(0, 1fr)` and shrinking text containers to prevent overflow.
- The mobile breakpoint converts finalists to one-column layouts and keeps selected panels in document flow.
- Animation is limited to a short opacity/transform reveal.
- `prefers-reduced-motion: reduce` disables animations, transitions, and smooth scrolling.
- No content is fetched or inserted asynchronously, so the lab introduces no runtime layout shift.
- The prototype is not part of the production bundle graph.

## 9. Recommended Top Two Directions

### 1. Minimal Concierge

Recommended as the brand and component foundation. It best balances maturity, warmth, food focus, trust, and practical speed. It also maps onto the existing information architecture with the lowest migration risk.

### 2. Map-First Explorer

Recommended as the strongest product-level differentiator. Mapetite already has a stable optional map and selected-place flow; this direction makes that capability feel intentional rather than appended. It should borrow Minimal Concierge typography, color, and card restraint.

Photo-Led Food Guide should remain a supporting influence for landing, hero, result media, and detail photography rather than the sole system. Real provider media can fail, so the product identity cannot depend entirely on photos.

## 10. Safe, Reversible Migration Plan

Do not migrate a complete prototype at once. Use a dedicated UI branch and move one independently testable layer at a time.

1. **Typography tokens:** introduce the approved sans-serif scale, weights, line heights, and compact labels. Verify wrapping, accessibility, and sticky-header height. Revert by restoring token values.
2. **Color tokens:** add off-white, charcoal, restrained green, and sparse orange roles without changing component structure. Verify contrast and map compatibility.
3. **Radius and shadow tokens:** reduce excessive pills and heavy panels through shared tokens. Verify focus rings and touch targets.
4. **Search bar styling:** restyle only the existing search shell, autocomplete, recent searches, and field grouping. Preserve every handler and state transition.
5. **Result card styling:** apply stable image ratios, tighter metadata hierarchy, and refined actions to the existing card component. Keep media fallback behavior unchanged.
6. **Selected panel styling:** reduce duplicated card content and restyle the existing desktop/mobile selected states without changing selection logic or map camera behavior.
7. **Detail page styling:** update hero media, practical facts, evidence rows, and action hierarchy one section at a time. Preserve data-honesty copy and external directions.
8. **Landing page styling:** migrate the approved hero and preview treatment last, after the product surfaces establish the system.

After every step run type checks, build, tests, desktop/mobile browser checks, reduced-motion checks, overflow checks, and CLS review. Do not migrate static placeholder data, CSS-generated food photography, map mockups, or lab tab JavaScript into production.
