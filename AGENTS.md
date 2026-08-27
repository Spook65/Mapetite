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
