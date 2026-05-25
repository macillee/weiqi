# v0.5 Next Phase Plan

> Project: 小棋童围棋闯关
> Version: v0.5.0a (planning)
> Date: 2026-05-25

---

## 1. Context

v0.4 content expansion is complete:

- 51 total problems (42 single-step, 9 multi-step)
- 5 categories: capture (17), connect_cut (12), escape (9), life_death (9), opening (4)
- Difficulty levels 1–3 filled; levels 4–5 empty
- No endgame category
- Validation tests strengthened; tag metadata normalized
- Release notes and manual QA checklist delivered

---

## 2. Candidate Directions

### A. Content Expansion (~60+ problems)

Continue expanding the problem library toward 60+ problems.

**Strengths:**
- Direct continuation of v0.4 trajectory
- Fills gaps: levels 4–5, endgame category
- More variety for spaced review and weekly report
- Clear, measurable progress

**Weaknesses:**
- Repeats v0.4 pattern — less novel
- No new product capabilities

**Estimated effort:** 3–4 slices (similar to v0.4)

### B. Product Polish / UX Refinement

Improve the child-facing experience: Chinese board coordinates, star/celebration animations, audio feedback, difficulty-appropriate hint styling.

**Strengths:**
- Directly improves child engagement
- Addresses known rough edges (no coordinate labels, minimal feedback)
- Smaller slices, faster shipping

**Weaknesses:**
- Less visible progress metric
- Risk of scope creep into full redesign

**Estimated effort:** 2–3 slices

### C. Deeper Multi-Step Support

Extend multi-step beyond 2-step sequences (3+ step problems), add multi-step opening problems, improve step transition UX.

**Strengths:**
- Unlocks new pedagogical content
- Leverages existing multi-step schema
- Differentiates from v0.4

**Weaknesses:**
- Requires schema/UI changes
- Content creation for 3+ step problems is harder
- Smaller immediate library impact

**Estimated effort:** 3–4 slices

### D. Infrastructure / Testing / Documentation

E2E tests, CI/CD pipeline polish, Docker compose hardening, developer documentation refresh.

**Strengths:**
- Low risk, high maintainability ROI
- Independent of content decisions

**Weaknesses:**
- No visible user-facing change
- Less motivating for a feature-driven roadmap

**Estimated effort:** 1–2 slices

---

## 3. Selected Primary Direction: A — Content Expansion (~60+ problems)

**Rationale:**

1. The v0.1 MVP target was "~50–60 problems." At 51, the library is at the low end of that range. Expanding to 60+ fulfills the original scope.
2. Levels 4–5 are completely empty — this is the most obvious content gap. Advanced-beginner children have no harder problems to grow into.
3. Endgame is the only category with zero problems. Adding it rounds out the curriculum.
4. The expansion pattern is proven from v0.4: plan → content pack → validation → metadata. This reduces planning risk.
5. UX polish (Direction B) can be interleaved as a smaller slice within v0.5 if bandwidth allows.

---

## 4. Proposed Slices

### v0.5.0b — Content Pack: Levels 4–5 + Endgame (estimated +12–15 problems)

- Add problems at difficulty levels 4 and 5 across existing categories
- Add endgame category problems (level 1–3)
- Focus on single-step problems; multi-step additions deferred to v0.5.0c
- Update content review doc
- Update problem count tests

**Acceptance:** `npm run test` passes; `npm run build` passes; no schema changes.

### v0.5.0c — Content Validation and Regression

- Run validation checks on all new problems
- Strengthen tests if gaps are found
- Verify multi-step transitions still correct after content additions
- Update content review doc

**Acceptance:** `npm run test` passes; `npm run build` passes; no data bugs in new problems.

### v0.5.0d — Stabilization and Release Notes

- Compile v0.5 release notes
- Run manual QA checklist from v0.4, extended for new content
- Tag/category metadata review for new problems

**Acceptance:** Release notes document final counts and known limitations.

---

## 5. Out-of-Scope for v0.5

- Multi-step beyond 2-step sequences (deferred to future phase)
- AI-generated content or AI review
- User login / authentication
- Database migrations
- Supabase integration changes
- Payment / subscription
- Online multiplayer
- Teacher/admin dashboard
- Leaderboard or social features
- 19×19 full-game platform
- SGF import/export

---

## 6. Acceptance Rules for v0.5 Tasks

1. Each slice must produce a single reviewable PR.
2. No slice may mix content addition with infrastructure or schema changes.
3. Content validation must pass before a stabilization slice begins.
4. All PRs must include `npm run test` and `npm run build` results.
5. No PR may modify `package.json`, `package-lock.json`, or SQL files unless explicitly scoped.
6. `docs/TASKS.md` must be updated with each completed slice.
