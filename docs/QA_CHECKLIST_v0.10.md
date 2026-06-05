# QA Checklist — v0.10 Daily-Practice Skill Filtering / Level-Aware Selection

> Project: 小棋童围棋闯关
> Version target: v0.10
> Purpose: manual acceptance + automated validation checklist for the
> v0.10 daily-practice skill filtering series (v0.10.0a planning,
> v0.10.0b category-balanced selection, v0.10.0c spaced review priority,
> v0.10.0d multi-step awareness, v0.10 stabilization).

See `docs/RELEASE_NOTES_v0.10.md` for the per-slice summary, behavior
inventory, known limitations, and next-phase recommendation. This
checklist focuses on acceptance validation.

---

# 1. Scope Confirmation

Before QA, confirm v0.10 scope:

- [ ] `src/lib/practice.ts` contains `selectDailyProblems` with
      `progress` and `today` params.
- [ ] `src/lib/practice.ts` contains `isMultiStepProblem`,
      `getCategorySingleStepMaxLevel`, `isMultiStepEligible` helpers.
- [ ] `src/lib/practice.ts` contains `getPriorityProblems` helper.
- [ ] 11 multi-step eligibility tests exist in
      `src/__tests__/practice.test.ts`.
- [ ] `src/lib/spaced-review.ts` was not modified.

Confirm **not** included in v0.10:

- [ ] No problem schema changes.
- [ ] No `ProblemStep` changes.
- [ ] No runtime UI behavior changes (no new UI for review/wrong/multi indicators).
- [ ] No `src/lib/chapters.ts` changes.
- [ ] No `src/app/practice/page.tsx` changes beyond v0.10.0b wiring.
- [ ] No problem data changes (`src/data/problems.json` untouched).
- [ ] No SQL / Supabase / RLS changes.
- [ ] No authentication, payment, teacher/admin, leaderboard, board-size,
      SGF import/export, multiplayer, or AI-generated content.
- [ ] No redesign or layout overhaul.
- [ ] No E2E / CI / Playwright config / package changes.

---

# 2. Required Automated Gates

Run or verify from CI output:

- [ ] `npm run lint` exits 0.
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run test` exits 0 (351 tests, 21 files).
- [ ] `npm run build` compiles successfully.
- [ ] `npm run test:e2e` exits 0 (6 tests).

---

# 3. Local Validation Commands

Run these locally to verify v0.10:

- [ ] `npm run lint` — no errors.
- [ ] `npm run typecheck` — no errors.
- [ ] `npm run test` — 351 passed (21 files).
- [ ] `npm run build` — compiled successfully.
- [ ] `npm run test:e2e` — 6 passed (Chromium).

---

# 4. Daily Practice Selection — Null / Empty / Stale Progress Fallback

- [ ] With no `StudentProgress` (null), `/practice` still loads and
      selects 10 problems using the old random fallback.
- [ ] With empty progress (no completed/mastered IDs),
      `/practice` uses the old random fallback.
- [ ] With stale progress (completed IDs not in current wired pool),
      `/practice` uses the old random fallback.

---

# 5. Daily Practice Selection — Category Balance

- [ ] When usable progress exists and enough candidates are available,
      no more than 3 selected problems come from the same category.
- [ ] All 6 categories (capture, escape, connect_cut, life_death,
      opening, endgame) are represented when possible.

---

# 6. Daily Practice Selection — Level Clamp

- [ ] Selected problem levels do not exceed `max(childMaxLevel, 2)`
      when enough lower-level candidates exist.
- [ ] A child who has only completed level-1 problems does not receive
      level-4 or level-5 single-step problems.

---

# 7. Daily Practice Selection — Due Review Priority

- [ ] When `reviewSchedule` has entries with `nextReviewAt <= today`,
      up to 2 are included in the daily selection.
- [ ] Future-dated review entries are not prioritized.
- [ ] Due review IDs not in the current wired pool are ignored.

---

# 8. Daily Practice Selection — Wrong-Problem Priority

- [ ] When `wrongProblems` has non-mastered entries, at least 1 is
      included in the daily selection (if available in the wired pool).
- [ ] Wrong problems already selected as due reviews are not duplicated.
- [ ] Mastered wrong problems are not prioritized.

---

# 9. Daily Practice Selection — Duplicate Prevention

- [ ] No problem ID appears more than once in the daily selection.
- [ ] Selection returns 10 problems when enough eligible candidates exist.

---

# 10. Daily Practice Selection — Multi-Step Eligibility

- [ ] Multi-step problems (with `totalSteps > 1` or `steps.length > 0`)
      are excluded when the child has no completed single-step problem in
      the same category.
- [ ] Multi-step problems are excluded when the child's max single-step
      level in the same category is more than 1 below the multi-step
      problem's level.
- [ ] Multi-step problems become eligible when the child completes a
      single-step problem in the same category within 1 level.
- [ ] Ineligible multi-step due review problems are not forced into the
      session.
- [ ] Ineligible multi-step wrong problems are not forced into the
      session.
- [ ] When eligible candidates are fewer than 10, the function returns
      only eligible candidates (may be fewer than 10).
- [ ] When the entire pool is ineligible multi-step, the function
      returns an empty or single-step-only result, never ineligible
      multi-step.

---

# 11. Regression — E2E Smoke

- [ ] `/practice` E2E smoke still passes (renders idle state with start
      button).
- [ ] Home, levels, chapter, demo, settings smoke coverage still passes.
- [ ] `npm run test:e2e` — 6 passed.

---

# 12. Regression — Content and Wiring

- [ ] 77 / 77 wired content remains unchanged.
- [ ] All 6 chapters are navigable from `/levels`.
- [ ] Multi-step problems appear in their respective chapter levels.

---

# 13. Regression — v0.6 Polish

- [ ] Chinese coordinate labels visible on board (一 through 九).
- [ ] Correct-answer star celebration animation triggers on correct tap.
- [ ] Audio toggle persists across page refresh.
- [ ] Progressive hint cards render with numbered badges and fade-in.
- [ ] Hint board markers display as outlined rings.

---

# 14. Optional Supabase Checks

- [ ] Missing Supabase env does not break the app.
- [ ] Configured env path remains unchanged (no new Supabase features).

---

# 15. Release Decision Checklist

```text
Release: v0.10
Date:
Tester:
Environment:

CI gates pass (lint/typecheck/test/build/e2e): yes/no
Category balance verified: yes/no
Level clamp verified: yes/no
Due review priority verified: yes/no
Wrong-problem priority verified: yes/no
Multi-step eligibility verified: yes/no
No ineligible multi-step forced in sparse pool: yes/no
Known limitations accepted: yes/no
No out-of-scope features introduced: yes/no

Decision:
[ ] Approved for v0.10 stabilization
[ ] Not approved — see notes

Notes:
```

---

# 16. v0.10 Completion Criteria

v0.10 is considered stabilized only when:

- sections 2–13 of this checklist pass on `main` at the stabilization
  commit;
- CI gates (lint, typecheck, test, build, e2e) all pass;
- all v0.10 known limitations in `docs/RELEASE_NOTES_v0.10.md` section 7
  are accepted as documented;
- no AI / payment / teacher / admin / leaderboard / multiplayer /
  board-size / SGF / schema work was introduced;
- the next task (`v0.11.0a` planning) is opened separately and does
  **not** include implementation.
