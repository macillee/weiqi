# v0.20.0a — Next-Phase Plan

## 1. Goal

Plan the v0.20 series on top of the **v0.19 pure-helper + privacy-boundary foundation**. The plan must keep v0.19.0a's explicit principle: **consumer wiring is a separate, gated follow-up**, not a default scope. v0.20 evaluates four candidate directions, picks one or two concrete slices, and queues the implementation in the same a → d cadence used in v0.18 / v0.19.

This slice is planning only. No code change in v0.20.0a.

## 2. Constraints (carry-over from v0.18 / v0.19)

- v0.1 boundary: no login / DB / payment / online / teacher backend.
- v0.19.0d extended `FORBIDDEN_PARENT_FIELDS` (v0.18 14 keys + 12 engine / KataGo keys) — boundary is the v0.19 stable baseline.
- v0.19 helpers are pure, off by default, not yet wired into any consumer:
  - `src/lib/engine-hint.ts` — `buildEngineHint()` + `ENGINE_HINT_PROJECTION` feature flag (env → runtime → default, env wins, off by default)
  - `src/lib/child-engine-explain.ts` — `explainChildEngine()` + `validateChildEngineExplain()` (case-insensitive banned-phrase sweep)
- 638 tests across 31 files; lint / typecheck / build green.
- Multi-step gate for engine-assisted wording lives at the consumer (helper is multi-step-safe by design but does not gate itself).
- `/dev/session-summary` unchanged since v0.17 (unlinked, local-only).
- 101 problems across 6 categories (capture 25, escape 15, connect_cut 19, opening 12, life_death 15, endgame 12, mixed 3); level 1–5 (L1=10, L2=33, L3=26, L4=19, L5=13).
- Small-step cadence: 1 slice/week. One milestone per PR.

## 3. Current assets (v0.19 status)

### v0.19 pure helpers (ready, not yet wired)

| Helper | File | Output | Trigger surface |
|---|---|---|---|
| `buildEngineHint(input)` | `src/lib/engine-hint.ts` | `{ kind: "no-hint", reason }` or `{ kind: "hint", point, reason }` | flag off, low confidence, no second usable move → no-hint; otherwise a single `point` plus child-readable `reason` (≤150 chars, no banned phrase, no winrate / rank / rating) |
| `explainChildEngine(input)` | `src/lib/child-engine-explain.ts` | `LocalReviewResult` (`{ message, concept, source }`) | `source: "engine-assisted"` only on agree + medium/high; otherwise `"rule-template"` fallback; rank-aware refinement; hint-aware fallback; multi-step-safe |
| `validateChildEngineExplain(result)` | same | `true | ValidationFailure` | length ≤150, empty, banned (case-insensitive), bad-source, empty concept |

### v0.19 privacy / privacy boundary

| Asset | File | State |
|---|---|---|
| `FORBIDDEN_PARENT_FIELDS` extended with 12 engine / KataGo keys | `src/lib/parent-review-session-history.ts` | Active in PR #212; will be on `main` once #212 merges |
| `checkPrivacyBoundary()` regression tests | `parent-review-session-history.test.ts` | 63 tests in file (7 new in v0.19.0d) |
| `toParentReviewSafeAggregate()` | same | Allowlist projection, no engine field on output shape |

### v0.19 documentation

| Doc | Purpose |
|---|---|
| `docs/AI_ENGINE_UX_PLAN_v0.19.md` | v0.19.0a planning — the 4-direction evaluation |
| `docs/AI_ENGINE_BOUNDARY_QA_v0.19.md` | v0.19.0d cross-surface privacy boundary QA |
| `docs/RELEASE_NOTES_v0.19.md` | v0.19 series release notes |
| `docs/QA_CHECKLIST_v0.19.md` | v0.19 series QA checklist |

### v0.13 / v0.14 engine assets (server-only, unchanged)

| Asset | File | Status |
|---|---|---|
| `analyzeWrongMove()` | `src/lib/engine-adapter.ts` | server-only, returns `null` on any failure |
| `parseEngineConfig()` | `src/lib/engine-config.ts` | env-driven, default off |
| `getLocalEngineDiagnostics()` | `src/lib/engine-diagnostics.ts` | server-only, sanitized booleans |
| `requestEngineReview()` | `src/lib/review-actions.ts` | server action bridge |
| `getLocalReview(input, engineSignal?)` | `src/lib/ai-review.ts` | client-callable, picks rule-template / engine-assisted wording |
| `FeedbackDialog` engine-assisted caption | `src/components/problem/FeedbackDialog.tsx` | amber "本地引擎辅助" caption when `coachSource === "engine-assisted"` |
| `ProblemPlayer.handleShowCoach` | `src/components/problem/ProblemPlayer.tsx` | fires server action, updates `coachReview`, with `coachRequestId` stale guard |

