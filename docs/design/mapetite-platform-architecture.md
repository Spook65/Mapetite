# Mapetite Platform Architecture Contract

**STATUS: APPROVED ARCHITECTURE CONTRACT**

**IMPLEMENTATION: NOT YET APPROVED**

**SOURCE OF TRUTH: YES**

This document defines Mapetite's platform information architecture and presentation boundaries before further adaptive UI implementation. It does not approve a visual rollout, route migration, native wrapper, or production behavior change.

Any future Codex task that conflicts with this contract must **STOP and report the conflict** rather than silently redesigning the architecture.

## Authority and decision order

Future design decisions must use this priority order:

1. Current Apple Human Interface Guidelines for installed Apple-platform behavior.
2. W3C, WCAG, and ARIA requirements for web accessibility semantics.
3. Current Apple Design Resources.
4. Current Apple WWDC design guidance.
5. Mapetite product requirements.
6. Existing Mapetite behavior and data contracts.
7. Mapetite branding.
8. Previous adaptive visual prototypes.

The previous adaptive prototype is exploratory evidence, not an architectural authority. When it conflicts with this contract or a higher-priority source, this contract and the higher-priority source prevail.

Normative terms in this document use their ordinary requirements meaning:

- **MUST** and **MUST NOT** identify nonnegotiable requirements.
- **SHOULD** and **SHOULD NOT** identify preferred behavior that requires a documented reason to override.
- **MAY** identifies an allowed implementation choice.

## 1. Platform models

Mapetite has three distinct presentation models. They share product state and behavior, but they do not share one scaled navigation shell.

### A. Web

#### Marketing entry

- Home remains available as the web marketing entry.
- Home is separate from the core search workspace.

#### Primary application destinations

- Search.
- Saved.
- Account or authentication entry.

#### Desktop web

- Use a compact web app header.
- Use structured Search and Filter popovers.
- Use a Results, Map, and Selected Restaurant workspace when width permits.
- Preserve pointer and keyboard efficiency.

#### Responsive phone web

- Current web navigation MAY remain during migration.
- Do not automatically replace responsive web navigation with installed-app navigation.
- Search and Filter sheets remain web UI with correct web semantics.

#### Footer

- Web attribution, privacy, provider, trademark, and demo disclosures remain available.
- Required attribution MUST NOT be removed to imitate an installed app.

### B. Installed iPhone

#### Top-level navigation

- Search.
- Saved.
- Account.

Use persistent tab-style navigation. Tabs represent destinations, not actions.

- Search is the initial and default destination.
- Home is not a top-level installed-app destination.
- Account remains a tab for the current MVP because authentication state is user-facing, Saved depends on identity, and account/settings information requires a stable destination.
- Account-as-tab is a Mapetite product decision, not an Apple requirement.

Restaurant details belong within the active destination's navigation hierarchy. Search, Filters, Selected Place, and Directions are not additional top-level tabs.

### C. Installed iPad

Top-level destinations remain:

- Search.
- Saved.
- Account.

Navigation MAY adapt between a tab bar and sidebar according to available width and current platform conventions.

The Search workspace follows these rules:

- Use Results List plus Map at regular widths when both remain useful.
- Add a Selected Place inspector only when sufficient width exists.
- Do not force three panes into narrow iPad windows.
- Preserve navigation and selection state when the window resizes.

## 2. Search architecture

Search is a primary product function. Platform presentation may change, but validation and location accuracy may not.

### Web desktop

Keep the structured anchored Search surface with:

- City.
- Region.
- Country.
- Autocomplete suggestions.
- Recent Searches.
- Restore Last Search.
- Example cities.
- Use My Location.
- Clear All.
- Search Restaurants.

This structured surface remains appropriate for global location search on desktop web.

### Installed iPhone

Replace the term **Search command** with platform-familiar search language.

Use:

- A dedicated Search destination.
- A recognizable primary search field.

Before typing, the Search destination SHOULD present:

- Recent Searches.
- A limited set of quick examples.
- Useful saved or recent context when it helps the current task.
- An explicit Use My Location action.

While typing:

- Suggestions appear in direct association with the search field.
- Suggestions remain bounded and relevant to the entered text.
- Expected ambiguity is explained inline rather than presented as a crash.

Structured location accuracy MUST NOT be removed.

