# Mapetite adaptive interface study

## Purpose

This design study explores an Apple-inspired adaptive product direction without copying Apple interfaces, trademarks, proprietary assets, or exact component treatments. It is a static local artifact: it makes no API, authentication, storage, analytics, or location calls and does not change any production route.

The prototype is intentionally app-like rather than marketing-led. Its central question is whether Mapetite can present the same search state naturally on a compact phone, an expanded tablet or foldable viewport, and a desktop workspace.

## Refinement from the first adaptive study

The first adaptive prototype established the right information architecture but relied too heavily on simulated hardware and abstract food-like color circles. This refinement makes the interface credible without those devices:

- heavy phone and tablet borders are replaced by quiet one-pixel app-canvas boundaries
- cards use stable scan lines for rating, review count, hours confidence, cuisine, location, and distance
- selected rows use a restrained inset accent and border rather than a larger duplicate card
- image fallback surfaces explicitly say “Photo unavailable” and use a restaurant initial mark
- selected-place surfaces prioritize decision evidence, distance, address, and actions
- the static map now distinguishes normal pins, selected pin, and search center while labeling positions as approximate
- calm provider, ambiguity, empty, offline, saved, photo, and map states demonstrate system behavior

The goal is not to imitate a native screenshot. It is to establish a web implementation that already behaves coherently when placed inside a future iOS shell.

## Production feature restoration

The refined shell now shows where Mapetite’s real product features belong rather than gaining visual cleanliness by omitting them:

- collapsed resolved-place search summary
- City, State / Province / Region, and Country fields
- autocomplete results and suggestions-paused behavior
- explicit Use My Location and Clear all actions
- browser-local recent searches with labeled result counts
- last-search restore with stale-result disclosure
- price, minimum rating, prioritize-open, Saved only, and Sort controls
- Map and Refresh commands
- Saved and Account navigation
- ambiguity, empty, provider, backend, map, media, offline, location, and autocomplete-rate-limit states

These are static representations only. The prototype does not read or write storage, call validation or provider APIs, request location, authenticate, or modify saved state.

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

## Apple-style UI gap analysis

This analysis extracts product principles from strong platform apps without reproducing Apple layouts, components, proprietary assets, or branding. The useful benchmark is not whether Mapetite resembles an Apple screenshot; it is whether content, commands, selection, navigation, and failure states feel coherent enough for repeated use on iOS.

### Apple Maps pattern

**What Mapetite already does well:** search is the primary command, the list and map share a selected restaurant, distance language is approximate, Directions remains an external utility, and compact selection already becomes a sheet.

**What was missing:** the map read as a secondary illustration, list selection and the selected pin were not explicitly connected, and the selected-place surface gave several facts equal visual weight.

**Prototype change:** the selected pin is visually dominant, map overlays say “Selected from results,” the distance explicitly avoids route claims, map controls remain minimal, and the selected place now follows photo → name → cuisine/location → rating/hours → evidence → distance/address → actions.

### Apple Photos pattern

**What Mapetite already does well:** recent searches and saved places are browser-local convenience features, location sharing is explicit, and the product has a natural personal-shortlist model.

**What was missing:** recent and saved concepts felt like utilities around search rather than quiet personal organization, and empty Saved state existed only in a detached state gallery.

**Prototype change:** Recent remains compact and subordinate to current results, Saved and Account become persistent destinations, the installed-app navigation model treats Saved as a collection rather than a filter-only concept, and the empty Saved treatment appears inside a Saved-view example.

### App Store pattern

**What Mapetite already does well:** cards support images, evidence, detail navigation, and a stronger dedicated restaurant detail route.

**What was missing:** fallback media and card text competed at similar weights, result cards carried more prose than a scanning surface needs, and selected-place actions lacked a crisp order.

**Prototype change:** fallback media uses a restrained material field and compact monogram, result evidence is one line, selected cards use a quiet “Selected” label, the decision panel adds hierarchy instead of repeating the list card, and Directions remains the distinct utility action.

### Weather pattern

**What Mapetite already does well:** timeout, ambiguity, stale data, location denial, and unavailable-map copy are calm, honest, and retry-oriented.

**What was missing:** those states were demonstrated mainly as documentation cards rather than where the user would encounter them.

**Prototype change:** provider delay appears in results, ambiguity and suggestion pause appear inside search, map unavailability stays inside the map pane, no-photo treatment stays inside cards, no-saved treatment stays in a Saved view, and restored results remain visible under backend failure.

### Adaptive compact-to-expanded pattern

**What Mapetite already does well:** compact, expanded, and desktop shells share one conceptual state; controls move rather than multiply; the selected restaurant becomes a sheet or evidence pane; and the wider layouts reveal map context.

