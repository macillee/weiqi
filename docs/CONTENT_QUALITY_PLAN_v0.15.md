# v0.15 Content Quality and Intermediate Problem Expansion Plan

## 1. Goal and Constraints

**Goal:** Improve content quality and intermediate learner fit before adding more engine/diagnostics UX.

**Target learner:** Child with about one year of Go study. Overly introductory content (level 1–2 single-stone capture, basic rules) is no longer well matched.

**Priorities:**

- Prioritize levels 3–5 over level 1–2 introductory problems.
- Preserve local-first and offline behavior.
- Do not depend on external AI APIs.
- Do not require KataGo for content use.
- Maintain human-reviewable problem data.
- Do not change runtime behavior in this planning task.

## 2. Current Content Baseline

### Library size and history

- v0.7.0b: 12 new problems (library reached 77 total).
- v0.8.0b–d: wired capture, escape, connect_cut, life_death, endgame, opening, multi-step (77 total, full library).
- v0.12.0e: 10 new intermediate level 3–5 human-reviewed problems.

### Existing categories

| Category | Description |
|---|---|
| capture | Single-group capture / race |
| escape | Run or connect out |
| connect_cut | Connect or cut reading |
| life_death | Basic eye shape / group status |
| opening | Corner approach / extension on 9×9 |
| endgame | Simple endgame / boundary play |
| mixed | Combined-skill review |

### Existing flows

- Daily practice with category-balanced and level-clamped selection.
- Spaced review scheduling.
- Multi-step problem awareness and safe exposure.
- Wrong-answer rule/template coach and optional engine-assisted review.
- Local anonymous mode (no server required).

**Note:** Exact category-by-level counts are not computed in this planning document. A follow-up audit task (v0.15.0b) will compute the matrix.

## 3. Content Quality Dimensions

For this project, "quality" means:

| Dimension | Definition |
|---|---|
| Accurate answer | The authored answer must be correct in the given position. |
| Accurate explanation | The explanation must describe the correct local reading. |
| Age-appropriate Chinese | Prompt, hint, and explanation must be clear and short. |
| Intermediate calibration | Level 3–5 problems should require reading, not just rule recall. |
| Tactical clarity | One clear tactical idea per problem. |
| No ambiguous correct moves | Unless deliberately scoped, only one reasonable answer. |
| Stable coordinates | Valid 0-indexed board coordinates within 9×9. |
| Valid initial state | No occupied intersections, no conflicting stones. |
| Category metadata accuracy | Problem matches its assigned category. |
| Level metadata accuracy | Problem difficulty matches its assigned level. |
| Coach compatibility | Wrong-answer coach can produce useful feedback for the position. |
| Engine compatibility | Engine-assisted review can run if available, but must not be required. |

## 4. Intermediate Learner Content Targets

### Recommended focus areas for levels 3–5

| Type | Examples |
|---|---|
| Capture race / liberty counting | Two-group race with 2–3 liberties each |
| Escape under pressure | Run out while being chased |
| Connect/cut reading, 2–3 move depth | Read whether a cut works or a connection can be prevented |
| Basic life/death shape recognition | Straight three, bent four, L-group, door group |
| Opening direction on 9×9 | Corner enclosure vs. extension, approach vs. pincer |
| Endgame sente/gote awareness | Simple boundary play with value judgment |
| Mixed review | Choose between two plausible moves (e.g., attack vs. defend) |

### Explicitly excluded

- Very basic single-stone capture (level 1).
- Pure rule explanation problems ("stones with no liberties are captured").
- Overly complex dan-level reading (10+ move depth).
- Problems requiring long text or abstract theory.
- Positions where multiple moves are equivalent unless marked as such.

## 5. Proposed v0.15 Content Slice Plan

| Slice | Focus | Estimated output |
|---|---|---|
| v0.15.0a | Content quality / intermediate problem expansion plan | This document |
| v0.15.0b | Content inventory / gap audit for level 3–5 problems | Category-by-level count matrix, gap analysis, target matrix for Pack A |
| v0.15.0c | Intermediate Problem Pack A | 12–16 new problems, levels 3–5, human-authored and reviewed |
| v0.15.0d | Content validation and regression for Pack A | Validation results, regression test updates, schema checks |
| v0.15.0e | v0.15 stabilization / release notes | Release notes, QA checklist |

