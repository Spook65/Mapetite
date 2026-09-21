# Adaptive Design Token and Alignment Audit

## Audit scope

This audit compares the current production visual system in `src/styles.css` and route-level utility classes with the static adaptive prototype in `apple-adaptive-mapetite.html`. The foundation tokens and optional primitives are implemented under `.mapetite-adaptive-scope`. The restaurant result list now has one explicit query-param preview; the default route still does not opt in. This does not authorize a structural migration.

## Current-system findings

### Production

The production CSS describes a 60/30/10 espresso/sage/apricot system, but routes still contain many direct RGBA values, arbitrary radii, shadows, heights, and gradients. The design is coherent enough to use, but the role boundary is loose: the same accent family can appear in borders, underlines, selection, buttons, and decorative surfaces.

### Adaptive prototype

The prototype has the right directional ingredients: warm light canvas, off-white surfaces, restrained sage, apricot action, content-first cards, and adaptive panes. It is not yet a system:

- Spacing uses many close one-off values rather than a readable scale.
- Radii range across numerous values from small labels to 30-pixel shells.
- Control heights vary across 35, 40, 42, 44, 54 pixels and other one-offs.
- Borders and shadows are redefined locally instead of using elevation roles.
- The phone mockup, stage labels, state lab, navigation diagrams, and context lab are design-document scaffolding, not app surfaces.
- Tablet and desktop columns use different independent ratios instead of one shared content grid.
- Sage and tinted green surfaces carry too much of the visual weight in some panels.
- Apricot and warm error colors are close enough that action, selection, warning, and error can blur together.

The goal is not fewer colors in the file; it is one semantic owner for every color and layout decision.

## Implemented opt-in contract

The adaptive foundation lives in a namespaced, unlayered block in `src/styles.css`. Keeping the block unlayered lets an explicitly opted-in adaptive primitive override Tailwind utility output without `!important`; the `.mapetite-adaptive-scope` prefix prevents those rules from matching the default UI. Every variable begins with `--mapetite-adaptive-`, and every primitive selector begins with `.mapetite-adaptive-scope`. Existing `:root`, `--mapetite-*`, Tailwind theme, route classes, and MapLibre styles remain unchanged.

Safe future opt-in requires an explicit boundary:

```html
<section class="mapetite-adaptive-scope">
  <article class="mapetite-adaptive-card">...</article>
</section>
```

Rules:

1. Add the scope to the smallest independently testable surface, not `html`, `body`, `#root`, `Layout`, or every route at once.
2. A scope provides variables plus its own light background/text context. Descendants change only when they use an adaptive primitive or consume an adaptive token explicitly.
3. Do not alias adaptive variables onto existing global variables. Legacy production CSS and MapLibre overlays must continue reading their current tokens until their own approved phase.
4. Prefer one coherent adaptive surface. The result-card preview temporarily retains legacy utility classes for shared dimensions and event-safe rollback, while the scoped adaptive classes own the preview's visible colors, shape, hierarchy, and controls. Do not extend this exception to new surfaces without review.
5. Rollback removes the opt-in class from the component. If no components remain opted in, the entire adaptive block can be deleted without restoring global token values.

## Result-card opt-in preview

The first visible experiment is intentionally limited to restaurant result cards:

- Default: `/restaurants`
- Preview: `/restaurants?ui=adaptive-card`
- Scope boundary: each rendered result-card `<article>`, not the route, results container, layout, or document root
- Persistence: none; `ui` is read from the current URL and is not written to local storage or the search store
- Data/network effect: none; `ui` is not passed to restaurant search, autocomplete, map, directions, favorites, or auth APIs

The preview uses the existing card markup, real result data, image failure state, selection handler, detail link, favorite mutation, and Google Maps directions helper. Adaptive classes provide:

- `mapetite-adaptive-result-card-preview` for the light card and selected/focus states
- `mapetite-adaptive-result-media` plus `mapetite-adaptive-media-fallback` for stable media and a text-backed no-photo state
- result heading, metadata, rating, evidence, status, and action classes for the scan hierarchy
- `mapetite-adaptive-button`, `mapetite-adaptive-chip`, and semantic success/support tokens for controls and states

