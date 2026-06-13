# v0.18 — Parent Review Session Boundary and History Model

## 1. Summary

v0.18 establishes the **conservative session boundary and minimal local session history model** that any future parent-facing insight delivery will rely on. The v0.18 series defines the vocabulary, contracts, and pure TS helpers — without introducing any parent UI, any persistence layer, or any new routes.

Key principles carried through v0.18:

- **Local-only**: all session/history data stays in the local module boundary; nothing is persisted, transmitted, or rendered.
- **No parent-facing UI**: no dashboard, no settings entry, no end-of-session modal, no report page integration.
- **Privacy by construction**: forbidden parent fields are enforced at the type/contract level (`checkPrivacyBoundary`, `toParentReviewSafeAggregate`).
- **Pure TS helpers**: every helper is side-effect free, deterministic, and unit-testable in isolation.

The v0.18 series continues the v0.17 debug-surface precedent: building the data and contract foundation before any user-facing surface.

## 2. What changed

| Slice | Deliverable | PR |
|---|---|---|
| v0.18.0a | `docs/PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18.md` — conservative session boundary / history modeling direction, v0.18.0b acceptance criteria | #202 |
| v0.18.0b | `docs/PARENT_REVIEW_SESSION_BOUNDARY_CONTRACT_v0.18.md` — session boundary vocabulary, current-session / daily / historical summary definitions, reset/retention behavior, sparse/empty/mixed handling, local-only assumptions, privacy/data minimization rules, parent gate requirements, future testing requirements, v0.18.0c recommendation | #204 |
| v0.18.0c | `src/lib/parent-review-session-history.ts` — 10 pure TS helpers (`createEmptyProgress`, `enrichAttempt`, `startSession`, `recordAttemptInSession`, `closeSession`, `buildDailySummary`, `buildHistoricalSummary`, `validateSessionContract`, `toParentReviewSafeAggregate`, `checkPrivacyBoundary`); 36 new tests in `src/__tests__/parent-review-session-history.test.ts` | #206 |
| v0.18.0d | `docs/PARENT_REVIEW_SESSION_HISTORY_QA_v0.18.md` — boundary/edge-case test expansion (10 new tests, 46 total in file), null/undefined guard fix for `buildHistoricalSummary` (`progress.attempts ?? []`) | #207 |

### File inventory

New files added in v0.18.0c–0.18.0d:

- `src/lib/parent-review-session-history.ts` — pure TS helper module (10 exports)
- `src/__tests__/parent-review-session-history.test.ts` — 36 + 10 = 46 tests
- `docs/PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18.md` — v0.18.0a planning
- `docs/PARENT_REVIEW_SESSION_BOUNDARY_CONTRACT_v0.18.md` — v0.18.0b contract
- `docs/PARENT_REVIEW_SESSION_HISTORY_QA_v0.18.md` — v0.18.0d QA report

## 3. What did not change

- No parent dashboard, parent settings entry, or child-facing summary UI
- No new route, no navigation link, no end-of-session modal, no report page integration
- No history or weekly report view
- No persistence of session, daily, or historical summary output
- No Supabase schema, database writes, or auth
- No API route, Server Action, telemetry, analytics, or external service call
- No AI, Ollama, KataGo, engine, or diagnostics integration change
- No package, Docker, CI, or build config change
- No problem content, selection logic, recommendation algorithm, practice flow, wrong-book, report, level progression, or child-facing UI change
- No `/dev/session-summary` change (the v0.17 debug page remains as the only parent-touchable surface, and it is still unlinked)

## 4. v0.18 vocabulary

The contract document defines five session-boundary constructs, all materialized as TS types in v0.18.0c:

| Type | Purpose |
|---|---|
| `EnrichedAttempt` | Single attempt enriched with category, level, attemptCount, multiStep, timestamp |
| `CurrentSessionState` | In-memory session with id, startedAt, attempts, completed flag |
| `CompletedSession` | Closed session with totals, hint/category breakdown |
| `DailySummary` | Aggregated per-day rollup (one or more CompletedSession) |
| `HistoricalSummary` | Multi-day rollup of DailySummary with grand totals |

