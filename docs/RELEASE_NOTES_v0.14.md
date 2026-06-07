# v0.14 Release Notes — Engine-Assisted Review UX Evaluation / Local Diagnostics

## 1. Summary

v0.14 evaluated and stabilized the engine-assisted review UX and local diagnostics infrastructure. This phase did **not** add child-facing diagnostics UI. Diagnostics are parent/developer scoped and server-only. KataGo remains optional and disabled by default. The rule/template coach remains the fallback. No external AI API, telemetry, or analytics was added.

Key outcomes:

- UX evaluation plan and manual observation checklist for engine-assisted review.
- Local engine diagnostics contract and server-only implementation.
- Diagnostics output is sanitized (no raw paths, child data, board positions, winrate, or scoreLead).
- 14 diagnostics unit tests across 1 file.

## 2. Delivered Slices

| Slice | Focus | PR |
|---|---|---|
| v0.14.0a | Engine-assisted review UX evaluation / local engine diagnostics plan | #156 |
| v0.14.0b | Manual UX observation checklist for engine-assisted review | #158 |
| v0.14.0c | Local engine diagnostics contract, no UI | #160 |
| v0.14.0d | Optional server-only diagnostics helper | #162 |
| v0.14.0e | Stabilization / release notes / QA checklist | #TBD |

## 3. Product Behavior Changes

- **No new child-facing UX** was introduced in v0.14.
- Existing engine-assisted review remains feature-flagged from v0.13.
- Existing rule/template fallback remains unchanged.
- Manual UX observation checklist (`docs/UX_OBSERVATION_CHECKLIST_v0.14.md`) gives the parent a structured way to evaluate disabled/unavailable/optional available engine states.
- Diagnostics helper (`getLocalEngineDiagnostics()`) is not called from practice UI — it is server-only for developer/parent scoped use.

## 4. Technical Behavior

- `src/lib/engine-diagnostics.ts` is **server-only** (`import "server-only"`).
- `getLocalEngineDiagnostics()` returns a `LocalEngineDiagnostics` object with:
  - `status`: `"disabled"` | `"enabled-unavailable"` | `"available"` | `"error"`
  - `reasons`: array of `EngineDiagnosticsReason` strings
  - `config`: sanitized booleans only (never raw file paths)
  - `checkedAt`: ISO timestamp
  - `lastAnalysis`: `EngineLastAnalysisDiagnostics` or `undefined` — maps to `not-run`, `rule-template` (timeout/malformed/process-error), or `engine-assisted` (success)
- Output does **not** include raw local paths, child data, board positions, moves, raw engine output, winrate, or scoreLead.
- The helper does **not** call `analyzeWrongMove()`, spawn KataGo, or use `child_process`.
- Tests use mocks/injected config/availability/clock and do not require a real KataGo binary.

## 5. Local Diagnostics Scope

- Diagnostics are **local-only** and **parent/developer scoped**.
- No UI or API route was added.
- No Server Action was added.
- No telemetry, analytics, persistence, external network calls, or Supabase dependency was added.
- No `NEXT_PUBLIC_*` diagnostics flags were added.
- Future diagnostics UI, if ever added, requires a separate scoped task.

## 6. Validation Baseline

Latest known validation from PR #162 CI:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | All tests pass |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed |
| `docker compose build` | Exit 0 |

## 7. Non-Goals / Unchanged Scope

- No child-facing diagnostics UI.
- No settings page or diagnostics page.
- No API route or Server Action for diagnostics.
- No logging code added.
- No telemetry or analytics.
- No external AI API or Ollama/local LLM.
- No KataGo binary, model, or config committed.
- No problem data changes.
- No Supabase or server progress changes.
- No Docker or CI changes.
- No payment, teacher/admin, leaderboard, board-size expansion, SGF, or multiplayer features.
