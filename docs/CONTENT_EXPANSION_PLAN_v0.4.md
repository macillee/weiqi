# Content Expansion Plan — v0.4.0

> Project: 小棋童围棋闯关
> Version: v0.4.0
> Status: planning-only (v0.4.0a)
> Date: 2026-05-24

---

# 1. Goal

Expand the problem library from 39 to ~60 problems, adding meaningful multi-step content and filling category gaps — while keeping all implementation slices small, reviewable, and backward compatible with v0.1–v0.3.

v0.4 builds on v0.3's Learning Depth infrastructure (multi-step schema, spaced review, weekly report) but does not change any product feature, player UI, or scheduling algorithm.

---

# 2. Current Content Baseline

| Metric | Value |
|---|---:|
| Total problems | 39 |
| Single-step problems | 36 |
| Multi-step problems | 3 |

Current category distribution:

| Category | Count | Single-step | Multi-step | ID range |
|---|---:|---:|---:|---|
| capture | 14 | 14 | 0 | CAP-001–CAP-013, MULTI-001 |
| escape | 7 | 7 | 0 | ESC-001–ESC-007 |
| connect_cut | 10 | 9 | 1 | CC-001–CC-010, MULTI-003 |
| life_death | 5 | 4 | 1 | LD-001–LD-005, MULTI-002 |
| opening | 3 | 3 | 0 | OP-001–OP-003 |

Multi-step problems currently exist only as 2-step samples (MULTI-001 capture, MULTI-002 life_death, MULTI-003 connect_cut). No escape or opening multi-step problems exist.

---

# 3. Feature Slices

Implementation must proceed in small, reviewable increments. Each slice has its own acceptance criteria and must not skip ahead.

## v0.4.0a — Planning and Boundaries (THIS TASK)

- Define expansion goals, slice boundaries, and quality rules.
- Docs-only; no code or problem data changes.
- Update `docs/TASKS.md` to mark v0.4.0a as delivered.

## v0.4.0b — First Multi-Step Content Pack

- Add ~10–12 new problems to `src/data/problems.json`.
- Mix of single-step and multi-step (2-step) problems.
- Prioritize capture (multi-step) and life_death (both single and multi-step) as the largest gaps.
- All problems: 9x9 board, valid coordinates, child-friendly copy.
- Multi-step problems: validate step order, board transitions, per-step hints.
- Run `validateAllProblems`, `npm run test`, `npm run build`.
- No player UI changes.

## v0.4.0c — Content Validation and Regression Checks

- Review all new problems for Go-logic correctness and child suitability.
- Add or strengthen validation tests in `src/__tests__/problems.test.ts` if gaps are found.
- Create `docs/CONTENT_REVIEW_v0.4.0b.md` documenting every new problem.
- Verify 9x9 coordinate validity, zero-liberty detection, answer-point emptiness, and multi-step board transitions.
- Run `npm run test`, `npm run build`.
- No new problems added in this slice.

## v0.4.0d — Tag / Category Metadata Refinement (if needed)

- Review existing 39 problems for tag consistency and category alignment.
- Adjust tags only where clearly wrong or missing.
- Add `multi-step` tag to multi-step problems if not already present.
- Create `docs/CONTENT_REVIEW_v0.4.0d.md` documenting any metadata changes.
- No new problems or player UI changes.

---

# 4. Target Problem Count

| Slice | Total After | New Problems | Multi-step | Single-step |
|---|---:|---:|---:|---:|
| v0.4.0a (planning) | 39 | 0 | 3 | 36 |
| v0.4.0b (content pack) | ~50–51 | ~11–12 | ~5–6 | ~6 |
| v0.4.0c (validation) | ~50–51 | 0 | — | — |
| v0.4.0d (metadata) | ~50–51 | 0 | — | — |
| **v0.4 total target** | **~50–60** | **~11–21** | — | — |

The final v0.4 target is approximately 50–60 reviewed problems. Exact v0.4.0b counts depend on Go-logic review capacity.

---

# 5. Recommended Category Distribution (v0.4.0b)

Target for ~12 new problems in v0.4.0b:

| Category | Current | New multi-step | New single-step | New total after v0.4.0b | Rationale |
|---|---:|---:|---:|---:|---|
| capture | 14 | +2 | +1 | 17 | Core skill; add multi-step capture sequences |
| life_death | 5 | +2 | +2 | 9 | Currently most underrepresented core category |
| connect_cut | 10 | +1 | +1 | 12 | Add multi-step connection sequences |
| escape | 7 | +1 | +1 | 9 | Add multi-step escape/defense |
| opening | 3 | 0 | +1 | 4 | Minor expansion |
| **Total** | **39** | **+6** | **+6** | **~51** | |