**Rationale:** Leading with an audit avoids adding problems in categories that already have sufficient intermediate coverage. Pack A is deliberately modest (12–16) to keep the review burden manageable.

## 6. Content Inventory / Gap Audit Requirements (v0.15.0b)

The audit task should:

- Compute current category counts by level across the full library (77 + 10 = 87 problems).
- Identify level 3–5 gaps by category (which categories lack intermediate content).
- Identify duplicate or too-easy problems for level 3–5 learners.
- Identify missing multi-step coverage in intermediate tiers.
- Identify categories overrepresented by level 1–2 introductory material.
- Produce a target matrix specifying how many Pack A problems to add per category and level.

The audit must **not** add problems yet. It may use lightweight scripts or manual counting.

## 7. Intermediate Problem Pack A Requirements (v0.15.0c)

When Pack A is implemented, each problem should meet these requirements:

| Requirement | Details |
|---|---|
| Count | 12–16 new problems |
| Levels | 3–5 only, unless a clear bridge problem is justified |
| Category balance | Based on audit gap matrix |
| Multi-step | At least 3 multi-step or two-ply reading problems if schema supports them |
| Stable id | Unique, no collisions with existing 87 problems |
| Category | One of the 7 existing categories |
| Level | Integer 1–5 |
| Chinese prompt | 1–2 sentences, child-friendly |
| Answer | `{ x, y }` coordinate |
| Hints | 1–3 progressive hints |
| Explanation | 1–3 sentences, one key concept |
| Initial stones | Array of `{ x, y, color }`, valid for 9×9 |
| Validation notes | Optional notes for reviewer |

No runtime logic changes unless strictly necessary and separately scoped.

## 8. Human Review Checklist

Each problem in Pack A must pass this checklist:

- [ ] Board coordinates are valid 0-indexed within 9×9.
- [ ] No duplicate ID with existing problems.
- [ ] Answer is a legal move (intersection not occupied).
- [ ] Answer is unique enough for an authored solution (no widely equivalent alternatives).
- [ ] Chinese prompt is clear for a child (short, concrete).
- [ ] Hint helps without giving the answer away.
- [ ] Explanation focuses on one tactical concept.
- [ ] Category assignment is accurate.
- [ ] Level assignment is appropriate.
- [ ] No excessive text (prompt ≤ 80 chars, explanation ≤ 150 chars).
- [ ] Coach feedback (rule/template) remains compatible — attempted move can generate useful response.
- [ ] Optional engine check can be run locally but must not block human review.

## 9. Risk and Mitigation

| Risk | Mitigation |
|---|---|
| Difficulty drift too high | Level metadata cross-checked during review; cap at level 5. |
| Problems too introductory for level 3–5 | Audit filters out level 1–2 candidates; reviewers verify. |
| Ambiguous answers | Require unique answer unless explicitly marked as multi-answer. |
| Category imbalance | Audit-driven target matrix enforces balance. |
| Long Chinese text hurts child focus | Enforce character limits per checklist. |
| Overreliance on AI/engine for review | Human review is required; engine check is optional and supplemental. |
| JSON / schema errors | Schema validation included in v0.15.0d regression checks. |
| Daily practice selection regression | Selection logic tests must still pass after adding problems. |
| Content pack too large to review | Cap at 16 problems; separate Pack B if more are needed. |

## 10. Next Task Definition

### v0.15.0b — Content Inventory / Gap Audit for Level 3–5 Problems

**Goal:** Compute current category-by-level counts and identify gaps for intermediate problem expansion.

**Allowed scope:**
- Manual counting or lightweight scripts.
- A report added to `docs/` (e.g., `docs/CONTENT_INVENTORY_v0.15.md`).
- `docs/TASKS.md` update.

**Non-goals:**
- No new problem data in `src/data/problems.json`.
- No runtime logic changes.
- No UI changes.

**Acceptance criteria:**
- Category-by-level count matrix is complete for all 87 existing problems.
- Gap analysis identifies categories with insufficient level 3–5 coverage.
- Target matrix specifies counts for Pack A.
- `docs/TASKS.md` marks v0.15.0b delivered, queues v0.15.0c.

**Validation:** Docs-only rationale applies unless audit scripts are added; if scripts are added, `npm run lint` and `npm run typecheck` must pass.
