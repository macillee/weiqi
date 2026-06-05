# v0.10 — Next Phase Plan: Daily-Practice Skill Filtering / Level-Aware Selection

> Project: 小棋童围棋闯关
> Phase: v0.10.0a — planning
> Date: 2026-06-05
> Status: Planning complete — ready for implementation

---

## 1. Phase Summary

v0.9 hardened the infrastructure layer: CI gates, Playwright E2E smoke
tests, and automated regression for lint/typecheck/build. With that
foundation stable, v0.10 shifts to **product-facing improvement** —
making daily practice smarter so every session feels appropriate to the
child's current level.

The current practice flow (`selectDailyProblems` in `src/lib/practice.ts`)
selects 10 random problems from the full 77-problem pool with no regard
for:

- Which categories the child has attempted or completed.
- The difficulty level relative to the child's demonstrated skill.
- Whether a problem has been mastered or needs review (spaced review data
  is stored in `StudentProgress` but never consulted during selection).
- Multi-step exposure timing (children may be served multi-step problems
  before they are ready).

This plan selects **daily-practice skill filtering** as the primary
v0.10 direction and defines three implementable slices.

---

## 2. Candidate Direction Evaluation

### A. Daily-Practice Skill Filtering / Level-Aware Selection

**Strengths:**
- Directly improves daily practice quality for every user without new content.
- No schema change required — `Problem.category`, `Problem.level`, and
  `StudentProgress` already contain the needed data.
