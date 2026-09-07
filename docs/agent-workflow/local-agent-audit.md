# Local-First Agent Audit Workflow

Mapetite is now portfolio-ready, so future agent work should preserve the evidence trail that got it there: tests, runtime logs, browser checks, production smoke tests, and a clear split between what an agent claimed and what was actually observed.

This workflow describes a local-first audit loop for reviewing Mapetite development history without sending private session archives to cloud models by default.

## Goals

- Audit Mapetite development history with evidence, not vibes.
- Keep private agent/chat/session archives local unless the user approves excerpts.
- Inventory metadata before reading private content.
- Separate observed evidence from agent claims.
- Support local LLMs and local agent tools when available.
- Export a compact, redacted evidence packet for ChatGPT review only when useful.

## Recommended Architecture

Use a three-layer workflow:

1. Metadata inventory
2. Evidence extraction
3. Optional model-assisted summary

The default path is local and deterministic:

```text
Mapetite repository
  -> local inventory script
  -> metadata report
  -> user approval gate
  -> redacted evidence excerpts
  -> local summary draft
  -> optional compact export for ChatGPT review
```

Do not make an agent the source of truth. Agents can summarize, compare, and flag contradictions, but the evidence packet should cite files, commands, outputs, commits, browser observations, and production URLs.

## What Runs Locally

The local workflow should run inside the Mapetite workspace only:

- `git status`, `git log`, `git show --stat`, and non-destructive diff commands.
- `pnpm run check`, `pnpm run build`, and `pnpm run test`.
- Optional validation-only scripts for backend behavior.
- Optional browser smoke tests against local Mapetite or approved production Mapetite.
- Metadata-only inventory of agent/session archive locations.
- Redaction scripts that prepare excerpts only after user approval.
- Local LLM review through Ollama, LM Studio, llama.cpp, Codex CLI local/OSS mode, Aider, Cline, or mini-SWE-agent if installed.

The workflow should not read private session logs automatically. It may count files, list filenames, collect sizes, and summarize timestamps as metadata.

## What Goes To ChatGPT

Nothing goes to ChatGPT by default.

If the user approves a cloud review, send only a compact evidence packet:

- Task name and date range.
- Commit SHAs or local diff summaries.
- Relevant command outputs.
- Redacted browser observations.
- Redacted excerpts from agent logs, if separately approved.
- Open questions where the local model was uncertain.

Do not send raw private archives, full chat transcripts, personal account data, precise user location, API keys, `.env` files, or unrelated repository content.

## Folder Structure

Recommended documentation and future script layout:

```text
docs/
  agent-workflow/
    local-agent-audit.md
    evidence-template.md
    roadmap-template.md

scripts/
  agent-audit/
    inventory.mjs              # future: metadata-only inventory
    redact-evidence.mjs        # future: approved excerpt redaction
    summarize-local.mjs        # future: local LLM adapter
    export-evidence-packet.mjs # future: compact cloud-review packet

.agent-audit/
  inventories/                 # gitignored future output
  evidence/                    # gitignored future output
  exports/                     # gitignored future output
```

Do not add the script directory until implementation begins. For this design pass, the docs are enough.

## Data Privacy Boundaries

Allowed by default:

- Repository source files inside Mapetite.
- Public documentation.
- Git metadata inside the Mapetite repository.
- Command names, pass/fail status, and summarized outputs.
- Metadata-only inventory of private archive candidates, such as counts and file sizes.
- Localhost model endpoints that do not require API keys.

Requires explicit user approval:

- Reading private agent/chat/session logs.
- Extracting excerpts from private logs.
- Sending any excerpts to a cloud model.
- Browser testing the deployed frontend.
- Using location permission in the browser.

Never include:

- `.env` secrets.
- API keys or tokens.
- Browser cookies/local storage.
- Personal accounts outside Mapetite.
- Gmail, bank, school, GitHub settings, or unrelated tabs.
- Raw precise user location unless explicitly required for the tested flow.
- Destructive shell commands or automation that mutates files outside the approved workspace.

