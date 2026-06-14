# v0.19.0a — Local AI / Engine UX Next-Phase Plan

## 1. Goal

Plan the next phase of the **child-facing local AI / engine experience**, building on the v0.13 / v0.14 engine assets and the v0.18 privacy contract. This slice is planning only.

The planning constraint for v0.19 is to **lock the engine experience to pure helpers, contracts, and feature-flagged toggles** — not to commit to any specific component or page-level UI integration. v0.19 must stay strictly local, optional, off-by-default, and must not widen v0.1 scope (no parent gate, no parent UI, no persistence, no telemetry).

## 2. Constraints (carry-over from v0.13 / v0.14 / v0.18)

- v0.1 boundary: no login / DB / payment / online / teacher backend.
- Engine is local, optional, server-only (`engine-adapter.ts`, `engine-config.ts`, `engine-diagnostics.ts` are `import "server-only"`).
- `ai-review.ts` (client-callable) currently consumes an `EngineReviewSignalLike` `{ confidence, agreesWithAuthoredAnswer }`. It is the only engine-aware surface visible to the child today.
- Privacy boundary inherited from v0.18: `parent-review-session-history.ts` `FORBIDDEN_PARENT_FIELDS` includes engine metrics. Engine signals must not leak to `/report`, `/wrong-book`, localStorage, or `/dev/session-summary`.
- Child wording rules: short, concrete, non-judgmental, no winrate / level / rank language, ≤150 chars, banned phrases list enforced by `validateReviewOutput()`.

## 3. Current assets (v0.13 / v0.14 status)

| Asset | Location | Surface | Server-only? | Notes |
|---|---|---|---|---|
| `analyzeWrongMove()` | `src/lib/engine-adapter.ts` | server | yes | Pure async; returns `null` on disabled / missing / timeout / malformed / error |
| `parseEngineConfig()` | `src/lib/engine-config.ts` | server | yes | env-based, default visits=300, timeout=5000ms |
| `getLocalEngineDiagnostics()` | `src/lib/engine-diagnostics.ts` | server | yes | Sanitized booleans; last-analysis lifecycle; reason codes |
| `requestEngineReview()` | `src/lib/review-actions.ts` | server action | yes | Bridge: client → server action → `analyzeWrongMove()` |
| `getLocalReview(input, engineSignal?)` | `src/lib/ai-review.ts` | client | no | Picks rule-template or engine-assisted message; deterministic hash-based selection |
| `FeedbackDialog` "本地引擎辅助" label | `src/components/problem/FeedbackDialog.tsx` | client | no | Subtle amber caption when `coachSource === "engine-assisted"` |
| `ProblemPlayer.handleShowCoach` | `src/components/problem/ProblemPlayer.tsx` | client | no | Calls server action, updates `coachReview` only if `coachRequestId` still current |
| Stale-request guard | `coachRequestId.current` ref | client | no | Prevents engine signal from overwriting a newer local review (v0.13d) |

Engine-aware behavior **today** is one path only: when the child clicks "请老师帮忙" on a wrong answer, the local rule-template message appears immediately, then is replaced (if engine returns, agrees, confidence ≠ low) with an engine-assisted message. That is the entire visible surface.

## 4. v0.19 candidate UX directions

Four directions evaluated. **Recommended for v0.19:** 4.1 (engine hint projection, **pure-helper-first**), 4.2 (multi-step wrong-move explanation). **Deferred to gated follow-up:** component / page-level UI integration of any engine-aware surface.

### 4.1 Engine hint projection (recommended as a pure-helper first slice)

**Concept:** A pure TS helper that, given the current engine signal and the problem state, derives a *single* next-best-move `Point` (with category-anchored rationale text) for use as a child-facing hint.

**Pure-helper contract (target of v0.19.0b):**

```ts
// src/lib/engine-hint.ts (proposed)
type EngineHintInput = {
  problem: Problem;
  attemptedMove: { x: number; y: number };
  authoredAnswer: { x: number; y: number };
  signal: EngineReviewSignalLike;
  topMoves?: ReadonlyArray<{ x: number; y: number; visits?: number; scoreLead?: number }>;
};

type EngineHintOutput =
  | { kind: "no-hint" } // disabled, low confidence, no usable second move, etc.
  | { kind: "hint"; point: { x: number; y: number }; reason: string };
```

**Behavior contract:**

- Returns `kind: "no-hint"` when:
  - feature flag is off (consumer responsibility)
  - signal confidence is `"low"`
  - no second `topMoves` entry exists
  - the second entry equals the `attemptedMove` or the `authoredAnswer`
- Returns `kind: "hint"` otherwise, with:
  - a single `point`
  - a category-anchored, ≤150-char child-friendly `reason` that passes `validateReviewOutput()`-style rules (no winrate, no rank, no judgement)

**Why pure-helper first:** the helper is the unit-testable contract. UI consumers (overlay, dialog copy, side panel, future "thinking about…" indicator) can be designed and approved independently, behind their own flags, after the contract is stable. v0.19.0b does not commit to which consumer — only to the helper, its tests, and the feature-flag contract.