## 4. v0.20 candidate directions

Four directions evaluated. **Recommended for v0.20: 4.1 (gated consumer wiring for v0.19 helpers) as the primary axis**, with **4.2 (content UX polish) as a parallel one-slice pilot**. 4.3 (infrastructure) and 4.4 (parent review) are deferred to v0.21+.

### 4.1 Gated consumer wiring for v0.19 helpers (recommended — primary)

**Concept:** Wire the v0.19 pure helpers into the existing practice flow behind feature flags. Two slices, each behind its own flag, each scope-bounded:

- **v0.20.0b** — `ProblemPlayer` consumes `explainChildEngine()` on multi-step wrong attempts when a new flag `CHILD_ENGINE_EXPLAIN` is on. The existing `coachReview` state machine extends to accept the engine-shaped message; the existing `engine-assisted` caption in `FeedbackDialog` is reused (no UI change). Off-state is byte-identical to v0.19.
- **v0.20.0c** — `ProblemPlayer` consumes `buildEngineHint()` to project a single `Highlight` of type `"hint"` after a wrong answer on the first attempt, when `ENGINE_HINT_PROJECTION` is on. The existing `GoBoard` already supports `highlights`; this is a one-line integration. Off-state is byte-identical to v0.19.

**Why this is the primary axis:**

- v0.19.0a explicitly named consumer wiring as a "gated follow-up". v0.20.0a is the right slice to evaluate and design that wiring; v0.20.0b/0c are the implementation.
- Both helpers are already unit-tested and privacy-bounded; the only remaining work is consumer integration + the new `CHILD_ENGINE_EXPLAIN` flag.
- The existing `ProblemPlayer` already has a server-action bridge and a stale-request guard, so the integration is small and safe.
- Privacy is already enforced: the helpers produce only safe-shape outputs; `checkPrivacyBoundary` rejects any engine field that ever reaches a parent-visible aggregate (v0.19.0d 7 new regression tests).

**Why this is bounded:**

- 2 slices, each ≤1 week.
- No new component. No new route. No persistence. No `StudentProgress` shape change.
- Two flags default off; off-state is byte-identical to v0.19.
- Privacy boundary already hardened (v0.19.0d).

**Why not in v0.19.0b/0c:**

- v0.19.0a plan named consumer wiring as "gated follow-up" so the helpers shipped first; the wiring is now ready to evaluate in v0.20.0a and implement in 0b/0c.

### 4.2 Content UX polish (recommended — one-slice pilot)

**Concept:** Address the lowest-coverage categories and add a small UX polish without changing scope.

- **v0.20.0d** — Endgame / Mixed problem expansion (`endgame 12 → 16`, `mixed 3 → 8`): add 4 endgame + 5 mixed human-reviewed problems, validate, and add a content review doc. Total problems 101 → 110.

**Why this is bounded:**

- One slice, ≤1 week.
- Mirrors the v0.4 / v0.5 / v0.7 / v0.15 content series (Pack B style, content-only).
- v0.1 boundary respected: local JSON, no UI change, no algorithm change.

**Why this is a one-slice pilot (not a full series):**

- v0.15.0b inventory audit already documented endgame / mixed as the lowest-coverage gaps. A single 9-problem expansion is a deliberate small step; a full Pack B is for v0.21+ if results are good.

### 4.3 Infrastructure / CI / Docker (deferred to v0.21+)

**Concept:** CI shard, e2e parallelization, Docker image slim, Playwright reporter upgrade, optional pnpm migration.

**Why deferred:**

- v0.19 series does not touch any infra file. No regression. No user-visible bug.
- Lower urgency than getting the v0.19 helpers visible to children (4.1) and addressing the lowest content gaps (4.2).
- Revisit when CI runtime or Docker image size becomes a blocker.

### 4.4 Parent review surface (deferred to v0.21+)

**Concept:** Optional parent-gated surface that consumes `toParentReviewSafeAggregate()`. Could replace or augment `/dev/session-summary`.

**Why deferred:**

- v0.17 / v0.18 explicitly chose "no parent UI, no parent gate". Reopening that decision requires a fresh planning slice (`v0.21.0a`).
- v0.19 already provides the data foundation (`buildHistoricalSummary`, `toParentReviewSafeAggregate`, privacy boundary). The "if / when" question is a product decision, not an implementation blocker.
- Revisit as `v0.21.0a` planning.