- v0.9 CI now gates practice-related changes (PR #110, #112).
- `selectDailyProblems` is a single pure function — easy to test and refactor.
- High pedagogical value: children get problems that match their skill band.

**Weaknesses / Risks:**
- Algorithm design is nontrivial — must balance variety, review, and
  difficulty without overwhelming the child.
- `StudentProgress` is localStorage-backed; selection logic must handle
  empty/missing progress gracefully.
- May reveal gaps in `StudentProgress` data (e.g. no per-category mastery
  tracking beyond `completedProblemIds` / `masteredProblemIds`).

**Estimated Slice Count:** 3 (see §4)

**Verdict:** Primary direction — highest user impact for lowest risk.

---

### B. Deployment / Supabase Environment Hardening

**Strengths:**
- Low effort (1 slice).
- Improves first-run DX for developers and deployers.
- Docker / Supabase setup docs benefit new contributors.

**Weaknesses / Risks:**
- No user-facing impact.
- The app already works fully in local anonymous mode without Supabase.
- Less urgent than product-facing improvements at this stage.

**Estimated Slice Count:** 1

**Verdict:** Defer to v0.11 unless infrastructure issues block development.

---

### C. Deeper Multi-Step Support (3+ Steps, Opening/Endgame Variants)

**Strengths:**
- High pedagogical value — multi-step problems teach deeper reading.

**Weaknesses / Risks:**
- Requires `ProblemStep` schema v2 — schema migration, authoring, and
  validation.
- 3–5 slices of work.
- Harder to test and review than algorithmic changes.
- Current multi-step content (9 problems, 2 steps each) was just wired in
  v0.8; the team should observe usage before expanding the format.

**Estimated Slice Count:** 3–5

**Verdict:** Defer — premature until skill filtering improves daily
practice quality and the team has usage data on current multi-step
problems.

---

### D. Further Content Expansion Beyond 77 Problems

**Strengths:**
- Tangible variety increase.

**Weaknesses / Risks:**
- Diminishing returns after the v0.4/v0.5/v0.7 series and the v0.8 full
  wiring.
- Without skill filtering, new content is still randomly served — the
  selection quality problem remains.
- Content authoring is more expensive than algorithmic improvement.

**Estimated Slice Count:** 2–3

**Verdict:** Defer — skill filtering should come first so new content is
distributed effectively.

---

### E. Release Automation Maturity

**Strengths:**
- Incremental over v0.9 foundation.
- E2E webServer speed improvement benefits local development.

**Weaknesses / Risks:**
- No user-facing impact.
- v0.9 CI/E2E coverage is already sufficient to gate product work.

**Estimated Slice Count:** 1

**Verdict:** Defer to v0.11 — the current CI is adequate for v0.10
development velocity.

---

## 3. Selected Primary Direction

**Daily-practice skill filtering / level-aware selection.**

Justification:

- v0.9 release notes (section 11) explicitly recommended this direction.
- The three known limitations from v0.9 release notes (no skill filtering,
  no 3+ step problems, E2E webServer speed) — skill filtering is the one
  with highest user impact and lowest risk.
- `selectDailyProblems` is a ~20-line pure function isolated in
  `practice.ts`; test coverage already exists for practice flow.
- No schema, data, or runtime UI changes needed.
- Every child using daily practice benefits immediately.

---

## 4. Slices

### Slice 1 (v0.10.0b): Category-Balanced Selection with Basic Level Clamping

**Goal:** Replace `selectDailyProblems` with an algorithm that distributes
the 10 daily problems across categories and clamps to a reasonable level
range based on the child's demonstrated progress.

**Rough Scope:**

- `src/lib/practice.ts` — rewrite `selectDailyProblems` (and rename to
  `selectBalancedDailyProblems` or similar) to accept `StudentProgress`.
- Round-robin category selection: pick problems from categories the child
  has engaged with, preferring unfinished categories.
- Level clamping: compute a max level from `completedProblemIds` + review
  state (e.g. if the child has completed capture L1–2, clamp capture
  problems to L3 max).
- Fallback to random selection if progress data is empty (fresh install).
- Update `src/app/practice/page.tsx` — pass `StudentProgress` to the
  selection function.
- Existing tests: update practice and chapter tests to pass mock progress.
- New unit tests: category balancing, level clamping, empty-progress
  fallback, full-pool edge case.

**Acceptance Criteria:**

- `selectDailyProblems` signature changes to accept `StudentProgress | null`.
- 10 problems selected daily; no more than 3 from the same category.
- No problem level exceeds `max(childMaxLevel, 2)` where `childMaxLevel`
  is derived from progress data.
- Empty progress returns random selection (same as current behavior).
- All existing tests pass; new tests cover the selection logic.
- E2E practice smoke test still passes.
- `npm run build` compiles successfully.

**Non-goals:**

- No spaced-review integration (deferred to slice 2).
- No per-category mastery level tracking.
- No schema changes.
- No problem content changes.
- No UI changes beyond the data flow change in `page.tsx`.

---

### Slice 2 (v0.10.0c): Spaced Review Integration

**Goal:** Incorporate `reviewSchedule` and `wrongProblems` into daily
selection so problems due for review and previously failed problems are
prioritized.

**Rough Scope:**

- `src/lib/practice.ts` — add review-priority logic to the selection
  algorithm.
- Dedicate 1–2 of the 10 daily slots to due reviews from
  `reviewSchedule`.
- Dedicate 1 slot to a previously wrong problem (from `wrongProblems`),
  preferring problems that have not been retried recently.
- Respect the level clamp and category balance from slice 1.
- New unit tests: review priority, wrong-problem rotation, empty review
  schedule fallback.

**Acceptance Criteria:**

- If `reviewSchedule` contains problems due today, at least 1 is included.
- If `wrongProblems` is non-empty, at least 1 wrong problem is included
  (unless all are already in today's review slots).
- Level clamp and category balance from slice 1 are preserved.
- Empty review/wrong state falls back to slice 1 behavior.
- All existing tests pass; new tests cover review logic.
- E2E practice smoke test passes.

**Non-goals:**

- No changes to the review schedule algorithm itself.
- No UI for reviewing due problems differently from new problems.
- No schema changes.
- No problem content changes.

---

### Slice 3 (v0.10.0d): Multi-Step Awareness and Safe Exposure

**Goal:** Ensure multi-step problems are not served to children who have
not yet completed enough single-step content in related categories.

**Rough Scope:**

- `src/lib/practice.ts` — add multi-step gating to the selection
  algorithm.
- A multi-step problem is eligible only if the child has completed at
  least one single-step problem in the same category AND their max level
  in that category is within 1 of the multi-step problem's level.
- If not eligible, the slot falls through to a single-step problem.
- New unit tests: multi-step eligibility, fallback behavior.

**Acceptance Criteria:**

- Multi-step problems are excluded from selection unless the child meets
  eligibility criteria.
- Eligibility does not block multi-step permanently — as the child
  progresses through single-step content, multi-step problems become
  available naturally.
- Category balance and level clamp from slice 1 are preserved.
- Review priority from slice 2 is preserved.
- All existing tests pass; new tests cover multi-step gating.
- E2E practice smoke test passes.

**Non-goals:**

- No changes to `ProblemStep` schema.
- No new multi-step content.
- No UI indication that a problem is "multi-step" vs. single-step.
- No schema changes.
- No problem content changes.

---

## 5. Out-of-Scope for v0.10

The following items are explicitly out of scope for the entire v0.10
phase:

- **Schema changes** — `Problem`, `ProblemStep`, `StudentProgress`, and
  `WrongProblemState` schemas remain unchanged.
- **Problem content** — no new problems, no edits to existing problems.
- **Problem data** — `src/data/problems.json` is not modified.
- **Runtime UI behavior** — no new pages, no redesign, no layout changes.
- **Tests** — only existing tests are updated to match new function
  signatures; no new E2E tests (slice acceptance is covered by existing
  smoke tests + new unit tests).
- **E2E / CI config** — `playwright.config.ts`, `.github/workflows/ci.yml`,
  and `package.json` are not modified.
- **Supabase / SQL** — no migrations, no server-side changes.
- **AI / payment / teacher / admin / leaderboard** — excluded from v0.10.
- **Board-size expansion / SGF import-export / multiplayer** — excluded
  from v0.10.
- **App redesign** — no new pages or visual redesigns.

---

## 6. Acceptance Rules for v0.10 Slices

1. **One reviewable PR per slice.** Each slice is self-contained and can
   be reviewed, merged, and deployed independently.
2. **No mixing unrelated product areas.** A slice PR touches only
   `src/lib/practice.ts`, `src/app/practice/page.tsx` (data-flow glue),
   and test files. It does not touch other components, pages, or modules.
3. **No package/lockfile changes unless explicitly scoped.** None of the
   three slices requires new dependencies.
4. **No schema change.** All logic operates on existing `Problem` and
   `StudentProgress` fields.
5. **No CI/E2E config changes.** Existing Playwright smoke tests cover
   practice page rendering; unit tests cover selection logic.
6. **No AI/payment/teacher/admin/leaderboard/board-size/SGF scope creep.**
7. **Each PR must pass `npm run lint`, `npm run typecheck`, `npm run test`,
   `npm run build`, and `npm run test:e2e`.**

---

## 7. Validation

This planning document is docs-only:

| Check | Status |
|---|---|
| `src/` modified | No |
| `e2e/` modified | No |
| CI config modified | No |
| `package.json` modified | No |
| `package-lock.json` modified | No |
| Problem data modified | No |
| Schema modified | No |
| Runtime UI code modified | No |
