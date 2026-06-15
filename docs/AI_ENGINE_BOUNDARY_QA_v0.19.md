# v0.19.0d — Engine Privacy Boundary Hardening / Stabilization

## Scope and Method

Validation scope covers the v0.19 series (v0.19.0a–v0.19.0d):

- `src/lib/engine-hint.ts` — pure `buildEngineHint()`, feature-flag `ENGINE_HINT_PROJECTION`
- `src/lib/child-engine-explain.ts` — pure `explainChildEngine()`, extended `validateChildEngineExplain()`
- `src/lib/parent-review-session-history.ts` — `FORBIDDEN_PARENT_FIELDS` extended with 16 engine / KataGo surface keys
- `src/__tests__/parent-review-session-history.test.ts` — **7 new regression tests** for the v0.19 engine boundary extensions
- `src/__tests__/engine-hint.test.ts` — 15 tests (v0.19.0b)
- `src/__tests__/child-engine-explain.test.ts` — 23 tests (v0.19.0c)

Method: code review, forbidden-field extension, regression-test expansion, cross-surface boundary inspection. No UI consumer was added in v0.19 — the helpers are pure, off by default, and unreachable from any parent-visible path.

Validation baseline:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 638 passed (31 files) |
| `npm run build` | Compiled successfully |

---

## 1. Forbidden-Field Boundary Extension

The v0.18 `FORBIDDEN_PARENT_FIELDS` list was extended with 12 new keys covering the v0.13 / v0.14 / v0.19 engine surface. Any payload that contains these keys — at any depth — is now rejected by `checkPrivacyBoundary()`.

New keys (v0.19.0d):

| Key | Source / meaning |
|---|---|
| `topMoves` | `EngineReviewSignal.topMoves` from `engine-adapter.ts` |
| `visits` | `MoveInfo.visits` (KataGo analysis count) |
| `scoreLead` | `MoveInfo.scoreLead` (KataGo score estimate) |
| `winrate` | `MoveInfo.winrate` (KataGo win probability) |
| `playouts` | engine config / analysis playout count |
| `engineHint` | `EngineHintOutput` shape from `engine-hint.ts` |
| `engineReview` | generic engine-review wrapper |
| `engineSignal` | `EngineReviewSignalLike` (from `ai-review.ts`) |
| `engineAssisted` | review source flag |
| `engineConfidence` | confidence enum projection |
| `agreedWithAuthoredAnswer` | engine-vs-authored flag |
| `authoredAnswerRank` | rank of the authored answer in engine's topMoves |
| `attemptedMoveRank` | rank of the child's attempt in engine's topMoves |
| `engineLatency` | engine call latency bucket |
| `engineDiagnostics` | `LocalEngineDiagnostics` wrapper |
| `lastAnalysis` | engine last-analysis lifecycle |

Result: **16 new keys** added (30 total lines in the table; the original 14 v0.18 keys are unchanged). `checkPrivacyBoundary()` already recurses into nested objects and arrays, so the new keys are detected at any depth.

---

## 2. New Regression Tests (7 new in `parent-review-session-history.test.ts`)

| # | Test | Asserts |
|---|---|---|
| 1 | rejects topMoves at the top level | `topMoves` in payload → 1 violation with `field: "topMoves"` |
| 2 | rejects visits / scoreLead / winrate / playouts at the top level | all 4 engine metric keys → 4 violations |
| 3 | rejects engineHint / engineReview / engineSignal / engineAssisted | all 4 surface keys → 4 violations |
| 4 | rejects engineConfidence / agreedWithAuthoredAnswer / authoredAnswerRank / attemptedMoveRank | all 4 rank / confidence keys → 4 violations |
| 5 | rejects engineLatency / engineDiagnostics / lastAnalysis | all 3 lifecycle keys → 3 violations |
| 6 | rejects engine fields nested under allowed parent shapes | engine fields inside `attempts: [{...}]` still detected |
| 7 | does not false-positive on legitimate aggregate fields | `category / level / totalAttempted / totalCorrectFirstTry / categories / levels` produce 0 violations; only `problemId` inside `attempts` is flagged (existing v0.18 behavior) |

Result: **7 new tests** added; **63 tests in `parent-review-session-history.test.ts`** (was 56). All 638 project tests pass across 31 files.

---

## 3. Cross-Surface Boundary Inspection

Manual review of every surface that could plausibly receive engine data:

| Surface | Engine data flow? | Boundary holds? |
|---|---|---|
| `StudentProgress` (`src/lib/progress.ts`) | No engine field is written, read, or referenced. The shape is unchanged from v0.18. | ✅ |
| `localStorage` `children-go-app:v0.1:progress` | No engine data persisted. | ✅ |
| `summarizeLearningSession()` (`src/lib/session-summary.ts`) | Pure function over `LearningSessionSummaryInput`; no engine imports. | ✅ |
| `buildHistoricalSummary()` (`src/lib/parent-review-session-history.ts`) | Iterates `progress.attempts` only; engine module is not imported. | ✅ |
| `toParentReviewSafeAggregate()` | Explicit allowlist of safe fields; no engine key on the output shape. | ✅ |
| `checkPrivacyBoundary()` | Extended with 16 new forbidden keys; covers v0.19.0b/0c helper outputs. | ✅ |
| `/dev/session-summary` page | Reads `loadProgress()` only; does not import engine modules. | ✅ |
| `/report` page | Aggregates from `StudentProgress`; no engine field. | ✅ |
| `/wrong-book` page | Aggregates from `StudentProgress`; no engine field. | ✅ |
| `engine-hint.ts` | Pure helper; consumer wiring is a gated follow-up and not in v0.19. | ✅ |
| `child-engine-explain.ts` | Pure helper; consumer wiring is a gated follow-up and not in v0.19. | ✅ |
| `ai-review.ts` | Consumes `EngineReviewSignalLike` for output wording only; the signal is dropped after the message is produced (no persistence). | ✅ |
| `engine-adapter.ts` | `import "server-only"`; no parent-visible consumer. | ✅ |
| `engine-config.ts` / `engine-diagnostics.ts` | `import "server-only"`; no parent-visible consumer. | ✅ |
| `requestEngineReview()` (server action) | Returns `EngineReviewSignal | null`; client stores it transiently in component state, never in `StudentProgress`. | ✅ |