Orange remains limited to the primary View details action and a small selected-card ring. Saved uses support sage. Only confirmed or likely-open hours receive the success treatment; closed or unknown hours stay neutral.

### Disable and rollback

Remove `ui` from `RestaurantsSearch`, remove `isAdaptiveCardPreview` and the conditional adaptive classes in `src/routes/restaurants.tsx`, then delete the result-preview-only CSS rules. No state migration, local-storage cleanup, backend rollback, or DOM reorder is required. Removing `?ui=adaptive-card` from the URL disables the preview immediately for a reviewer.

### Design review still required

- Compare real-image and failed-image cards across long international restaurant names.
- Verify larger text and keyboard focus in addition to the 390-pixel viewport.
- Review whether approximate distance adds enough value to keep in a full migration.
- Approve the light card beside the still-dark surrounding results page before any default rollout.
- Capture visual regression baselines before migrating selected-place, map, search, or filter surfaces.

### Optional primitive classes

| Class | Intended role | Notes |
| --- | --- | --- |
| `.mapetite-adaptive-surface` | Neutral app/content surface | Base for a future isolated preview or pane |
| `.mapetite-adaptive-card` | General content card | Supports `aria-selected="true"` |
| `.mapetite-adaptive-result-card` | Restaurant list result | Same stable card foundation; content hierarchy comes later |
| `.mapetite-adaptive-place-card` | Selected-place decision panel | Elevated surface, not a duplicate detail route |
| `.mapetite-adaptive-button` | Neutral button | `.is-primary` and `.is-destructive` are explicit variants |
| `.mapetite-adaptive-chip` | True filter/status chip | `aria-pressed` or `aria-selected` uses support, not accent |
| `.mapetite-adaptive-toolbar` | Stable command row | Does not apply sticky positioning or pane layout |
| `.mapetite-adaptive-sheet` | Safe-area-aware sheet surface | Does not implement dialogs, focus traps, or open/close behavior |
| `.mapetite-adaptive-status-banner` | Contextual calm state | `data-tone="success|warning|error"` supplies semantic color |
| `.mapetite-adaptive-media-fallback` | Stable no-photo material field | CSS-only, fixed ratio, and text-backed |

These classes are visual building blocks only. They do not add layout state, event handling, accessibility semantics, map behavior, or route behavior.

## Strict 60/30/10 color model

The ratio describes visible UI area and emphasis, not a literal per-screen measurement.

### 60%: base and breathing room

Use warm neutral base colors for the page, app shell, primary cards, text-bearing surfaces, and most empty space.

| Token | Proposed value | Role |
| --- | --- | --- |
| `--mapetite-adaptive-bg` | `#F4F2EC` | Page/app background |
| `--mapetite-adaptive-app-surface` | `#FFFDF8` | Primary app surface |
| `--mapetite-adaptive-elevated-surface` | `rgba(255, 253, 248, 0.96)` | Sheet/popover surface with an opaque color fallback |
| `--mapetite-adaptive-card-surface` | `#FFFDF8` | Result and place-card surface |
| `--mapetite-adaptive-subtle-surface` | `#F8F6F0` | Quiet grouped section, skeleton, or disabled-adjacent surface |
| `--mapetite-adaptive-text` | `#202A24` | Primary text |
| `--mapetite-adaptive-text-secondary` | `#5A665F` | Secondary text and metadata |
| `--mapetite-adaptive-text-faint` | `#7A837D` | Nonessential helper copy that still passes contrast at its intended size |
| `--mapetite-adaptive-border` | `rgba(32, 42, 36, 0.13)` | Default divider/border |
| `--mapetite-adaptive-border-strong` | `rgba(32, 42, 36, 0.24)` | Selected/focus-adjacent structural border |

### 30%: supportive sage and map context

Sage organizes the shell, map, secondary selected surfaces, and calm success/support states. It should not fill every card.

