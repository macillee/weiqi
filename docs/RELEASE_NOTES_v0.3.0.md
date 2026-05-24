# Release Notes — v0.3.0 Learning Depth

> Project: 小棋童围棋闯关
> Release type: Learning Depth expansion (local-first)
> Status: locally accepted after regression QA, with known limitations documented below.

---

# 1. Release Summary

v0.3.0 introduces multi-step problem support, spaced review scheduling, and a parent weekly report — delivering on the Learning Depth milestone while maintaining full backward compatibility with v0.1–v0.2 local-first and authenticated modes.

The release follows five feature slices (v0.3.0a–e):

- v0.3.0a: Planning and boundaries (docs only)
- v0.3.0b: Multi-step problem schema / data model
- v0.3.0c: Multi-step problem player UI
- v0.3.0d: Spaced review scheduling
- v0.3.0e: Parent weekly report

---

# 2. Delivered Features

## 2.1 Multi-Step Problem Support

**Schema** (`v0.3.0b`):

- `Problem` type extended with optional `ProblemStep[]` and `totalSteps` field.
- Each `ProblemStep` includes: `step`, `addedStones`, `removedStones`, `answers`, `hints`, `explanation`, `successMessage`, `failureMessage`, `wrongMoves`.
- `validateProblem` updated for multi-step validation (step ordering, per-step answers/hints, addedStones/removedStones coordinates).
- 3 sample multi-step problems added: `MULTI-001` (capture), `MULTI-002` (life-death), `MULTI-003` (connect).
- Backward compatible: single-step problems validate and play identically.

**Player UI** (`v0.3.0c`):

- `ProblemPlayer` detects multi-step problems and renders step-by-step progression.
- Board state updates between steps (addedStones rendered, removedStones cleared).
- Step indicator shows current step / total steps.
- Hints reset per step.
- Wrong answers recorded at problem level (accumulates across steps; max-wrong failure per step triggers move to next step).
- `src/lib/multi-step-problem.ts` utilities for board state computation and step data retrieval.
- Single-step problems remain backward compatible.

## 2.2 Spaced Review Scheduling

**Algorithm** (`v0.3.0d`):

- Four outcome classes: `failed`, `correct_with_wrong`, `correct_with_hint`, `clean`.
- Scheduling intervals: failed → 1 day, correct with wrong/hint → 2 days, clean initial → 4 days, repeated clean → progressive doubling (capped at 30 days).
- `StudentProgress` extended with `reviewSchedule` field (backward compatible with old localStorage).
- Integration with practice page, chapter page, and wrong-book review: schedule updated on problem completion.
- 25 unit tests covering interval progression, due-reviews, priority ordering, and multi-step scheduling by problem id.

## 2.3 Parent Weekly Report

**Weekly aggregation** (`v0.3.0e`):

- `src/lib/weekly-report.ts` with `getWeekRange` (Mon–Sun boundary) and `computeWeeklyReport`.
- Weekly overview card on the report page when the current week has activity.
- Shows: attempts, accuracy, hints used, completions, wrong-book counts, due-review count.
- 13 unit tests covering week window, accuracy, hints, wrong counts, due count, and no-activity edge cases.

## 2.4 Stabilization and QA

- Regression review over all v0.3.0 behavior verified via 241 existing tests (17 files).
- Documentation cleanup in `docs/TASKS.md` (stale PR references fixed, current phase updated).
- No new tests added during stabilization — existing coverage confirmed sufficient.

---

# 3. Feature Details

## 3.1 Multi-Step Problem Format

```ts
type ProblemStep = {
  step: number;
  addedStones?: Stone[];
  removedStones?: Point[];
  answers: Point[];
  hints: string[];
  explanation: string;
  successMessage: string;
  failureMessage: string;
  wrongMoves?: Array<{ x: number; y: number; message: string }>;
};

// Extended Problem type
type Problem = {
  id: string;
  // ... existing fields
  totalSteps?: number;
  steps?: ProblemStep[];
};
```

## 3.2 Spaced Review Intervals

| Outcome | Next interval |
|---|---:|
| Failed | 1 day |
| Correct with wrong attempt | 2 days |
| Correct with hint | 2 days |
| Clean (first) | 4 days |
| Clean (2nd consecutive) | 8 days |
| Clean (3rd+) | progressive ×2, max 30 days |

## 3.3 Weekly Report Metrics

- Total attempts
- Accuracy percentage
- Hints used count
- Problems completed
- Active wrong problems count
- Mastered wrong problems count
- Due reviews count

---

# 4. Backward Compatibility

