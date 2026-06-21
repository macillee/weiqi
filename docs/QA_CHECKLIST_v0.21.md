# v0.21 — Pack B Chapter/Daily-Practice Wiring QA Checklist

## 1. Scope checklist

- [x] `docs/RELEASE_NOTES_v0.21.md` exists and covers v0.21.0a–v0.21.0b
- [x] `docs/QA_CHECKLIST_v0.21.md` exists (this file)
- [x] `docs/NEXT_PHASE_PLAN_v0.21.md` exists and is current
- [x] `src/lib/chapters.ts` has new `endgame-5` level and new `mixed` chapter
- [x] `src/__tests__/chapters.test.ts` exists — 15 tests
- [x] No algorithm change, no UI change, no route change, no selection-logic change, no recommendation-algorithm change, no practice-flow change, no wrong-book change, no report change, no level-progression change
- [x] No `FeedbackDialog` change, no `ProblemPlayer` change, no `GoBoard` change
- [x] No `StudentProgress` schema change, no persistence change
- [x] No new component, no new flag, no new helper, no new problem data
- [x] No package, Docker, CI, or build config change
- [x] No telemetry, no analytics, no Supabase, no parent UI, no engine, no AI

## 2. Static validation

- [x] `npm run lint` — exit 0
- [x] `npm run typecheck` — exit 0
- [x] `npm run test` — all 682 tests pass (32 files)
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

- [x] Existing `endgame-1`..`endgame-4` levels preserved (backward compatibility with saved progress and chapter-by-id links)
- [x] New `endgame-5` level exists
- [x] `endgame-5` problemIds = `[END-013, END-014, END-015, END-016]`
- [x] All 4 problems are level 3–5 endgame
- [x] `getAllProblemIdsInChapter("endgame")` includes END-013..016

### `mixed` chapter (new)

- [x] Chapter id `mixed`, title `综合擂台`, emoji `🏟️`
- [x] Description `多种功夫都用上`
- [x] 4 levels: `mixed-1`..`mixed-4`
- [x] `mixed-1` problemIds = `[MIX-001, MIX-002]`
- [x] `mixed-2` problemIds = `[MIX-003, MIX-004]`
- [x] `mixed-3` problemIds = `[MIX-005, MIX-006]`
- [x] `mixed-4` problemIds = `[MIX-007, MIX-008]`
- [x] All 8 mixed problems reachable
- [x] `getAllProblemIdsInChapter("mixed")` length = 8

### `categoryLabels`

- [x] `categoryLabels.mixed` defined and non-empty
- [x] Existing `categoryLabels` entries (capture / escape / connect_cut / life_death / opening / endgame) preserved

## 4. Daily-practice pool coverage manual QA

- [x] `getAllProblemIds()` covers 99 problems (was 87)
- [x] All 9 v0.20.0d Pack B problems reachable from the daily pool: END-013, END-014, END-015, END-016, MIX-004, MIX-005, MIX-006, MIX-007, MIX-008
- [x] All 3 v0.4.0b MIX problems reachable from the daily pool: MIX-001, MIX-002, MIX-003
- [x] `selectDailyProblems()` automatically samples the newly-wired problems with no algorithm change
- [x] E2E smoke `第 1 / 110 题` (unchanged from v0.20.0d) still passes

### Out of scope (deferred)

- [x] `END-011`, `END-012`, `CAP-022`, `CC-018` remain unwired in `problems.json` (deferred to a follow-up slice, not in v0.21.0b scope)
- [x] `MULTI-008`, `MULTI-009` already wired in v0.8 (in `connect-cut-8` and `escape-8` respectively); no change needed

## 5. Duplicate-protection manual QA

- [x] Every Pack B ID appears **exactly once** across all chapters (no accidental duplicate wiring)
- [x] No `problemId` is duplicated globally across all chapters
- [x] If a developer accidentally adds the same `problemId` to two levels, the regression test fails

## 6. v0.20 wiring regression (must remain green)

- [x] `CHILD_ENGINE_EXPLAIN` flag default off — byte-identical to v0.19
- [x] `ENGINE_HINT_PROJECTION` flag default off — byte-identical to v0.19
- [x] Multi-step + `CHILD_ENGINE_EXPLAIN=off` routes to `handleShowCoach()` (rule-template)
- [x] Multi-step + `CHILD_ENGINE_EXPLAIN=on` routes to `handleShowChildCoach()` (rule-template via honest low-confidence signal)
- [x] `ENGINE_HINT_PROJECTION=on` + first wrong attempt: `buildEngineHint()` called; with `topMoves: undefined` + low-confidence signal returns `no-hint`; no hint highlight rendered
- [x] No engine field reaches `/report`, `/wrong-book`, `/dev/session-summary`, or `localStorage`
- [x] 30-key `FORBIDDEN_PARENT_FIELDS` privacy boundary preserved end-to-end

## 7. Privacy and out-of-scope

- [x] No engine data is touched by v0.21.0b
- [x] No telemetry, no Supabase, no parent UI, no parent gate change
- [x] No `StudentProgress` schema change
- [x] No new problem data added to `problems.json` (all wired problems already existed in v0.20.0d)
- [x] No Docker, package, CI, or build config change
- [x] v0.1 boundary preserved end-to-end

## 8. Release sign-off

- [x] `docs/RELEASE_NOTES_v0.21.md` is complete and accurate
- [x] `docs/QA_CHECKLIST_v0.21.md` is complete (this file)
- [x] `docs/NEXT_PHASE_PLAN_v0.21.md` exists and is current
- [x] `docs/TASKS.md` marks v0.21.0a–v0.21.0b delivered and v0.21.0c (this slice) queued
- [x] All static validation passes
- [x] No open blockers from v0.21 QA
- [x] All docs are internally consistent
- [x] v0.1 scope respected: local-only, no parent UI, no persistence, no auth, no external AI, no Supabase
