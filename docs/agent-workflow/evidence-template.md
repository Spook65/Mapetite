# Evidence Packet Template

Use this template when Mapetite development history needs outside review. Keep it compact, redacted, and evidence-first.

## Packet Metadata

- Project: Mapetite
- Audit title:
- Date prepared:
- Prepared by:
- Local workspace:
- Date range covered:
- Approved sources:
- Redaction status:
- Cloud review approved: yes/no

## Privacy Boundary

This packet should not include:

- Raw private chat/session archives.
- API keys, tokens, `.env` values, cookies, or browser storage.
- Personal account pages or unrelated tabs.
- Precise user location.
- Unrelated repository files.

## Executive Summary

Short summary of what changed, what was verified, and what remains uncertain.

## Claims Under Review

| Claim | Source | Evidence status | Confidence |
| --- | --- | --- | --- |
| Example: Search map no longer teleports on pin click. | Agent final report | Browser verified | Medium-high |

## Observed Evidence

### Code Evidence

- File:
- Commit or diff:
- Relevant behavior:
- Notes:

### Command Evidence

```bash
pnpm run check
pnpm run build
pnpm run test
```

Observed result:

```text
Paste concise output or summary here.
```

### Browser Evidence

- Target: local / preview / production
- Exact actions:
- Observed result:
- Console/network findings:
- Screenshots: optional local paths only, if approved

### API Evidence

- Endpoint:
- Request:
- Status:
- Response summary:
- Timing:

## Agent Claims Versus Observations

| Area | Agent claim | Observed evidence | Match? | Notes |
| --- | --- | --- | --- | --- |

## Contradictions Or Gaps

- Gap:
- Why it matters:
- Suggested next check:

## Data Honesty Review

Check for unsupported claims:

- Verified restaurant
- Official menu
- Guaranteed open
- Google rating
- Exact travel time
- AI recommended
- Best restaurant
- All cities supported

Findings:

## Risk Rating

- Launch-blocking issues:
- Non-blocking issues:
- Privacy concerns:
- Follow-up priority:

## Recommended Next Step

One small next action, with the evidence that justifies it.