**Out of scope for v0.19.0b (gated follow-up):**

- Any new component (e.g. an `EngineHintOverlay`) — design and implement only after v0.19.0b contract is reviewed
- Any change to `ProblemPlayer` flow / `FeedbackDialog` / any page
- Any new prop wiring on existing components

### 4.2 Wrong-move engine explanation for multi-step problems (recommended as a pure-helper first slice)

**Concept:** A pure TS helper that, given the current engine signal and the attempted move on a multi-step problem, produces a `LocalReviewResult`-shaped child-readable explanation (1–2 Chinese sentences) that complements or replaces the rule-template coach.

**Pure-helper contract (target of v0.19.0c):**

```ts
// src/lib/child-engine-explain.ts (proposed)
type ChildEngineExplainInput = {
  problem: Problem;
  attemptedMove: { x: number; y: number };
  authoredAnswer: { x: number; y: number };
  usedHint: boolean;
  signal: EngineReviewSignalLike;
  attemptedMoveRank?: number | null;
  authoredMoveRank?: number | null;
};

type ChildEngineExplainOutput = LocalReviewResult; // reuses existing shape
```

**Behavior contract:**

- Always returns a `LocalReviewResult` (never throws)
- `source` is `"engine-assisted"` only when the input signal agrees with the authored answer and confidence is `medium` or `high`; otherwise falls back to `"rule-template"`
- `message` length ≤150 chars, no banned phrases, no winrate / rank language (extend `validateReviewOutput()` or add a parallel validator)
- When `isMultiStepProblem(problem)` is `false`, the helper must still produce a valid output but the *consumer* is responsible for not calling it — the helper itself does not gate on multi-step; that gate lives at the consumer

**Why pure-helper first:** the rule-template / engine-assisted wording must be unit-tested and reviewed before any consumer is wired. v0.19.0c is the helper + tests + validator extension. Wiring into `ProblemPlayer.handleShowCoach` is a gated follow-up.

**Out of scope for v0.19.0c (gated follow-up):**

- Any change to `ProblemPlayer` / `FeedbackDialog` / server action bridge
- Any new feature flag (the engine-aware caption already exists in `FeedbackDialog`; turning it on/off is a separate decision)

### 4.3 Success-path engine reasoning (deferred)

**Concept:** When the child answers correctly, show a short engine validation ("引擎也认为这是最强的一步").

**Why deferred:** Requires consuming a second engine call (correct-position analysis) on the success path. Heavier cost, child could read it as a score, and the marginal value over the existing `successMessage` is low. Revisit after v0.19.

### 4.4 Pre-warming / queue analysis (deferred)

**Concept:** Pre-analyze the next problem in the queue to warm the engine.

**Why deferred:** requires a queue, debouncing, and a cancel path. Synchronous-on-click architecture is the v0.19 baseline. Revisit after v0.19.

## 5. v0.19.0a recommended scope (a → d)

| Slice | Deliverable | Notes |
|---|---|---|
| v0.19.0a | This planning document | planning only — no code |
| v0.19.0b | Engine hint projection **pure helper** + tests + feature-flag contract | NO component / page / `ProblemPlayer` change in this slice. UI consumer is a separate, gated follow-up. |
| v0.19.0c | Wrong-move engine explanation for multi-step **pure helper** + tests + extended validator | NO consumer wiring in this slice. Wiring is a separate, gated follow-up. |
| v0.19.0d | Engine privacy boundary hardening / QA: regression tests confirming engine fields never reach `/report`, `/wrong-book`, localStorage, or `/dev/session-summary`; `docs/AI_ENGINE_BOUNDARY_QA_v0.19.md`; release notes and stabilization | closes the v0.19 series |

Total cadence: ~3 weeks at one slice/week.

## 6. Acceptance criteria (v0.19.0a → 0d)

### v0.19.0a (this slice)

- [x] This document exists, names a concrete v0.19.0b/0c/0d scope
- [x] v0.13 / v0.14 / v0.18 assets are inventoried and re-anchored
- [x] Each candidate direction includes: inputs, outputs, deferral reason if not selected
- [x] v0.19.0b and v0.19.0c are explicitly scoped to **pure helpers, contracts, tests, and feature-flag contract**; component / page / `ProblemPlayer` UI integration is named as a gated follow-up, not as part of the planning slice
- [x] Privacy boundary carry-over from v0.18 is explicit
- [x] No code change in this slice
- [x] Lint / typecheck / test (583 passed) / build green

### v0.19.0b acceptance (preview)

- `src/lib/engine-hint.ts` exists with `EngineHintInput` / `EngineHintOutput` types and a pure `buildEngineHint()` function
- Feature-flag contract: a documented `ENGINE_HINT_PROJECTION` env (or equivalent module-level constant) defaults to off; helper treats off the same as `kind: "no-hint"`
- 8–12 unit tests cover: flag off, low confidence, no second move, second-move-equals-attempted, second-move-equals-authored, multi-step input, single-step input, empty / malformed signal
- **No new component. No change to `ProblemPlayer` / `FeedbackDialog` / any page. The helper is the deliverable.**
- Lint / typecheck / test / build all green

