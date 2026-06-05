# v0.10 — Daily-Practice Skill Filtering / Level-Aware Selection

> Project: 小棋童围棋闯关
> Release: v0.10
> Date: 2026-06-05

---

## 1. Release Summary

v0.10 is a daily-practice skill filtering series that replaces the old
random `shuffle + slice(10)` selection with a level-aware, category-
balanced, review-prioritized, and multi-step-gated algorithm. The change
directly improves daily practice quality for every child without adding
new content, changing schemas, or modifying runtime UI.

The release consists of four slices plus this stabilization:

- v0.10.0a — Next phase plan (planning, PR #116 / Issue #115)
- v0.10.0b — Category-balanced selection with basic level clamping (PR #118 / Issue #117)
- v0.10.0c — Spaced review and wrong-problem priority (PR #120 / Issue #119)
- v0.10.0d — Multi-step awareness and safe exposure (PR #122 / Issue #121)
- v0.10 stabilization — Release notes and QA checklist (this PR)

---

## 2. Direction and Rationale

v0.9 established CI and E2E smoke-test automation, making algorithmic
changes to `selectDailyProblems` safer to ship. v0.10.0a evaluated five
candidate directions (daily-practice skill filtering, deployment/Supabase
hardening, deeper multi-step, further content expansion, release
automation maturity) and selected **daily-practice skill filtering /
level-aware selection** because:

- **Direct child benefit.** Better selection quality benefits every
  child immediately, regardless of how many problems exist in the
  library.
- **No schema change.** `selectDailyProblems` is a pure function in
  `practice.ts`; the change is algorithmic only.
- **CI regression coverage.** v0.9 CI now provides automated regression
  coverage for practice and chapter flows, making algorithmic changes
  safer to validate.
- **Fills a known gap.** v0.8 full content wiring made all 77 problems
  reachable, but selection was still random. Children could receive
  level-5 multi-step problems on their first session.

The full rationale and slice boundaries are recorded in
`docs/NEXT_PHASE_PLAN_v0.10.md`.

---

## 3. Slice Summary

### v0.10.0a — Next Phase Plan (PR #116)

- Planning document `docs/NEXT_PHASE_PLAN_v0.10.md`.
- 5 candidate directions evaluated; daily-practice skill filtering
  selected.
- 4 implementation slices defined (b, c, d, stabilization) with explicit
  non-goals.
- Docs-only.

### v0.10.0b — Category-Balanced Selection with Basic Level Clamping (PR #118)

- `selectDailyProblems` now accepts `StudentProgress | null`.
- Null / empty / stale progress preserves old random fallback.
- With usable progress, daily practice applies:
  - Category-balanced round-robin: no more than 3 selected problems
    from one category when alternatives exist.
  - Basic level clamp: selected problem levels should not exceed
    `max(childMaxLevel, 2)` when enough lower-level candidates exist.
- `/practice` passes current `progress` into `selectDailyProblems`.
- 8 new/updated selection tests covering null/empty/stale fallback, category balance, level clamp, and sparse pool behavior.
- `npm run test`: 334 passed (21 files).

### v0.10.0c — Spaced Review and Wrong-Problem Priority (PR #120)

- `getPriorityProblems` helper reserves up to 2 slots for due review
  problems (`nextReviewAt <= today`) and 1 slot for a non-mastered
  wrong problem.
- Priority selections count toward per-category max-3 caps.
- Remaining slots filled by v0.10.0b category-balanced round-robin
  and level clamp.
- `selectDailyProblems` now accepts optional `today` param for
  testability.
- `src/lib/spaced-review.ts` was not modified.
- 7 new unit tests for review priority, wrong-problem priority, and
  v0.10.0b regression.
- `npm run test`: 341 passed (21 files).

### v0.10.0d — Multi-Step Awareness and Safe Exposure (PR #122)

- `isMultiStepProblem`, `getCategorySingleStepMaxLevel`, and
  `isMultiStepEligible` helper functions added.
- Multi-step problems are excluded unless:
  - the child has completed at least one single-step problem in the
    same category; AND
  - their max completed/mastered single-step level in that category is
    within 1 of the multi-step problem's level.
- Ineligible multi-step problems are excluded from all selection paths:
  priority picks, round-robin, and remaining fill.
- When eligible candidates are fewer than 10, the function returns only
  eligible candidates (possibly fewer than 10) rather than reintroducing
  ineligible multi-step problems.
- `ProblemStep` schema and problem data were not changed.
- 11 new unit tests covering eligibility rules, due/wrong priority
  interaction, sparse candidate behavior, and all-ineligible pool.
- `npm run test`: 351 passed (21 files).

---

## 4. Current Behavior Inventory

After v0.10, `selectDailyProblems(progress, today?)` behaves as follows:

| Condition | Behavior |
|---|---|
| `available.length <= 10` and no usable progress | Return all available |
| `available.length <= 10` and usable progress | Return eligible subset (may be fewer than 10 or empty) |
| No usable progress (`null` / empty / stale) | Old random `shuffle + slice(10)` |
| Usable progress | Apply level clamp → multi-step filter → priority picks → category round-robin → remaining fill |

Selection rules with usable progress:

| Rule | Detail |
|---|---|
| Level clamp | Selected levels ≤ `max(childMaxLevel, 2)` when enough candidates |
| Multi-step eligibility | Requires same-category single-step completion and level proximity ≤ 1 |
| Category balance | Max 3 per category when alternatives exist |
| Due review priority | Up to 2 due reviews from `reviewSchedule` |
| Wrong-problem priority | Up to 1 non-mastered wrong problem |
| Duplicate prevention | No problem ID appears more than once |
| Sparse eligible pool | Returns only eligible candidates; may be fewer than 10 |

---

## 5. Compatibility / Unchanged Areas

- No problem data changes (`src/data/problems.json` unchanged).
- No `ProblemStep` schema changes.
- No `src/lib/spaced-review.ts` scheduling algorithm changes.
- No `src/lib/chapters.ts` changes.
- No `src/app/practice/page.tsx` changes beyond v0.10.0b wiring.
- No E2E / CI / Playwright config changes.
- No `package.json` / `package-lock.json` changes.
- No SQL / Supabase behavior changes.
- No runtime UI redesign.
- Local anonymous mode remains fully functional without Supabase env.

---

## 6. Validation Status

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 351 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed |

This stabilization PR is documentation-only and does not change any code,
test, config, package, or behavior file, so it does not re-run the
validation checks; the numbers above are the values captured against
`main` after v0.10.0d (PR #122) merged.

---

## 7. Known Limitations / Non-Goals

- **No UI explanation for why a daily problem was selected.** Children
  see the same problem card regardless of whether the problem was chosen
  for review, wrong-problem rotation, or category balance.
- **No per-child profile configuration.** Selection parameters (max 3
  per category, up to 2 due reviews, up to 1 wrong problem) are fixed.
- **No new content.** The problem library remains 77 problems.
- **No ProblemStep schema v2.** Multi-step problems remain 2-step.
- **No 3+ step support.**
- **No visual regression or performance benchmarking.**
- **Mixed-category multi-step problems are always eligible.** This is
  a conservative default since no mixed multi-step problems currently
  exist in the library.

---

## 8. Next Phase Recommendation

The next slice should be a **planning-only `v0.11.0a` task** that picks a
single direction. v0.10 completes the daily-practice selection algorithm;
the next phase should evaluate what gap is most pressing.

Short comparison of candidate directions for v0.11:

| Direction | User impact | Effort | Risk | Notes |
|---|---|---|---|---|
| A. Deployment / Supabase env hardening | Low — ops-only | 1–2 slices | Low | Docker polish, env validation, first-run DX; improves ops reliability. |
| B. Deeper multi-step (3+ step, opening/endgame multi-step) | High pedagogically | 3–5 slices | Medium | Requires `ProblemStep` schema v2; harder to author and review. |
| C. Further content expansion | High for daily variety | 2–3 slices | Low | Continue adding problems beyond 77; diminishing novelty returns. |
| D. UI explainability for practice selection | Medium — child-facing | 1–2 slices | Low | Show "复习" badge or review indicator; no algorithm change. |
| E. Release automation maturity | None user-facing | 1 slice | Low | Improve E2E coverage, add visual regression; incremental over v0.9. |

**Recommended primary direction for v0.11.0a planning:** A — Deployment /
Supabase env hardening. Rationale:

- v0.2 introduced Supabase as an optional backend, but Docker
  deployment and env validation remain minimally documented.
- Every subsequent feature (multi-step, content, UI) will benefit from
  a reliable deployment and configuration foundation.
- Low risk; no schema, data, or runtime changes.
- Does not close the door on B or C for v0.11.0b+.

`v0.11.0a` itself should be docs-only: a `NEXT_PHASE_PLAN_v0.11.md` that
chooses one direction, defines 1–3 slices, and lists explicit non-goals.
It must **not** start implementation.

---

## 9. Release Decision Template

```text
Release: v0.10
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.10 stabilization
[ ] Not approved — see notes

Notes:
```
