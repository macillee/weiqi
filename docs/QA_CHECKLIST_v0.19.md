# v0.19 — Local AI / Engine UX QA Checklist

## 1. Scope checklist

- [x] `docs/RELEASE_NOTES_v0.19.md` exists and covers v0.19.0a–v0.19.0d
- [x] `docs/QA_CHECKLIST_v0.19.md` exists (this file)
- [x] `docs/AI_ENGINE_UX_PLAN_v0.19.md` exists and is current
- [x] `docs/AI_ENGINE_BOUNDARY_QA_v0.19.md` exists with QA validation report
- [x] `src/lib/engine-hint.ts` exists — pure `buildEngineHint()` with feature-flag contract
- [x] `src/__tests__/engine-hint.test.ts` exists — 15 tests
- [x] `src/lib/child-engine-explain.ts` exists — pure `explainChildEngine()` + extended `validateChildEngineExplain()`
- [x] `src/__tests__/child-engine-explain.test.ts` exists — 23 tests
- [x] `src/lib/parent-review-session-history.ts` `FORBIDDEN_PARENT_FIELDS` extended with 16 engine / KataGo keys
- [x] `src/__tests__/parent-review-session-history.test.ts` includes 7 new engine boundary regression tests
- [x] No parent dashboard, child-facing summary, navigation link, end-of-session modal, history/report view, persistence, API route, Server Action, telemetry, Supabase write, external AI, new KataGo integration, or diagnostics integration was added
- [x] No new component, no `ProblemPlayer` change, no `FeedbackDialog` change, no route change, no problem content change, no selection logic change, no recommendation algorithm change, no practice flow change, no wrong-book change, no report change, no level progression change, no child-facing UI change
- [x] No package, Docker, CI, or build config change

## 2. Static validation

- [x] `npm run lint` — exit 0
- [x] `npm run typecheck` — exit 0
- [x] `npm run test` — all 638 tests pass (31 files)
- [x] `npm run build` — compiled successfully
- [x] `npm run test:e2e` — passes in CI
- [x] Docker build verification — passes in CI

## 3. `engine-hint.ts` manual QA

### Feature-flag contract

- [x] Default off: `getEngineHintProjectionFlag()` returns `{ enabled: false, source: "default" }` when no env / no runtime setter
- [x] Env wins over runtime: `ENGINE_HINT_PROJECTION=true` + `setEngineHintProjectionEnabled(false)` → `{ enabled: true, source: "env" }`
- [x] Env wins over runtime: `ENGINE_HINT_PROJECTION=false` + `setEngineHintProjectionEnabled(true)` → `{ enabled: false, source: "env" }`
- [x] Runtime overrides default when env is unset: `setEngineHintProjectionEnabled(true)` + no env → `{ enabled: true, source: "runtime" }`
- [x] `setEngineHintProjectionEnabled(undefined)` clears the runtime override

### `buildEngineHint()` no-hint paths

- [x] Flag off → `{ kind: "no-hint", reason: "flag-off" }`
- [x] Signal `confidence: "low"` → `{ kind: "no-hint", reason: "low-confidence" }`
- [x] `topMoves: undefined` → `{ kind: "no-hint", reason: "no-top-moves" }`
- [x] `topMoves: [{...}]` (single entry) → `{ kind: "no-hint", reason: "single-top-move" }`
- [x] Second top move equals attempted move → `{ kind: "no-hint", reason: "second-move-equals-attempted" }`
- [x] Second top move equals authored answer → `{ kind: "no-hint", reason: "second-move-equals-authored" }`
- [x] Second top move out of board range → `{ kind: "no-hint", reason: "second-move-malformed" }`
- [x] Second top move on occupied intersection → `{ kind: "no-hint", reason: "no-usable-second-move" }`

### `buildEngineHint()` happy path

- [x] Returns `{ kind: "hint", point, reason }` when all conditions are met
- [x] `reason` length ≤ 150 chars
- [x] `reason` contains no banned phrase (你下错了 / 级位 / 段位 / 胜率 / winrate / rating / etc.)
- [x] Output is deterministic for the same input
- [x] Output works on multi-step problem input (helper does not gate on multi-step)

## 4. `child-engine-explain.ts` manual QA

### Source enum

- [x] `signal.agreesWithAuthoredAnswer=true` + `confidence="high"` → `source: "engine-assisted"`
- [x] `signal.agreesWithAuthoredAnswer=true` + `confidence="medium"` → `source: "engine-assisted"`
- [x] `signal.agreesWithAuthoredAnswer=true` + `confidence="low"` → `source: "rule-template"` (fallback)
- [x] `signal.agreesWithAuthoredAnswer=false` + any confidence → `source: "rule-template"` (fallback)
- [x] `usedHint=true` + fallback path → message contains "用了提示也没关系"

### Rank refinement

- [x] `attemptedMoveRank=2` + `authoredMoveRank=1` → message contains "旁边"
- [x] `attemptedMoveRank=5` + `authoredMoveRank=1` → message is a "远" / "多看几步" variant
- [x] `attemptedMoveRank=null` (or `undefined` / `NaN` / `0`) → ignored safely, no crash

### Category coverage