| Token | Proposed value | Role |
| --- | --- | --- |
| `--mapetite-adaptive-support` | `#617264` | Secondary action text/icon and structural accent |
| `--mapetite-adaptive-support-strong` | `#405548` | High-contrast support foreground |
| `--mapetite-adaptive-support-soft` | `#E2E8E1` | Selected-neutral, grouped filters, calm informational surface |
| `--mapetite-adaptive-group-surface` | `#EDF1EC` | Subtle map/list linkage and quiet empty states |
| `--mapetite-adaptive-map-surface` | `#DCE4DD` | Map placeholder/loading base; real map colors remain style-owned |

### 10%: apricot action and selection

Apricot is reserved for the primary action, selected map pin, and small focus/selection emphasis. It is not a decorative background, generic chip color, or gradient endpoint.

| Token | Proposed value | Role |
| --- | --- | --- |
| `--mapetite-adaptive-accent` | `#BC542F` | Primary action and selected pin |
| `--mapetite-adaptive-accent-hover` | `#A94727` | Hover/pressed action |
| `--mapetite-adaptive-accent-soft` | `#F5E1D8` | Small selected/action-support surface |
| `--mapetite-adaptive-on-accent` | `#FFFDFC` | Text/icon on accent; contrast must be verified before production |
| `--mapetite-adaptive-focus` | `#A94727` | Visible focus ring; may be paired with a neutral outer ring on busy map content |

### State colors outside the decorative ratio

State colors are semantic exceptions and must remain sparse. They are not additional brand accents.

| Token | Proposed value | Role and rule |
| --- | --- | --- |
| `--mapetite-adaptive-success` | `#3E694C` | Likely/listed-open text or confirmation; never “guaranteed open” |
| `--mapetite-adaptive-success-soft` | `#E3EEE5` | Small status background |
| `--mapetite-adaptive-warning` | `#835A32` | Timeout, stale, or caution text |
| `--mapetite-adaptive-warning-soft` | `#F4E9DC` | Calm retry/stale banner |
| `--mapetite-adaptive-error` | `#92483E` | Validation/provider error text, not a full-page red wall |
| `--mapetite-adaptive-error-soft` | `#F3E5E1` | Contextual error banner |
| `--mapetite-adaptive-favorite` | `#617264` | Saved state uses support green rather than inventing a pink/red brand color |
| `--mapetite-adaptive-disabled-bg` | `#ECEBE6` | Disabled control surface |
| `--mapetite-adaptive-disabled-text` | `#858C87` | Disabled label/icon; pair with more than color alone |

### Color-role rules

1. Orange is never decorative. It marks one primary action per decision surface, the selected map pin, or focus/selection emphasis.
2. Green does not become the background of every card. It groups secondary controls, map context, and calm statuses.
3. Error and timeout states use tinted neutral cards with concise text and a retry action; they do not flood the viewport.
4. A selected restaurant uses one consistent combination: strong neutral/sage outline plus a small apricot marker or action, not multiple unrelated tints.
5. Saved uses icon shape/text plus the support color; it must not rely on color alone.
6. MapLibre tile/style colors stay provider-owned. App overlays use these tokens and preserve attribution.
7. Gradients are optional inside no-photo placeholders only. Core actions and information hierarchy cannot depend on glow or gradient.
8. Every new color must map to a documented semantic token. Route-local hex/RGBA additions require design review.
9. All proposed foreground/background pairs require automated contrast verification before production. Small metadata should target WCAG AA, not be made faint merely for polish.

## Typography tokens

Use the existing locally available/system sans stack during migration; do not add a remote font. Optical hierarchy should come from size, weight, spacing, and content order.

| Token | Size / line height | Intended use |
| --- | --- | --- |
| `--type-title` | `28px / 34px`, weight 680 | Compact route title or selected-place title maximum |
| `--type-heading` | `22px / 28px`, weight 680 | Pane/section heading |
| `--type-card-title` | `17px / 22px`, weight 660 | Restaurant card/place-card name |
| `--type-body` | `15px / 22px`, weight 430 | Primary copy and fields |
| `--type-label` | `14px / 20px`, weight 620 | Buttons, controls, status text |
| `--type-meta` | `13px / 18px`, weight 500 | Rating, location, evidence, counts |
| `--type-caption` | `12px / 16px`, weight 520 | Attribution and helper copy |

