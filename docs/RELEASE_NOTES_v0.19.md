# v0.19 — Local AI / Engine UX (Pure Helpers + Boundary Hardening)

## 1. Summary

v0.19 delivers the **pure helper, contract, and boundary foundation** for the child-facing local AI / engine UX enhancements, while keeping every consumer surface (component, page, `ProblemPlayer`, `FeedbackDialog`, server action) byte-identical to v0.18. The v0.19 series adds two new pure helpers and extends the v0.18 privacy boundary to cover the engine / KataGo surface.

Key principles carried through v0.19:

- **Pure helpers, no consumer wiring.** v0.19.0b and v0.19.0c ship only `buildEngineHint()` and `explainChildEngine()` plus their validators, types, and tests. Component / page / `ProblemPlayer` / `FeedbackDialog` integration is a named gated follow-up, not part of v0.19.
- **Local-only, optional, off by default.** The new `ENGINE_HINT_PROJECTION` feature flag defaults off via env → runtime → default resolution; off-state is byte-identical to v0.18.
- **Privacy by construction.** v0.18's `FORBIDDEN_PARENT_FIELDS` is extended with 16 engine / KataGo keys; 7 new regression tests pin the boundary.
- **No parent-visible engine output.** No new route, no new page, no new prop, no persistence, no telemetry. The `/dev/session-summary` page is unchanged.

## 2. What changed

| Slice | Deliverable | PR |
|---|---|---|
| v0.19.0a | `docs/AI_ENGINE_UX_PLAN_v0.19.md` — re-anchors v0.13 / v0.14 engine assets, evaluates 4 UX directions, scopes v0.19.0b / v0.19.0c to pure helpers / contracts / tests / feature-flag contracts. Component / page / `ProblemPlayer` integration is a named gated follow-up. v0.1 boundary respected; planning-only slice, no code change. | #209 |
| v0.19.0b | `src/lib/engine-hint.ts` — pure `buildEngineHint(input)` returning `{ kind: "no-hint", reason }` or `{ kind: "hint", point, reason }`. Feature-flag contract `ENGINE_HINT_PROJECTION` resolves env → runtime → default (env wins), off by default. 15 new tests in `src/__tests__/engine-hint.test.ts`. | #210 |
| v0.19.0c | `src/lib/child-engine-explain.ts` — pure `explainChildEngine(input)` returning a `LocalReviewResult`-shaped object. `source` is `"engine-assisted"` only when signal agrees with authored answer AND confidence is `medium` or `high` (otherwise `"rule-template"`). Rank-aware refinement. Extended `validateChildEngineExplain()` with case-insensitive banned-phrase matching. 23 new tests in `src/__tests__/child-engine-explain.test.ts`. | #211 |
| v0.19.0d | `docs/AI_ENGINE_BOUNDARY_QA_v0.19.md` — `FORBIDDEN_PARENT_FIELDS` extended with 16 engine / KataGo keys, 7 new boundary regression tests, cross-surface boundary inspection confirming no engine field can reach a parent-visible path. | this PR |

### File inventory

New files added in v0.19.0a–0d:

- `docs/AI_ENGINE_UX_PLAN_v0.19.md` — v0.19.0a planning
- `docs/AI_ENGINE_BOUNDARY_QA_v0.19.md` — v0.19.0d QA report
- `docs/RELEASE_NOTES_v0.19.md` — v0.19 series release notes
- `docs/QA_CHECKLIST_v0.19.md` — v0.19 series QA checklist
- `src/lib/engine-hint.ts` — pure helper + feature-flag contract
- `src/__tests__/engine-hint.test.ts` — 15 tests
- `src/lib/child-engine-explain.ts` — pure helper + extended validator
- `src/__tests__/child-engine-explain.test.ts` — 23 tests

Modified files:

