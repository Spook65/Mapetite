# Mapetite Palette Prototypes

This is a standalone design exploration. These palette variants are not imported by the live app and should not be treated as the production theme until one direction is selected intentionally.

Open the visual prototype:

```bash
open docs/design/palette-prototypes.html
```

If `open` is not available, drag `docs/design/palette-prototypes.html` into a browser.

## Evaluation Surfaces

Each prototype section includes static Mapetite-inspired surfaces:

- Landing hero
- Product preview card
- Search form/card
- Result card
- Selected restaurant preview treatment
- Detail/decision card
- Footer-style attribution block
- Mobile-style stacked layout

The selected restaurant preview blur/glass behavior is intentionally represented and should remain part of Mapetite's visual language.

## Variant A: Current Refined Espresso/Copper Baseline

### Token Set

| Role | Value |
| --- | --- |
| Background / base | `#100c0a` |
| Elevated background | `#1a120f` |
| Surface | `rgba(40, 29, 23, 0.88)` |
| Soft surface | `rgba(46, 34, 27, 0.48)` |
| Strong surface | `rgba(58, 41, 31, 0.68)` |
| Border | `rgba(246, 224, 204, 0.085)` |
| Strong border | `rgba(246, 224, 204, 0.16)` |
| Primary text | `#f8ece1` |
| Secondary text | `rgba(248, 236, 225, 0.76)` |
| Muted text | `rgba(248, 236, 225, 0.54)` |
| Accent | `#e3a66f` |
| Accent hover | `#efbb88` |
| Accent foreground | `#1c100a` |
| Accent soft | `rgba(227, 166, 111, 0.095)` |
| Trust micro-accent | `#9a9f72` |

### 60/30/10 Interpretation

- 60% deep espresso/cocoa background.
- 30% roasted brown panels and cards.
- 10% copper/apricot for CTAs, selected states, and focus.

### Strengths

- Feels most like existing Mapetite.
- Warm, premium, restaurant-adjacent.
- Strong brand continuity with current screenshots.
- CTA is readable and clear.
- Selected states remain clear without becoming loud.

### Weaknesses

- Still risks feeling too brown/same-tone.
- Product preview and footer can feel slightly monochrome.
- The accent may feel familiar rather than fresh because the whole app already lives in this family.

### Readability Concerns

- Primary text is strong.
- Muted text is acceptable on cards.
- Footer attribution remains readable, though faint text should not be pushed lower than the current opacity.
- Chip text is readable but visually subdued.

### Fit

- Premium: Yes.
- Too generic: No.
- Restaurant discovery fit: Strong.
- CTA standout: Good.
- Selected state clarity: Good.

## Variant B: Charcoal Cream Copper

### Token Set

| Role | Value |
| --- | --- |
| Background / base | `#0d0e0e` |
| Elevated background | `#171717` |
| Surface | `rgba(35, 35, 33, 0.9)` |
| Soft surface | `rgba(48, 47, 43, 0.52)` |
| Strong surface | `rgba(64, 60, 54, 0.72)` |
| Border | `rgba(246, 238, 224, 0.1)` |
| Strong border | `rgba(246, 238, 224, 0.18)` |
| Primary text | `#f7efe4` |
| Secondary text | `rgba(247, 239, 228, 0.77)` |
| Muted text | `rgba(247, 239, 228, 0.55)` |
| Accent | `#e6a15f` |
| Accent hover | `#f1b980` |
| Accent foreground | `#18110c` |
| Accent soft | `rgba(230, 161, 95, 0.1)` |
| Trust micro-accent | `#a4a37d` |

### 60/30/10 Interpretation

- 60% charcoal near-black base.
- 30% warm graphite surfaces.
- 10% copper/apricot primary actions and selected states.

### Strengths

- Cleaner and more modern than Variant A.
- Reduces brown-on-brown sameness.
- Makes copper CTA feel more deliberate.
- Search and detail cards feel more product-like and less moody.
- Footer and nav feel slightly crisper.

### Weaknesses

- Loses some restaurant warmth.
- Can drift toward generic premium SaaS if typography/copy do not carry the brand.
- Less editorial and less food-adjacent than A or C.

### Readability Concerns

- Primary and muted text are strong on charcoal.
- CTA contrast is strong.
- Chips are readable.
- Footer attribution remains readable.

### Fit

- Premium: Yes.
- Too generic: Medium risk.
- Restaurant discovery fit: Good, but less distinctive.
- CTA standout: Strong.
- Selected state clarity: Strong.

## Variant C: Espresso Sage Apricot

### Token Set

| Role | Value |
| --- | --- |
| Background / base | `#100d0a` |
| Elevated background | `#17130f` |
| Surface | `rgba(34, 38, 27, 0.88)` |
| Soft surface | `rgba(49, 55, 39, 0.5)` |
| Strong surface | `rgba(67, 75, 51, 0.62)` |
| Border | `rgba(231, 228, 198, 0.105)` |
| Strong border | `rgba(231, 228, 198, 0.18)` |
| Primary text | `#fbefe0` |
| Secondary text | `rgba(251, 239, 224, 0.77)` |
| Muted text | `rgba(251, 239, 224, 0.55)` |
| Accent | `#efa96f` |
| Accent hover | `#f5bd8d` |
| Accent foreground | `#1d1109` |
| Accent soft | `rgba(239, 169, 111, 0.095)` |
| Trust micro-accent | `#b7b176` |