Rules:

- Restaurant names may wrap to two lines in Dynamic Type; do not solve overflow with smaller-than-caption text.
- Uppercase labels are limited to short status/kicker text with modest tracking.
- Rating/reviews/open status form one aligned scan line; cuisine/location/distance form a second.
- Evidence is one concise line in result cards and may expand in the selected place panel.
- Truncation is a compact fallback, not the only way to support long international names.

## Spacing and sizing system

### Spacing scale

Use a 4-pixel base with a deliberately short set:

| Token | Value | Typical use |
| --- | --- | --- |
| `--mapetite-adaptive-space-0` | `0` | Reset |
| `--mapetite-adaptive-space-1` | `4px` | Tight icon/text gap |
| `--mapetite-adaptive-space-2` | `8px` | Metadata gap |
| `--mapetite-adaptive-space-3` | `12px` | Compact card gap/padding |
| `--mapetite-adaptive-space-4` | `16px` | Default card/sheet padding |
| `--mapetite-adaptive-space-5` | `20px` | Selected card and pane padding |
| `--mapetite-adaptive-space-6` | `24px` | Desktop pane gutter |
| `--mapetite-adaptive-space-8` | `32px` | Major section separation |
| `--mapetite-adaptive-space-10` | `40px` | Route section separation |
| `--mapetite-adaptive-space-12` | `48px` | Large web-only rhythm |
| `--mapetite-adaptive-space-16` | `64px` | Landing-only separation |

Do not translate every current `0.42rem` or `0.68rem` literally. Snap to the nearest token based on role.

### Radius scale

| Token | Value | Use |
| --- | --- | --- |
| `--mapetite-adaptive-radius-control` | `10px` | Inputs, compact buttons, statuses |
| `--mapetite-adaptive-radius-card` | `14px` | Result cards and banners |
| `--mapetite-adaptive-radius-panel` | `18px` | Selected/elevated panels |
| `--mapetite-adaptive-radius-sheet` | `24px` | Top corners of sheets and major popovers |
| `--mapetite-adaptive-radius-round` | `999px` | Icon buttons, badges, true chips only |

Pill shapes are limited to status chips, count badges, and icon controls. Full-width buttons and cards should not all be pills.

### Elevation scale

| Token | Proposed shadow | Use |
| --- | --- | --- |
| `--mapetite-adaptive-shadow-none` | `none` | Inline/card content separated by border or background |
| `--mapetite-adaptive-shadow-card` | `0 1px 2px rgba(25, 35, 29, 0.06)` | Result card over base canvas |
| `--mapetite-adaptive-shadow-popover` | `0 10px 28px rgba(25, 35, 29, 0.10)` | Popover/selected card |
| `--mapetite-adaptive-shadow-sheet` | `0 24px 64px rgba(25, 35, 29, 0.15)` | Compact modal sheet only |

Use either a border or a meaningful shadow at low elevation, not both at maximum strength.

### Control dimensions

| Token | Compact | Expanded/desktop | Rule |
| --- | --- | --- | --- |
| `--mapetite-adaptive-button-height` | `44px` | `44px` | Default minimum; future dense desktop controls must retain a 44-pixel hit area |
| `--mapetite-adaptive-button-height-prominent` | `50px` | `50px` | Search command and primary sheet action |
| `--mapetite-adaptive-toolbar-height` | `60px + shell-owned safe area` | `60px` | Stable; content never changes its height |

### Content dimensions

| Surface | Compact | Expanded/desktop |
| --- | --- | --- |
| Result thumbnail | `88px` square | `72px` to `84px` square for dense rows |
| Result card | Minimum `112px`, content-driven up to two title lines | Minimum `92px` dense row |
| Selected media | `16:10` when expanded; `56px` square in collapsed sheet summary | `16:10` |
| Detail hero | `16:10` or `16:9` | `16:9` |
| Gallery tile | `4:3` | `4:3` |
| Map | At least `280px` when explicitly opened | Flexible pane with minimum `420px` width where three panes are used |