- `src/lib/parent-review-session-history.ts` — `FORBIDDEN_PARENT_FIELDS` extended with 16 engine / KataGo keys
- `src/__tests__/parent-review-session-history.test.ts` — 7 new boundary regression tests
- `docs/TASKS.md` — current phase and strategy entries updated for v0.19.0a–0d

## 3. What did not change

- No parent dashboard, parent settings entry, parent gate, or child-facing summary UI
- No new route, no navigation link, no end-of-session modal, no report page integration
- No history or weekly report view
- No persistence of engine output, `topMoves`, `scoreLead`, `winrate`, or `lastAnalysis`
- No `StudentProgress` schema change (engine signals stay server-only / transient)
- No Supabase schema, database writes, or auth
- No API route, Server Action change, telemetry, analytics, or external service call
- No new AI / Ollama / KataGo integration (the v0.13 engine is reused as-is)
- No package, Docker, CI, or build config change
- No problem content, selection logic, recommendation algorithm, practice flow, wrong-book, report, level progression, or child-facing UI change
- No `ProblemPlayer` / `FeedbackDialog` / any page change
- `/dev/session-summary` unchanged from v0.17 — still unlinked, still local-only, still consumes `summarizeLearningSession()` from v0.16

## 4. New helpers (public API)

### `src/lib/engine-hint.ts`

```ts
type EngineHintInput = {
  problem: Problem;
  attemptedMove: Point;
  authoredAnswer: Point;
  signal: EngineReviewSignalLike;
  topMoves?: ReadonlyArray<{ x: number; y: number; visits?: number; scoreLead?: number }>;
};

type EngineHintOutput =
  | { kind: "no-hint"; reason: EngineHintNoHintReason }
  | { kind: "hint"; point: Point; reason: string };
```

8 documented no-hint reasons: `flag-off | low-confidence | no-top-moves | single-top-move | second-move-equals-attempted | second-move-equals-authored | second-move-malformed | no-usable-second-move`.

Feature-flag contract `ENGINE_HINT_PROJECTION` resolves in this order: `process.env` / `import.meta.env` → `setEngineHintProjectionEnabled()` → default. **Off by default.** Off-state is byte-identical to v0.18.

### `src/lib/child-engine-explain.ts`

```ts
type ChildEngineExplainInput = {
  problem: Problem;
  attemptedMove: Point;
  authoredAnswer: Point;
  usedHint: boolean;
  signal: EngineReviewSignalLike;
  attemptedMoveRank?: number | null;
  authoredMoveRank?: number | null;
};

type ChildEngineExplainOutput = LocalReviewResult; // reuses existing shape

validateChildEngineExplain(result: LocalReviewResult): true | ValidationFailure;
```

`source` is `"engine-assisted"` only when the input signal agrees with the authored answer AND confidence is `medium` or `high`; otherwise `"rule-template"` fallback. The helper does **not** gate on `isMultiStep`; the multi-step gate lives at the consumer, which is a separate, gated follow-up.

`validateChildEngineExplain()` is case-insensitive on both message and banned list, covering length ≤150, empty message, banned phrases (carried from `ai-review.ts` plus engine-specific: 胜率 / winrate / rating / score / 得分 / visits / playouts), source enum, non-empty concept.

## 5. Privacy and data minimization

- v0.18's `FORBIDDEN_PARENT_FIELDS` extended with 16 engine / KataGo keys: `topMoves | visits | scoreLead | winrate | playouts | engineHint | engineReview | engineSignal | engineAssisted | engineConfidence | agreedWithAuthoredAnswer | authoredAnswerRank | attemptedMoveRank | engineLatency | engineDiagnostics | lastAnalysis`.
- `checkPrivacyBoundary()` already recurses into nested objects and arrays; the new keys are detected at any depth.
- 7 new boundary regression tests in `parent-review-session-history.test.ts` (63 total in file). All pass.
- v0.19 helpers produce no engine-shaped output that reaches a parent-visible surface:
  - `buildEngineHint` returns `{ kind, reason, point?, ... }`; `point.x` and `point.y` are already forbidden, so the helper output would be flagged if it ever reached `checkPrivacyBoundary`.
  - `explainChildEngine` returns `LocalReviewResult` = `{ message, concept, source }`; all three keys are safe.
  - `getEngineHintProjectionFlag` returns `{ enabled, source }`; both are safe.
