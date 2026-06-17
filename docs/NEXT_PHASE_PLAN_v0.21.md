# v0.21.0a — Next-Phase Plan

## 1. Goal

Plan the v0.21 series on top of the **v0.20 gated consumer wiring + Content Pack B foundation**. The plan must evaluate four candidate directions, pick the conservative primary path, and queue the implementation in the same a → d cadence used in v0.18 / v0.19 / v0.20.

This slice is planning only. No code change in v0.21.0a.

## 2. Constraints (carry-over from v0.18 / v0.19 / v0.20)

- v0.1 boundary: no login / DB / payment / online / teacher backend.
- v0.19.0d extended `FORBIDDEN_PARENT_FIELDS` (v0.18 14 keys + 16 engine / KataGo keys) — boundary is the v0.19/v0.20 stable baseline.
- v0.20 consumer wiring is in place behind two default-off feature flags:
  - `CHILD_ENGINE_EXPLAIN` — v0.20.0b wired `explainChildEngine()` into `ProblemPlayer` for multi-step wrong attempts; honest low-confidence signal; `source` remains `rule-template` without real engine payload.
  - `ENGINE_HINT_PROJECTION` — v0.20.0c wired `buildEngineHint()` projection; inert without real `topMoves` data.
- 667 tests across 31 files; lint / typecheck / build green.
- 110 problems across 7 categories (capture 25, escape 15, connect_cut 19, opening 12, life_death 15, endgame 16, mixed 8); level 1–5 (L1=10, L2=33, L3=28, L4=23, L5=16).
- Pack B (9 problems) is not wired into `chapters.ts` or daily-practice rotation; reachable via `/demo` and spaced review only.
- `/dev/session-summary` unchanged since v0.17 (unlinked, local-only).
- Small-step cadence: 1 slice/week. One milestone per PR.

## 3. Current assets (v0.20 status)

### v0.20 consumer wiring (in place, flags off by default)

| Flag | Default | Consumer slice | State when off |
|---|---|---|---|
| `CHILD_ENGINE_EXPLAIN` | off | v0.20.0b | "请老师帮忙" routes through `handleShowCoach()` (rule-template); byte-identical to v0.19 |
| `ENGINE_HINT_PROJECTION` | off | v0.20.0c | No hint highlight projected; byte-identical to v0.19 |

### v0.20 content Pack B (in place, not wired)

| Category | Before v0.20 | After v0.20 | Delta |
|---|---|---|---|
| endgame | 12 | 16 | +4 |
| mixed | 3 | 8 | +5 |
| **Total** | **101** | **110** | **+9** |

All 9 Pack B problems at levels 3–5. Reachable via `/demo` and spaced review, but **not** in daily-practice rotation or chapter levels.

### v0.19 pure helpers (unchanged since v0.19)

| Helper | File | Status |
|---|---|---|
| `buildEngineHint()` | `src/lib/engine-hint.ts` | Pure, tested (15 tests), wired in v0.20.0c behind flag |
| `explainChildEngine()` | `src/lib/child-engine-explain.ts` | Pure, tested (23 tests), wired in v0.20.0b behind flag |
| `validateChildEngineExplain()` | same | Case-insensitive banned-phrase sweep |

### v0.19/v0.20 privacy boundary (unchanged)

| Asset | File | State |
|---|---|---|
| `FORBIDDEN_PARENT_FIELDS` with 30 keys (14 v0.18 + 16 engine) | `parent-review-session-history.ts` | Merged in PR #212 (v0.19.0d) |
| `checkPrivacyBoundary()` regression tests | `parent-review-session-history.test.ts` | 63 tests in file |
| `toParentReviewSafeAggregate()` | same | Allowlist projection, no engine field on output |

### v0.13 / v0.14 engine assets (server-only, unchanged)

| Asset | File | Status |
|---|---|---|
| `analyzeWrongMove()` | `engine-adapter.ts` | Server-only, returns `null` on any failure |
| `parseEngineConfig()` | `engine-config.ts` | Env-driven, default off |
| `requestEngineReview()` | `review-actions.ts` | Server action bridge |
| `getLocalReview(input, engineSignal?)` | `ai-review.ts` | Client-callable, rule-template / engine-assisted |

