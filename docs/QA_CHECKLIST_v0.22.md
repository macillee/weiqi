# v0.22 — Wire Remaining 4 Unwired v0.7.0b Problems QA Checklist

## 1. Scope checklist

- [x] `docs/RELEASE_NOTES_v0.22.md` exists and covers v0.22.0a–v0.22.0b
- [x] `docs/QA_CHECKLIST_v0.22.md` exists (this file)
- [x] `docs/NEXT_PHASE_PLAN_v0.22.md` exists and is current
- [x] `src/lib/chapters.ts` has new `endgame-6`, `capture-13`, `connect-cut-9` levels
- [x] `src/__tests__/chapters.test.ts` has 10 new v0.22.0b tests, 1 obsolete test removed
- [x] No algorithm change, no UI change, no route change, no selection-logic change, no recommendation-algorithm change, no practice-flow change, no wrong-book change, no report change, no level-progression change
- [x] No `FeedbackDialog` change, no `ProblemPlayer` change, no `GoBoard` change
- [x] No `StudentProgress` schema change, no persistence change
- [x] No new component, no new flag, no new helper, no new problem data
- [x] No package, Docker, CI, or build config change
- [x] No telemetry, no analytics, no Supabase, no parent UI, no engine, no AI

## 2. Static validation

- [x] `npm run lint` — exit 0
- [x] `npm run typecheck` — exit 0
- [x] `npm run test` — all 691 tests pass (32 files)
- [x] `npm run build` — compiled successfully
- [x] `npm run test:e2e` — passes in CI

## 3. `chapters.ts` structure manual QA

### Chapter list

- [x] 7 chapters exported: `capture`, `escape`, `connect_cut`, `opening`, `life_death`, `endgame`, `mixed`
- [x] Every chapter has a unique id
- [x] Every chapter has at least one level
- [x] Every level has a unique id
- [x] Every level has at least one problem
- [x] Every `problemId` referenced in chapters resolves to a problem in `problems.json`

### `endgame` chapter

- [x] Existing `endgame-1`..`endgame-5` levels preserved (backward compatibility)
- [x] New `endgame-6` level exists
- [x] `endgame-6` problemIds = `[END-011, END-012]`
- [x] Both problems are endgame category
- [x] `getAllProblemIdsInChapter("endgame")` includes END-011, END-012

### `capture` chapter

- [x] Existing `capture-1`..`capture-12` levels preserved
- [x] New `capture-13` level exists
- [x] `capture-13` problemIds = `[CAP-022]`
- [x] Problem is capture category
- [x] `getAllProblemIdsInChapter("capture")` includes CAP-022

### `connect_cut` chapter

- [x] Existing `connect-cut-1`..`connect-cut-8` levels preserved
- [x] New `connect-cut-9` level exists
- [x] `connect-cut-9` problemIds = `[CC-018]`
- [x] Problem is connect_cut category
- [x] `getAllProblemIdsInChapter("connect_cut")` includes CC-018

### `categoryLabels`

- [x] Existing `categoryLabels` entries (capture / escape / connect_cut / life_death / opening / endgame / mixed) preserved

## 4. Daily-practice pool coverage manual QA

- [x] `getAllProblemIds()` covers 103 problems (was 99)
- [x] All 4 newly-wired problems reachable from the daily pool: END-011, END-012, CAP-022, CC-018
- [x] `selectDailyProblems()` automatically samples the newly-wired problems with no algorithm change

### Remaining out of scope

- [x] Full 110-problem chapter/daily-practice coverage remains out of scope until a separate coverage audit

## 5. Duplicate-protection manual QA

- [x] Each of the 4 target IDs appears **exactly once** across all chapters (no accidental duplicate wiring)
- [x] No `problemId` is duplicated globally across all chapters
- [x] If a developer accidentally adds the same `problemId` to two levels, the regression test fails

## 6. v0.21 wiring regression (must remain green)

- [x] v0.21.0b `endgame-5` level preserved with END-013..016
- [x] v0.21.0b `mixed` chapter preserved with MIX-001..008
- [x] v0.21.0b Pack B exact-once duplicate protection test still passes

## 7. v0.20 wiring regression (must remain green)

- [x] `CHILD_ENGINE_EXPLAIN` flag default off — byte-identical to v0.19
- [x] `ENGINE_HINT_PROJECTION` flag default off — byte-identical to v0.19
- [x] Multi-step + `CHILD_ENGINE_EXPLAIN=off` routes to `handleShowCoach()` (rule-template)
- [x] Multi-step + `CHILD_ENGINE_EXPLAIN=on` routes to `handleShowChildCoach()` (rule-template via honest low-confidence signal)
- [x] `ENGINE_HINT_PROJECTION=on` + first wrong attempt: `buildEngineHint()` called; with `topMoves: undefined` + low-confidence signal returns `no-hint`; no hint highlight rendered
- [x] No engine field reaches `/report`, `/wrong-book`, `/dev/session-summary`, or `localStorage`
- [x] 30-key `FORBIDDEN_PARENT_FIELDS` privacy boundary preserved end-to-end

## 8. Privacy and out-of-scope

- [x] No engine data is touched by v0.22
- [x] No telemetry, no Supabase, no parent UI, no parent gate change
- [x] No `StudentProgress` schema change
- [x] No new problem data added to `problems.json` (all wired problems already existed in v0.7.0b)
- [x] No Docker, package, CI, or build config change
- [x] v0.1 boundary preserved end-to-end

## 9. Release sign-off

- [x] `docs/RELEASE_NOTES_v0.22.md` is complete and accurate
- [x] `docs/QA_CHECKLIST_v0.22.md` is complete (this file)
- [x] `docs/NEXT_PHASE_PLAN_v0.22.md` exists and is current
- [x] `docs/TASKS.md` marks v0.22.0a–v0.22.0c delivered and v0.23.0a queued
- [x] All static validation passes
- [x] No open blockers from v0.22 QA
- [x] All docs are internally consistent
- [x] v0.1 scope respected: local-only, no parent UI, no persistence, no auth, no external AI, no Supabase