## Approval Workflow

Use progressive gates:

1. Inventory gate
   - Run metadata-only inventory.
   - Report archive counts, date ranges, file sizes, and candidate task names.
   - Do not read contents yet.

2. Scope gate
   - Ask the user to approve exact sources and date ranges.
   - Example: "Read only Mapetite Codex task logs from September 2026 that mention map, directions, place validation, or filters."

3. Excerpt gate
   - Extract small relevant snippets.
   - Redact secrets, personal data, unrelated paths, and precise location.
   - Keep the original local.

4. Summary gate
   - Summarize locally first.
   - Split output into observed evidence, agent claims, contradictions, unresolved questions, and recommended follow-up.

5. Cloud-review gate
   - If the user wants a second pass, export only the compact evidence packet.
   - User approves the packet before it leaves the machine.

## Evidence Model

Every audit item should distinguish:

- Claim: what an agent said happened.
- Evidence: command output, code diff, browser observation, test result, production response, or source file reference.
- Confidence: high, medium, or low.
- Gap: what was not verified.
- Follow-up: the smallest safe next check.

Example:

```text
Claim:
  Search map no longer teleports on pin click.

Evidence:
  Browser smoke test clicked a production Stockton marker after manual zoom.
  Popup opened and search-center marker persisted.
  Console logs had no Mapetite errors.

Confidence:
  Medium-high.

Gap:
  Did not verify with user-location marker in production because location permission was not requested.
```

## Local Tool Recommendations

### Best First Stack

Start simple:

- Ollama or LM Studio for local inference.
- A custom Node script for metadata inventory and evidence packets.
- Repomix only for tightly scoped exports, not private session archives.
- Codex CLI local/OSS mode or Aider for local code review experiments.

This keeps the workflow understandable and avoids building a mini platform before the audit process has proven value.

### Ollama

Good default for local model serving. It exposes local APIs and integrates with coding tools, including Codex CLI local/OSS workflows. Use it when you want a low-friction local model runner.

Tradeoff: model quality and context length depend heavily on hardware and model choice.

### LM Studio

Good for a GUI-first local model workflow. It can serve local models on localhost and provides OpenAI-compatible endpoints. Use it when model loading, switching, and manual inspection matter.

Tradeoff: less script-native than a plain CLI unless using its CLI/server flow.

### llama.cpp

Good when you want maximum control over GGUF models and inference settings. It can run a local OpenAI-compatible server.

Tradeoff: more setup and tuning.

### Aider

Useful for local code-editing experiments against LM Studio or other local endpoints. For this audit workflow, use Aider later for narrow code/documentation changes, not as the first evidence collector.

### Cline

Useful in an IDE when explicit local-model interaction is wanted. It supports Ollama and LM Studio style local setups, but it is heavier than a script-first audit.

### Codex CLI

Good fit if the user wants a familiar terminal coding-agent loop and local/OSS provider support. Keep it in workspace-write mode and require approvals for file edits or browser actions.

### mini-SWE-agent

Useful for contained agent experiments because it is intentionally small and can be configured for local models through LiteLLM-compatible settings.

Tradeoff: better for code tasks than privacy-preserving audit inventory.

### Repomix

Useful for packaging selected repository context into an AI-friendly file. For privacy, do not run it over private agent logs. Use a narrow config and exclude `.env`, generated data, private archives, and large artifacts.

### Serena

Promising for local semantic code navigation through language-server-backed tools. Consider later if Mapetite grows and symbol-aware local retrieval becomes valuable.

Tradeoff: adds MCP/tooling complexity that is not needed for the first MVP audit.

### Open Astra / Astra

Not recommended for the first Mapetite audit MVP.

Why: Open Astra appears aimed at durable multi-agent runtime, memory tiers, approvals, audit trails, REST APIs, and team workflows. Those are interesting later, but too much platform for the immediate need: a local, user-approved, evidence-first audit of one portfolio project.