### v0.20 documentation

| Doc | Purpose |
|---|---|
| `docs/NEXT_PHASE_PLAN_v0.20.md` | v0.20.0a planning |
| `docs/CONTENT_REVIEW_v0.20.md` | v0.20.0d per-problem content review |
| `docs/RELEASE_NOTES_v0.20.md` | v0.20 series release notes |
| `docs/QA_CHECKLIST_v0.20.md` | v0.20 series QA checklist |

## 4. v0.21 candidate directions

Four directions evaluated. **Recommended for v0.21: 4.1 (Pack B chapter/daily-practice wiring) as the primary first slice**, with the other directions deferred or evaluated as follow-up slices.

### 4.1 Pack B chapter/daily-practice wiring (recommended — first slice)

**Concept:** Wire the 9 v0.20.0d Pack B problems into `chapters.ts` so they appear in chapter levels and daily-practice rotation.

- **v0.21.0b** — Wire END-013..016 into the existing `endgame` chapter (or new levels within it); wire MIX-004..008 into the existing `mixed` chapter. Update `getAllProblemIds()` to include the new wired IDs. No selection algorithm change; daily practice automatically picks up newly wired problems.

**Why this is the primary first slice:**

- **Highest immediate value.** Pack B problems are reviewed and ready but currently unreachable in the main flow. Wiring them unlocks 9 new problems for daily practice and chapter progression.
- **Lowest risk.** Content wiring is a proven pattern (v0.8.0b/0c/0d wired 53 problems). No new algorithm, no new component, no new route, no privacy concern.
- **Testable.** Existing chapter/practice/E2E patterns cover the wiring. E2E test count for demo may need updating.
- **v0.1 boundary preserved.** No schema change, no persistence, no AI/engine change.
- **Conservative.** Keeps v0.20 feature flags default-off; does not introduce new engine/AI behavior.

**Why this is bounded:**

- 1 slice, ≤1 week.
- Changes only `src/lib/chapters.ts` (and possibly a test count update in `problems.test.ts`).
- No `ProblemPlayer`, `FeedbackDialog`, `practice.ts`, or any UI change.

**Risk:** Very low. Chapter wiring has been done 3 times before (v0.8.0b/0c/0d) with no regressions.

### 4.2 Feature flag enablement / QA with real engine payload

**Concept:** Enable `ENGINE_HINT_PROJECTION` or `CHILD_ENGINE_EXPLAIN` in a staging / manual QA environment with a real KataGo engine to verify the on-path behavior.

- **v0.21.0x** — Manual QA protocol: enable one flag, run through 5–10 problems with real engine, verify hint highlight appears, verify coach message upgrades from `rule-template` to `engine-assisted` when confidence is high. Document findings.

**Why this is deferred:**

- Requires a running KataGo engine (not available in all environments).
- The current off-state is safe and tested; enabling the flag is a QA activity, not a code change.
- Should be done after content wiring (4.1) to avoid mixing content + engine QA in one slice.
- Privacy risk is low (helpers already bounded) but on-path QA is valuable before any flag is turned on in production.

**Risk:** Medium. Engine availability is environment-dependent. On-path QA may reveal UX issues that need design iteration.

### 4.3 Infrastructure hardening

**Concept:** CI sharding, E2E parallelization, Docker image slimming, Playwright reporter/logging improvements.

- **v0.21.0x** — One or more slices targeting CI speed, Docker image size, or E2E reliability.

**Why this is deferred:**

- Current CI pipeline is green and functional (lint/typecheck/test/build/E2E/Docker).
- Infrastructure improvements have no child-facing value.
- Should be done when CI becomes a bottleneck (not currently the case).

**Risk:** Low. Infrastructure changes are isolated and do not affect product behavior.

### 4.4 Parent review surface

**Concept:** Consume `toParentReviewSafeAggregate()` behind explicit parent gating to show session summaries to parents.