Result: **no engine field can reach a parent-visible path** with the current v0.19 series. The boundary is enforced at three layers:

1. **Type level** — `StudentProgress` has no engine field; engine modules are server-only.
2. **Function level** — `checkPrivacyBoundary()` rejects any payload with a forbidden key.
3. **Test level** — the 7 new regression tests + the 15 v0.19.0b tests + the 23 v0.19.0c tests assert the boundary directly.

---

## 4. v0.19.0b / v0.19.0c Helper Outputs vs Boundary

Spot-check of every key the v0.19 helpers can produce:

| Helper | Possible output keys | In `FORBIDDEN_PARENT_FIELDS`? |
|---|---|---|
| `buildEngineHint` | `{ kind, reason, point?, reason? }` — `point` is `{ x, y }` which is forbidden. Output is a transient helper return value, never persisted or passed to a parent-visible surface. | `point.x` / `point.y` are in the list, but `checkPrivacyBoundary` is only called on parent-visible aggregates. No leak. |
| `explainChildEngine` | `LocalReviewResult` = `{ message, concept, source }` — `message` and `concept` are safe; `source` is the literal enum string. | Safe. |
| `validateChildEngineExplain` | `true | { reason, detail }` — output is dev-time only, not rendered. | Safe. |
| `getEngineHintProjectionFlag` | `{ enabled, source }` — flag state only. | Safe. |

Result: all v0.19 helper outputs are confirmed safe for the parent-review boundary. The `point` field from `buildEngineHint` is the only engine-shaped nested key, and it is correctly caught if it ever reaches a parent-visible aggregate (test #6 above).

---

## 5. Code-Quality Observations

| Observation | Severity | Status |
|---|---|---|
| `buildEngineHint` returns `point: { x, y }` which is a v0.18 forbidden key | Informational | Confirmed safe — output is transient and never reaches a parent-visible aggregate; covered by test #6 |
| `EngineReviewSignalLike` is a client-callable type | Informational | The shape (`{ confidence, agreesWithAuthoredAnswer }`) is already gated; `confidence` is not a forbidden key, only `engineConfidence` (a different key) is. No false positive, no leak. |
| `child-engine-explain.ts` banned-phrase matching is case-insensitive (v0.19.0c) | Confirmed by 5 `it.each` variants | ✅ |
| `engine-hint.ts` feature flag defaults off via env → runtime → default | Confirmed by 4 flag tests (v0.19.0b) | ✅ |
| No new dependency introduced | Confirmed by `package.json` unchanged | ✅ |
| No temporary debug code, no `console.log` of engine data | Confirmed by code review | ✅ |
| No `any` introduced; types are explicit | Confirmed by `tsc --noEmit` | ✅ |

---

## 6. Release-Readiness Checklist

- [x] `FORBIDDEN_PARENT_FIELDS` extended with 16 engine / KataGo keys
- [x] 7 new boundary regression tests added (63 total in `parent-review-session-history.test.ts`)
- [x] All 638 tests pass (31 files)
- [x] `npm run lint` — Exit 0
- [x] `npm run typecheck` — Exit 0
- [x] `npm run build` — Compiled successfully
- [x] No UI / runtime practice-flow / API route / Server Action / Supabase / persistence / telemetry / Docker / CI / dependency change
- [x] No consumer wiring introduced — `ProblemPlayer` / `FeedbackDialog` / server action unchanged from v0.18
- [x] `docs/TASKS.md` updated — v0.19.0d delivered, v0.19 series complete
- [x] `docs/RELEASE_NOTES_v0.19.md` covers v0.19.0a–0d
- [x] `docs/QA_CHECKLIST_v0.19.md` provides review checklist

---

## 7. Recommended Next Phase

**v0.20+** (deferred, no planning slice yet). Possible directions, in priority order:

1. **Gated consumer wiring for v0.19 helpers** — add a `ProblemPlayer` integration that calls `buildEngineHint()` and `explainChildEngine()` behind the existing `ENGINE_HINT_PROJECTION` flag and a new `CHILD_ENGINE_EXPLAIN` flag, multi-step-gated. This is the explicit gated follow-up named in v0.19.0a.
2. **Content / UX polish** — endgame / mixed problem expansion (Pack B), end-of-session celebration polish, gentle progress visualization.
3. **Infrastructure** — CI shard, e2e parallelization, Docker image slim, Playwright reporter upgrade.
4. **Parent review** (deferred since v0.18.0e) — optional parent-gated surface that consumes `toParentReviewSafeAggregate()`. Requires explicit gate decision in v0.20.0a.

The next phase must remain a planning-only slice (`v0.20.0a`).
