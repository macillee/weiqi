# Release Notes — v0.4.0 Content Expansion

> Project: 小棋童围棋闯关
> Release type: Content expansion (local-first)
> Status: locally accepted after validation and QA

---

# 1. Release Summary

v0.4.0 expands the problem library from 39 to 51 problems, adding meaningful multi-step content and filling category gaps while keeping all four implementation slices small, reviewable, and fully backward compatible with v0.1–v0.3.

The release follows four slices (v0.4.0a–d):

- v0.4.0a: Content expansion planning and slice boundaries (docs only)
- v0.4.0b: First 12-problem multi-step content pack
- v0.4.0c: Content validation and regression checks
- v0.4.0d: Tag/category metadata refinement

This is a pure content and metadata release — no schema changes, no player UI changes, no scheduling or weekly report changes.

---

# 2. Content Inventory

Final content state after v0.4.0:

| Category | Single-step | Multi-step | Total |
|---|---:|---:|---:|
| capture | 14 | 3 | 17 |
| connect_cut | 10 | 2 | 12 |
| escape | 8 | 1 | 9 |
| life_death | 6 | 3 | 9 |
| opening | 4 | 0 | 4 |
| **Total** | **42** | **9** | **51** |

All problems: 9x9 board, Chinese child-friendly copy, 2–3 hints per problem/step, warm success/failure messages.

---

# 3. Slice Summary

## v0.4.0a — Planning and Boundaries

- `docs/CONTENT_EXPANSION_PLAN_v0.4.md` defining expansion goals, slice boundaries, target counts, category distribution, quality rules, ID conventions, and tag recommendations.
- Docs-only; no code or problem data changes.

## v0.4.0b — First Multi-Step Content Pack

- Added 12 new problems (6 single-step + 6 multi-step) to `src/data/problems.json`.
- Category distribution: capture +3, life_death +4, connect_cut +2, escape +2, opening +1.
- New multi-step problems: MULTI-004 (capture), MULTI-005 (capture), MULTI-006 (life_death), MULTI-007 (life_death), MULTI-008 (connect_cut), MULTI-009 (escape).
- New single-step problems: CAP-014, LD-006, LD-007, CC-011, ESC-008, OP-004.
- `docs/CONTENT_REVIEW_v0.4.0b.md` documenting every new problem with validation notes.
- Updated problem count test.

## v0.4.0c — Content Validation and Regression Checks

- Reviewed all 51 problems for data and Go-logic correctness.
- Confirmed: no duplicate IDs, all coordinates valid, no zero-liberty groups, all answer points empty on relevant board state.
- Multi-step checks: sequential ordering, addedStones/removedStones validity, per-step hints/answers, board transitions.
- Strengthened tests: `validateAllProblems` pass test, added ID existence check, no-old-ID-number-reuse check, negative test for step-2-answer-on-occupied-point.
- `docs/CONTENT_REVIEW_v0.4.0c.md` — validation and regression review.

## v0.4.0d — Tag / Category Metadata Refinement

- Reviewed tags for all 51 problems.
- Normalized `life-death` → `life_death` (3 problems affected).
- Canonical tag list: 22 tags, lowercase kebab-case/snake_case.
- Category/tag mapping rules documented.
- Added 5 metadata tests: category-aligned tag, multi-step tag presence, non-empty tag, no duplicate tags, canonical `life_death` check.
- `docs/METADATA_REVIEW_v0.4.0d.md` — metadata review.

---

# 4. Backward Compatibility

- All 39 original problems unchanged.
- Existing ProblemPlayer behavior unchanged.
- Spaced review scheduling unaffected.
- Weekly report aggregation unaffected.
- localStorage progress format unchanged.
- Supabase server mode unchanged.
- Missing Supabase env does not break any feature.

---

# 5. Manual QA Checklist

> Use this checklist for v0.4.0 acceptance testing.
> Run each check in order and mark pass/fail.

## 5.1 Environment Check

- [ ] `npm run dev` starts successfully.
- [ ] `http://localhost:3000` loads in browser.
- [ ] No blocking console errors on page load.
- [ ] App loads in local anonymous mode without Supabase env configured.

## 5.2 Problem List / Category Navigation

- [ ] Home page loads with correct star and wrong-problem counts.
- [ ] Daily practice selects from the full 51-problem pool (no missing IDs).
- [ ] Chapter/level pages render available problems correctly.

## 5.3 Single-Step Problem Play

- [ ] Single-step problems render correctly (no step indicator).
- [ ] Correct answer shows green feedback.
- [ ] Wrong answer shows warm failure message.
- [ ] After 2 wrong answers, correct answer is revealed.
- [ ] Hints show progressively per problem.

## 5.4 Multi-Step Problem Play

- [ ] Multi-step problems render with step indicator.
- [ ] Board state updates between steps (addedStones rendered, removedStones cleared).
- [ ] Clicking correct answer advances to next step.
- [ ] On final step correct, success feedback with explanation is shown.
- [ ] Wrong answer at any step shows step-specific failure message.

## 5.5 Hints Reset Per Step

- [ ] Multi-step problem: each step has its own hints.
- [ ] Using hint on step 1 does not consume hint on step 2.

## 5.6 Wrong Answers at Problem Level

- [ ] Getting wrong on step 1 and wrong on step 2: problem registers 2 wrongs.
- [ ] After review, problem appears in wrong book.

## 5.7 Spaced Review Scheduling

- [ ] After completing a problem, review schedule entry is created.
- [ ] Failed problems are due the next day.
- [ ] Clean success problems are due in 4 days.
- [ ] Repeated clean success extends interval progressively.
- [ ] Due problems appear correctly in practice selection.

## 5.8 Weekly Report

- [ ] Weekly card shows attempt count, accuracy, hints, completions after activity.
- [ ] Empty state shows no weekly card for new or inactive users.

## 5.9 Content Validation Tests

- [ ] `npm run test` passes (250+ tests).
- [ ] Test output includes metadata validation tests from v0.4.0d.

## 5.10 Local Build Smoke Check

- [ ] `npm run build` passes.
- [ ] No TypeScript errors.

---

# 6. Known Limitations

- Multi-step problems limited to 2-step sequences (schema supports more, not product-tested).
- No multi-step opening problems.
- No endgame category problems.
- life_death (9) and opening (4) remain the smallest categories.
- All problems use 9x9 board; 13×19 supported by types but not populated.
- Time spent tracking remains `0` for all attempts (inherited from v0.1).
- No AI review or feedback beyond hint system.

---

# 7. Test Summary

| Slice | Test count | Key files |
|---|---:|---|
| v0.4.0b (content) | 241 (baseline) | `problems.test.ts` |
| v0.4.0c (validation) | 245 (+4) | `problems.test.ts` |
| v0.4.0d (metadata) | 250 (+5) | `problems.test.ts` |
| **Total** | **250** | **17 test files** |

---

# 8. Next Recommended Version

v0.5.0 should be a planning-only slice. Potential directions:

- Content expansion to ~60+ problems (life_death, opening, endgame).
- Multi-step content beyond 2-step sequences.
- Product polish and UX refinement.
- Infrastructure, testing, or documentation improvements only.

---

# 9. Release Decision Template

```text
Release: v0.4.0
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.4.0 release
[ ] Not approved — see notes

Notes:
```