The implementation exposes these values as `--mapetite-adaptive-result-media-ratio`, `--mapetite-adaptive-selected-media-ratio`, `--mapetite-adaptive-detail-media-ratio`, `--mapetite-adaptive-gallery-media-ratio`, `--mapetite-adaptive-card-padding`, `--mapetite-adaptive-place-card-padding`, and `--mapetite-adaptive-sheet-padding`.

## Shared grid and alignment system

### Shell

- Maximum desktop shell width: `1440px`.
- Compact gutter: `16px`.
- Expanded gutter: `20px`.
- Desktop gutter: `24px`.
- All top-level panes align to the same toolbar, results header, and content baseline.
- Safe-area padding is applied once at shell edges, not repeated inside every child.

### Adaptive columns

| Mode | Recommended grid | Notes |
| --- | --- | --- |
| Compact | `--mapetite-adaptive-compact-width: 390px` as a test concept; actual layout remains `minmax(0, 1fr)` | One content surface plus at most one transient sheet |
| Expanded | `--mapetite-adaptive-expanded-columns: minmax(280px, 34%) minmax(0, 1fr)` | List + map; selected place overlays map or replaces a secondary region |
| Wide expanded | `--mapetite-adaptive-list-pane-width: 320px` plus a flexible map with `--mapetite-adaptive-map-pane-min-width: 420px` | List + map with a compact selected card attached to map |
| Desktop | `--mapetite-adaptive-desktop-columns`, composed from `320px / flexible map / 340px` | List + map + decision/evidence panel; outer gutters remain aligned |

Do not make list, map, and selected columns independent percentages at every breakpoint. Use fixed readable rails around one flexible content pane.

## Alignment/layout findings and corrections

| Finding | Why it weakens the prototype | Required correction before migration |
| --- | --- | --- |
| Device frames dominate compact examples | Polish appears to come from the mock device rather than the product | Evaluate a frameless shell first; retain frame only as presentation scaffolding |
| Prototype intro/stage labels consume visual priority | The file reads as design documentation before it reads as an app | Keep in the lab file only; never migrate to the product shell |
| Many arbitrary spacing values | Related controls do not share rhythm and future edits drift | Replace with the 4-pixel token scale |
| Many radius values | Cards, controls, badges, and sheets lack category identity | Reduce to control/card/panel/sheet/round roles |
| Multiple button heights | Rows and baselines appear uneven; touch targets are uncertain | Use compact and desktop control tokens with a 44-point hit target |
| Independent card widths and padding | Result, map overlay, and decision panel feel assembled rather than related | Align media, title, metadata, and action insets to shared 12/16/20-pixel roles |
| Desktop columns do not share a stable grid | Extra space creates arbitrary dead zones or cramped evidence | Use `320 / flexible / 340` rails with shared 24-pixel gutters |
| Map overlay and side panel can duplicate selection | One state gets two equal-weight representations | Map overlay shows identity/one action; side panel owns full decision details |
| State labs resemble documentation | Errors/empty states are detached from their recovery context | Render each state inside its owning Search, Results, Map, Saved, or Detail surface |
| Excess green-tinted panels | Support color becomes the dominant base rather than 30% structure | Return most text-bearing cards to neutral surface; reserve sage for grouping and map context |
| Accent/error warmth overlaps | Primary action and error may feel like the same state | Use darker semantic error text on muted error-soft; reserve apricot for action/selection |
| Baselines vary between counts, status chips, and actions | Result rows scan slowly | Use fixed metadata line-height and align controls to a shared 44-pixel hit row |
| Large empty areas in expanded states | Prototype feels staged rather than information-efficient | Let map flex; keep list/decision rails bounded; use empty space for content breathing, not filler |
| Fallback treatments use local gradients | Fallbacks may look like decorative fake photos | Use one tokenized material field, initial mark, and “Photo unavailable” badge at stable ratios |

## Component role specifications

### Search command

- Neutral elevated surface, one resolved-place line, one optional context line, and one primary Search action.
- Accent is used on Search only; field expansion uses neutral/sage structure.
- The command does not expand the page height on compact screens; it opens a sheet.

### Result card