- [x] All 7 categories (`capture`, `escape`, `connect_cut`, `life_death`, `opening`, `endgame`, `mixed`) produce a non-empty message ≤150 chars
- [x] Unknown category falls back to "fallback" key without throwing

### Multi-step input

- [x] Multi-step problem (with `totalSteps=2` and `steps[]`) → valid output

### Banned-phrase sweep

- [x] All 4 signal variants × 7 categories produce 0 banned-phrase hits across both source paths

### `validateChildEngineExplain()`

- [x] Valid engine-assisted output → `true`
- [x] Empty message → `{ reason: "empty", detail: "message is empty" }`
- [x] Message >150 chars → `{ reason: "too-long", detail: "message length N > 150" }`
- [x] Banned phrase in message (e.g. "胜率") → `{ reason: "banned", detail: "..." }`
- [x] Case-insensitive banned phrase `WinRate` → `{ reason: "banned", ... }`
- [x] Case-insensitive banned phrase `WIN RATE` → `{ reason: "banned", ... }`
- [x] Case-insensitive banned phrase `SCORE` → `{ reason: "banned", ... }`
- [x] Case-insensitive banned phrase `Rating` → `{ reason: "banned", ... }`
- [x] Case-insensitive banned phrase `Visits` → `{ reason: "banned", ... }`
- [x] Unknown source enum (e.g. `"ai-turbo"`) → `{ reason: "bad-source", ... }`

## 5. `parent-review-session-history.ts` engine boundary (v0.19.0d)

### `FORBIDDEN_PARENT_FIELDS` extension

- [x] `topMoves` listed
- [x] `visits` listed
- [x] `scoreLead` listed
- [x] `winrate` listed
- [x] `playouts` listed
- [x] `engineHint` listed
- [x] `engineReview` listed
- [x] `engineSignal` listed
- [x] `engineAssisted` listed
- [x] `engineConfidence` listed
- [x] `agreedWithAuthoredAnswer` listed
- [x] `authoredAnswerRank` listed
- [x] `attemptedMoveRank` listed
- [x] `engineLatency` listed
- [x] `engineDiagnostics` listed
- [x] `lastAnalysis` listed

### `checkPrivacyBoundary` regression tests

- [x] Rejects `topMoves` at top level
- [x] Rejects `visits` / `scoreLead` / `winrate` / `playouts` at top level
- [x] Rejects `engineHint` / `engineReview` / `engineSignal` / `engineAssisted`
- [x] Rejects `engineConfidence` / `agreedWithAuthoredAnswer` / `authoredAnswerRank` / `attemptedMoveRank`
- [x] Rejects `engineLatency` / `engineDiagnostics` / `lastAnalysis`
- [x] Rejects engine fields nested inside `attempts: [{...}]`
- [x] Does not false-positive on legitimate aggregate fields (`category / level / totalAttempted / totalCorrectFirstTry / categories / levels`)

## 6. Privacy / data minimization checklist

Confirm the v0.19 series does **not**:

- [x] Import engine modules into `parent-review-session-history.ts` or any parent-visible aggregator
- [x] Persist engine output (`topMoves` / `scoreLead` / `winrate` / `engineHint` / `lastAnalysis`) in `StudentProgress` or `localStorage`
- [x] Render engine fields in `/report`, `/wrong-book`, or `/dev/session-summary`
- [x] Expose engine fields via Server Action return types
- [x] Send engine fields to any external service, fetch call, or telemetry module
- [x] Add a new route, navigation link, or parent-facing surface

Confirm the v0.19 series does:

- [x] Enforce the v0.18 forbidden-field list extended with 16 engine / KataGo keys
- [x] Produce only safe-shape outputs (`{ kind, reason, point? }` from `buildEngineHint`, `{ message, concept, source }` from `explainChildEngine`, `{ enabled, source }` from the flag getter)
- [x] Keep every helper pure, deterministic, side-effect-free

## 7. Cross-cutting checks

- [x] `docs/TASKS.md` marks v0.19.0a–v0.19.0d delivered and the v0.19 series complete
- [x] `docs/TASKS.md` strategy section increments to the new high-water mark (v0.19.0d, 638 tests)
- [x] Release notes PR references are correct (#209 / #210 / #211 / this PR)
- [x] No migration required for downstream consumers (v0.19 modules are additive; `engine-hint.ts` and `child-engine-explain.ts` are not yet consumed by any UI module)
- [x] No conflict markers left in any of the merged files

## 8. Release sign-off

- [x] `docs/RELEASE_NOTES_v0.19.md` is complete and accurate
- [x] `docs/QA_CHECKLIST_v0.19.md` is complete (this file)
- [x] `docs/AI_ENGINE_BOUNDARY_QA_v0.19.md` exists with validation report
- [x] `docs/AI_ENGINE_UX_PLAN_v0.19.md` exists and is current
- [x] `docs/TASKS.md` marks v0.19.0d delivered and queues v0.20.0a
- [x] All static validation passes
- [x] No open blockers from v0.19 QA
- [x] All docs are internally consistent
- [x] v0.1 scope respected: local-only, no parent UI, no persistence, no auth, no external AI, no Supabase