- City is the primary location input.
- Region and Country are progressive qualifiers.
- Region and Country become available when ambiguity requires clarification.
- Region and Country become available when a person intentionally requests advanced location input.
- Existing place-validation semantics remain authoritative.

Preserve:

- Ambiguity handling.
- Global city correctness.
- Clearing search history.
- Recent-search privacy.
- Explicit Use My Location permission.
- Suggestion paused, unavailable, and no-match states.

### Installed iPad

- Search remains a primary destination.
- Search MAY use a toolbar field, sidebar field, or dedicated Search view according to available width and current platform guidance.
- Recent searches MAY appear inline, in a Search view, or in an attached menu where appropriate.
- Structured qualifiers follow the same progressive rules as iPhone.

## 3. Filter architecture

Mapetite MUST preserve one filter-state source across every presentation.

### Installed phone

- Filters and Sort use one sheet.

### Installed iPad

- Use an anchored popover when space and keyboard conditions make it suitable.
- Use a sheet when available space, window size, or keyboard state makes a popover unsuitable.

### Desktop web

- Use an anchored popover.

Every presentation preserves:

- Categories.
- Price.
- Minimum rating.
- Prioritize open.
- Sort.
- Saved only.
- Active count.
- Clear Filters.
- Done or dismissal behavior.

Clear Filters MUST NOT clear City, Region, Country, or resolved location context.

Sort MUST remain part of the same refinement system and MUST NOT be duplicated as competing state.

## 4. Content architecture

### Compact and phone

Primary content modes are:

- List.
- Map.

Do not force simultaneous desktop split panes into compact layouts.

The selected restaurant appears as a contextual bottom sheet.

Only one transient sheet may be active:

- Search.
- Filters.
- Selected Place.

Opening Search or Filters temporarily yields Selected Place. Closing Search or Filters may restore Selected Place when its selection remains valid.

### Regular and iPad

The primary workspace is Results List plus Map when width permits.

Selected restaurant context may use:

- An inspector.
- An overlay.
- A detail destination.

The choice depends on actual available width. It MUST NOT create a cramped three-pane layout.

### Wide and desktop

The preferred workspace is:

**Results | Map | Selected Restaurant Inspector**

- The Map receives the largest flexible region.
- The Results pane remains efficiently scannable.
- The inspector remains contextual and does not replace the canonical detail route.

`selectedRestaurantId` remains shared across compact, regular, and wide presentations.

## 5. Top-level state contract

The following concepts remain a **single source of truth**:

- Searched location.
- City.
- Region.
- Country.
- Location coordinates when explicitly available.
- Suggestion and autocomplete state.
- Recent Searches.
- Restored-search state.
- Filter object.
- Sort.
- Visible restaurant results.
- `selectedRestaurantId`.
- Map and search-center state.
- User-location state.
- Favorite restaurant IDs.
- Authentication state.

Presentation components may consume and render this state. They MUST NOT create parallel copies of business state.

A state value may be owned by the existing store, route, query/cache helper, authentication provider, or map component. Single source of truth does not require moving all state into one store; it requires one authoritative owner for each concept and prohibits presentation-specific duplicates.

The visible filtered restaurant list remains the shared input for:

- Result count.
- Mapped count.
- Result cards.
- Map pins.
- Selection validity.

## 6. Nonnegotiable product behavior

Preserve exactly:

- Provider strategy.
- Restaurant ranking.
- Place validation.
- Ambiguity handling.
- City-scope honesty.
- Recent-search privacy.
- Clear Recent Searches.
- Explicit Use My Location permission.
- Restored-results stale labeling.
- Filter semantics.
- Sorting semantics.
- Map camera lifecycle.
- List and map selection synchronization.
- Google Maps directions generation.
- Save and Unsave behavior.
- Signed-out Save feedback.
- Media fallback honesty.
- Provider timeout and unavailable behavior.
- One-active-transient-surface rule.
- No fabricated ratings, reviews, photos, routes, or recommendations.
- List fallback when the map is unavailable.

Platform adaptation MUST NOT silently reinterpret these behaviors.

## 7. Apple design contract

This section applies to installed Apple-platform design.

### Navigation

- Tabs represent destinations, not actions.
- Search, Saved, and Account are Mapetite's chosen top-level destinations.
- Home is web marketing only.
- Screen-specific actions belong with the screen or in its toolbar, not in the tab bar.

### Search