- **v0.21.0x** — Planning + implementation of a parent-gated surface (Settings entry, `/dev/session-summary` migration, or new route).

**Why this is deferred:**

- v0.18.0e and v0.20.0a both explicitly deferred this direction.
- Requires an explicit gate decision (who sees it, how it's accessed, what data is shown).
- The `/dev/session-summary` debug page exists but is unlinked and developer-only.
- Privacy risk is higher than other directions (parent-visible data surface).

**Risk:** Medium-high. Parent-facing data surfaces require careful design, wording review, and privacy QA.

## 5. Evaluation matrix

| Criterion | 4.1 Pack B wiring | 4.2 Flag enablement/QA | 4.3 Infrastructure | 4.4 Parent review |
|---|---|---|---|---|
| Product/user value | **High** — unlocks 9 new problems for daily practice | Medium — verifies existing feature | Low — no child-facing change | Medium — parent insight |
| Runtime risk | **Very low** — proven pattern, no algorithm change | Medium — engine dependency, UX unknowns | Low — CI/Docker only | Medium-high — new data surface |
| Privacy / child-safety risk | **None** — content only | Low — helpers already bounded | None | Medium — parent-visible data |
| v0.1 boundary compatibility | **Full** | Full | Full | Requires gate decision |
| Test burden | **Low** — existing patterns, possible E2E update | Medium — manual QA protocol needed | Low | High — new QA surface |
| Slice size / reviewability | **Small** — 1 file change | Medium — QA protocol + possible fixes | Variable | Large — planning + implementation |
| Local-only feasibility | **Full** | Partial — needs KataGo binary | Full | Full |

## 6. Recommended v0.21 path

**Primary: 4.1 — Pack B chapter/daily-practice wiring (v0.21.0b)**

This is the conservative, low-risk, high-value first slice. It unlocks the v0.20.0d content investment and follows the proven v0.8 wiring pattern.

**Follow-up candidates (to be evaluated in v0.21.0c planning):**

- 4.2 — Feature flag enablement / QA (when KataGo is available)
- 4.4 — Parent review surface (if gate decision is made)
- 4.3 — Infrastructure (when CI becomes a bottleneck)

## 7. v0.21 slice plan

| Slice | Deliverable | Scope |
|---|---|---|
| v0.21.0a | This planning document | docs-only |
| v0.21.0b | Pack B chapter/daily-practice wiring | `chapters.ts` + test count update |
| v0.21.0c | Next-phase planning (or follow-up slice) | TBD based on 4.2/4.3/4.4 evaluation |

## 8. Explicitly not in v0.21 scope (yet)

- ❌ No feature flag enablement or on-path engine QA (deferred to v0.21.0c+)
- ❌ No parent dashboard, parent settings entry, parent gate, or parent-visible engine output
- ❌ No new route, no navigation link, no end-of-session modal, no report page change
- ❌ No persistence of engine output, `topMoves`, `scoreLead`, `winrate`, or `lastAnalysis`
- ❌ No `StudentProgress` schema change
- ❌ No Supabase schema, database writes, or auth
- ❌ No API route, Server Action change, telemetry, analytics, or external service call
- ❌ No new AI / Ollama / KataGo integration
- ❌ No package, Docker, CI, or build config change (unless 4.3 is selected)
- ❌ No selection logic, recommendation algorithm, or practice flow change
- ❌ No `ProblemPlayer` / `FeedbackDialog` / UI change
- ❌ No problem data addition (Pack B is the latest; Pack C deferred)
- ❌ No unreviewed child-facing AI/engine text

## 9. Acceptance criteria (v0.21.0a)

- [x] This document exists
- [x] v0.20 baseline is summarized accurately (flags, content, privacy, tests)
- [x] 4 candidate directions are evaluated with a decision matrix
- [x] One primary v0.21 path is recommended with justification
- [x] Explicit non-goals and forbidden changes are stated
- [x] No runtime code, tests, problem data, routes, schema, package, Docker, CI, telemetry, persistence, or behavior changes