## 5. v0.20.0a recommended scope (a → d)

| Slice | Deliverable | Est. effort |
|---|---|---|
| v0.20.0a | This planning document | done |
| v0.20.0b | `ProblemPlayer` consumer wiring for `explainChildEngine()` on multi-step wrong attempts, behind `CHILD_ENGINE_EXPLAIN` feature flag (env → runtime → default, off by default); reuses existing `engine-assisted` caption in `FeedbackDialog`; off-state is byte-identical to v0.19. New `child-engine-explain.test.ts` extension to cover the wiring shape; `CoachReview` state extension is type-only (no schema migration). | 1 week |
| v0.20.0c | `ProblemPlayer` consumer wiring for `buildEngineHint()` to project a single `Highlight` of type `"hint"` after the first wrong attempt, behind `ENGINE_HINT_PROJECTION` (already defined in v0.19.0b, off by default). Reuses existing `GoBoard` `highlights` prop. Off-state is byte-identical to v0.19. New `engine-hint.test.ts` extension for the wiring shape. | 1 week |
| v0.20.0d | Endgame / Mixed problem expansion: 4 new endgame + 5 new mixed human-reviewed problems (level 3–5); `docs/CONTENT_REVIEW_v0.20.md`; 6+ new tests (problem data, level / category coverage, copy). | 3–5 days |

Total cadence: ~3 weeks at one slice/week.

## 6. Acceptance criteria (v0.20.0a → 0d)

### v0.20.0a (this slice)

- [x] This document exists, names a concrete v0.20.0b/0c/0d scope
- [x] v0.19.0a / 0b / 0c / 0d assets are inventoried and re-anchored
- [x] Each candidate direction includes: concept, rationale, scope, deferral reason
- [x] v0.20.0b / 0c are explicitly scoped to **consumer wiring behind feature flags** with off-state byte-identical to v0.19
- [x] v0.20.0d is a content-only slice (problem data + content review doc + tests); no algorithm / UI change
- [x] 4.3 (infra) and 4.4 (parent review) are named as deferred to v0.21+
- [x] Privacy boundary carry-over from v0.19.0d is explicit
- [x] No code change in this slice
- [x] Lint / typecheck / test (638 passed) / build green

### v0.20.0b acceptance (preview)

- New feature flag `CHILD_ENGINE_EXPLAIN` defined next to `ENGINE_HINT_PROJECTION` (env → runtime → default, env wins, off by default)
- `ProblemPlayer.handleShowCoach` (or a new dedicated handler) invokes `explainChildEngine()` on multi-step wrong attempts when the flag is on; the existing `engine-assisted` caption path in `FeedbackDialog` is reused
- `isMultiStepProblem()` gate is at the consumer (helper is multi-step-safe but does not gate itself)
- Off-state: byte-identical to v0.19 (no new state, no new render, no new prop)
- 6+ new tests: flag off / on, multi-step gate, single-step skip, rank refinement, fallback to rule-template, single-fire per attempt, stale `coachRequestId` guard compatibility
- Lint / typecheck / test (≥ +6 new) / build all green

### v0.20.0c acceptance (preview)

- `ProblemPlayer` projects a single `Highlight` of type `"hint"` after the first wrong attempt when `ENGINE_HINT_PROJECTION` is on
- The hint is sourced from `buildEngineHint()`'s `{ kind: "hint", point, reason }` output
- `GoBoard` `highlights` prop already supports this; no `GoBoard` change
- The overlay renders only after a wrong answer; never on correct answers; never on the second+ attempt
- Off-state: byte-identical to v0.19
- 6+ new tests: flag off / on, projection shape, single-highlight invariant, first-attempt-only, hint-point valid, no overlay when helper returns `no-hint`
- Lint / typecheck / test (≥ +6 new) / build all green

### v0.20.0d acceptance (preview)

- 9 new human-reviewed problems (4 endgame + 5 mixed), levels 3–5
- Schema / coordinate / category / level / copy validation passes
- `docs/CONTENT_REVIEW_v0.20.md` covers: per-problem review, matrix coverage delta, multi-step audit, child-facing copy review, no-data-defects conclusion
- 6+ new tests: problem data shape, level / category coverage, copy length, no banned phrase
- Lint / typecheck / test (≥ +6 new) / build all green

### v0.20.0e (release notes / QA checklist) — at the end of the v0.20 series

