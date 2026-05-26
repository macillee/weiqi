# v0.6 Next Phase Plan

> Project: 小棋童围棋闯关
> Version: v0.6.0a (planning)
> Date: 2026-05-26

---

## 1. Context

v0.5 content expansion is complete:

- 65 total problems (56 single-step, 9 multi-step)
- 6 categories: capture (20), connect_cut (14), escape (11), life_death (11), opening (5), endgame (4)
- Levels 1–5 all populated
- Endgame category added (4 problems, levels 1–3)
- Validation tests at 258 total
- Release notes and manual QA checklist delivered

---

## 2. Candidate Directions

### A. UX Polish / Child-Facing Gameplay Refinement

Improve the child-friendly experience: Chinese board coordinate labels, success animations / star effects, audio feedback (correct/wrong), better hint presentation, celebratory copy enhancements.

**Strengths:**
- Directly improves daily experience for target users (children aged ~7–9)
- Addresses known rough edges: no board labels, minimal feedback, dry presentation
- Visible, parent-facing improvement — easier to demo and share
- Can be sliced into small, independent features

**Weaknesses:**
- Harder to measure success quantitatively
- Risk of scope creep into full redesign
- Some features (audio, animation) may need new dependencies

**Estimated effort:** 3–4 slices

### B. Deeper Multi-Step Support

Extend multi-step beyond 2-step sequences: add 3+ step problems, create multi-step opening and endgame content, improve step-transition UX.

**Strengths:**
- Unlocks new pedagogical depth
- Leverages existing multi-step schema
- Differentiates from v0.4–v0.5 pure content expansion

**Weaknesses:**
- Requires schema and UI changes (not just data)
- Content creation for 3+ steps is significantly harder
- Small library impact (fewer problems added)
- Overlaps with content expansion pattern already done

**Estimated effort:** 3–5 slices

### C. Infrastructure / Testing / CI / DX

E2E tests (Playwright), CI pipeline polish, Docker compose hardening, HMR/developer experience improvements, pre-commit hooks.

**Strengths:**
- Low risk, high maintainability ROI
- Independent of content and UI decisions
- Fast to implement (1–2 slices for most items)

**Weaknesses:**
- No visible user-facing change
- Least motivating for a feature-driven roadmap
- Less useful feedback from stakeholders

**Estimated effort:** 1–2 slices

### D. Content Balancing (Endgame, Opening, Level Distribution)

Add more endgame (target 8–10 total), more opening problems (target 8–10, add level 5), and rebalance level 2 dominance by adding more level 3–5 content.

**Strengths:**
- Continuing the proven v0.4–v0.5 content expansion pattern
- Addresses the known limitations documented in v0.5 release notes
- Measurable, clear progress

**Weaknesses:**
- Repeats v0.5 pattern — diminishing novelty returns
- Does not improve UX or technical foundation
- Expanding endgame/opening without UX refinement limits child engagement

**Estimated effort:** 2–3 slices

### E. Deployment / Supabase Environment Hardening

Polish Docker compose workflow, document Supabase local setup, add env validation, improve local/first-run developer experience.

**Strengths:**
- Reduces onboarding friction for new contributors
- Low effort for high developer experience gain

**Weaknesses:**
- No user-facing impact
- Supabase is not used in local anonymous mode — lower priority
- Limited educational project context (single contributor expected)

**Estimated effort:** 1 slice

---

## 3. Selected Primary Direction: A — UX Polish / Child-Facing Gameplay Refinement

**Rationale:**

1. **Content is sufficient for v0.6.** At 65 problems across 6 categories and levels 1–5, the library meets the original MVP target. Further expansion without UX improvement risks diminishing returns — children will encounter more problems without a better experience.

2. **Known UX gaps directly affect the target user.** The app has no Chinese board coordinate labels, no animations, no audio feedback, and minimal celebration on correct answers. A 7–9 year old child using this app daily would benefit most from a more engaging, polished interface.

3. **Parent appeal.** Polish improvements (animations, stars, audio) make the app more shareable and demo-worthy. This matters for a children's educational app even in a non-commercial context.

4. **Slices remain small and reviewable.** Each UX feature (coordinate labels, animations, audio, hints) can be a standalone PR. This avoids the scope-creep risk of a monolithic redesign.

5. **Infrastructure (Direction C/E) can be interleaved** as a single maintenance slice within v0.6 if bandwidth allows. UX polish is the primary direction, not the exclusive one.

---

## 4. Proposed Slices

### v0.6.0b — Chinese Board Coordinate Labels

- Add Chinese numeral labels (一到九) along board edges
- Use standard Go coordinate convention (columns: 一~九, rows: 1~9 or 一~九)
- Ensure labels are visible at all board sizes and screen widths
- No gameplay logic changes

**Acceptance:** Board renders with coordinates in all viewports; `npm run test` passes; `npm run build` passes.

### v0.6.0c — Success Animations and Star Effects

- Add lightweight CSS/keyframe animation on correct answer
- Show star or sparkle effect at the played intersection
- Brief celebratory visual before advancing to next problem
- No new animation library dependencies if possible (CSS-only)

**Acceptance:** Correct answer triggers visual feedback; `npm run test` passes; `npm run build` passes.

### v0.6.0d — Audio Feedback (Correct/Wrong)

- Add short sound effects for correct and wrong answers
- Use lightweight audio (Web Audio API or small audio files)
- Respect user preference (opt-out toggle in settings)
- No external audio library dependency

**Acceptance:** Audio plays on answer submission; toggleable in settings; `npm run test` passes; `npm run build` passes.

### v0.6.0e (optional) — Hint Presentation Polish

- Style hints as progressive reveal cards instead of flat text
- Add visual indicators on the board corresponding to hint coordinates
- Keep hint content unchanged

**Acceptance:** Hints display progressively with board highlights; `npm run test` passes; `npm run build` passes.

---

## 5. Out-of-Scope for v0.6

- New problem content (problems, categories, or levels)
- Changes to Problem / ProblemStep schema
- Multi-step beyond 2-step sequences
- User login / authentication
- Database migrations
- Supabase integration changes
- Payment / subscription
- Online multiplayer
- Teacher/admin dashboard
- Leaderboard or social features
- 19×19 full-game platform
- SGF import/export
- Full app redesign or layout overhaul
- Sound effect or animation library additions beyond what's needed for basic feedback
- AI-generated content or AI review

---

## 6. Acceptance Rules for v0.6 Tasks

1. Each slice must produce a single reviewable PR.
2. No slice may mix UX changes with content or infrastructure changes.
3. All UX changes must be tested in both light and dark modes if the app supports them.
4. All PRs must include `npm run test` and `npm run build` results.
5. No PR may modify `package.json` or `package-lock.json` unless explicitly scoped (audio may need none; animation should be CSS-only).
6. `docs/TASKS.md` must be updated with each completed slice.
7. Audio and animation feedback must have an opt-out mechanism (settings toggle or system preference).