When to revisit:

- You want durable multi-agent runs.
- You need shared team memory or tamper-evident audit trails.
- You want a local agent operations platform rather than a small repo workflow.

## First MVP Implementation Plan

Phase 1: Docs only

- Add this workflow.
- Add an evidence packet template.
- Add a roadmap template.
- Do not read private logs.

Phase 2: Metadata inventory script

- Add `scripts/agent-audit/inventory.mjs`.
- Limit scanning to approved Mapetite paths.
- Output counts, filenames, sizes, and timestamps.
- Do not read private file contents.
- Write output to `.agent-audit/inventories/`.

Phase 3: Evidence packet builder

- Add `scripts/agent-audit/export-evidence-packet.mjs`.
- Pull from git metadata, command outputs, approved excerpts, and README/docs.
- Produce Markdown.
- Include explicit redaction status.

Phase 4: Local summarizer adapter

- Add provider-neutral support for:
  - Ollama: `http://localhost:11434`
  - LM Studio: `http://localhost:1234/v1`
  - llama.cpp: configured local URL
- Summarizer should accept an evidence packet, not raw archives.
- Keep cloud export manual.

Phase 5: Optional agent integrations

- Try Codex CLI local/OSS or Aider for narrow review tasks.
- Try Serena if symbol-aware retrieval becomes useful.
- Consider Open Astra only after a simple script-first workflow is working.

## Risks And Mitigations

- Risk: private logs are read accidentally.
  - Mitigation: metadata-only inventory first; content reads require explicit source/date approval.

- Risk: local model fabricates summaries.
  - Mitigation: evidence packet requires citations to command outputs, files, or observations.

- Risk: cloud review receives too much context.
  - Mitigation: manual export packet with redaction checklist.

- Risk: local tools mutate files unexpectedly.
  - Mitigation: run audit scripts read-only by default; no destructive commands; no auto-merge; no auto-push.

- Risk: repository packaging includes secrets.
  - Mitigation: default exclusions for `.env*`, `.git`, `.agent-audit`, screenshots with personal data, and private archives.

- Risk: overengineering.
  - Mitigation: start with docs and a tiny metadata script before adopting a full agent platform.

## Commands To Add Later

Do not add these until implementation begins:

```json
{
  "scripts": {
    "agent:audit:inventory": "node scripts/agent-audit/inventory.mjs",
    "agent:audit:export": "node scripts/agent-audit/export-evidence-packet.mjs",
    "agent:audit:local-summary": "node scripts/agent-audit/summarize-local.mjs"
  }
}
```

Possible local model commands:

```bash
ollama serve
ollama run qwen3-coder
lms server start
codex --oss --local-provider ollama
aider --model lm_studio/<model-name>
```

These commands are examples for future setup, not required for the current Mapetite app.

## What Not To Build Yet

- No autonomous archive crawler.
- No auto-redaction trusted as perfect.
- No auto-merge, auto-commit, or auto-push.
- No production Mapetite app AI features.
- No browser automation outside Mapetite.
- No vector database until simple file-based retrieval proves insufficient.
- No Open Astra deployment until there is a real need for durable multi-agent infrastructure.
- No cloud upload button for private history.
- No API-key-dependent local workflow as the default path.

## Public References

- Ollama documentation: https://docs.ollama.com/
- LM Studio REST API: https://lmstudio.ai/docs/developer/rest
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Aider with LM Studio: https://aider.chat/docs/llms/lm-studio.html
- Cline local models: https://docs.cline.bot/running-models-locally/overview
- mini-SWE-agent local models: https://github.com/SWE-agent/mini-swe-agent/blob/main/docs/models/local_models.md
- Repomix guide: https://repomix.com/guide/
- Serena MCP: https://github.com/oraios/serena
- Ollama Codex CLI integration: https://github.com/ollama/ollama/blob/main/docs/integrations/codex.mdx
- Open Astra: https://github.com/open-astra/openastra