- `docs/RELEASE_NOTES_v0.20.md` covers v0.20.0a–0d
- `docs/QA_CHECKLIST_v0.20.md` provides review checklist
- v0.20 series closeout; queue v0.21.0a

## 7. Risks and mitigations

| Risk | Trigger | Mitigation |
|---|---|---|
| Helper output misroutes to parent path | Wiring accidentally exposes `topMoves` / engine field in `ProblemPlayer` state | v0.19.0d `checkPrivacyBoundary` extended with 12 engine keys; a new privacy regression test in v0.20.0b asserts no engine field on the wired output shape |
| Feature flag never enabled in QA | Both flags default off; nobody tests on-path | v0.20.0b / 0c each ship a manual QA checklist for both flag states; CI does not enable them |
| Stale engine signal overwrites a newer local review | v0.20.0b shares the `coachRequestId` ref pattern with v0.13d | Reuse the existing `coachRequestId.current` guard; add a regression test for it |
| Hint projection on every wrong attempt | 0c accidentally renders a hint on the second attempt | Single-attempt gate at the consumer; explicit test pins the invariant |
| Content series scope creep | 0d accidentally restructures problem data shape | 0d is content-only: append 9 problems to `problems.json`; no shape change; no algorithm change |
| Two slices regress single-step flow | 0b and 0c both touch `ProblemPlayer` | 0b/0c ship independent flags; CI runs with both off; explicit single-step regression test added in each slice |

## 8. Explicitly not in v0.20 scope

- ❌ No parent dashboard, parent settings entry, parent gate, or parent-visible engine output
- ❌ No new route, no navigation link, no end-of-session modal, no report page change
- ❌ No persistence of engine output, `topMoves`, `scoreLead`, `winrate`, or `lastAnalysis`
- ❌ No external AI / LLM / Ollama / cloud engine
- ❌ No `StudentProgress` schema change
- ❌ No Docker / package / CI / build config change
- ❌ No success-path engine reasoning (deferred to v0.21+ as `4.3` of a future planning slice)
- ❌ No pre-warming / queue analysis (deferred)
- ❌ No infra (CI shard, Docker slim, Playwright upgrade) — deferred to v0.21+
- ❌ No parent review surface (deferred to v0.21+ as `4.4`)
- ❌ No 19x19 / sparring / online / teacher backend
- ❌ No new component (overlay, dialog, page) — wiring only reuses existing `GoBoard` `highlights`, `FeedbackDialog` caption, and `ProblemPlayer` state

## 9. References

- v0.18.0a: `docs/PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18.md`
- v0.18.0b: `docs/PARENT_REVIEW_SESSION_BOUNDARY_CONTRACT_v0.18.md`
- v0.18.0d: `docs/PARENT_REVIEW_SESSION_HISTORY_QA_v0.18.md`
- v0.19.0a: `docs/AI_ENGINE_UX_PLAN_v0.19.md`
- v0.19.0b: `src/lib/engine-hint.ts`, `src/__tests__/engine-hint.test.ts`
- v0.19.0c: `src/lib/child-engine-explain.ts`, `src/__tests__/child-engine-explain.test.ts`
- v0.19.0d: `docs/AI_ENGINE_BOUNDARY_QA_v0.19.md`, `docs/RELEASE_NOTES_v0.19.md`, `docs/QA_CHECKLIST_v0.19.md`
- v0.13.0a: `docs/LOCAL_GO_ENGINE_PLAN_v0.13.md`
- v0.13.0d: `src/lib/ai-review.ts` engine-assisted branch, `src/lib/review-actions.ts`, `FeedbackDialog` engine-assisted caption
- v0.14.0c / 0d: `docs/LOCAL_ENGINE_DIAGNOSTICS_CONTRACT_v0.14.md`, `src/lib/engine-diagnostics.ts`
- v0.15.0b: `docs/CONTENT_INVENTORY_v0.15.md` (endgame / mixed coverage delta)
- v0.17.0d: `docs/RELEASE_NOTES_v0.17.md` (privacy boundary precedent for unlinked debug surface)

## 10. v0.1 boundary check

- v0.1 allows: local engine, server-side, no network, no auth, no DB, no payment, no online
- v0.20 inherits all of the above; no widening proposed
- v0.20.0b / 0c add **consumer wiring behind off-by-default flags**; off-state is byte-identical to v0.19
- v0.20.0d adds **content only** (problem data + review doc + tests); no algorithm / UI / privacy change
- Decision: **v0.20 stays inside v0.1 scope**