- Search receives primary placement.
- Useful Recent Searches appear before typing.
- Relevant suggestions appear while typing.
- Structured location qualifiers remain available through progressive disclosure.
- Use My Location remains explicit and is not requested on launch.

### Materials

- Material or glass belongs primarily to the navigation and control layer.
- Glass is not applied throughout the content layer.
- Ordinary content surfaces remain opaque or use standard materials where appropriate.
- Hierarchy comes from information architecture, layout, grouping, and typography before material effects.

### Split view

- Split view is used only with enough horizontal space.
- Selected-item indication persists across related panes.
- Three panes are not squeezed into compact or narrow regular widths.
- Hidden panes retain a clear way to be revealed.

### Color

- Color and tint communicate interaction, selection, emphasis, or semantic status.
- Sage and apricot are not decorative fills applied throughout the interface.
- The same tint does not represent unrelated meanings.
- Primary-action tint remains limited enough to preserve hierarchy.

## 8. Accessibility contract

### Installed iPhone and iPad controls

- Target at least 44 by 44 points where Apple touch guidance applies.
- Do not make an interaction depend on hover.
- Support platform text scaling and accessibility settings.

### Touch-oriented web controls

- Target approximately 44 by 44 CSS pixels where practical.
- CSS pixels and Apple points are not identical units; the web target is an accessibility-oriented approximation, not a unit equivalence claim.

### Dynamic Type and larger text

- Content must be allowed to grow.
- Critical information cannot rely exclusively on rigid line clamps.
- Controls, sheets, result rows, and selected-place surfaces must remain usable at larger text sizes.
- Truncation may protect layout only when the full value remains available through an accessible path.

### Web ARIA modality

`aria-modal="true"` may be used only when application behavior makes outside content inert and users cannot interact with the underlying content.

Therefore:

- A genuinely blocking phone modal sheet may use modal semantics.
- A desktop anchored Search or Filter surface that leaves the workspace interactive MUST NOT claim modal semantics.
- Visual dimming alone does not establish correct modal behavior.

### Focus and keyboard behavior

- Opening a transient surface moves focus appropriately.
- Escape behavior remains available where expected.
- Closing returns focus to an appropriate triggering control.
- Keyboard users cannot become trapped unintentionally.
- Web autocomplete preserves combobox, listbox, option, and active-descendant semantics where applicable.

Preserve:

- Reduced-motion support.
- Visible focus indication.
- Semantic buttons, links, fields, and navigation landmarks.
- Safe-area handling.
- Text-backed status communication.
- Sufficient contrast without relying on color alone.

## 9. Material and glass rule

Allowed candidates include:

- Installed tab and navigation layers.
- Floating toolbar controls.
- A Selected Place sheet over visually rich map content.
- Genuinely floating transient controls.

Prefer opaque or standard content surfaces for:

- Restaurant cards.
- Evidence and explanatory content.
- Search field body.
- Filter groups.
- Result lists.
- Empty-state content.
- Web footer.

Do not attempt to reproduce native Liquid Glass merely by increasing CSS `backdrop-filter` blur. Web material treatments require an opaque, legible fallback and remain web approximations rather than native Liquid Glass.

## 10. Responsive model

Future responsive reasoning uses three behavioral concepts instead of treating many arbitrary breakpoints as separate designs.

### Compact

- One primary content mode.
- Sheets for transient tasks.
- Touch-first interaction.
- Safe-area-aware placement.

### Regular

- Split content when useful.
- Adaptive navigation.
- No forced inspector.
- Preserve continuity when width changes.

### Wide

- Multi-pane workspace.
- Pointer and keyboard efficiency.
- Inspector permitted when enough space remains for list and map.

Web CSS breakpoints and container queries may implement these concepts. Runtime JavaScript measurement MUST NOT be added merely to classify layout.

## 11. Performance contract

Do not introduce:

- Duplicated business state.
- Polling for layout.
- Layout-measurement loops.
- Unnecessary `ResizeObserver` usage.
- New provider requests for presentation changes.
- Map instance recreation for visual layout.
- Runtime work proportional to restaurant count solely for layout.

Prefer:

- CSS Grid and Flexbox.
- CSS media and container queries.
- Existing application state.
- Existing data and helpers.
- The existing map instance.

Presentation changes must not change backend cache keys, provider behavior, ranking, or validation requests.

## 12. Web versus installed decision table