### v0.19.0c acceptance (preview)

- `src/lib/child-engine-explain.ts` exists with `ChildEngineExplainInput` / `ChildEngineExplainOutput = LocalReviewResult`
- Extended validator (or new `validateChildEngineExplain()`) covers: length ≤150, banned phrases, no winrate / rank, `source` enum
- 10–14 unit tests cover: each category, rank combinations, low-confidence fallback, hint-used combination, single-step input, multi-step input, deterministic output
- **No consumer wiring. No change to `ProblemPlayer` / `FeedbackDialog` / server action.**
- Lint / typecheck / test / build all green

### v0.19.0d acceptance (preview)

- New regression tests assert no engine field reaches:
  - `/report` page output
  - `/wrong-book` page output
  - localStorage `children-go-app:v0.1:progress` payload
  - `/dev/session-summary` rendered HTML
- `docs/AI_ENGINE_BOUNDARY_QA_v0.19.md` with the same structure as `docs/PARENT_REVIEW_SESSION_HISTORY_QA_v0.18.md`
- Lint / typecheck / test (≥ +18 new) / build all green
- Release notes + QA checklist for v0.19

## 7. Risks and mitigations

| Risk | Trigger | Mitigation |
|---|---|---|
| Helper output drifts from child wording rules | Banned phrases or winrate language leak into helper output | Helper output goes through `validateReviewOutput()`-style validator; tests assert no banned phrase |
| Helper misclassifies the second-best move | `topMoves[1]` happens to equal `attemptedMove` or `authoredAnswer` | Helper explicitly returns `kind: "no-hint"` in those cases; covered by unit tests |
| Consumer wiring regresses single-step flow | Future gated follow-up accidentally changes `ProblemPlayer` for single-step | v0.19.0b/0c ship helper only; consumer wiring is a separate, gated slice; codex review enforces "no consumer change" on 0b/0c |
| Privacy leak to parent path | Engine fields added to `StudentProgress` or a `summarizeLearningSession` argument | v0.19.0d adds explicit field-level diff tests against the v0.18 boundary; no `StudentProgress` shape change in v0.19 |
| Feature flag never turned on in QA | Flag defaults off and nobody tests on-path | v0.19.0b includes a manual QA checklist for both flag states; CI does not enable it |

## 8. Explicitly not in v0.19 scope

- ❌ No parent dashboard, parent settings entry, parent gate, or parent-visible engine output
- ❌ No new route, no navigation link, no end-of-session modal, no report page change
- ❌ No persistence of engine output, topMoves, or scoreLead
- ❌ No external AI / LLM / Ollama / cloud engine
- ❌ No problem content change, no selection logic change, no recommendation algorithm change
- ❌ No UI/UX change to the existing rule-template coach
- ❌ No `StudentProgress` schema change (engine signals stay server-only)
- ❌ No Docker / package / CI / build config change
- ❌ No practice flow, wrong-book, report, level progression change for single-step problems
- ❌ No sparring / free-form engine play / 19x19 / online / teacher backend
- ❌ **No new component, no `ProblemPlayer` change, no `FeedbackDialog` change in v0.19.0b/0c** — those are gated follow-ups
- ❌ **No premature commitment to a specific consumer (overlay vs dialog copy vs side panel) — the helper is the deliverable**

## 9. References

- v0.13.0a: `docs/LOCAL_GO_ENGINE_PLAN_v0.13.md`
- v0.13.0b: `docs/ENGINE_ADAPTER_CONTRACT_v0.13.md`
- v0.13.0c: `src/lib/engine-adapter.ts`, `src/lib/engine-config.ts`
- v0.13.0d: `src/lib/ai-review.ts` engine-assisted branch, `src/lib/review-actions.ts`, `src/components/problem/FeedbackDialog.tsx` engine-assisted caption
- v0.14.0c: `docs/LOCAL_ENGINE_DIAGNOSTICS_CONTRACT_v0.14.md`
- v0.14.0d: `src/lib/engine-diagnostics.ts`
- v0.17.0d: `docs/RELEASE_NOTES_v0.17.md` (privacy boundary precedent for unlinked debug surface)
- v0.18.0b: `docs/PARENT_REVIEW_SESSION_BOUNDARY_CONTRACT_v0.18.md` (privacy/data minimization rules)
- v0.18.0d: `docs/PARENT_REVIEW_SESSION_HISTORY_QA_v0.18.md` (QA structure template)
- v0.18.0e: `docs/RELEASE_NOTES_v0.18.md` (current stable baseline)

## 10. v0.1 boundary check

- v0.1 allows: local engine, server-side, no network, no auth, no DB, no payment, no online
- v0.19 inherits all of the above; no widening proposed
- v0.19 adds: pure helpers, contracts, and feature-flag contracts over an already-computed server signal — still local, still optional, still off by default
- **Any consumer wiring (component, page, `ProblemPlayer` change) is explicitly out of v0.19.0b/0c** and is a gated follow-up only
- Decision: **v0.19 stays inside v0.1 scope**
