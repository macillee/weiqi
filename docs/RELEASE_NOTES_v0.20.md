# v0.20 — Gated Consumer Wiring + Content Pack B

## 1. Summary

v0.20 closes the v0.19 "pure helpers" foundation by wiring `explainChildEngine()` and `buildEngineHint()` into `ProblemPlayer` behind independent feature flags, and adds a content-only Pack B pilot with 9 new endgame/mixed problems at levels 3–5.

Key principles carried through v0.20:

- **Gated consumer wiring.** v0.20.0b and v0.20.0c integrate the v0.19 helpers into `ProblemPlayer` behind `CHILD_ENGINE_EXPLAIN` and `ENGINE_HINT_PROJECTION` feature flags, both off by default. Off-state is byte-identical to v0.19.
- **Privacy by construction.** v0.19.0d's `FORBIDDEN_PARENT_FIELDS` with 16 engine / KataGo keys is preserved end-to-end. The v0.20.0b/0c wiring paths pass honest low-confidence signals so the helpers' `source` gate renders `rule-template` without a real engine payload.
- **Content-only Pack B.** v0.20.0d appends 9 human-reviewed problems (4 endgame + 5 mixed) to `problems.json` at levels 3–5. No algorithm, UI, or schema change.
- **No parent-visible engine output.** No new route, no new page, no persistence, no telemetry. The `/dev/session-summary` page is unchanged from v0.17.

## 2. What changed

| Slice | Deliverable | PR |
|---|---|---|
| v0.20.0a | `docs/NEXT_PHASE_PLAN_v0.20.md` — re-anchors v0.19 helpers and v0.19.0d privacy boundary, evaluates 4 candidate directions, scopes v0.20 series to gated consumer wiring + content pilot. Planning-only, no code change. | #213 |
| v0.20.0b | `ProblemPlayer.tsx` — `handleShowChildCoach()` routes "请老师帮忙" through `explainChildEngine()` when `CHILD_ENGINE_EXPLAIN` flag is on and problem is multi-step. Stale-async guard, validator defense-in-depth. 16 new tests (flag contract + wiring + privacy regression). | #214 |
| v0.20.0c | `ProblemPlayer.tsx` — `engineHint` state + projection effect fires `buildEngineHint()` on first wrong attempt when `ENGINE_HINT_PROJECTION` flag is on, merges result into `GoBoard` highlights as `hint` type. 7 new tests (flag off/on, reset, highlight-type regression). | #215 |
| v0.20.0d | `problems.json` — 9 new problems (END-013..016 level 3–5 endgame + MIX-004..008 level 3–5 mixed). Library 101 → 110. `docs/CONTENT_REVIEW_v0.20.md` covers per-problem review. 7 new tests. | #216 |

### File inventory

New files added in v0.20.0a–0d:

- `docs/NEXT_PHASE_PLAN_v0.20.md` — v0.20.0a planning
- `docs/CONTENT_REVIEW_v0.20.md` — v0.20.0d per-problem content review
- `src/__tests__/ProblemPlayer.multi-step.test.tsx` — v0.20.0b/0c wiring tests (23 tests)

Modified files:

- `src/components/problem/ProblemPlayer.tsx` — v0.20.0b `handleShowChildCoach()` + v0.20.0c `engineHint` projection
- `src/data/problems.json` — v0.20.0d Pack B (9 new problems)
- `src/__tests__/problems.test.ts` — v0.20.0d Pack B regression tests
- `e2e/demo.spec.ts` — problem count updated for 110-library
- `docs/TASKS.md` — current phase and strategy entries updated for v0.20.0a–0d

## 3. What did not change

- No parent dashboard, parent settings entry, parent gate, or child-facing summary UI
- No new route, no navigation link, no end-of-session modal, no report page integration
- No persistence of engine output, `topMoves`, `scoreLead`, `winrate`, or `lastAnalysis`
- No `StudentProgress` schema change
- No Supabase schema, database writes, or auth
- No API route, Server Action change, telemetry, analytics, or external service call
- No new AI / Ollama / KataGo integration
- No package, Docker, CI, or build config change
- No selection logic, recommendation algorithm, practice flow, wrong-book, report, or level progression change
- No `FeedbackDialog` change
- `/dev/session-summary` unchanged from v0.17

