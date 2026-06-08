# v0.15 Release Notes — Content Quality / Intermediate Problem Expansion

## 1. Summary

v0.15 shifted focus from AI/engine/diagnostics back to content quality and intermediate learner progression. This phase intentionally stepped away from more engine/diagnostics/UI work to address the core product need: **better intermediate-level content for children who have studied Go for about one year**.

Key characteristics:

- **Target learner**: child with about one year of Go study.
- **Emphasis**: level 3–5 problems, not introductory level 1–2 content.
- **No external AI API dependency** — all content is human-reviewed.
- **No KataGo requirement** for content use.
- **Local-first/offline practice** remains intact — no new runtime dependencies.

## 2. Delivered Slices

| Slice | Focus | PR |
|---|---|---|
| v0.15.0a | Content quality / intermediate problem expansion plan | #166 |
| v0.15.0b | Content inventory / gap audit for level 3–5 problems | #168 |
| v0.15.0c | Intermediate Problem Pack A (14 new problems) | #170 |
| v0.15.0d | Pack A validation and regression | #172 |
| v0.15.0e | Stabilization / release notes / QA checklist | (this PR) |

## 3. Product Behavior Changes

- **Problem library increased** from 87 to **101 problems**.
- **Level 3–5 count increased** from 44 to **58**.
- **First `mixed` category problems** added (3 problems: MIX-001, MIX-002, MIX-003).
- **3 new multi-step Pack A problems** added: CAP-022, CC-018, MIX-001.
- **No runtime selection logic changed** — daily practice, level calibration, spaced review, and multi-step gating are unchanged.
- **No practice UI changed** — ProblemPlayer, FeedbackDialog, HintPanel, and board components are unchanged.
- **No coach/engine/diagnostics behavior changed** — rule/template coach and engine-assisted review are unchanged.
- **Existing local anonymous mode** remains unchanged.

## 4. Pack A Content Summary

### Pack A Matrix

| Category | L3 | L4 | L5 | Total | Multi-step |
|---|---:|---:|---:|---:|---:|
| capture | 0 | 1 | 1 | 2 | 1 |
| escape | 0 | 1 | 1 | 2 | 0 |
| connect_cut | 0 | 1 | 1 | 2 | 1 |
| life_death | 0 | 1 | 0 | 1 | 0 |
| opening | 1 | 1 | 0 | 2 | 0 |
| endgame | 1 | 1 | 0 | 2 | 0 |
| mixed | 1 | 1 | 1 | 3 | 1 |
| **Total** | **3** | **7** | **4** | **14** | **3** |

### Pack A IDs

- **Capture**: CAP-021, CAP-022
- **Escape**: ESC-013, ESC-014
- **Connect/Cut**: CC-017, CC-018
- **Life/Death**: LD-013
- **Opening**: OP-011, OP-012
- **Endgame**: END-011, END-012
- **Mixed**: MIX-001, MIX-002, MIX-003

## 5. Validation Baseline

Latest known validation from PR #172 CI:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | All 492 tests pass |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed |
| `docker compose build` | Exit 0 |

Additional validation outcomes:

- Pack A validation report found **no data defects**.
- Regression tests verify total count **101** and L3–5 count **58**.
- Demo smoke expectation was updated to 101 in v0.15.0c.

## 6. Non-Goals / Unchanged Scope

- No new runtime selection logic.
- No UI changes.
- No settings page.
- No diagnostics page.
- No engine/diagnostics behavior changes.
- No external AI API.
- No Ollama/local LLM.
- No KataGo binary/model/config.
- No telemetry or analytics.
- No Supabase/server progress changes.
- No Docker/CI changes.
- No package dependency changes.
- No payment, teacher/admin, leaderboard, board-size expansion, SGF, or multiplayer.

## 7. Known Limitations / Follow-Up Notes

- Count/schema tests do not prove tactical correctness by themselves — human review remains required for future content packs.
- Some opening/endgame positions may have reasonable alternatives; future content should avoid ambiguity or encode acceptable alternatives explicitly.
- Pack A is intentionally small enough for thorough human review (14 problems).
