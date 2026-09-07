# Local Agent Audit Roadmap Template

Use this when planning the next small improvement to Mapetite's local-first audit workflow.

## Roadmap Item

- Title:
- Owner:
- Status: proposed / approved / in progress / blocked / complete
- Target scope:
- Non-goals:

## Why This Matters

Describe the concrete reliability, privacy, cost, or auditability problem this solves.

## Privacy Review

- Reads private logs: yes/no
- Requires user approval: yes/no
- Sends data to cloud model: yes/no
- Redaction required: yes/no
- Approved workspace only: yes/no

## Evidence Sources

- Repository files:
- Git metadata:
- Command outputs:
- Browser checks:
- Production checks:
- Approved private excerpts:

## Local Tooling

Candidate tools:

- Ollama
- LM Studio
- llama.cpp
- Codex CLI local/OSS mode
- Aider
- Cline
- mini-SWE-agent
- Repomix
- Serena
- Custom Node/Python scripts

Recommended tool for this item:

Reason:

## Implementation Plan

1. Inventory metadata only.
2. Ask for approval before reading private content.
3. Extract or generate evidence locally.
4. Redact sensitive information.
5. Produce a local summary.
6. Optionally prepare a compact cloud-review packet.

## Acceptance Criteria

- No app code changed unless explicitly in scope.
- No private logs read without approval.
- No secrets included.
- Observed evidence is separated from agent claims.
- No auto-commit or auto-push.
- Output is useful without requiring a cloud model.

## Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |

## Commands To Add Or Run Later

```bash
# Placeholder only. Add concrete commands after approval.
pnpm run agent:audit:inventory
pnpm run agent:audit:export
pnpm run agent:audit:local-summary
```

## Decision Log

- Decision:
- Date:
- Reason:
- Evidence:
