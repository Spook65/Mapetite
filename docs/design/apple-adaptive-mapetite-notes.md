# Mapetite adaptive interface study

## Purpose

This design study explores an Apple-inspired adaptive product direction without copying Apple interfaces, trademarks, proprietary assets, or exact component treatments. It is a static local artifact: it makes no API, authentication, storage, analytics, or location calls and does not change any production route.

The prototype is intentionally app-like rather than marketing-led. Its central question is whether Mapetite can present the same search state naturally on a compact phone, an expanded tablet or foldable viewport, and a desktop workspace.

## Principles extracted

The useful principles are broader than a particular visual effect:

1. **Content is primary.** Results, maps, photos, and evidence stay visually dominant. Controls recede until needed.
2. **Controls form a functional layer.** Frosted material is reserved for search commands, navigation, and a selected-place sheet. It is not applied to every content card.
3. **Layouts adapt rather than scale.** Compact, expanded, and desktop presentations share state but reorganize panes and actions for available space.
4. **Action placement is predictable.** Details, Save, and Directions stay grouped around the selected restaurant. Search, filters, sort, and refresh stay in one command area.
5. **Continuity beats duplication.** A wider viewport reveals map and evidence panes; it does not create a second filter system or another selected card.
6. **Motion confirms state.** Only short opacity/transform transitions are used. Reduced-motion preferences remove them.
7. **Legibility wins over transparency.** Solid content surfaces and sufficient contrast remain the default. Blur is progressive enhancement with an opaque fallback.

These principles align with current Apple guidance that treats material as a functional control/navigation layer, asks interfaces to adapt across resizable environments, and keeps content visually central:

