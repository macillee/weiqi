# v0.20 — Gated Consumer Wiring + Content Pack B QA Checklist

## 1. Scope checklist

- [x] `docs/RELEASE_NOTES_v0.20.md` exists and covers v0.20.0a–v0.20.0d
- [x] `docs/QA_CHECKLIST_v0.20.md` exists (this file)
- [x] `docs/NEXT_PHASE_PLAN_v0.20.md` exists and is current
- [x] `docs/CONTENT_REVIEW_v0.20.md` exists with per-problem review
- [x] `src/components/problem/ProblemPlayer.tsx` has `handleShowChildCoach()` and `engineHint` projection
- [x] `src/__tests__/ProblemPlayer.multi-step.test.tsx` exists — 23 tests
- [x] `src/data/problems.json` has 110 problems (101 pre-Pack-B + 9 Pack B)
- [x] `src/__tests__/problems.test.ts` includes 7 new Pack B regression tests
- [x] No parent dashboard, child-facing summary, navigation link, end-of-session modal, history/report view, persistence, API route, Server Action, telemetry, Supabase write, external AI, new KataGo integration, or diagnostics integration was added
- [x] No `FeedbackDialog` change, no route change, no selection logic change, no recommendation algorithm change, no practice flow change, no wrong-book change, no report change, no level progression change
- [x] No package, Docker, CI, or build config change

## 2. Static validation

- [x] `npm run lint` — exit 0
- [x] `npm run typecheck` — exit 0
- [x] `npm run test` — all 667 tests pass (31 files)
- [x] `npm run build` — compiled successfully
- [x] `npm run test:e2e` — passes in CI

## 3. `CHILD_ENGINE_EXPLAIN` flag manual QA

### Flag off (default)

- [x] Single-step problem: "请老师帮忙" routes through `handleShowCoach()` (rule-template)
- [x] Multi-step problem: "请老师帮忙" routes through `handleShowCoach()` (rule-template)
- [x] No `engine-assisted` source rendered in `FeedbackDialog`
- [x] Single-step + multi-step + flag-off all byte-identical to v0.19

### Flag on

- [x] Single-step problem: "请老师帮忙" still routes through `handleShowCoach()` (single-step gate)
- [x] Multi-step problem, wrong attempt: "请老师帮忙" routes through `handleShowChildCoach()`
- [x] `source` rendered as `rule-template` (honest low-confidence signal; no `engine-assisted` caption)
- [x] Stale-async guard: engine response discarded when `coachRequestId` counter doesn't match
- [x] Try-again resets coach state
- [x] `validateChildEngineExplain()` defense-in-depth prevents invalid output

## 4. `ENGINE_HINT_PROJECTION` flag manual QA

### Flag off (default)

- [x] No hint highlight projected after wrong attempt
- [x] Rendered highlights are byte-identical to v0.19

### Flag on

- [x] First wrong attempt: `buildEngineHint()` called; when `topMoves` is undefined → `no-hint` → no hint highlight rendered
- [x] Second wrong attempt: single-attempt guard prevents re-fire
- [x] Try-again: hint state cleared
- [x] Problem change: hint state cleared
- [x] Only `hint` / `correct` / `wrong` highlight types ever rendered (allowlist regression)

## 5. Content Pack B manual QA

### Problem data

- [x] `problems.json` contains exactly 110 problems
- [x] All 9 Pack B IDs exist: END-013, END-014, END-015, END-016, MIX-004, MIX-005, MIX-006, MIX-007, MIX-008
- [x] All Pack B problems at levels 3–5
- [x] Endgame category: 4 new problems (END-013..016)
- [x] Mixed category: 5 new problems (MIX-004..008)
- [x] No duplicate coordinates in initial board states
- [x] All answer points on empty intersections
- [x] All failureMessages use warm, non-judgmental wording
- [x] All successMessages are concise and encouraging
- [x] MIX-006 accepts both `(4,3)` and `(5,3)` as answers

### `/demo` flow

- [x] `/demo` loads a problem; board renders with 110-problem library
- [x] E2E `e2e/demo.spec.ts` shows "第 1 / 110 题"

## 6. Privacy regression

- [x] v0.19.0d `FORBIDDEN_PARENT_FIELDS` with 16 engine / KataGo keys preserved
- [x] No engine field rendered in `FeedbackDialog` source label without real engine review
- [x] `ProblemPlayer.multi-step.test.tsx` includes privacy regression test: no engine field on wired output shape
- [x] `checkPrivacyBoundary()` still enforces all 30 forbidden keys

## 7. v0.19 regression

- [x] `engine-hint.ts` pure helper unchanged
- [x] `child-engine-explain.ts` pure helper unchanged
- [x] `parent-review-session-history.ts` `FORBIDDEN_PARENT_FIELDS` unchanged
- [x] `/dev/session-summary` unchanged from v0.17
- [x] `session-summary.ts` unchanged
- [x] `session-summary-input.ts` unchanged
- [x] All v0.19.0b/0c test suites still pass

## 8. Core app regression

- [x] Daily practice flow works end-to-end
- [x] Chapter/level flow works end-to-end
- [x] Wrong book flow works end-to-end
- [x] Report page loads and displays data
- [x] Settings page renders with audio toggle
- [x] Local anonymous mode fully functional (no Supabase env)
- [x] `/demo` isolation preserved (no progress written)

## 9. Release sign-off

| Check | Status |
|---|---|
| Release notes cover v0.20.0a–0d | ✅ |
| QA checklist covers all slices | ✅ |
| Lint / typecheck / test / build all green | ✅ |
| No v0.1 scope violations | ✅ |
| No privacy boundary regressions | ✅ |
| Content Pack B data verified | ✅ |
| Feature flags off by default, off-state = v0.19 | ✅ |
| Known limitations documented | ✅ |

**Approved for v0.20 stabilization.**
