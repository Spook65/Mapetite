# Mapetite Agent Instructions

## Browser/debugging safety policy

For browser-based debugging, the agent may only interact with the Mapetite app running on:

- localhost Vite dev server
- local preview server
- the deployed Mapetite frontend URL, if explicitly allowed

The agent must not:

- open unrelated websites
- interact with personal accounts outside Mapetite
- browse Gmail, GitHub settings, bank pages, school portals, or unrelated tabs
- change browser permissions except when explicitly requested
- access files outside the Mapetite repository
- run destructive shell commands
- auto-commit or auto-push without approval
- leave debug logs in production
- collect or log precise user location unless explicitly required for the tested flow

The agent must:

- state the exact browser actions before running them
- keep testing scoped to Mapetite
- use test/demo accounts only
- use dev-only instrumentation
- remove or gate temporary logs before final output
- report exactly what it clicked, observed, changed, and verified

## Mapetite adaptive UI migration rules

The adaptive-shell preview is experimental and must remain query-gated behind `?ui=adaptive-shell` until explicitly approved.

For UI tasks:

- Do not invent a new visual direction.
- Do not perform broad redesigns.
- Do not move DOM structure unless the prompt explicitly allows it.
- Default `/restaurants` must remain unchanged unless explicitly requested.
- Use existing handlers and state. Do not reimplement search, filters, map, save, or directions.
- Keep changes scoped to named adaptive-shell classes.
- Prefer exact design algorithms over subjective styling words.
- Mobile `<768px`: sheets.
- Tablet: centered compact panels.
- Desktop: anchored popovers.
- Only one transient surface may be active at once.
- Do not run browser QA until after typecheck/build passes unless debugging a browser-only issue.
- Report diff size before final response.
- If a prompt is broad, ask for a narrower target instead of redesigning multiple areas.