- Neutral surface on base canvas with elevation 1.
- Selected state uses strong support border plus a small accent marker, not a fully colored card.
- Image/fallback size is fixed before load.
- Title, signal line, context line, evidence, and actions share consistent insets.

### Selected place

- Neutral elevated surface at elevation 2 or compact sheet elevation 3.
- One primary action at a time. Recommended hierarchy: Directions when available, then View details, then Save icon/action. Product validation may choose View details as primary, but all viewports must match.
- Evidence and caution blocks use support/warning-soft surfaces rather than extra chips.

### Map overlays

- Frost/material treatment must have an opaque fallback and sufficient contrast over any tile color.
- Selected pin alone uses accent. Search center and user marker use distinct shapes/support tones and text labels where opened.
- Map controls are neutral, minimal, and maintain attribution visibility.

### System banners

- Local to their owning pane.
- Maximum one title, one sentence, and one recovery action.
- Warning/error tint is subtle; state meaning is carried by text and icon/label, not color alone.

## Apple-style interaction audit

This applies interaction principles without copying Apple assets or components.

| Principle | Current prototype status | Gap | Required refinement |
| --- | --- | --- | --- |
| Content first | Strong list/map/place concept | Lab framing and helper panels still compete with content | Remove documentation surfaces from app views; let results/map dominate |
| Search as command | Represented in all three states | Keyboard/focus/error combinations are static | Prototype actual focused, suggestions, paused, ambiguous, and clear-all states at compact height |
| Compact sheets, wide popovers | Direction is correct | One-active-surface behavior is not fully specified | Add a sheet coordinator rule and focus-return destination |
| Progressive disclosure | Main shell is concise | Complete data appears too early in some selected/map surfaces | Identity on list/map, evidence/actions in selected place, full content on detail route |
| Place card as sheet/popover | Strong concept | Result card and selected place still duplicate facts in places | Give each surface an explicit information budget |
| Adaptive continuity | Same state appears across viewport concepts | Layout ratios and control ownership vary | Use shared rails and a single control owner at each breakpoint |
| Safe areas | Mentioned and partially styled | Potential double padding and keyboard coverage remain untested | One shell-level safe-area strategy plus sheet keyboard resizing |
| Keyboard behavior | Documented conceptually | No focus order, return focus, or sheet dismissal contract | Define open focus, listbox keys, Escape, submit, and close restoration |
| Dynamic Type | Recognized in notes | Fixed compact text and one-line truncation dominate examples | Test 200% text, two-line titles, wrapped actions, and breakpoint fallback |
| Reduced motion | CSS preference exists | Transition ownership and no-motion end state are not enumerated | Motion tokens limited to opacity/transform; zero-duration reduced path |
| No hover-only behavior | Mostly satisfied | Some prototype emphasis is visually hover-like | Define pressed, focus-visible, selected, and disabled equivalents |
| One relevant state at a time | Intended | Search, filters, and selected sheets can conceptually compete | Only one compact transient surface; wide selected pane may persist behind a popover |
| Native-feeling navigation | Navigation model exists | Browser back, wrapper back, and external links are not fully resolved | Preserve canonical routes and define wrapper-safe external direction handling before TestFlight |

## Interaction tokens

- `--mapetite-adaptive-motion-fast: 120ms`
- `--mapetite-adaptive-motion-standard: 180ms`
- `--mapetite-adaptive-motion-sheet: 240ms`
- `--mapetite-adaptive-ease: cubic-bezier(0.2, 0.8, 0.2, 1)`
- Animate only opacity and transform in the visual migration.
- Under `prefers-reduced-motion: reduce`, set transition duration to near-zero and avoid sheet travel.
- Focus rings use a 2-pixel semantic focus ring plus a 2-pixel surface separator on busy content.
- Hover is enhancement only. Pressed, focus-visible, selected, and disabled states must exist without it.

## Recommendations

### Keep or pivot

Keep the adaptive direction. It matches Mapetite’s search/list/map/selected-place model and offers a credible path from mobile web to a Capacitor beta. The issue is token and behavior discipline, not the direction itself.

### Color decision

