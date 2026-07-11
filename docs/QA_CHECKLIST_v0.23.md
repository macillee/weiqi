# v0.23 — Wire Remaining 7 Unwired v0.7.0b Problems QA Checklist

## 1. Scope checklist

- [x] `docs/RELEASE_NOTES_v0.23.md` exists and covers v0.23.0a–v0.23.0b
- [x] `docs/QA_CHECKLIST_v0.23.md` exists (this file)
- [x] `docs/NEXT_PHASE_PLAN_v0.23.md` exists and is current
- [x] `src/lib/chapters.ts` has new `capture-14`, `escape-9`, `connect-cut-10`, `opening-6`, `life-death-7` levels
- [x] `src/__tests__/chapters.test.ts` has 14 new v0.23.0b tests, 1 v0.22.0b count assertion relaxed to `>= 103`
- [x] No algorithm change, no UI change, no route change, no selection-logic change, no recommendation-algorithm change, no practice-flow change, no wrong-book change, no report change, no level-progression change
- [x] No `FeedbackDialog` change, no `ProblemPlayer` change, no `GoBoard` change
- [x] No `StudentProgress` schema change, no persistence change
- [x] No new component, no new flag, no new helper, no new problem data
- [x] No package, Docker, CI, or build config change
- [x] No telemetry, no analytics, no Supabase change, no parent UI, no engine change, no AI change

## 2. Static validation

- [x] `npm run lint` — exit 0
- [x] `npm run typecheck` — exit 0
- [x] `npm run test` — all 705 tests pass (32 files)
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

### `capture` chapter

- [x] Existing `capture-1`..`capture-13` levels preserved (backward compatibility)
- [x] New `capture-14` level exists
- [x] `capture-14` problemIds = `[CAP-021]`
- [x] Problem is capture category
- [x] `getAllProblemIdsInChapter("capture")` includes CAP-021

### `escape` chapter

- [x] Existing `escape-1`..`escape-8` levels preserved
- [x] New `escape-9` level exists
- [x] `escape-9` problemIds = `[ESC-013, ESC-014]`
- [x] Both problems are escape category
- [x] `getAllProblemIdsInChapter("escape")` includes ESC-013, ESC-014

### `connect_cut` chapter

- [x] Existing `connect-cut-1`..`connect-cut-9` levels preserved
- [x] New `connect-cut-10` level exists
- [x] `connect-cut-10` problemIds = `[CC-017]`
- [x] Problem is connect_cut category
- [x] `getAllProblemIdsInChapter("connect_cut")` includes CC-017

### `opening` chapter

- [x] Existing `opening-1`..`opening-5` levels preserved
- [x] New `opening-6` level exists
- [x] `opening-6` problemIds = `[OP-011, OP-012]`
- [x] Both problems are opening category
- [x] `getAllProblemIdsInChapter("opening")` includes OP-011, OP-012

### `life_death` chapter

- [x] Existing `life-death-1`..`life-death-6` levels preserved
- [x] New `life-death-7` level exists
- [x] `life-death-7` problemIds = `[LD-013]`
- [x] Problem is life_death category
- [x] `getAllProblemIdsInChapter("life_death")` includes LD-013

### `categoryLabels`

- [x] Existing `categoryLabels` entries (capture / escape / connect_cut / life_death / opening / endgame / mixed) preserved

## 4. Daily-practice pool coverage manual QA

- [x] `getAllProblemIds()` covers 110 problems (was 103) — full library coverage achieved
- [x] All 7 newly-wired problems reachable from the daily pool: CAP-021, ESC-013, ESC-014, CC-017, OP-011, OP-012, LD-013
- [x] `selectDailyProblems()` automatically samples the newly-wired problems with no algorithm change

### Full coverage

- [x] All 110 problems in `problems.json` are now wired into chapter navigation and the daily-practice pool
- [x] The v0.22.0b "remaining 7" gap is fully closed by v0.23.0b

## 5. Duplicate-protection manual QA

- [x] Each of the 7 target IDs appears **exactly once** across all chapters (no accidental duplicate wiring)
- [x] No `problemId` is duplicated globally across all chapters
- [x] If a developer accidentally adds the same `problemId` to two levels, the regression test fails

## 6. v0.22 wiring regression (must remain green)

- [x] v0.22.0b `endgame-6` level preserved with END-011/012
- [x] v0.22.0b `capture-13` level preserved with CAP-022
- [x] v0.22.0b `connect-cut-9` level preserved with CC-018
- [x] v0.22.0b exact-once duplicate protection test still passes

## 7. v0.21 wiring regression (must remain green)

- [x] v0.21.0b `endgame-5` level preserved with END-013..016
- [x] v0.21.0b `mixed` chapter preserved with MIX-001..008
- [x] v0.21.0b Pack B exact-once duplicate protection test still passes

## 8. v0.20 wiring regression (must remain green)

- [x] `CHILD_ENGINE_EXPLAIN` flag default off — byte-identical to v0.19
- [x] `ENGINE_HINT_PROJECTION` flag default off — byte-identical to v0.19
- [x] Multi-step + `CHILD_ENGINE_EXPLAIN=off` routes to `handleShowCoach()` (rule-template)
- [x] Multi-step + `CHILD_ENGINE_EXPLAIN=on` routes to `handleShowChildCoach()` (rule-template via honest low-confidence signal)
- [x] `ENGINE_HINT_PROJECTION=on` + first wrong attempt: `buildEngineHint()` called; with `topMoves: undefined` + low-confidence signal returns `no-hint`; no hint highlight rendered
- [x] No engine field reaches `/report`, `/wrong-book`, `/dev/session-summary`, or `localStorage`
- [x] 30-key `FORBIDDEN_PARENT_FIELDS` privacy boundary preserved end-to-end

## 9. Privacy and out-of-scope

- [x] No engine data is touched by v0.23
- [x] No telemetry, no Supabase change, no parent UI, no parent gate change
- [x] No `StudentProgress` schema change
- [x] No new problem data added to `problems.json` (all wired problems already existed in v0.7.0b)
- [x] No Docker, package, CI, or build config change
- [x] v0.1 boundary preserved end-to-end

## 10. Release sign-off

- [x] `docs/RELEASE_NOTES_v0.23.md` is complete and accurate
- [x] `docs/QA_CHECKLIST_v0.23.md` is complete (this file)
- [x] `docs/NEXT_PHASE_PLAN_v0.23.md` exists and is current
- [x] `docs/TASKS.md` marks v0.23.0a–v0.23.0c delivered
- [x] All static validation passes
- [x] No open blockers from v0.23 QA
- [x] All docs are internally consistent
- [x] v0.1 scope respected: local-first child-facing flow preserved; no parent UI, no persistence/auth/Supabase/engine/AI changes introduced by v0.23
