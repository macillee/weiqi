# v0.7 — Content Balancing (Endgame + Opening + Level 3–5)

> Project: 小棋童围棋闯关
> Release: v0.7
> Date: 2026-06-04

---

## 1. Release Summary

v0.7 is a content balancing series that addresses the documented limitations
from v0.5: thin endgame (4 problems, levels 1–3 only), thin opening
(5 problems, no level 5), and level 2 dominance (32/65 problems).

No runtime UX changes, no schema changes, no scheduling or weekly report
changes — only problem data and its validation tests.

The release follows three slices (v0.7.0a–c) plus this stabilization
(v0.7.0d), each delivered as its own PR:

- v0.7.0a — Next phase plan (planning, PR #86)
- v0.7.0b — Content pack: 12 new single-step 9×9 problems (PR #89)
- v0.7.0c — Content validation and regression tests (PR #91)
- v0.7.0d — Stabilization and release notes (this PR)

---

## 2. Direction and Rationale

v0.6 UX polish brought Chinese board labels, success animations, audio
feedback, and progressive hint cards to the existing 65-problem library.
With the UX foundation ready, v0.7.0a evaluated four candidate directions
(content balancing, deeper multi-step, infrastructure/CI, deployment
hardening) and selected **content balancing** because:

- v0.5 release notes already flagged endgame thinness, opening thinness
  with no level 5, and level 2 dominance — these gaps directly affect
  daily practice quality.
- Content expansion is a low-risk, well-rehearsed pattern (v0.4 and v0.5
  both shipped cleanly under the same plan → content → validation →
  stabilization shape).
- v0.6 proved the UX is polished enough that more content is rewarding
  to play, not just listed.
- Deeper multi-step (Direction B) requires a `ProblemStep` schema change
  that was not in scope for v0.7; infrastructure (C) and deployment (D)
  have lower immediate product impact.

The full rationale and slice boundaries are recorded in
`docs/NEXT_PHASE_PLAN_v0.7.md`.

---

## 3. Slice Summary

### v0.7.0a — Next Phase Plan (PR #86)

- Planning document `docs/NEXT_PHASE_PLAN_v0.7.md`.
- 4 candidate directions evaluated; content balancing selected.
- 3 implementation slices defined (b, c, d) with explicit non-goals.
- Docs-only.

### v0.7.0b — Content Pack: Endgame + Opening + Level 3–5 (PR #89)

Added 12 new single-step 9×9 problems (library: 65 → 77):

| ID | Category | Level | Theme |
|---|---|---|---|
| END-005 | endgame | 2 | Edge endgame — fill the last big point |
| END-006 | endgame | 3 | Corner endgame — fill the key point |
| END-007 | endgame | 4 | Center connect — join two black groups |
| END-008 | endgame | 5 | Center defend — hold the last big point |
| OP-006 | opening | 5 | Tengen after opponent takes a corner |
| OP-007 | opening | 3 | Small knight approach to opponent corner |
| OP-008 | opening | 3 | Small knight corner enclosure |
| OP-009 | opening | 4 | Edge extension from corner |
| CAP-018 | capture | 3 | Capture white 2×2 block in atari |
| ESC-011 | escape | 3 | Escape single stone from atari to center |
| CC-014 | connect_cut | 3 | Cut between two white stones |
| LD-010 | life_death | 3 | Make first eye in a 3×3 ring |

All 12 problems: 9×9, single-step, ≥2 hints, soft failureMessage,
category-aligned tag, answer points empty, no zero-liberty initial groups.

Files: `src/data/problems.json`, `docs/CONTENT_REVIEW_v0.7.0b.md`.

### v0.7.0c — Content Validation and Regression (PR #91)

- Added 10 new tests to `src/__tests__/problems.test.ts`:
  - 6 review-time correctness checks (END-006, END-008, OP-007, OP-008,
    OP-009, CC-014) mirroring the v0.5.0c pattern.
  - 4 per-property validation tests (answer emptiness, ≥2 hints,
    failureMessage tone, single-answer).
- Created `docs/CONTENT_REVIEW_v0.7.0c.md` — validation log with
  per-problem verification and final distribution.
- `npm run test`: 326 passed (21 files).
- `npm run build`: compiled successfully.

---

## 4. Final Content Inventory

### Category Distribution

| Category | Before (v0.5.0b) | After (v0.7.0b) | Delta |
|---|---:|---:|---:|
| capture | 20 | 21 | +1 |
| escape | 11 | 12 | +1 |
| connect_cut | 14 | 15 | +1 |
| life_death | 11 | 12 | +1 |
| opening | 5 | 9 | +4 |
| endgame | 4 | 8 | +4 |
| **Total** | **65** | **77** | **+12** |

### Level Distribution

| Level | Before (v0.5.0b) | After (v0.7.0b) | Delta |
|---|---:|---:|---:|
| 1 | 10 | 10 | 0 |
| 2 | 32 | 33 | +1 |
| 3 | 13 | 20 | +7 |
| 4 | 5 | 7 | +2 |
| 5 | 5 | 7 | +2 |
| **Total** | **65** | **77** | **+12** |

### Single-step / Multi-step Split

- Single-step: 68
- Multi-step (all 2-step): 9

---

## 5. Backward Compatibility

- All 77 problems pass `validateAllProblems`.
- Problem schema unchanged — single-step and 2-step `ProblemStep` only.
- Runtime UI behavior unchanged: ProblemPlayer, GoBoard, HintPanel,
  CelebrationOverlay, audio feedback, coordinate labels all unchanged.
- Progress/wrong-book/spaced-review/weekly-report behavior unchanged.
- Supabase server mode unchanged; missing Supabase env still does not
  break local anonymous mode.
- No `package.json` / `package-lock.json` changes across v0.7.
- No SQL migrations or Supabase integration changes.
- No new external dependencies.

---

## 6. Known Limitations

- **Level 2 still dominates.** Despite the deliberate tilt toward levels
  3–5 (+7 at L3, +2 at L4, +2 at L5), level 2 remains the largest
  single tier at 33/77 problems (~43%).
- **No 3+ step multi-step problems.** All 9 multi-step problems remain at
  2 steps; no opening or endgame multi-step problems exist.
- **Chapter wiring and daily-practice rotation** for the 12 new problems
  remains deferred. New problems are reachable via `/demo` and spaced
  review but are **not** yet in the chapter flow or daily practice pool.
- **No 13×13 / 19×19 board support.** v0.7 is 9×9 only.
- **No E2E / Playwright tests or CI hardening** was added in v0.7 —
  the project still relies on manual QA and unit tests.
- **New problem Go-logic correctness** was verified statically (initial
  board checks, answer-point emptiness, liberty counts) but no full game
  tree simulation exists for multi-step problems.

---

## 7. Validation Status

| Check | Result |
|---|---|
| `npm run test` | 326 passed (21 files) on `main` after v0.7.0c |
| `npm run build` | Compiled successfully across v0.7.0b–c PRs |
| `package.json` | Unchanged across v0.7 |
| `package-lock.json` | Unchanged across v0.7 |
| Problem schema | Unchanged |
| Supabase / SQL | Unchanged |
| Runtime UI code | Unchanged |

This stabilization PR is documentation-only and does not change any code,
test, config, package, or behavior file, so it does not re-run
`npm run test` / `npm run build`; the numbers above were captured against
`main` after v0.7.0c (PR #91) merged.

For acceptance testing against this release, see
`docs/QA_CHECKLIST_v0.7.md`.

---

## 8. Next Phase Recommendation

The next slice should be a **planning-only `v0.8.0a` task** that picks a
single direction. v0.7 closes out the content balancing theme; the next
phase should evaluate fresh directions rather than continuing content work.

Short comparison of candidate directions for v0.8:

| Direction | User impact | Effort | Risk | Notes |
|---|---|---|---|---|
| E. Infrastructure / E2E / CI hardening | None user-facing | 1–2 slices | Low | Playwright smoke tests, CI polish, pre-commit hooks; highest long-term maintainability ROI. |
| F. Deployment / Supabase env hardening | None user-facing | 1 slice | Low | Docker compose polish, env validation, first-run DX; limited audience. |
| G. Deeper multi-step (3+ step, opening/endgame multi-step) | High pedagogically | 3–5 slices | Medium | Requires `ProblemStep` schema v2; harder to author and review. |
| H. Chapter / daily-practice content wiring | Medium — unlocks new content in daily rotation | 1 slice | Low | Wire the 12 new v0.7.0b problems into `chapters.ts` and daily practice pool; no schema change. |
| I. Content expansion (further) | High for daily variety | 2–3 slices | Low | Continue the v0.7 pattern; diminishing novelty returns after 3 consecutive content series. |

**Recommended primary direction for v0.8.0a planning:** H — chapter /
daily-practice content wiring. Rationale:

- It directly unlocks the 12 new v0.7.0b problems for daily practice and
  chapter flow, which is the highest-impact next step after content
  creation.
- It is a single, small slice with no schema, UI, or dependency change.
- It does not close the door on E, F, or G for v0.8.0b+.

E (infrastructure) is the recommended **secondary** candidate if the team
judges wiring to be premature or if the content gap is not pressing.

`v0.8.0a` itself should be docs-only: a `NEXT_PHASE_PLAN_v0.8.md` that
chooses one direction, defines 1–3 slices, and lists explicit non-goals.
It must **not** start implementation.

---

## 9. Release Decision Template

```text
Release: v0.7
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.7 stabilization
[ ] Not approved — see notes

Notes:
```