These types are not yet wired into `StudentProgress`. They exist as a typed contract surface that any future persistence or UI integration must conform to.

## 5. Privacy and data minimization

- The forbidden parent field list is enforced in code: `FORBIDDEN_PARENT_FIELDS` covers `selectedX`, `selectedY`, `x`, `y`, `stars`, `streakDays`, `achievements`, `reviewSchedule`, `timeSpentSeconds`, `wrongProblems`, `problemId`, `boardState`, `identity`, `telemetry`.
- `toParentReviewSafeAggregate()` projects a `ParentSessionSummary` into a `ParentReviewSafeSession` shape with explicit allowlist of fields.
- `checkPrivacyBoundary()` recursively scans any object for forbidden top-level keys; the recursive collector handles null/undefined/non-object values gracefully (skips non-objects, recurses into arrays).
- No raw move coordinates, board state, engine metrics, Supabase/account IDs, child identity/profile, stars/streaks/achievements, raw review schedule, problem IDs, or telemetry may appear in any output derived from the v0.18 helpers.
- The v0.18 module has zero imports from `/supabase`, `/engine-*`, `/auth-actions`, `/telemetry`, or any external service module — verified by `npm run lint` and code review.

## 6. Testing and validation

| Area | Count | Scope |
|---|---|---|
| `parent-review-session-history.test.ts` (v0.18.0c) | 36 | session lifecycle, daily aggregation, historical aggregation, contract validation (empty / attempt-count / time-order / missing-category / invalid-level), privacy aggregation, privacy boundary |
| New boundary tests (v0.18.0d) | 10 | `buildHistoricalSummary` null/undefined guard, single attempt, all-same-day, `closeSession` empty, `buildDailySummary` empty array, `toParentReviewSafeAggregate` empty problems, `checkPrivacyBoundary` empty object / null nested / missing `sessionStartedAt` / missing `sessionCompletedAt` |
| Total in file | 46 | |
| Total in project | 583 | 29 test files |

All checks pass on CI:

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 583 passed (29 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## 7. Known limitations

- v0.18 introduces the typed contract and pure TS helpers, but does **not** wire them into `StudentProgress` or any persistence layer.
- The module is not yet consumed by `/dev/session-summary` — that page still uses the v0.16 `summarizeLearningSession()` helper. Future v0.19+ slices can safely migrate the debug page to consume `buildHistoricalSummary()` + `toParentReviewSafeAggregate()` once integration scope is planned.
- No session boundary filtering on the existing debug page — it still aggregates all attempts as a single summary.
- No parent gate is built or required by v0.18; the contract document defines gate requirements for the slice that eventually introduces parent-facing access.
- No daily/weekly/longitudinal trend view.
- No persistence, no in-memory retention across page refresh.
- The forbidden parent field list is enforced only for the v0.18 module output; legacy code paths (v0.16 `summarizeLearningSession()` and any direct `loadProgress()` consumer) must be migrated independently if they ever feed parent-visible data.

## 8. Recommended next phase

**v0.19.0a — Local AI / Engine UX Next-Phase Plan**

The v0.18 series closes the parent-review contract work. With the contract foundation in place, the next direction shifts from "data shape" to "user experience":

- Reuse the v0.13 engine-adapter and v0.13d feature-flagged `ai-review.ts` signal to enhance the child-facing review surface (still strictly local, still no parent exposure).
- Plan engine-assisted hint projection, multi-step wrong-move explanation, and the privacy boundary hardening required to keep engine signals out of any parent-readable path.
- Continue the small-slice cadence: a (plan) → b (engine hint projection) → c (multi-step explanation) → d (QA / privacy hardening).

A planning-only slice should land first to evaluate UX candidates, privacy surface, and acceptance criteria before any integration code is written.
