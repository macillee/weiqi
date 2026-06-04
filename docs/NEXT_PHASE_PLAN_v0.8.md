# v0.8 Next Phase Plan

> Project: 小棋童围棋闯关
> Version: v0.8.0a (planning)
> Date: 2026-06-04

---

## 1. Context

v0.7 content balancing is complete and stabilized:

- v0.7.0a: next phase plan selected content balancing as the primary v0.7
  direction (`docs/NEXT_PHASE_PLAN_v0.7.md`).
- v0.7.0b: added 12 single-step 9×9 problems (PR #89).
- v0.7.0c: strengthened validation/regression tests (PR #91).
- v0.7.0d: release notes and QA checklist published (PR #93).
- Library: 77 problems total (68 single-step, 9 multi-step, 6 categories,
  levels 1–5).
- v0.6 UX polish (labels, celebration, audio, hints) remains stable.

Library state at the start of v0.8:

- **77 total problems** (68 single-step, 9 multi-step).
- 6 categories: capture (21), escape (12), connect_cut (15), life_death
  (12), opening (9), endgame (8).
- Levels 1–5 populated; level 2 still dominates (33/77 = 43 %).
- Multi-step problems capped at 2 steps; no opening or endgame multi-step.
- 9×9 only.

### Wiring Gap

Only **24 of 77 problems** are wired into `chapters.ts` and therefore
reachable via daily practice and chapter flow:

| Category | Wired | Total | Unwired |
|---|---|---|---|
| capture | 10 | 21 | 11 |
| escape | 5 | 12 | 7 |
| connect_cut | 6 | 15 | 9 |
| life_death | 0 | 12 | 12 |
| opening | 3 | 9 | 6 |
| endgame | 0 | 8 | 8 |
| **Total** | **24** | **77** | **53** |

- All life_death and endgame problems are completely unwired (no chapters
  exist for these categories).
- All 9 multi-step problems are unwired.
- 53 problems are only reachable via `/demo` and spaced review.

This is the largest single gap in the current product experience.

---

## 2. Candidate Directions

### A. Chapter / Daily-Practice Content Wiring

Wire the 53 unwired problems into `chapters.ts` so they appear in learner-
facing chapter flow and daily practice selection.

Strengths:

- **Highest direct user impact.** Wiring unlocks 53 problems for daily
  practice and chapter play — more than doubling the practice-accessible
  library from 24 to 77.
- **No schema change.** `chapters.ts` is a data file; the `Chapter` and
  `LevelNode` types already support arbitrary `problemIds`.
- **No UI change.** ProblemPlayer, HintPanel, audio, animations, and
  coordinate labels all work with any problem ID.
- **Small, reviewable slices.** Can be split into 2–3 category-based
  slices (e.g. A1: capture + escape, A2: connect_cut + life_death,
  A3: opening + endgame + multi-step).
- **Directly addresses the v0.7.0b "deferred" note.** v0.7.0b explicitly
  deferred chapter wiring; this task completes that commitment.

Weaknesses / risks:

- **Large surface.** 53 problems across 6 categories requires careful
  level design within each chapter. Simply dumping all unwired IDs into
  existing chapters would produce poor pedagogy.
- **Chapter structure design is real work.** Deciding level groupings,
  ordering, and unlock progression for life_death and endgame requires
  domain judgment, not just copy-paste.
- **Daily practice selection** will automatically include more problems
  once wired — no code change needed in `practice.ts` — but the increased
  pool may surface problems at inappropriate levels for a given child's
  skill. The current random-10 selection has no skill filter.
- **Low novelty** vs. a new content or infrastructure direction.

Estimated slice count: 2–3 implementation slices.

### B. Infrastructure / E2E / CI Hardening

Add Playwright smoke tests, CI lint + typecheck + test on every PR,
deterministic release QA automation, pre-commit hooks.

Strengths:

- **Highest long-term maintainability ROI.** Every future slice benefits
  from automated regression coverage.
- **No user-facing risk.** No schema, data, or behavior changes.
- **Slices are small and independent.** 1–2 slices can ship separately.
- **Independent of content decisions.** Can proceed in parallel with A.

Weaknesses / risks:

- **No user-facing change.** Parents and children see no difference.
- **Adds CI dependencies.** Playwright runner, potentially a new Docker
  build stage or GitHub Actions workflow — package/lockfile decision
  required.
- **Easy to under-scope.** A Playwright config that nobody runs in CI
  is worse than no config.
- **Not urgent.** The manual QA checklist for v0.7 passed cleanly; there
  is no regression crisis.

Estimated slice count: 1–2 implementation slices.

### C. Deployment / Supabase Environment Hardening

Polish Docker compose workflow, document Supabase local setup, add env
validation helpers, improve first-run developer experience, better error
messages when Supabase is unconfigured.

Strengths:

- **Low effort, mostly documentation.** One slice can cover the bulk.
- **Reduces onboarding friction** for new contributors and parents
  re-running the stack.

Weaknesses / risks:

- **No user-facing change.** Only relevant for self-hosting contributors.
- **Limited audience.** The app works fine without Supabase env; local
  Supabase is not used by anonymous mode.
- **Easy to scope-creep** into "rewrite the Docker setup" without clear
  acceptance criteria.
- **Not time-sensitive.** Existing Docker workflow works.

Estimated slice count: 1 implementation slice.

### D. Deeper Multi-Step Support

Add 3+ step problems, opening/endgame multi-step problems, and polish
step-transition UX. Likely requires `ProblemStep` schema v2.

Strengths:

- **High pedagogical value.** Longer problem chains teach deeper reading
  and planning.
- **Differentiates the product.** No other children Go app offers guided
  multi-step problems of this style.

Weaknesses / risks:

- **Schema change required.** `ProblemStep` was designed for 2 steps;
  3+ steps may require array-length constraints, step-type metadata,
  or branching logic.
- **Touches schema + data + UI.** At minimum: type change + validation
  update + ProblemPlayer step-transition polish. Larger PRs, harder to
  review.
- **Content creation is harder.** Multi-step opening and endgame problems
  are significantly more difficult to author than single-step ones.
- **No immediate user benefit for the 77 existing problems.** Existing
  problems stay at 2 steps; only new problems benefit.
- **Could be planned later** without blocking more urgent work.

Estimated slice count: 4–5 implementation slices (schema, player UX,
content pack, validation, stabilization).

### E. Further Content Expansion

Continue adding problems beyond 77, targeting further level 3–5
rebalance, more endgame, and more opening variety.

Strengths:

- **Proven, well-rehearsed pattern.** Three consecutive content series
  (v0.4, v0.5, v0.7) all shipped cleanly.
- **Low product risk.** No schema, UI, or dependency change.

Weaknesses / risks:

- **Diminishing novelty returns.** The team has shipped 3 content series;
  a fourth without any infrastructure or wiring improvement feels
  repetitive.
- **Wiring gap grows.** Each new content series adds problems that are
  unreachable in daily practice — compounding the gap documented in § 1.
- **Chapter wiring becomes harder.** More unwired problems mean a larger
  wiring task later, with more level-design decisions to make at once.
- **Better to wire existing content first** before creating more.

Estimated slice count: 2–3 implementation slices.

---

## 3. Selected Primary Direction: A — Chapter / Daily-Practice Content Wiring

**Rationale:**

1. **Largest gap, highest impact.** 53 of 77 problems (69 %) are
   unreachable in the main learning flows. Wiring them more than doubles
   the practice-accessible library from 24 to 77. No other candidate
   produces a comparable immediate improvement in daily practice variety.

2. **Completes a deferred commitment.** v0.7.0b and v0.7.0d both
   explicitly deferred chapter wiring. v0.8.0a is the task that closes
   that loop. Further deferral erodes credibility with the user base.

3. **Prepares the ground for future directions.** Once all 77 problems
   are wired:
   - Further content expansion (E) becomes meaningful because new
     problems appear in daily practice immediately.
   - Deeper multi-step (D) can target chapter-gated content instead of
     a separate review-only path.
   - Infrastructure (B) benefits from having a complete content flow to
     test against.

4. **Lowest risk of any high-impact direction.** No schema, UI, package,
   lockfile, SQL, or dependency changes. `chapters.ts` is a plain data
   file. The ProblemPlayer and all runtime code handles any problem ID
   transparently.

5. **Clear slice boundaries.** The 53 unwired problems group naturally
   by category, yielding 2–3 independent, reviewable PRs.

**Why not B, C, D, or E now:**

- **B (infrastructure)** remains the recommended secondary direction.
  It can follow A in v0.8.0b+ without conflict, and it benefits from
  having a complete content flow to write Playwright tests against.
- **C (deployment)** is low-effort but also low-impact. It can be a
  single slice in any future phase.
- **D (multi-step)** requires a schema change that should have its own
  dedicated planning task if revisited. Content wiring does not block
  D — they are orthogonal.
- **E (more content)** would compound the wiring gap. Wire first, then
  expand.

---

## 4. Proposed Slices

### v0.8.0b — Wire Existing Content: Capture + Escape + Connect_Cut

- **Goal:** Wire all unwired single-step capture (8: CAP-011 ~ CAP-018),
  escape (6: ESC-006 ~ ESC-011), and connect_cut (7: CC-007 ~ CC-009,
  CC-011 ~ CC-014) problems into their respective chapter structures.
  Add appropriate level nodes to existing chapters; no new chapter
  creation needed.
- **Scope:** `src/lib/chapters.ts` only.
- **Acceptance criteria:**
  - 21 newly wired problems appear in their correct chapter and level
    progression (capture-6 ~ capture-8, escape-4 ~ escape-6,
    connect-cut-4 ~ connect-cut-6, etc.).
  - Level ordering respects difficulty (lower-level problems first,
    higher-level problems later).
  - `getAllProblemIds()` returns 45 wired problems (24 existing + 21
    new) — capture, escape, connect_cut single-step problems fully
    wired.
  - Daily practice selection (`selectDailyProblems`) includes the newly
    wired problems automatically (no `practice.ts` change needed).
  - No existing wired problem is removed or re-ordered from its current
    level position.
  - `npm run test` passes (existing count unchanged or adjusted for
    wiring-dependent tests).
  - `npm run build` passes.
- **Non-goals:**
  - No wiring of multi-step problems (deferred to v0.8.0d).
  - No new chapters for life_death, endgame, or multi-step.
  - No `practice.ts`, `ProblemPlayer`, schema, or runtime code changes.
  - No `src/data/problems.json` changes.

### v0.8.0c — Wire Existing Content: Life_Death + Endgame + Opening

- **Goal:** Wire all unwired single-step life_death (9: LD-001 ~ LD-004,
  LD-006 ~ LD-010), endgame (8: END-001 ~ END-008), and opening
  (6: OP-004 ~ OP-009) problems. This slice requires creating two new
  chapters: **死活山洞** (life_death) and **官子山谷** (endgame), plus
  extending the existing opening chapter.
- **Scope:** `src/lib/chapters.ts` only.
- **Acceptance criteria:**
  - `chapters.ts` includes two new chapter entries with level nodes for
    life_death and endgame, and extends the existing opening chapter.
  - 23 newly wired problems appear in their correct chapter and level
    progression: 9 life_death + 8 endgame + 6 opening.
  - Level ordering respects difficulty; categories with no prior chapter
    structure design reasonable level progressions.
  - `getAllProblemIds()` returns 68 (45 from v0.8.0b + 23 new).
  - `npm run test` passes.
  - `npm run build` passes.
- **Non-goals:**
  - No changes to existing chapter structure for capture, escape, or
    connect_cut.
  - No wiring of multi-step problems (deferred to v0.8.0d).
  - No `practice.ts`, `ProblemPlayer`, schema, or runtime code changes.
  - No `src/data/problems.json` changes.

### v0.8.0d (optional) — Wire Multi-Step Problems

- **Goal:** Wire all 9 multi-step problems (MULTI-001 ~ MULTI-009) into
  appropriate chapters and levels.
- **Scope:** `src/lib/chapters.ts` only.
- **Acceptance criteria:**
  - All 9 multi-step problems are wired into their relevant category
    chapters (e.g. MULTI-001, MULTI-004, MULTI-005 in capture;
    MULTI-002, MULTI-006, MULTI-007 in life_death; MULTI-003, MULTI-008,
    MULTI-009 in connect_cut).
  - Multi-step problems appear at appropriate level positions (after
    single-step problems of similar difficulty).
  - `getAllProblemIds()` returns all 77 problems — full library wired;
    single-step split: 68, multi-step: 9.
  - `npm run test` passes.
  - `npm run build` passes.
- **Non-goals:**
  - No changes to existing single-step problem level positions.
  - No `practice.ts`, `ProblemPlayer`, schema, or runtime code changes.

---

## 5. Out-of-Scope for v0.8

- New problem categories or new problem metadata shapes.
- 3+ step multi-step problems or any `ProblemStep` schema v2.
- 13×13 / 19×19 board sizes or SGF import / export.
- User login, authentication, parent / child profile changes beyond
  what already exists in v0.2.
- Database migrations, RLS changes, or new Supabase functionality.
- Payment, subscription, teacher / admin backend, leaderboard, social
  features.
- AI-generated content, AI opponent, AI review.
- Full app redesign or layout overhaul.
- Audio library, animation library, or any new external dependencies.
- New infrastructure that requires a new external dependency
  (e.g. Playwright runner) without an explicit, separate planning task.
- Docker / Supabase environment hardening — to be re-considered in a
  later phase, not bundled into v0.8.
- Any changes to `src/data/problems.json`.
- Any changes to `practice.ts`, `ProblemPlayer`, or runtime UI code.

---

## 6. Acceptance Rules for v0.8 Tasks

1. **One reviewable PR per slice.** v0.8.0b / 0c / 0d each ship in their
   own PR. No slice may contain content + wiring + docs in a single PR.
2. **No mixing unrelated areas.** v0.8.0b and v0.8.0c are `chapters.ts`
   only; v0.8.0d is also `chapters.ts` only.
3. **No package / lockfile changes unless explicitly scoped.** The default
   for all three v0.8 slices is no `package.json` / `package-lock.json`
   change.
4. **No problem schema change unless selected in this plan.** `Problem`
   and `ProblemStep` shapes stay exactly as v0.3 left them.
5. **No AI / payment / teacher / admin / leaderboard / board-size / SGF
   / multiplayer scope creep.** Any such proposal must be filed as a new
   planning task before it can ship.
6. **Each PR body must include** `Closes #ISSUE_NUMBER`, a changed-files
   summary, `npm run test` + `npm run build` results, and an explicit
   docs-only / wiring-only scope statement.
7. **`docs/TASKS.md` is updated** at the end of every slice with the
   completed block and the next task reference.
8. **PRs stay open for ChatGPT review** per `AGENTS.md`.
9. **No test count regressions.** Wires-only slices must not reduce the
   total test count; if a test references a specific wired problem ID,
   that test must still pass.

---

## 7. Decision Log

- Direction A (Chapter / Daily-Practice Content Wiring) was selected
  because 53/77 problems are currently unreachable in the main learning
  flows. Wiring them produces the single largest improvement to daily
  practice variety with the lowest risk.
- Direction B (Infrastructure) is the recommended secondary direction;
  it can follow A in a later v0.8 slice or v0.9 planning.
- Direction D (Deeper Multi-Step) remains deferred. It requires a
  `ProblemStep` schema change that is not in scope for v0.8.
- Direction E (Further Content Expansion) is explicitly not selected.
  Wiring existing content first ensures future content additions are
  immediately usable in daily practice.
