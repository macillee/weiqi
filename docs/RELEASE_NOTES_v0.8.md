# v0.8 — Content Wiring (Chapter / Daily-Practice)

> Project: 小棋童围棋闯关
> Release: v0.8
> Date: 2026-06-04

---

## 1. Release Summary

v0.8 is a content-wiring series that closes the largest product gap
identified at the end of v0.7: only 24 of 77 problems were reachable in
learner-facing chapter flow and daily practice selection. After v0.8, all
77 problems are wired into chapters and available for daily practice.

No problem data changes, no schema changes, no runtime UI changes, no
`practice.ts` changes — only `chapters.ts` data wiring.

The release follows four slices (v0.8.0a–d) plus this stabilization:

- v0.8.0a — Next phase plan (planning, PR #95)
- v0.8.0b — Wire capture + escape + connect_cut (21 problems, PR #97)
- v0.8.0c — Wire life_death + endgame + opening (23 problems, PR #99)
- v0.8.0d — Wire multi-step problems (9 problems, PR #101)

---

## 2. Direction and Rationale

v0.7 content balancing expanded the library to 77 problems but left 53 of
them only reachable via `/demo` and spaced review. v0.8.0a evaluated five
candidate directions (chapter wiring, infrastructure/CI, deployment
hardening, deeper multi-step, further content expansion) and selected
**chapter / daily-practice content wiring** because:

- 53/77 problems (69%) were unreachable in the main learning flows.
  Wiring them more than doubles the practice-accessible library from 24
  to 77.
- v0.7.0b and v0.7.0d explicitly deferred chapter wiring; further
  deferral would erode credibility.
- No schema, UI, package, lockfile, SQL, or dependency changes —
  `chapters.ts` is a plain data file.
- Wiring prepares the ground for future content expansion (new problems
  appear in daily practice immediately) and deeper multi-step support
  (chapter-gated content instead of review-only).
- Infrastructure (Direction B) is the recommended secondary direction;
  it benefits from having a complete content flow to test against.

The full rationale and slice boundaries are recorded in
`docs/NEXT_PHASE_PLAN_v0.8.md`.

---

## 3. Slice Summary

### v0.8.0a — Next Phase Plan (PR #95)

- Planning document `docs/NEXT_PHASE_PLAN_v0.8.md`.
- 5 candidate directions evaluated; chapter/daily-practice wiring selected.
- 3 implementation slices defined (b, c, d) with explicit non-goals.
- Docs-only.

### v0.8.0b — Wire Capture + Escape + Connect_Cut (PR #97)

Wired 21 single-step problems into existing chapter structures:

| Chapter | New Levels | Problem IDs |
|---|---|---|
| 吃子小岛 (capture) | capture-6 ~ capture-9 | CAP-011~018 (8 problems) |
| 逃跑森林 (escape) | escape-4 ~ escape-6 | ESC-006~011 (6 problems) |
| 连接桥 (connect_cut) | connect-cut-4 ~ connect-cut-6 | CC-007~009, CC-011~014 (7 problems) |

Wired count after: 45 (24 existing + 21 new).

### v0.8.0c — Wire Life/Death + Endgame + Opening (PR #99)

Wired 23 single-step problems, creating two new chapters and extending
one:

| Chapter | New Levels | Problem IDs |
|---|---|---|
| 死活山洞 (life_death) — **new** | life-death-1 ~ life-death-4 | LD-001~004, LD-006~010 (9 problems) |
| 官子山谷 (endgame) — **new** | endgame-1 ~ endgame-3 | END-001~008 (8 problems) |
| 布局城堡 (opening) — extended | opening-3 ~ opening-4 | OP-004~009 (6 problems) |

Wired count after: 68 (45 + 23).

### v0.8.0d — Wire Multi-Step Problems (PR #101)

Wired all 9 multi-step problems into their category-correct chapters:

| Chapter | New Level | Problem IDs |
|---|---|---|
| 吃子小岛 (capture) | capture-10 | MULTI-001, MULTI-004, MULTI-005 |
| 死活山洞 (life_death) | life-death-5 | MULTI-002, MULTI-006, MULTI-007 |
| 连接桥 (connect_cut) | connect-cut-7 | MULTI-003, MULTI-008 |
| 逃跑森林 (escape) | escape-7 | MULTI-009 |

Wired count after: 77 (68 + 9) — full library.

---

## 4. Final Chapter Inventory

| Chapter ID | Title | Emoji | Levels | Problem Count | Single-step | Multi-step |
|---|---|---|---|---:|---:|---:|
| capture | 吃子小岛 | 🏝️ | 10 | 21 | 18 | 3 |
| escape | 逃跑森林 | 🌲 | 7 | 12 | 11 | 1 |
| connect_cut | 连接桥 | 🌉 | 7 | 15 | 13 | 2 |
| opening | 布局城堡 | 🏰 | 4 | 9 | 9 | 0 |
| life_death | 死活山洞 | 🏯 | 5 | 12 | 9 | 3 |
| endgame | 官子山谷 | 🌄 | 3 | 8 | 8 | 0 |
| **Total** | | | **36** | **77** | **68** | **9** |

### Category Distribution

| Category | Problems | Percentage |
|---|---:|---:|
| capture | 21 | 27.3% |
| connect_cut | 15 | 19.5% |
| escape | 12 | 15.6% |
| life_death | 12 | 15.6% |
| opening | 9 | 11.7% |
| endgame | 8 | 10.4% |
| **Total** | **77** | **100%** |

---

## 5. Backward Compatibility

- All 77 problems pass `validateAllProblems`.
- No problem data changes (`src/data/problems.json` untouched across v0.8).
- No problem schema changes — single-step and 2-step `ProblemStep` only.
- No `practice.ts` changes — daily practice automatically picks up newly
  wired problems via `getAllProblemIds()`.
- No ProblemPlayer, GoBoard, HintPanel, CelebrationOverlay, audio
  feedback, or coordinate label changes.
- Progress/wrong-book/spaced-review/weekly-report behavior unchanged.
- Supabase server mode unchanged; missing Supabase env still does not
  break local anonymous mode.
- No `package.json` / `package-lock.json` changes across v0.8.
- No SQL migrations or Supabase integration changes.
- No new external dependencies.

---

## 6. Known Limitations

- **Daily practice selection lacks skill filtering.** `selectDailyProblems`
  picks randomly from the full wired pool; it does not adjust difficulty
  based on the child's current skill level or recent performance.
- **Multi-step problems remain 2-step only.** All 9 multi-step problems
  use the existing 2-step `ProblemStep` schema; no 3+ step problems or
  `ProblemStep` schema v2 exists.
- **No E2E / Playwright tests or CI automation.** The project still relies
  on manual QA and unit tests.
- **No deployment hardening.** Docker compose and Supabase env setup
  remain unchanged from v0.6.
- **No new problem content beyond the existing 77.** v0.8 is wiring-only;
  no new problems were added.
- **No opening or endgame multi-step problems.** All 9 multi-step
  problems are in capture, life_death, connect_cut, and escape.

---

## 7. Validation Status

| Check | Result |
|---|---|
| `npm run test` | 326 passed (21 files) on `main` after v0.8.0d |
| `npm run build` | Compiled successfully across v0.8.0b–d PRs |
| `package.json` | Unchanged across v0.8 |
| `package-lock.json` | Unchanged across v0.8 |
| Problem schema | Unchanged |
| Problem data (`problems.json`) | Unchanged |
| Supabase / SQL | Unchanged |
| Runtime UI code | Unchanged |
| `practice.ts` | Unchanged |

This stabilization PR is documentation-only and does not change any code,
test, config, package, or behavior file, so it does not re-run
`npm run test` / `npm run build`; the numbers above were captured against
`main` after v0.8.0d (PR #101) merged.

For acceptance testing against this release, see
`docs/QA_CHECKLIST_v0.8.md`.

---

## 8. Next Phase Recommendation

The next slice should be a **planning-only `v0.9.0a` task** that picks a
single direction. v0.8 closes out the content-wiring theme; the next
phase should evaluate fresh directions.

Short comparison of candidate directions for v0.9:

| Direction | User impact | Effort | Risk | Notes |
|---|---|---|---|---|
| A. Infrastructure / E2E / CI hardening | None user-facing | 1–2 slices | Low | Playwright smoke tests, CI lint+typecheck+test on every PR; highest long-term maintainability ROI. |
| B. Deployment / Supabase env hardening | None user-facing | 1 slice | Low | Docker compose polish, env validation; limited audience. |
| C. Deeper multi-step (3+ step, schema v2) | High pedagogically | 4–5 slices | Medium | Requires `ProblemStep` schema change; harder to author and review. |
| D. Further content expansion | High for daily variety | 2–3 slices | Low | Diminishing novelty after 3 consecutive content series + 1 wiring series; wiring gap is now 0 so new problems are immediately usable. |
| E. Daily-practice skill filtering / level-aware selection | Medium | 1–2 slices | Low | Adjust daily problem selection based on the child's performance history; improves practice quality without new content. |

**Recommended primary direction for v0.9.0a planning:** A —
infrastructure / E2E / CI hardening. Rationale:

- v0.8 completes the content story (77 problems, fully wired). The
  next highest-ROI investment is in long-term maintainability and
  regression safety.
- Every future slice (content, multi-step, skill filtering) benefits
  from automated regression coverage.
- The manual QA checklist pattern has worked for v0.5–v0.8 but is
  increasingly labor-intensive as the chapter and problem count grows.
- A (infrastructure) and E (skill filtering) are complementary; A can
  ship first with E as a secondary candidate.

`v0.9.0a` itself should be docs-only: a `NEXT_PHASE_PLAN_v0.9.md` that
chooses one direction, defines slices, and lists explicit non-goals. It
must **not** start implementation.

---

## 9. Release Decision Template

```text
Release: v0.8
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.8 stabilization
[ ] Not approved — see notes

Notes:
```
