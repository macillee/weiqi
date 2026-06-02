# v0.7 Next Phase Plan

> Project: 小棋童围棋闯关
> Version: v0.7.0a (planning)
> Date: 2026-06-02

---

## 1. Context

v0.6 UX Polish is complete and stabilized:

- v0.6.0a: next phase plan selected UX polish as the primary v0.6
  direction (`docs/NEXT_PHASE_PLAN_v0.6.md`).
- v0.6.0b: Chinese board coordinate labels (PR #72).
- v0.6.0c: success animations and star effects (PR #76).
- v0.6.0d: toggleable answer audio feedback (PR #78).
- v0.6.0e: progressive hint cards and deterministic board hint
  markers (PR #80).
- v0.6 stabilization: release notes and QA checklist (PR #82, issue
  #81, `docs/RELEASE_NOTES_v0.6.md`, `docs/QA_CHECKLIST_v0.6.md`).
- v0.6 follow-up: `/practice` last-problem async race fix (PR #84,
  issue #83) — scope-confined to `src/app/practice/page.tsx` and a
  new regression test; no UX impact.

Library state at the start of v0.7:

- 65 total problems (56 single-step, 9 multi-step).
- 6 categories: capture (20), connect_cut (14), escape (11),
  life_death (11), opening (5), endgame (4).
- Levels 1–5 populated; level 2 dominates (32 / 65), levels 4–5
  thin (5 each); opening has no level 5; endgame only levels 1–3.
- Multi-step problems capped at 2 steps; no opening or endgame
  multi-step problems.
- 9×9 only; 13×13 / 19×19 not in scope.

Validation baseline at the start of v0.7:

- `npm run test` passes — 301 tests / 21 files on `main` at
  `286d108`.
- `npm run build` passes.
- 299 tests / 20 files at the v0.6 stabilization commit (`ac94ffb`);
  +2 from the v0.6.0e hint-presentation tests and a
  `practice-page` regression test from PR #84.

---

## 2. Candidate Directions

### A. Content Balancing / More Content

Target the documented v0.5 limitations directly: more endgame
(target 8–10), more opening (target 8–10, with at least 1–2 level 5
problems), and better level 3–5 distribution to reduce level 2
dominance.

Strengths:

- Addresses gaps that are already on the record
  (`docs/RELEASE_NOTES_v0.5.md` § 5, `docs/RELEASE_NOTES_v0.6.md`
  § 7).
- Continues the proven v0.4 / v0.5 expansion pattern: the team
  already has working content review, validation, and release notes
  templates.
- v0.6 has just made the UX polished enough that more content is
  rewarding to play, not just listed.
- Low product risk: no schema change, no player / scheduling /
  weekly-report change.

Weaknesses / risks:

- Repeats the v0.5 pattern — diminishing novelty returns compared
  to UX or technical investment.
- Endgame and multi-step opening problems are harder to author
  well; review time will be non-trivial.
- Without concurrent UX improvement, content-only work may still
  feel incremental.

Estimated slice count: 3 implementation slices (1 content pack, 1
validation, 1 stabilization).

### B. Deeper Multi-Step Support

Push beyond the current 2-step cap: add 3+ step problems, add
multi-step opening and endgame problems, polish step-transition UX
(e.g. transition feedback, per-step "下一题" wording consistency,
step-end recap).

Strengths:

- Unlocks new pedagogical depth and longer problem sessions.
- Differentiates v0.7 from a pure content expansion.
- Step-transition polish would also improve 2-step problems.

Weaknesses / risks:

- Touches both schema and UI: the existing `ProblemStep` schema
  was designed for 2 steps; extending it to 3+ steps is a real
  schema change, not just data.
- Multi-step opening and endgame content creation is significantly
  harder than single-step content; review time multiplies.
- Larger PRs; harder to keep slices reviewable.
- The first such slice would likely be a 2-part slice (schema +
  content) which violates the "one reviewable PR per slice" rule
  unless the team is willing to break the rule explicitly.

Estimated slice count: 4–5 implementation slices (schema, player UX,
content pack, validation, stabilization).

### C. Infrastructure / E2E / CI Hardening

Add Playwright smoke tests, CI polish (lint + typecheck + test on
PR), deterministic release QA automation (a script that runs the
v0.6 / v0.7 manual QA checklist mechanically where possible),
Docker compose hardening, pre-commit hooks.

Strengths:

- Lowest product risk: no user-visible feature change, no schema
  change, no problem data change.
- High long-term maintainability ROI; pays off for every future
  release.
- Can ship in 1–2 small slices; suitable as a "clean-up" thread
  alongside content work.
- Independent of content and UI decisions.

Weaknesses / risks:

- No user-facing change; less visible to a child / parent audience.
- Adds CI dependencies (Playwright runner, possibly a new image
  layer), which is a package / lockfile decision to be made
  explicitly.
- Easy to under-scope (e.g. add a Playwright config that nobody
  actually runs in CI).

Estimated slice count: 1–2 implementation slices.

### D. Deployment / Supabase Environment Hardening

Polish Docker compose workflow, document Supabase local setup
clearly, add env validation, improve first-run developer
experience, better error messages when Supabase is unconfigured.

Strengths:

- Reduces onboarding friction for new contributors and for
  parents re-running the stack.
- Low effort, mostly documentation and small helpers.

Weaknesses / risks:

- No user-facing change; only relevant for self-hosting.
- Supabase Cloud is the default v0.2+ deployment; local
  Supabase is not used by anonymous mode, so this primarily
  benefits a small subset of contributors.
- Easy to drift into "add a docs page and call it v0.7" with
  insufficient substance.

Estimated slice count: 1 implementation slice (mostly docs).

---

## 3. Selected Primary Direction: A — Content Balancing

**Rationale:**

1. **Existing, well-documented limitations.** `docs/RELEASE_NOTES_v0.5.md`
   § 5 already calls out endgame thinness (4 problems, levels 1–3
   only), opening thinness (5 problems, no level 5), and level 2
   dominance (32 / 65). The v0.6 release notes § 7 also recommends
   content balancing as the v0.7 primary direction. v0.7.0a is
   therefore continuing a recognized gap, not inventing a new one.

2. **Ready UX foundation.** v0.6 just delivered Chinese board
   labels, success animations, audio feedback, and progressive
   hints. Children encountering more problems will now experience
   the polished flow, not the dry v0.5 baseline. Adding content
   before UX polish would have yielded lower engagement; adding
   content now is well-timed.

3. **Lowest schema and product risk.** v0.7 under Direction A
   stays inside the current problem schema (single-step and 2-step
   `ProblemStep` only). It does not require a `ProblemStep` v2,
   player UI rework, scheduling change, weekly report change, or
   Supabase change.

4. **Proven, well-rehearsed slice shape.** v0.4 (3 slices) and
   v0.5 (3 slices) both shipped cleanly under
   plan → content → validation → stabilization. The team has the
   review templates, the QA vocabulary, and the regression test
   surface for this shape.

5. **Direction C and D are good follow-ups, not primary.** They
   have lower product impact and a smaller audience. They can be
   interleaved later (e.g. one infrastructure slice in v0.8 or
   v0.9) without blocking content work.

**Direction B is explicitly not selected now.** Deeper multi-step
requires a schema change that this planning task is not allowed to
scope and that should be its own dedicated planning task if the
team ever revisits it.

---

## 4. Proposed Slices

All three implementation slices below are **planning proposals**.
They become real work only when their respective tasks are opened
and accepted; this planning task does **not** start any of them.

### v0.7.0a — Next Phase Plan (this task)

- Goal: select a primary v0.7 direction and define slice
  boundaries; align `docs/TASKS.md`.
- Scope: this document + a small `docs/TASKS.md` update.
- Acceptance criteria:
  - `docs/NEXT_PHASE_PLAN_v0.7.md` exists, evaluates all four
    candidate directions, and selects one primary direction.
  - 2–4 future implementation slices are defined with goal,
    scope, acceptance criteria, and non-goals.
  - `docs/TASKS.md` is updated to mark this planning task
    delivered and set the next task to `v0.7.0b`.
- Non-goals:
  - no problem content changes;
  - no schema, runtime, package / lockfile, SQL, or Supabase
    changes;
  - no `src/` files touched.

### v0.7.0b — Endgame + Opening + Level 3–5 Content Pack

- Goal: bring the library to ~80 problems by adding endgame and
  opening content, with a deliberate tilt toward levels 3–5 to
  reduce level 2 dominance.
- Scope: `src/data/problems.json` only (single-step and existing
  2-step multi-step problems; no schema change).
- Target additions (proposed; final count per slice review):
  - endgame: +4 to +6 problems, including the first endgame
    problems at level 4 and level 5.
  - opening: +3 to +5 problems, including the first opening
    problems at level 5.
  - level 3–5 rebalance: +4 to +6 problems in existing categories
    (capture / connect_cut / escape / life_death) at level 3+.
- Acceptance criteria:
  - `src/data/problems.json` contains the new IDs and they are
    unique.
  - `validateAllProblems` passes.
  - No new problem has zero-liberty initial groups, out-of-range
    coordinates, or wrong answer points.
  - Multi-step problems (if any in the pack) remain 2-step; no
    3+ step problems in this slice.
  - A content review document is added under
    `docs/CONTENT_REVIEW_v0.7.0b.md` documenting each new
    problem.
  - `npm run test` and `npm run build` pass.
- Non-goals:
  - no problem schema change;
  - no `ProblemStep` extension to 3+ steps;
  - no `ProblemPlayer` or any UI change;
  - no audio, animation, hint, coordinate-label behavior change;
  - no `package.json` / `package-lock.json` change.

### v0.7.0c — Content Validation and Regression

- Goal: validate the v0.7.0b content pack, strengthen regression
  tests, confirm no behavioral regression elsewhere.
- Scope: tests in `src/__tests__/problems.test.ts` (and adjacent
  test files if needed) plus a new
  `docs/CONTENT_REVIEW_v0.7.0c.md`.
- Acceptance criteria:
  - new test cases cover: all v0.7.0b IDs exist; no ID reuse;
    category / level / type distribution matches the plan;
    at least one correctness check per new problem category
    (capture, opening, endgame, level 3+ rebalance);
  - `validateAllProblems` pass test for the full library
    (now ~80 problems) is updated to the new count;
  - no existing test is removed or weakened;
  - `npm run test` and `npm run build` pass.
- Non-goals:
  - no content edits in `src/data/problems.json`;
  - no schema or runtime change;
  - no E2E / Playwright work (reserved for a future
    infrastructure task).

### v0.7.0d — Stabilization and Release Notes

- Goal: produce v0.7 release notes and a manual QA checklist,
  confirm the v0.7 polish flow end-to-end, and identify the next
  task.
- Scope: `docs/RELEASE_NOTES_v0.7.md`,
  `docs/QA_CHECKLIST_v0.7.md`, and a `docs/TASKS.md` update.
- Acceptance criteria:
  - release notes cover v0.7.0a–c, document final content
    inventory (~80 problems), known limitations, and a short
    next-phase comparison;
  - QA checklist covers the v0.6 polish flow + v0.7 content
    additions + a build / test smoke check;
  - `docs/TASKS.md` marks `v0.7.0d` delivered and identifies
    the next task (a small `v0.8.0a` planning task or a single
    infrastructure slice, depending on team capacity).
- Non-goals:
  - no product code change;
  - no content or schema change;
  - no new problems, no metadata changes;
  - no `package.json` / `package-lock.json` change.

---

## 5. Out-of-Scope for v0.7

- New problem categories or new problem metadata shapes.
- 3+ step multi-step problems or any `ProblemStep` schema v2.
- 13×13 / 19×19 board sizes or SGF import / export.
- User login, authentication, parent / child profile changes
  beyond what already exists in v0.2.
- Database migrations, RLS changes, or new Supabase
  functionality.
- Payment, subscription, teacher / admin backend, leaderboard,
  social features.
- AI-generated content, AI opponent, AI review.
- Full app redesign or layout overhaul.
- Audio library, animation library, or any new external
  dependencies.
- New infrastructure that requires a new external dependency
  (e.g. Playwright runner) without an explicit, separate
  planning task.
- Docker / Supabase environment hardening (Direction D) — to be
  re-considered in v0.8+ planning, not bundled into v0.7.

---

## 6. Acceptance Rules for v0.7 Tasks

1. **One reviewable PR per slice.** v0.7.0b / 0c / 0d each ship
   in their own PR. No slice may contain content + validation
   + docs in a single PR.
2. **No mixing unrelated areas.** v0.7.0b is content only; v0.7.0c
   is tests + content review only; v0.7.0d is docs only.
3. **No package / lockfile changes unless explicitly scoped.**
   The default for all three v0.7 slices is no
   `package.json` / `package-lock.json` change. Any dependency
   change must be justified in the PR body and approved in the
   planning task first.
4. **No problem schema change unless selected in this plan.**
   `Problem` and `ProblemStep` shapes stay exactly as v0.3 left
   them. A future multi-step extension must be a new planning
   task.
5. **No AI / payment / teacher / admin / leaderboard / board-size
   / SGF / multiplayer scope creep.** Any such proposal must be
   filed as a new planning task before it can ship.
6. **Each PR body must include** `Closes #ISSUE_NUMBER`, a
   changed-files summary, `npm run test` + `npm run build`
   results for code / data / test PRs, and an explicit
   docs-only skip statement for docs PRs.
7. **`docs/TASKS.md` is updated** at the end of every slice
   with the completed block and the next task reference.
8. **Content review and QA documentation remain in
   `docs/CONTENT_REVIEW_v0.7.0*.md` and
   `docs/QA_CHECKLIST_v0.7.md`** to keep release-prep artifacts
   discoverable.
9. **PRs stay open for ChatGPT review** per `AGENTS.md`.

---

## 7. Decision Log

- Direction A (Content Balancing) was selected over B (Deeper
  Multi-Step) primarily because B requires a `ProblemStep` schema
  change that this planning task is not allowed to scope. A
  dedicated v0.7.0a2 planning task could revisit B if the team
  changes its mind.
- Direction C (Infrastructure) and D (Deployment) are explicitly
  deferred. Both are good candidates for v0.8.0a planning, where
  they can each be evaluated on their own merits and a clean
  decision can be made without competing with content work.
- No Direction A slice may produce more than 16 new problems.
  This keeps content review tractable and matches the
  ~14-problem v0.5.0b ceiling. If a slice needs more, the next
  slice must be a continuation task, not a stretched v0.7.0b.