### 60/30/10 Interpretation

- 60% espresso base.
- 30% muted sage/olive surfaces.
- 10% apricot/copper CTA and selected states.

### Strengths

- Best at breaking the brown sameness while preserving warmth.
- Feels editorial, organic, and restaurant-guide appropriate.
- Sage surfaces make data honesty and no-photo states feel more intentional.
- Apricot CTA stands out clearly against olive surfaces.
- Selected states remain visible without turning the UI orange.

### Weaknesses

- Needs careful restraint so sage does not become a full green theme.
- Some users may read olive as less luxurious than brown/wine if overused.
- Requires token-only discipline; random hardcoded brown classes would dilute it.

### Readability Concerns

- Primary text is strong.
- Muted text is readable on sage surfaces.
- CTA contrast is strong.
- Footer attribution is readable.
- Chip text remains readable if border/soft surface opacity stays near this range.

### Fit

- Premium: Yes.
- Too generic: Low risk.
- Restaurant discovery fit: Very strong.
- CTA standout: Strong.
- Selected state clarity: Strong.

## Variant D: Espresso Wine Peach

### Token Set

| Role | Value |
| --- | --- |
| Background / base | `#120b0b` |
| Elevated background | `#1a0f11` |
| Surface | `rgba(43, 24, 31, 0.88)` |
| Soft surface | `rgba(58, 32, 43, 0.52)` |
| Strong surface | `rgba(78, 40, 56, 0.64)` |
| Border | `rgba(255, 226, 218, 0.1)` |
| Strong border | `rgba(255, 226, 218, 0.18)` |
| Primary text | `#fff0e6` |
| Secondary text | `rgba(255, 240, 230, 0.77)` |
| Muted text | `rgba(255, 240, 230, 0.55)` |
| Accent | `#f0a978` |
| Accent hover | `#f5bd94` |
| Accent foreground | `#1d0d09` |
| Accent soft | `rgba(240, 169, 120, 0.095)` |
| Trust micro-accent | `#b5a06e` |

### 60/30/10 Interpretation

- 60% espresso base.
- 30% wine/plum surfaces.
- 10% peach/copper CTA and selected states.

### Strengths

- Most evening/upscale.
- Good dining-room mood.
- Makes Mapetite feel less like a product dashboard.
- CTA remains readable and expressive.

### Weaknesses

- Highest risk of feeling theatrical or less practical.
- Wine/plum can compete emotionally with restaurant data.
- Some result/search surfaces may feel heavier than they need to.
- Could become too niche for broad global city search.

### Readability Concerns

- Primary and muted text are readable.
- Footer stays readable.
- Selected states remain clear.
- Be careful with very small text on wine surfaces; avoid lowering opacity further.

### Fit

- Premium: Yes.
- Too generic: Low.
- Restaurant discovery fit: Strong for evening dining, weaker for everyday search.
- CTA standout: Strong.
- Selected state clarity: Good.

## Recommended Winner

Variant C: Espresso Sage Apricot.

## Why Variant C Fits Mapetite

Variant C best supports Mapetite's direction: editorial restaurant guide with clean search-product discipline.

It keeps the warm espresso foundation but introduces enough sage/olive secondary color to break the current brown-on-brown sameness. The apricot CTA still feels appetizing and premium, while the sage surfaces make honesty states, context cards, and selected previews feel calmer and more intentional.

Variant B is cleaner, but it risks making Mapetite look like a generic SaaS product. Variant D is attractive, but it may push too far into evening-lounge mood. Variant A is safe and brand-consistent, but it does not fully solve the same-tone concern.

## Screenshot Instructions

1. Open `docs/design/palette-prototypes.html` in a browser.
2. Set viewport to desktop width around `1440px`.
3. Capture each section from its heading through footer mock.
4. Set viewport to mobile width around `390px`.
5. Capture each section again to compare mobile readability.
6. Compare CTA contrast, selected card clarity, footer readability, and whether the result card feels restaurant-like instead of dashboard-like.

## Next Implementation Prompt

```text
Project: Mapetite

Task:
Apply the chosen Variant C Espresso Sage Apricot palette to Mapetite's live color tokens.

Scope:
Prefer editing only src/styles.css.
Do not change layout, routing, backend/API, search, ranking, auth/favorites, place validation, menu/cuisine/photo logic, or component structure.

Required:
- Replace Mapetite semantic color tokens with the approved Variant C values.
- Keep primary CTA apricot/copper.
- Use sage/olive only as the 30% secondary surface family, not as a loud accent.
- Preserve selected preview blur/glass behavior.
- Keep text contrast readable.
- Do not repaint hardcoded component classes unless a specific contrast bug appears.

Verification:
Run git diff --check, pnpm run check, pnpm run build, pnpm run test.

Output:
Report files changed, token changes, contrast notes, behavior preserved, and verification results.
```