**What was missing:** the navigation model was implied rather than explicit, extra space occasionally looked like a static composition, and expanded selection did not strongly communicate continuity from the list.

**Prototype change:** a six-stage installed-app navigation model documents Discover, Search, Filters, Selected Place, Detail, Saved, and Account; wider layouts devote space to map context and decision evidence; and every selected surface uses the same selected-place label and restaurant identity.

### Highest-priority production gaps

1. Test keyboard-aware compact sheets with real autocomplete content and Dynamic Type-sized text.
2. Make selection semantics and focus movement accessible across list, map, bottom sheet, and detail route.
3. Validate the selected place hierarchy with real missing-field combinations instead of static complete data.
4. Preserve map camera behavior while resizing persistent panes in split-screen and Stage Manager-like widths.
5. Establish native-wrapper navigation and external-link rules before a TestFlight build so the app never feels like an unbounded web view.

## Prototype summary

### Compact phone

- A single-column result flow keeps search and scanning primary.
- The search command is sticky inside the content viewport and uses a restrained frosted treatment.
- Recent searches and filter controls stay horizontally compact.
- Results use stable square media areas, predictable card heights, and two short scan lines.
- The selected restaurant becomes a safe-area-aware decision sheet with an image fallback, evidence, and 44px actions.
- Full restaurant information remains a detail route rather than an oversized sheet.
- The list reserves bottom space equal to the sheet so the final result is never hidden.

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

## Search command model

The default search command displays resolved context, such as “Stockton, California” and “Any cuisine,” plus one Search action. The full form appears only when the user edits location context.

### Compact

- Open City, Region, and Country in a safe-area-aware bottom sheet.
- Keep autocomplete, recent searches, quick examples, Use My Location, Clear all, and Search within that sheet.
- Cap and internally scroll the sheet when the keyboard is visible.
- Closing the sheet restores focus to the command trigger.
- Opening the search sheet temporarily moves the selected-place sheet out of the interaction layer; it does not clear selection.

### Expanded and desktop

- Open the same field set as an anchored overlay above the list/map workspace.
- Keep results, map, and selected-place evidence visible behind the overlay.
- Avoid inserting search form rows into the page and causing a layout shift.
- Treat suggestion failure as optional assistance failure; normal Search remains available.

## Filters and sort command

Filters and Sort share one command because Sort must not appear in two competing places. The toolbar count reflects only active narrowing filters.

- Price uses no selected levels to mean Any price.
- Minimum rating uses Any as the default absence of a constraint.
- Prioritize likely open remains honest about hours confidence.
- Saved only is available from the same surface without duplicating Saved navigation.
- Sort changes ordering and is visually separated from narrowing filters.
- Clear filters resets filter defaults without clearing the searched place.
- Compact uses a bottom sheet; larger layouts use an anchored overlay.

## Recent and restore behavior

- Recent rows show full place context and a labeled “N results” badge.
- Mobile helper chips may abbreviate the count but retain a readable label in the expanded search sheet.
- Clear recent searches is scoped to browser-local history.
- Last-search restore stays a quiet banner near results, not a competing hero.
- Restored results use an explicit browser-saved, possibly stale label until the normal backend refresh succeeds.
- Precise Use My Location coordinates are not added to recent-search history.

## Web and installed entry

### Web

Keep the existing lightweight landing route for portfolio context, data honesty, and discovery. Its primary CTA opens the search shell; it should not duplicate app controls.

### Installed/TestFlight

Launch directly into the app shell. An optional first-run introduction may explain public listing data, explicit location, and saved-state limitations, but repeat launches must not pass through marketing content. Saved and Account remain visible in the app bar, with signed-out copy that does not block city search.

## Sticky behavior

- The global app header keeps a stable height and respects safe-area insets.
- Compact search may become sticky after the page title leaves view, but it must reserve its height and avoid layout shift.
- The selected bottom sheet is viewport-fixed within safe areas. It must not cover the final list item; the list needs matching bottom padding.
- Expanded and desktop pane headers may stay sticky within their pane. The whole page should not accumulate multiple sticky bars.
- Focused autocomplete and filter overlays should remain above the sheet while preserving keyboard access.

## Compact iOS and keyboard behavior

- Use `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` in the real wrapper, with web-safe fallbacks.
- Keep Search, Details, Save, and Directions at least 44px tall in the compact mode.
- The selected sheet must remain dismissible without clearing the selected restaurant unless product logic explicitly requires it.
- When the software keyboard opens, anchor autocomplete to the active field and let the results viewport resize; do not translate the whole app shell.
- Search submission remains available when autocomplete is empty, offline, malformed, or rate-limited.
- No compact action may depend on hover. Focus, pressed, selected, and disabled states need equivalent visible treatment.
- External directions should leave the wrapper intentionally rather than opening an unbounded in-app browser.