## 4. Feature flag summary

| Flag | Default | Consumer slice | Behavior when off |
|---|---|---|---|
| `CHILD_ENGINE_EXPLAIN` | off | v0.20.0b | "请老师帮忙" routes through existing `handleShowCoach()` (rule-template); single-step always uses `handleShowCoach()` |
| `ENGINE_HINT_PROJECTION` | off | v0.20.0c | No hint highlight projected; rendered highlights are byte-identical to v0.19 |

Both flags resolve via `env → runtime setter → default` (env wins). Off-state is byte-identical to v0.19 for both flags.

## 5. Content Pack B inventory

| ID | Category | Level | Type | Learning goal |
|---|---|---|---|---|
| END-013 | endgame | 3 | single-step | Edge connection |
| END-014 | endgame | 4 | single-step | Corner territory |
| END-015 | endgame | 4 | single-step | Center connection (cross shape) |
| END-016 | endgame | 5 | single-step | Territory reduction |
| MIX-004 | mixed | 3 | single-step | Connection |
| MIX-005 | mixed | 4 | single-step | Cut |
| MIX-006 | mixed | 4 | single-step | Extension (multi-answer: 4,3 + 5,3) |
| MIX-007 | mixed | 5 | single-step | Connection |
| MIX-008 | mixed | 5 | single-step | Block connection |

Final library: **110 problems** across 7 categories, levels 1–5.

## 6. Testing and validation

| Area | Count | Scope |
|---|---|---|
| `ProblemPlayer.multi-step.test.tsx` (v0.20.0b/0c) | 23 | flag contract, wiring, privacy regression, highlight-type regression |
| `problems.test.ts` (v0.20.0d) | 7 | library count 110, ID existence, level/category constraints, no duplicate coordinates, answers on empty intersections, copy length, no banned phrase |
| **Total in project** | **667** | **31 test files** |

All checks pass:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 667 passed (31 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |

## 7. Known limitations

- Both feature flags (`CHILD_ENGINE_EXPLAIN`, `ENGINE_HINT_PROJECTION`) default off. The on-path behavior is only observable when explicitly enabled via env or runtime setter.
- v0.20.0b only wires `explainChildEngine()` for multi-step problems. Single-step problems continue to use the existing `handleShowCoach()` path regardless of the flag.
- v0.20.0c projects a single hint highlight from `buildEngineHint()`, but the helper returns `no-hint` when `topMoves` is undefined (no real engine payload). The hint highlight is only visible when a real engine provides `topMoves` data.
- Pack B adds 9 problems but does not wire them into `chapters.ts` or daily-practice rotation. They are reachable via `/demo` and spaced review only. Chapter wiring is a future concern.
- No pre-warming, no success-path engine reasoning, no engine-aware re-grade — all deferred to v0.21+.
- No `/dev/session-summary` migration to `buildHistoricalSummary()` from v0.18.

## 8. Recommended next phase

**v0.21.0a — Next-Phase Plan (planning-only slice)**

With the v0.20 consumer wiring in place, the next direction candidates are:

- **Feature flag enablement / QA**: enable one or both flags in a staging environment, run manual QA, verify on-path behavior with real engine data.
- **Chapter wiring for Pack B**: wire the 9 new v0.20.0d problems into `chapters.ts` and daily-practice rotation.
- **Infrastructure**: CI shard, e2e parallelization, Docker image slim, Playwright reporter upgrade.
- **Parent review surface** (deferred since v0.18.0e): optional parent-gated surface that consumes `toParentReviewSafeAggregate()`. Requires explicit gate decision before any consumer slice.

The next phase should be a planning-only slice (`v0.21.0a`) that evaluates these candidates and writes the slice plan before any implementation code is written.