- [Liquid Glass overview](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)
- [Human Interface Guidelines: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Human Interface Guidelines: Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [WWDC25: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)

## Prototype summary

### Compact phone

- A single-column result flow keeps search and scanning primary.
- The search command is sticky inside the content viewport and uses a restrained frosted treatment.
- Recent searches and filter controls stay horizontally compact.
- Results use stable square media areas and concise evidence.
- The selected restaurant becomes a bottom sheet with Details, Save, and Directions.
- Full restaurant information remains a detail route rather than an oversized sheet.

### Expanded tablet or foldable

- A shared top command bar contains search, filters, sort, and Show all.
- Results occupy the left pane, map context the middle pane, and a concise selected-place detail the right pane.
- At intermediate widths the detail pane moves below list and map rather than duplicating itself.
- Selection is shared across all panes.

### Desktop

- A command-center toolbar replaces a marketing hero.
- A dense list, map, and evidence panel can remain visible together.
- The evidence panel explains why a place may be worth considering without exposing internal ranking scores.
- The map is spatial context; actions remain in the evidence panel.

## Proposed adaptive rules

The ranges below are planning defaults, not device detection. Production should prefer content-driven breakpoints and container queries where practical.

| Layout state | Starting range | Presentation |
| --- | ---: | --- |
| Compact | below 720px | Search, results, selected bottom sheet, detail route |
| Expanded | 720px–1179px | Search/list plus map; optional contextual detail pane |
| Desktop | 1180px and above | List, map, and selected/evidence panel |

Orientation, split-screen multitasking, text scaling, and browser chrome can make a nominal tablet behave like compact mode. Width and content fit should control the result.

## Shared state

The real app should keep one shared state model across all layouts:

- typed and resolved place fields
- validation and autocomplete state
- raw and filtered restaurant results
- price, rating, category, open-priority, and saved filters
- active sort
- selected restaurant ID
- optional map visibility and camera state
- search-center or explicitly shared user-location origin metadata
- saved restaurant IDs
- loading, stale snapshot, refresh, and error states

No layout should create its own copy of these values. Changing viewport size should not reset a search, filter, selection, or manually chosen map camera.

## Controls that move, but must not duplicate

| Control | Compact | Expanded | Desktop |
| --- | --- | --- | --- |
| Search | Sticky command above results | Shared top command bar | Shared top toolbar |
| Autocomplete | Anchored overlay within search card | Anchored below search field | Anchored below toolbar field |
| Filters | Compact button opens sheet/drawer | Popover or side sheet from toolbar | Popover or inline toolbar disclosure |
| Sort | One compact action | One toolbar action | One toolbar action |
| Map | Explicit toggle; never permanent | Persistent pane when space permits | Persistent central pane |
| Refresh | Compact overflow or control row | Toolbar action | Toolbar action |
| Selection actions | Bottom sheet | Context pane | Evidence panel |

There must never be a toolbar Sort plus a second Sort panel, or map actions repeated in both the list and selected panel.

## Sticky behavior

- The global app header keeps a stable height and respects safe-area insets.
- Compact search may become sticky after the page title leaves view, but it must reserve its height and avoid layout shift.
- The selected bottom sheet is viewport-fixed within safe areas. It must not cover the final list item; the list needs matching bottom padding.
- Expanded and desktop pane headers may stay sticky within their pane. The whole page should not accumulate multiple sticky bars.
- Focused autocomplete and filter overlays should remain above the sheet while preserving keyboard access.

## Autocomplete behavior

### Compact

- Open as an anchored overlay, not an element that pushes results downward.
- Cap height and scroll internally.
- Keep keyboard navigation, Escape, outside-click dismissal, loading, no-match, and rate-limit states.
- Keep Search submission available when suggestions are unavailable.

### Expanded and desktop

- Anchor to the shared search field.
- Keep result width tied to the search control, not the full toolbar.
- Preserve selected country and region context in suggestion requests.
- Do not open a second autocomplete in another pane.

## Filter behavior

### Compact

- A single Filters control opens a bottom sheet or full-height drawer with explicit Apply/Clear actions.
- Any price and default rating remain absence of constraints, not removable active chips.
- Active constraints can appear as a short summary next to the Filters control.

### Expanded and desktop

- Use one toolbar disclosure or one side sheet.
- Keep active constraints visible without duplicating full controls.
- Sorting remains ordering, not a narrowing filter.

## Map behavior

### Compact

- Map remains optional and user-triggered.
- It opens inline or as a dedicated mode without permanently covering the list.
- The selected bottom sheet can remain, but the map must not recenter on selection.

### Expanded and desktop

- The same MapLibre instance can occupy a persistent pane.
- Origin markers, restaurant pins, popup safety, attribution, and manual camera behavior remain unchanged.
- Resizing a pane may call map resize, but must not imply a new search or reset user pan/zoom.
- Show all remains the only intentional post-open fit-to-results action.

## Visual system

- **Canvas:** warm off-white rather than pure white.
- **Content:** mostly solid light surfaces with calm borders.
- **Functional material:** translucent white with blur, strong fallback opacity, and controlled shadow.
- **Primary ink:** green-charcoal.
- **Secondary accent:** restrained sage.
- **Action accent:** apricot used for the main action and location pins, not every badge.
- **Typography:** system sans stack for a native-adjacent feel without adding remote fonts.
- **Shape:** moderate radii; circular controls only where their semantics are clear.
- **Media:** stable aspect ratios and abstract CSS fields in this prototype; production continues honest image/fallback handling.

## Accessibility and motion

- Prototype state tabs use ARIA tab semantics and support Arrow Left/Right, Home, and End.
- Focus rings remain visible.
- Ratings, hours, and evidence are text-backed rather than color-only.
- Compact controls retain touch-friendly targets.
- Content contrast does not depend on backdrop filtering.
- `prefers-reduced-motion` reduces transitions to effectively zero.
- Production migration must also verify Dynamic Type-like text scaling, screen reader order, RTL layout, keyboard viewport changes, and safe areas.

## Security and dependency decisions

- No dependency or lockfile change.
- No remote font, image, script, stylesheet, iframe, or API call.
- No storage, authentication, analytics, or geolocation access.
- No `eval`, `new Function`, or dynamic HTML injection.
- Static placeholder content is declared as such.
- Apple trademarks and proprietary assets are not used in the interface.

## What should not move directly into production

- The prototype’s static map texture and mock pins.
- Device frames and viewport labels.
- Placeholder ratings, addresses, restaurants, and evidence.
- Literal breakpoint values without testing the real production content.
- Blur on low-power devices without measuring rendering cost.
- A three-pane layout before selection, accessibility order, and map resizing are tested against real state.

## Safe migration sequence

1. Add reversible color, material, radius, shadow, and typography tokens.
2. Restyle the production search command without changing its form/state logic.
3. Restyle result cards while preserving media dimensions and all actions.
4. Introduce the compact selected sheet treatment behind the existing selection state.
5. Consolidate expanded controls into one toolbar without changing filter behavior.
6. Add an expanded list/map layout using existing map and result components.
7. Add the desktop evidence pane using the current selected preview content.
8. Validate safe areas and keyboard behavior in a Capacitor test shell before any TestFlight build.

Each step should have its own visual review, mobile overflow check, accessibility pass, and check/build/test run. None requires a backend contract change.

## Recommendation

Use this direction as a system prototype, not an immediate reskin. The strongest production candidate is the **expanded list + map + evidence layout**, supported by the compact selected sheet. The glass treatment should remain secondary and restrained; the adaptive information architecture is the valuable part.