## iOS and TestFlight polish checklist

- **Safe areas:** app bar, sheets, selected-place actions, and transient notices must use top and bottom safe-area insets without double-padding in a wrapper.
- **Keyboard:** focus the active search field, keep autocomplete attached to that field, preserve Search and Clear all access, and resize rather than translate the full shell.
- **Tap targets:** interactive compact controls remain at least 44 by 44 points even when their visual treatment is smaller.
- **Reduced motion:** selection, sheet, and panel transitions use short opacity/transform changes and collapse to effectively instant state changes when requested.
- **Contrast:** text and controls remain legible when blur is unavailable, Increase Contrast is enabled, or the map beneath a material surface is visually busy.
- **Dynamic Type:** names, evidence, states, and actions must wrap without clipping; the production shell should switch layout before compressing text below usable sizes.
- **Offline/provider failure:** retain recent or restored content when honest, label stale data, and keep retry actions local to the affected surface.
- **Privacy copy:** city search requires no location; precise location is requested only after Use My Location and is never implied to be live tracking.
- **Wrapper quality:** launch directly into Discover, provide predictable back navigation, open external directions intentionally, avoid browser chrome, and prevent marketing content from appearing on repeat app launches.
- **Review risk:** a wrapper that still exposes web-only navigation, covered inputs, hover-dependent controls, blank network states, or duplicate toolbars remains too web-like for beta readiness.

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
- **Media:** stable aspect ratios and clearly labeled fallback fields. Initial marks provide identity without pretending a generated illustration is restaurant photography.

## Result and decision hierarchy

Result cards should answer four scan questions in order:

1. What is this restaurant?
2. How strong and current is the available public signal?
3. What cuisine/place/distance context is known?
4. Why might it be worth opening?

The selected panel should not repeat every card sentence. It adds decision context: full location, approximate-distance source, address, hours wording, concise “why consider it” evidence, and Details/Save/Directions. Internal ranking scores never appear.

## Media fallback behavior

- Preserve the exact media container dimensions before and after an image request.
- When a remote image fails, replace it in the same container without retry loops or a broken-image icon.
- Use the restaurant’s safe text initial and a neutral “Photo unavailable” label.
- Never imply the fallback is a real restaurant photo, official logo, or cuisine image.
- Keep alt text factual: either describe the supplied image or state that the photo is unavailable.

## Calm system states

- **Provider timeout:** keep loading or saved browser results visible, explain the delay, and offer retry.
- **No matching places:** retain the current search and suggest clearing a real constraint.
- **Ambiguous city:** ask for region/country or selection from suggestions; do not present it as a crash.
- **No saved places:** explain how to build a shortlist without inventing examples.
- **No restaurant photo:** use the stable initial fallback.
- **Map unavailable:** keep restaurant results usable in the list.
- **Offline/backend unavailable:** preserve local convenience state, label cached results honestly, and offer reconnect/retry.
- **Suggestions paused / 429:** pause autocomplete requests quietly and preserve normal Search submission.
- **Location permission denied:** continue with city search and do not repeat-prompt automatically.

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

1. **Design tokens only:** add reversible color, type, radius, divider, shadow, spacing, and material variables without changing component markup.
2. **Button/card/control styles:** update shared focus, pressed, selected, disabled, and 44px compact target treatments.
3. **Result card styling:** apply the stable media fallback, scan-line hierarchy, line clamps, and selected-state treatment without changing search data or actions.
4. **Selected-place panel styling:** reuse current selection state and content to create the evidence-led desktop panel and compact decision sheet.
5. **Map/list layout styling:** change layout containers only; preserve MapLibre lifecycle, camera, markers, attribution, filtering, and current-results scope.
6. **Compact mobile sheet styling:** add safe-area spacing, reserved list padding, keyboard-aware sizing, and non-hover interactions.
7. **Landing and detail pages later:** migrate them only after the search experience proves the tokens and controls across real data states.
8. **Capacitor/TestFlight wrapper last:** add the wrapper only after the responsive web UI, offline states, safe areas, and external-link behavior are stable.

Each step must remain separately reviewable and reversible, with a visual review, 390px overflow check, accessibility pass, and check/build/test run. None requires a backend contract change.

## Recommendation

Use this direction as a system prototype, not an immediate reskin. The strongest production candidate is the **expanded list + map + evidence layout**, supported by the compact selected sheet. The glass treatment should remain secondary and restrained; the adaptive information architecture is the valuable part.