Keep warm neutral, sage, and apricot, but tighten them to the strict role system above. Do not reuse the prototype palette by copying every local color. Base neutrals should visibly dominate, sage should organize rather than flood, and apricot should be scarce enough that primary actions and the selected pin are unmistakable.

### Refine before production

1. Normalize grid, spacing, radius, control height, and elevation in the static prototype.
2. Demonstrate real missing-data combinations and contextual failure states.
3. Resolve compact sheet coordination and keyboard behavior.
4. Choose one owner for full selected-place details at expanded widths.
5. Verify Dynamic Type, contrast, safe areas, and 390-pixel overflow.
6. Define installed-app attribution/About access and external-link behavior.

### Do not migrate yet

- Search/filter structural sheets.
- Three-pane detail preview.
- Static device frames and design-lab panels.
- Blur-heavy glass, animation packages, remote type, or decorative assets.
- Wrapper-specific navigation or native APIs.

### First production migration step

The namespaced token definitions and optional primitives now exist behind `.mapetite-adaptive-scope`, with no global token replacement and no production opt-in. The next separately approved step should validate them on one low-risk, non-structural surface before touching result cards. That experiment must be reversible by removing one scope class.

## Risks before TestFlight

- A web wrapper with inline forms, browser-like navigation, covered inputs, or duplicated toolbars will still feel web-only despite visual polish.
- Keyboard and safe-area failures can hide Search, Clear all, or selected-place actions on real iPhones.
- Dynamic Type can invalidate one-line truncation and fixed sheet heights.
- MapLibre resizing across panes can regress camera stability unless tested with the existing map unchanged.
- Attribution, privacy, explicit location permission, and demo data-reset disclosures need an installed-app destination.
- Provider timeout, backend sleep, and stale restored results must remain usable and honest in a wrapper.
- External directions, website, menu, and phone links need intentional handoff rules.
- Remote listing media can fail or raise rights questions; fallback presentation must remain first-class.
- Contrast under transparency, Increase Contrast, and busy map tiles must be tested with opaque fallbacks.
- The generated place index remains backend-only; no adaptive convenience should move it or precise location into frontend persistence.

## Audit conclusion

The adaptive prototype is directionally strong but not migration-ready as a structural shell. Its strict role-based token layer and optional primitives are implemented but intentionally dormant. The safest next move is a separately approved, small opt-in visual experiment after the prototype is normalized, not a route rewrite.

## Query-gated shell usage

The token layer now supports two non-persistent restaurant-page previews:

- `/restaurants?ui=adaptive-card` applies adaptive primitives only to real result cards.
- `/restaurants?ui=adaptive-shell` applies the scope at the restaurant-page boundary and composes the existing command, list, map, and selected-place surfaces into a higher-fidelity shell.

The shell aliases existing `--mapetite-*` roles to namespaced adaptive roles only inside `.mapetite-adaptive-scope.mapetite-adaptive-shell-preview`. Global production tokens remain unchanged. Neutral base/card surfaces remain dominant, sage is limited to grouping/map context, and apricot remains reserved for primary actions and selected map markers.

### Shell classes and token roles

| Optional class | Role | Primary tokens |
| --- | --- | --- |
| `mapetite-adaptive-shell-preview` | Scoped light app canvas and legacy-role aliases | base, text, border, accent, shell width |
| `mapetite-adaptive-shell-command` | Elevated search-command material | elevated surface, panel radius, popover shadow |
| `mapetite-adaptive-shell-toolbar` | Compact control layer | toolbar height, border, elevated surface |
| `mapetite-adaptive-shell-results-layout` | Wide list/map/place composition | desktop pane columns, 16-pixel gutter |
| `mapetite-adaptive-shell-results-list` | Bounded comparison rail | list width, spacing, thin overflow rail |
| `mapetite-adaptive-shell-map-pane` | Flexible existing map or honest closed state | map surface, panel radius, card shadow |
| `mapetite-adaptive-shell-selected-panel` | Wide decision/evidence surface | place-card padding, elevated surface, popover shadow |
| `mapetite-adaptive-shell-mobile-selection` | Compact safe-area selected sheet | sheet radius, sheet shadow, sheet padding |
| `mapetite-adaptive-shell-selected-fallback` | Mature no-photo material | support soft, map surface, stable ratio/badge |