- No new module imports engine / KataGo code into the v0.18 contract module or any parent-visible aggregator.
- v0.19.0b/0c helpers are pure and side-effect-free; no `localStorage` write, no `fetch` call, no telemetry.

## 6. Testing and validation

| Area | Count | Scope |
|---|---|---|
| `engine-hint.test.ts` (v0.19.0b) | 15 | feature-flag resolution (env / runtime / default; env wins), no-hint paths, hint path, determinism, multi-step input |
| `child-engine-explain.test.ts` (v0.19.0c) | 23 | engine-assisted on high/medium, rule-template fallback, all 7 categories, banned-phrase sweep, rank refinement, malformed rank safety, multi-step input, unknown category, validator (valid / empty / too-long / banned / bad-source + 5 case-insensitive variants) |
| `parent-review-session-history.test.ts` (v0.19.0d) | 63 | existing 56 + 7 new engine boundary tests (topMoves / visits+scoreLead+winrate+playouts / engineHint+engineReview+engineSignal+engineAssisted / engineConfidence+agreedWithAuthoredAnswer+authoredAnswerRank+attemptedMoveRank / engineLatency+engineDiagnostics+lastAnalysis / nested / no false positive) |
| **Total in project** | **638** | **31 test files** |

All checks pass on CI:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 638 passed (31 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## 7. Known limitations

- v0.19.0b and v0.19.0c ship pure helpers only. No consumer wiring is included; the helpers are not yet connected to `ProblemPlayer`, `FeedbackDialog`, or any new component.
- The `ENGINE_HINT_PROJECTION` feature flag defaults off; until a consumer slice lands, the off-state is the only observable state in production.
- The `EngineHintOutput.point` is `{ x, y }`, which contains v0.18 forbidden keys. This is safe as long as the helper output is transient and never reaches `checkPrivacyBoundary` — confirmed by inspection in `AI_ENGINE_BOUNDARY_QA_v0.19.md` §4.
- `child-engine-explain.ts` is multi-step-safe by design but does not gate on `isMultiStep` itself; the consumer must gate if it only wants the engine-assisted message on multi-step problems.
- No pre-warming, no success-path engine reasoning, no engine-aware re-grade — all deferred to v0.20+.
- No `/dev/session-summary` change. The debug page still consumes `summarizeLearningSession()` from v0.16; a future slice could migrate it to consume `buildHistoricalSummary()` + `toParentReviewSafeAggregate()` from v0.18.

## 8. Recommended next phase

**v0.20.0a — Next-Phase Plan (planning-only slice)**

The v0.19 series closes the engine-helper foundation. With the helpers and the privacy boundary in place, the next direction is to decide what to do with the deferred items:

- **Gated consumer wiring** for v0.19 helpers: integrate `buildEngineHint()` and `explainChildEngine()` behind flags into `ProblemPlayer` / `FeedbackDialog` (the explicit v0.19.0a gated follow-up). This is the highest-priority v0.20 candidate.
- **Content / UX polish**: endgame / mixed problem expansion (Pack B), gentle progress visualization, end-of-session celebration refinement.
- **Infrastructure**: CI shard, e2e parallelization, Docker image slim, Playwright reporter upgrade.
- **Parent review** (deferred since v0.18.0e): optional parent-gated surface that consumes `toParentReviewSafeAggregate()`. Requires explicit gate decision in v0.20.0a before any consumer slice.

The next phase should be a planning-only slice (`v0.20.0a`) that evaluates these candidates and writes the slice plan before any integration code is written.