| Concern | Web | Installed iPhone | Installed iPad |
| --- | --- | --- | --- |
| Home | Marketing entry remains available | Not a top-level destination | Not a top-level destination |
| Navigation | Compact web header; responsive web navigation may remain during migration | Persistent Search, Saved, Account tabs | Search, Saved, Account via adaptive tab bar or sidebar |
| Search | Structured anchored surface on desktop; web sheet on phone | Dedicated Search destination with primary search field | Primary Search destination using toolbar, sidebar, or dedicated view as width permits |
| Filters | Desktop anchored popover; responsive web sheet | One Filter and Sort sheet | Anchored popover or sheet based on available space |
| Results | Scannable list in the web workspace | Primary List mode | List pane beside Map when useful |
| Map | Flexible center pane when wide; explicit mode when compact | Primary Map mode, not a forced split | Persistent Map beside Results when width permits |
| Selected place | Inspector when wide; contextual sheet when compact | Contextual bottom sheet | Inspector, overlay, or detail destination based on actual width |
| Authentication | Header and route entry; existing web auth presentation | Stable Account tab and contextual sign-in when Save requires it | Stable Account destination in tab/sidebar navigation |
| Footer/legal | Footer retains attribution, privacy, provider, and demo disclosures | Move to reachable About, Data, Privacy, or Account information surfaces | Move to reachable About, Data, Privacy, or Account information surfaces |
| Materials | Restrained CSS material with opaque fallback | Platform materials for navigation and genuinely floating controls | Platform materials for navigation, sidebar, and floating controls |
| Responsive system | CSS compact, regular, and wide implementations | Compact phone model with safe areas and keyboard handling | Resizable regular/wide model without forcing three panes |
| Accessibility semantics | WCAG and ARIA govern dialogs, popovers, comboboxes, focus, and landmarks | Native semantics, Dynamic Type, VoiceOver, and 44-point touch guidance | Native semantics, Dynamic Type, VoiceOver, keyboard, pointer, and resizable windows |

## 13. Implementation order

Do not skip dependency phases solely for visual polish.

### Phase 0: Architecture contract

- This document.
- No production implementation is approved by this phase.

### Phase 1: Accessibility foundations

- Touch targets.
- Dynamic Type and larger-text strategy.
- Correct modal and popover semantics.
- Focus movement and focus return.
- Keyboard and assistive-technology validation plan.

### Phase 2: Installed navigation prototype

- Search, Saved, and Account.
- Home excluded.
- No duplicated route or authentication state.

### Phase 3: Installed Search architecture

- Primary search field.
- Recent Searches.
- Suggestions.
- Progressive City, Region, and Country qualifiers.
- Existing validation and privacy behavior preserved.

### Phase 4: Compact, regular, and wide content adaptation

- Compact List and Map modes.
- Regular Results plus Map.
- Wide Results, Map, and Selected Place inspector.
- One shared selection state.

### Phase 5: Filters and contextual actions

- Installed phone sheet.
- iPad popover or sheet.
- Web anchored popover.
- Existing filter state and semantics retained.

### Phase 6: Material and tint cleanup

- Limit material to functional navigation and control layers.
- Normalize semantic tint usage.
- Preserve opaque and increased-contrast behavior.

### Phase 7: Capacitor and TestFlight device validation

- Safe areas.
- Software and hardware keyboard behavior.
- Tab and sheet coexistence.
- Dynamic Type and VoiceOver.
- External directions handoff.
- Offline and provider failures.
- Authentication and Saved behavior.
- Attribution and privacy access.

### Phase 8: Controlled rollout

- Retain explicit preview gating until approved.
- Migrate one independently testable surface at a time.
- Preserve rollback paths.
- Require behavior, accessibility, performance, and mobile-overflow verification before default rollout.

## 14. Document status and conflict protocol

This is the approved architecture contract and source of truth for future Mapetite platform UI planning. Implementation remains unapproved until a later task explicitly authorizes a scoped phase.

Existing audits, inventories, migration maps, visual prototypes, and tokens remain useful supporting material. They do not override this contract.

When a future request conflicts with this document:

1. Stop before implementation.
2. Identify the conflicting contract clause.
3. Explain the functional, accessibility, or platform consequence.
4. Request an explicit architecture decision.
5. Update this contract only when the user explicitly approves that architecture change.

Visual resemblance to an earlier prototype is never sufficient reason to bypass this protocol.