Translucent shell surfaces declare an opaque warm surface first and enhance it with restrained `backdrop-filter` only where supported. Text never relies on the background blur for contrast. Motion remains limited to existing opacity/transform transitions and collapses under `prefers-reduced-motion`.

### Usage limits

- Do not place `mapetite-adaptive-shell-preview` on `Layout`, `body`, or another global ancestor.
- Do not reuse shell aliases outside an explicit query-gated or separately approved boundary.
- Do not use accent orange for decorative map fields, helper cards, recent-search backgrounds, or broad selected surfaces.
- Do not convert the closed-map placeholder into a fake map or routing claim; it is a preview affordance that opens the real map.
- Do not treat independent list/map scrolling as approved production interaction until keyboard, touch, MapLibre resize, and Dynamic Type testing passes.

### Safe rollback

Remove the validated `adaptive-shell` query value, conditional shell classes and map placement in the restaurant route, and the scoped `mapetite-adaptive-shell-*` rules. The global palette, default restaurant page, backend/cache requests, store, route handlers, and map component require no reversal. The card preview and dormant token foundation can remain independently for review.

### Review still required

- Whether the command should become a real compact sheet/wide popover rather than an expanded elevated form.
- Whether the independent results rail is comfortable for keyboard and touch users.
- Whether the center map should be persistently visible at the final wide breakpoint.
- Whether the right decision panel should keep View details or Directions as its primary action.
- Whether compact selection needs one evidence line without becoming too tall.
- Contrast on live map tiles, 200% text scaling, image failure, signed-out Save, stale restore, provider errors, and 390-pixel width.

## Refined shell token application

The prototype-parity pass keeps the token values and semantic ownership intact while changing how the opt-in shell composes them:

- `--mapetite-adaptive-border` now provides pane dividers inside one shared shell rather than outlining three elevated cards.
- `--mapetite-adaptive-shadow-card` owns ordinary command/toolbar elevation; the stronger popover shadow is limited to the map command overlay and true transient surfaces.
- `--mapetite-adaptive-map-surface` remains the honest closed/loading base and real MapLibre tiles remain provider-owned.
- `--mapetite-adaptive-selected-media-ratio` controls the media-first desktop decision panel without affecting production cards or the detail route.
- `--mapetite-adaptive-space-2` and `--mapetite-adaptive-space-3` now drive the dense result rail; larger spacing tokens remain reserved for selected evidence and route-level separation.
- Accent orange remains limited to primary actions and selected map emphasis. Selection surfaces use support sage and neutral structure.

### Preview-only dimensions

| Surface | Refined adaptive-shell preview | Reason |
| --- | --- | --- |
| Wide shared composition | `320px / minmax(420px, 1fr) / 340px` | Preserves readable fixed rails around one flexible spatial pane |
| Wide composition height | `620px` minimum | Approaches the prototype's 654-pixel content surface without changing map logic |
| Wide result media | `76px` square | Fits the documented dense-row range while preserving all actions |
| Compact result media | `88px` square | Matches the mobile token recommendation and stable fallback dimensions |
| Map header material | Opaque warm fallback plus 10-pixel blur enhancement | Keeps controls legible over arbitrary tiles without blur dependence |
| Compact selected sheet | `min(50vh, 380px)` | Keeps results and dismissal context visible while retaining actions |

These dimensions are deliberately attached to `.mapetite-adaptive-shell-preview`. They do not replace global size tokens or modify `SearchResultsMap` outside the query-gated composition.

### Material constraints after refinement

1. The shared list/map/place shell gets one meaningful low elevation, not a shadow per pane.
2. Content panes remain opaque or nearly opaque. Blur is limited to command controls and the map header overlay.
3. Map text always has a warm opaque fallback under it.
4. Result cards rely on border and selected inset/ring hierarchy; hover elevation remains enhancement only.
5. Reduced-motion behavior and stable media dimensions remain unchanged.

Rollback remains selector-based: removing the query-gated scope/class hooks makes every refined rule non-matching, with no token, state, cache, or backend reversal.
