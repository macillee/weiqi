# Intermediate Content Pipeline — v0.12

## 1. Goal and Constraints

This document defines the safe content creation workflow for adding intermediate Go problems to the children Go learning app.

**Target learner**: child with approximately one year of Go study.

**Constraints**:

- Local-first and privacy-first — no external AI service required or defaulted.
- No unreviewed AI-generated content may be merged.
- All new content must conform to the existing `Problem` schema at `src/lib/problems.ts`.
- All UI and board constraints (9x9 only in v0.1) must be respected.
- New problems must pass all existing validation tests.

## 2. Content Design Principles

- **One concept per problem** — each problem targets exactly one Go shape or tactic.
- **Child-readable Chinese** — all text fields use short, concrete, encouraging language suitable for ages 6–10.
- **Short hints** — 2–3 progressive hints that guide without giving away the answer immediately.
- **Category and level calibration** — levels 3–5 for intermediate content; avoid adding more level-1 introductory problems.
- **No trick problems** — avoid shapes that require advanced (dan-level) reading.

## 3. Problem Authoring Workflow

1. **Draft** — write problem ID, title, description, board position, answer(s), hints, explanation, messages, tags, and optional wrongMoves.
2. **Verify board state** — ensure:
   - All stone coordinates are within the 9x9 board (0–8).
   - No duplicate coordinates in `initialStones`.
   - The answer point is an empty intersection.
   - The target group has exactly the intended liberties.
   - No group has zero liberties at setup (already dead).
3. **Check category / level / tags** — ensure the problem fits the intended category and level progression.
4. **Add wrongMoves** — for common mistakes children make, include `wrongMoves` entries with constructive Chinese feedback.
5. **Manually solve** — a human reviewer must solve each problem to confirm it is correct and unambiguous.
6. **Validate** — run `npm run test` and `npm run build` and confirm all pass.
7. **Merge** — only after human review and CI pass.

## 4. AI-Assisted Workflow (Future Use)

If AI tools are used to assist content creation:

- AI may propose candidate positions, coordinate layouts, or hint wording.
- A human **must** manually verify every problem before it is added to `problems.json`.
- No direct AI-to-merge is permitted — an AI may never independently push unreviewed content.
- Local AI tools (e.g., KataGo position analysis) are preferred.
- External cloud AI services are opt-in only and never the default workflow.
- No data from problems or user progress may be sent to external AI services without explicit consent.

## 5. Quality Checklist

Before merging a content pack, verify:

- [ ] Every problem ID is unique and follows the established prefix convention (e.g., `CAP-`, `CC-`, `END-`, `ESC-`, `LD-`, `OP-`).
- [ ] All coordinates are within board range (0–8 for 9x9).
- [ ] Answer points are empty intersections in the initial board state.
- [ ] No zero-liberty groups exist in the initial position.
- [ ] Hints are progressive (do not reveal the answer in hint 1).
- [ ] The explanation accurately describes the tactic or shape.
- [ ] `wrongMoves` entries (if any) use constructive language.
- [ ] Category and level are appropriate relative to existing content.
- [ ] Tags are consistent and use the established tag vocabulary.
- [ ] All `successMessage` values are ≤ 30 characters, positive, and child-friendly.
- [ ] All `failureMessage` values avoid blame, harsh language, or negative framing.

## 6. Review Focus

PR reviewers for future content packs should check:

1. **Go correctness** — every problem must have a valid, solvable position.
2. **Level calibration** — new problems should not dilute the intermediate focus by adding basic content.
3. **Wiring** — new IDs are properly added to `src/lib/chapters.ts`.
4. **Test pass** — `npm run test` passes and no existing test is weakened.
5. **Child safety** — all text is kind, concrete, and age-appropriate.
6. **Scope** — no package, Docker, CI, Supabase, or schema changes unless separately justified.
