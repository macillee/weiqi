# Learning Depth Plan — v0.3.0

> Project: Children Go Web Training App
> Version: v0.3.0
> Status: planning-only (v0.3.0a)
> Date: 2026-05-23

---

# 1. Goal

Extend the app from single-move problems to a deeper learning system with multi-step problems, spaced review scheduling, and parent weekly reports — while preserving the v0.2 local-first and server-sync architecture.

---

# 2. Feature Slices

Implementation must proceed in small, reviewable increments. Each slice has its own acceptance criteria and must not skip ahead.

## v0.3.0a — Planning and Boundaries (THIS TASK)

- Define feature slices, data model changes, and compatibility constraints.
- Docs-only; no code changes.
- Update `docs/TASKS.md` to mark v0.3.0a as delivered.

## v0.3.0b — Multi-Step Problem Schema / Data Model

- Extend `Problem` type to support multi-step (sequence) problems.
- Each step has its own `answers`, `hints`, and `initialStones` (with delta from previous step).
- Backward-compatible: existing single-move problems work unchanged.
- Add JSON schema validation tests for new problem format.
- Add 3–5 sample multi-step problems in `problems.json`.
- `npm run test` and `npm run build` pass.
- No UI changes yet.

## v0.3.0c — Multi-Step Problem Player UI

- ProblemPlayer renders step-by-step progression.
- After correct answer at step N, board updates to show step N+1 initial position.
- Step indicator shows current step / total steps.
- Wrong answer at any step records the attempt and adds to wrong book (at problem level, not step level).
- Hints reset per step.
- Single-move problems continue to work identically.
- `npm run test` and `npm run build` pass.

## v0.3.0d — Spaced Review Scheduling

- Add `next_review_at` field to `wrong_problems` table (SQL migration).
- Implement SM-2–inspired scheduling: after mastering a wrong problem, schedule review at increasing intervals (1d → 3d → 7d → 14d → 30d).
- Daily practice includes "due for review" problems before new problems.
- `wrong_problems` status transitions: `active` → `reviewing` → `mastered` → `scheduled_review`.
- Server sync: `next_review_at` stored in Supabase and synced.
- Local mode: `next_review_at` stored in localStorage.
- `npm run test` and `npm run build` pass.

## v0.3.0e — Parent Weekly Report

- Weekly summary email or in-app report for parents.
- Data source: `problem_attempts`, `wrong_problems`, `progress_summary` for the past 7 days.
- Report content: problems completed, accuracy, time spent, weakest categories, streak.
- Requires v0.3.0d data (spaced review) for meaningful "needs review" recommendations.
- Server-side computation only; no client-heavy aggregation.
- Parent must be authenticated and have a child profile.
- `npm run test` and `npm run build` pass.

---

# 3. Data Model Changes

## 3.1 Problem Schema Extension (v0.3.0b)

```ts
type ProblemStep = {
  /** Step number, 1-indexed */
  step: number;
  /** Stones to add relative to previous step (or initial position for step 1) */
  addedStones?: Stone[];
  /** Stones to remove relative to previous step */
  removedStones?: Stone[];
  /** Answers for this step */
  answers: Point[];
  /** Hints for this step */
  hints: string[];
  /** Explanation after this step */
  explanation: string;
  /** Success message for this step */
  successMessage: string;
  /** Failure message for this step */
  failureMessage: string;
  /** Wrong moves for this step (optional) */
  wrongMoves?: Array<{ x: number; y: number; message: string }>;
};

type Problem = {
  id: string;
  boardSize: 9 | 13 | 19;
  category: ProblemCategory;
  level: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  toPlay: StoneColor;
  title: string;
  description: string;
  initialStones: Stone[];
  // v0.1 single-step fields (backward compatible)
  answers: Point[];
  hints: string[];
  explanation: string;
  successMessage: string;
  failureMessage: string;
  wrongMoves?: Array<{ x: number; y: number; message: string }>;
  // v0.3 multi-step extension (optional)
  steps?: ProblemStep[];
  /** Total number of steps (1 = single-move, default) */
  totalSteps?: number;
};
```

**Compatibility rule**: If `steps` is absent or `totalSteps === 1`, the problem is a single-move problem using the existing top-level `answers`, `hints`, etc. If `steps` is present and `totalSteps > 1`, the problem is multi-step.

## 3.2 Wrong Problems Extension (v0.3.0d)

```sql
ALTER TABLE wrong_problems
  ADD COLUMN next_review_at timestamptz,
  ADD COLUMN review_interval_days int DEFAULT 1;

-- Status values now include 'scheduled_review'
ALTER TABLE wrong_problems
  DROP CONSTRAINT wrong_problems_status_check;

ALTER TABLE wrong_problems
  ADD CONSTRAINT wrong_problems_status_check
  CHECK (status IN ('active', 'reviewing', 'mastered', 'scheduled_review'));
```

## 3.3 Problem Attempts (no change)

The existing `problem_attempts` table works for multi-step problems because each step attempt is recorded with the same `problem_id`. A future extension could add `step_number` but this is not required in v0.3.0.

---

# 4. Spaced Review Algorithm

Based on a simplified SM-2 approach:

```
After first correct review (active → reviewing):
  next_review_at = now + 1 day
  review_interval_days = 1

After second correct review (reviewing → mastered):
  next_review_at = now + 3 days
  review_interval_days = 3

After mastering, each subsequent correct review:
  review_interval_days = min(review_interval_days * 2, 30)
  next_review_at = now + review_interval_days days

After wrong answer during review:
  review_interval_days = 1
  next_review_at = now + 1 day
  status = reviewing (or active if never mastered)
```

---

# 5. Local Mode Compatibility

- Multi-step problems work in local anonymous mode (no Supabase needed).
- Spaced review `next_review_at` stored in localStorage `StudentProgress.wrongProblems[problemId].nextReviewAt`.
- Weekly report requires server mode (authenticated + child profile).
- Missing Supabase env must not break any v0.3 feature except weekly report.

---

# 6. AI Report — Out of Scope

AI-generated report content (e.g., "Your child seems to struggle with life-and-death problems because...") is explicitly **out of scope** for v0.3.0. The parent weekly report in v0.3.0e uses only deterministic statistics and scheduling data.

AI report may be considered in v0.4+ but requires a separate planning slice.

---

# 7. What NOT to Do in v0.3.0

- Do not implement AI-generated content.
- Do not implement payment, teacher/admin backend, or leaderboard.
- Do not modify SQL schema until v0.3.0d (spaced review).
- Do not modify package dependencies or lockfiles unless a new dependency is justified.
- Do not implement 13×13 or 19×19 board support.
- Do not implement SGF import/export.
- Do not change the v0.2 import/local-progress behavior.

---

# 8. Acceptance Criteria for v0.3.0a

- [x] This document (`docs/LEARNING_DEPTH_PLAN_v0.3.md`) exists and defines all five slices.
- [x] Data model changes are documented before implementation.
- [x] Local/server mode compatibility is documented.
- [x] AI Report is explicitly out of scope.
- [x] `docs/TASKS.md` updated to mark v0.3.0a as delivered.
- [x] No code changes; docs-only task.