---

# 6. Problem Quality Rules

Every new problem must satisfy:

- `boardSize` is `9`.
- Coordinates are 0-based; `x` left-to-right, `y` top-to-bottom.
- `initialStones` has no duplicate coordinates.
- Every answer coordinate is empty in the initial position.
- Every answer coordinate is inside the board.
- Initial position contains no zero-liberty group.
- The answer matches the title and description.
- Hints move from general observation to concrete direction (minimum 2 hints).
- Feedback is warm, short, and suitable for children aged 6–10.
- `successMessage` ≤ 30 characters; `failureMessage` ≤ 30 characters.

**Multi-step problem extra rules:**

- `totalSteps` ≥ 2.
- Steps are numbered sequentially starting from 1.
- Each step has at least 1 answer.
- Each step has at least 1 hint.
- `addedStones` and `removedStones` coordinates are valid and produce a legal board state.
- `addedStones` does not overlap existing stones.
- `removedStones` references only stones that exist at that step.
- The board transition from step N to step N+1 is deterministic and unambiguous.
- Wrong moves accumulate at problem level (not per step) — consistent with v0.3 player behavior.

---

# 7. ID Convention for New Problems

New problems in v0.4.0b should use the next available IDs in the existing scheme:

| Category | Next available ID | Notes |
|---|---|---|
| capture | CAP-014, CAP-015, ... | Extend from CAP-013 |
| escape | ESC-008, ESC-009, ... | Extend from ESC-007 |
| connect_cut | CC-011, CC-012, ... | Extend from CC-010 |
| life_death | LD-006, LD-007, ... | Extend from LD-005 |
| opening | OP-004, OP-005, ... | Extend from OP-003 |
| multi-step | MULTI-004, MULTI-005, ... | Extend from MULTI-003 |

Multi-step problems should use the `MULTI-` prefix for their ID but reference the relevant category in their `category` and `tags` fields. Multi-step problems may have corresponding single-step problem IDs where pedagogically related (e.g., CAP-014 and MULTI-004 could both target capture technique).

---

# 8. Tags Convention

Every new problem should have at least 2–3 tags:

- The primary category tag (e.g., `"capture"`, `"life-and-death"`)
- A technique tag (e.g., `"atari"`, `"liberty-counting"`, `"connect"`, `"cut"`, `"two-eyes"`)
- A difficulty signal (e.g., `"one-move"`, `"multi-step"`, `"two-step"`)

Optional tags:

- `"review"` — the problem is specifically designed for spaced review
- `"beginner"` — suitable for very early learners
- `"defense"` — the player is defending, not attacking

---

# 9. What NOT to Do in v0.4.0

- Do not change the `Problem` schema or `ProblemStep` type.
- Do not change `ProblemPlayer` UI.
- Do not change spaced review scheduling algorithm.
- Do not change weekly report aggregation.
- Do not modify `package.json` or `package-lock.json`.
- Do not add SQL migrations or schema changes.
- Do not implement AI-generated content or AI review.
- Do not implement payment, teacher/admin backend, or leaderboard.
- Do not implement 13×13 or 19×19 board support.
- Do not implement SGF import/export.
- Do not implement user accounts beyond existing v0.2 Supabase auth.

---

# 10. Acceptance Criteria for v0.4.0a

- [ ] This document (`docs/CONTENT_EXPANSION_PLAN_v0.4.md`) exists and defines all slices.
- [ ] Target counts and category distribution are documented.
- [ ] Quality rules for new problems are defined.
- [ ] ID conventions and tag recommendations are specified.
- [ ] `docs/TASKS.md` updated to mark v0.4.0a as delivered and set next task to v0.4.0b.
- [ ] No code or problem data changes; docs-only task.

---

# 11. Next Task: v0.4.0b — First Multi-Step Content Pack

Recommended scope:

1. Add ~12 new problems to `src/data/problems.json` following the distribution in §5.
2. Include ~6 multi-step (2-step) problems to expand multi-step practice beyond the 3 samples.
3. Prioritize capture and life_death categories.
4. Verify with `validateAllProblems`, `npm run test`, `npm run build`.
5. Update `docs/TASKS.md` to mark v0.4.0b as delivered.
6. Create `docs/CONTENT_REVIEW_v0.4.0b.md` documenting every new problem.