- All single-step problems play identically to v0.1/v0.2.
- Existing localStorage progress loads with default empty `reviewSchedule`.
- Practice, chapter, wrong-book, and report pages unchanged for single-step flow.
- Supabase server mode compatible with existing v0.2 infrastructure.
- Missing Supabase env does not break any feature.

---

# 5. Manual QA Checklist

> Use this checklist for v0.3.0 acceptance testing.
> Run each check in order and mark pass/fail.

## 5.1 Environment Check

- [ ] `npm run dev` starts successfully.
- [ ] `http://localhost:3000` loads in browser.
- [ ] No blocking console errors on page load.

## 5.2 Local Anonymous Mode

- [ ] Home page loads without Supabase env configured.
- [ ] Daily practice works without auth.
- [ ] Wrong book works without auth.
- [ ] Report page works without auth.
- [ ] Settings page works without auth.
- [ ] `/demo` does not write to progress.

## 5.3 Single-Step Problem Play

- [ ] Single-step problems render correctly (no step indicator).
- [ ] Correct answer shows green feedback.
- [ ] Wrong answer shows warm failure message.
- [ ] After 2 wrong answers, correct answer is revealed.
- [ ] Hints show progressively per problem.
- [ ] Star earned on first correct answer.

## 5.4 Multi-Step Problem Play

- [ ] Multi-step problem renders with step indicator (e.g., "1 / 2").
- [ ] Board state updates between steps (stones added/removed).
- [ ] Clicking correct answer advances to next step.
- [ ] On final step correct, success feedback with explanation is shown.
- [ ] Wrong answer at any step shows step-specific failure message.
- [ ] Max wrong attempts per step: moves to next step without blocking.
- [ ] Wrong answers accumulate at problem level (affects star/review logic).

## 5.5 Hints Reset Per Step

- [ ] Multi-step problem: each step has its own hints.
- [ ] Using hint on step 1 does not consume hint on step 2.
- [ ] Hint indicator shows usedHint state per step.

## 5.6 Wrong Answers Recorded at Problem Level

- [ ] Getting wrong on step 1 and wrong on step 2: problem registers 2 wrongs.
- [ ] After review, problem appears in wrong book.
- [ ] Spaced review schedule reflects problem-level outcome (not step-level).

## 5.7 Spaced Review Due Behavior

- [ ] After completing a problem, review schedule entry is created.
- [ ] Failed problems are due the next day.
- [ ] Clean success problems are due in 4 days.
- [ ] Repeated clean success extends interval progressively.
- [ ] Due problems appear correctly in practice selection.

## 5.8 Weekly Report

- [ ] Empty state: new user or no activity this week shows no weekly card.
- [ ] Active state: after activity this week, weekly card shows attempt count, accuracy, hints, completions.
- [ ] Wrong-book counts shown in weekly report.
- [ ] Due review count shown in weekly report.

## 5.9 Report Fallback Behavior

- [ ] Server mode: report reads from server data, falls back to local on failure.
- [ ] Error message shown when server fails but local data is displayed.
- [ ] Local mode: report continues using `computeReportStats` from localStorage.

## 5.10 Local Build Smoke Check

- [ ] `npm run build` passes.
- [ ] `npm run test` passes (241+ tests in 17 files).

---

# 6. Known Limitations

- Current sample multi-step problems use 2 steps; broader step counts are schema-supported but not product-tested.
- Only 3 sample multi-step problems included (MULTI-001, MULTI-002, MULTI-003).
- Time spent tracking remains `0` for all attempts (inherited from v0.1).
- No AI review or feedback for wrong answers beyond hint system.
- 9x9 board only; 13x19 supported by types but not populated.
- No teacher/admin backend or class management.

---

# 7. Test Summary

| Slice | Test count | Key test files |
|---|---|---|
| v0.3.0b | +0 (existing) | `problems.test.ts` |
| v0.3.0c | +15 | `multi-step-problem.test.ts`, `ProblemPlayer.multi-step.test.tsx` |
| v0.3.0d | +25 | `spaced-review.test.ts` |
| v0.3.0e | +13 | `weekly-report.test.ts` |
| **Total** | **241+** | **17 files** |

---

# 8. Next Recommended Version

v0.3.x maintenance or v0.4 content expansion:

- Expand multi-step problem library (beyond 3 samples).
- Add content for new multi-step categories.
- Refine spaced review intervals based on real usage data.
- Continue stabilization and test coverage improvements.

---

# 9. Release Decision Template

```text
Release: v0.3.0
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.3.0 release
[ ] Not approved — see notes

Notes:
```
