# v0.15 Content Inventory and Gap Audit — Level 3–5 Problems

## 1. Audit Scope and Method

- **Source file:** `src/data/problems.json`
- **Method:** Read-only Node.js script auditing all 87 problems; counts verified manually.
- **Script committed:** No. The one-liner used for this audit is documented in method notes but not committed.
- **Total problems found:** 87 (matches expected count from v0.8 + v0.12.0e).
- **Data modified:** None.

## 2. Category-by-Level Matrix

| Category | L1 | L2 | L3 | L4 | L5 | Total | L3–5 total |
|---|---:|---:|---:|---:|---:|---:|---:|
| capture | 4 | 12 | 2 | 2 | 3 | 23 | 7 |
| escape | 1 | 6 | 3 | 1 | 2 | 13 | 6 |
| connect_cut | 2 | 7 | 5 | 2 | 1 | 17 | 8 |
| life_death | 0 | 3 | 8 | 2 | 1 | 14 | 11 |
| opening | 2 | 2 | 2 | 3 | 1 | 10 | 6 |
| endgame | 1 | 3 | 3 | 2 | 1 | 10 | 6 |
| mixed | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **10** | **33** | **23** | **12** | **9** | **87** | **44** |

### Observations

- **Level 2 is heavily overrepresented** (33 problems, 38%). This suggests many problems that could be level 3 may be under-ranked, or the library is skewed toward introductory-intermediate transition.
- **Life_death** is the only category with strong level 3+ coverage (11/14 problems are L3–5). This makes sense for a one-year learner.
- **Mixed has zero problems** — there is no cross-category review content.
- **Level 4–5 coverage is thin** across all categories (only 21 problems total), especially in capture (5), escape (3), opening (4), and endgame (3).

## 3. Intermediate Coverage Analysis

### Strong coverage (L3–5 ≥ 8)

| Category | L3–5 count | Assessment |
|---|---|---|
| life_death | 11 | Strong; covers 8 L3 problems. Room for a few more L4–5. |
| connect_cut | 8 | Adequate; 5 at L3, but only 1 at L5. |

### Moderate coverage (L3–5 6–7)

| Category | L3–5 count | Assessment |
|---|---|---|
| capture | 7 | Moderate, but heavily L1–2 skewed (16 of 23). Needs more L4–5. |
| escape | 6 | Moderate; could use more variety at L4–5. |
| opening | 6 | Moderate for 9×9 opening topics. Thin at L4–5 (only 4 total). |
| endgame | 6 | Moderate; primary gap is limited variety at L4–5. |

### Weak or missing coverage

| Category | L3–5 count | Assessment |
|---|---|---|
| mixed | 0 | Entirely missing. No cross-category review problems exist. |

### Summary

The library has sufficient L3 problems for most categories but is thin at L4–5 overall. Mixed is a complete gap. Life_death is the best-covered intermediate category; capture has the most introductory skew.

## 4. Multi-Step and Reading-Depth Audit

**Current multi-step problems:** 9 total (IDs MULTI-001 through MULTI-009).

| ID | Level | Category | Steps |
|---|---|---|---|
| MULTI-001 | 2 | capture | 2 |
| MULTI-003 | 2 | connect_cut | 2 |
| MULTI-004 | 2 | capture | 2 |
| MULTI-005 | 2 | capture | 2 |
| MULTI-008 | 2 | connect_cut | 2 |
| MULTI-009 | 2 | escape | 2 |
| MULTI-002 | 3 | life_death | 2 |
| MULTI-006 | 3 | life_death | 2 |
| MULTI-007 | 3 | life_death | 2 |

**Finding:** 6 of 9 multi-step problems are level 2 (introductory). Only 3 are level 3, all in life_death. No multi-step problems exist in opening, endgame, or mixed categories. No problems exceed 2 steps.

**Recommendation:** Pack A should add multi-step problems in underrepresented categories (connect_cut, escape) and at higher levels (4–5). Consider 3-step problems if the schema supports it.

## 5. Potential Review Candidates

The following are flagged for human review — none are automatically targeted for removal.

### L3–5 with concise explanations (< 20 Chinese characters)

These explanations are short but grammatically complete Chinese sentences. They may be adequate or may benefit from slight expansion:

| ID | Level | Category | Explanation length |
|---|---|---|---|
| MULTI-002 | 3 | life_death | 10 chars |
| LD-003 | 3 | life_death | 16 chars |
| CC-012 | 4 | connect_cut | 16 chars |
| LD-006 | 3 | life_death | 17 chars |
| LD-008 | 4 | life_death | 18 chars |
| CC-005 | 3 | connect_cut | 18 chars |
| CC-006 | 3 | connect_cut | 18 chars |
| CC-013 | 5 | connect_cut | 19 chars |
| CAP-016 | 5 | capture | 19 chars |
| ESC-010 | 5 | escape | 19 chars |

### Categories overrepresented by L1–2 material

- **Capture:** 16 of 23 problems (70%) are level 1–2, mostly single-stone atari.
- **Escape:** 7 of 13 problems (54%) are level 1–2.
- **Connect_cut:** 9 of 17 problems (53%) are level 1–2.

### Multi-step L2 saturation

6 of 9 multi-step problems are level 2. Intermediate multi-step content is almost entirely absent outside life_death.

## 6. Pack A Target Matrix

**Total target:** 14 new problems (within the 12–16 range).

| Category | L3 | L4 | L5 | Multi-step target | Rationale |
|---|---:|---:|---:|---:|---|
| capture | 0 | 1 | 1 | 1 | L4–5 thin; add race reading at higher levels |
| escape | 0 | 1 | 1 | 0 | Thin at L4–5; add escape under pressure |
| connect_cut | 0 | 1 | 1 | 1 | Only 1 L5; add deeper cut/connect reading |
| life_death | 0 | 1 | 0 | 0 | Already strong; just 1 more L4 shape |
| opening | 1 | 1 | 0 | 0 | Add L3 direction choice + L4 corner approach |
| endgame | 1 | 1 | 0 | 0 | Add L3+L4 sente/gote boundary awareness |
| mixed | 1 | 1 | 1 | 1 | Entirely missing; add 3 mixed review problems |
| **Total** | **3** | **7** | **4** | **3** | Balanced across categories |

### Summary

- **11 single-step + 3 multi-step = 14 total**. The 3 multi-step problems are included within the 14-problem Pack A target.
- **3 multi-step targets:** 1 capture race reading, 1 connect_cut deep reading, 1 mixed cross-category review.
- **Emphasis on L4–5** where gaps are widest.
- **Mixed category seeded** with 3 problems (L3, L4, L5) — critical for reviewing multiple skills.

## 7. Recommended v0.15.0c Scope

### v0.15.0c — Intermediate Problem Pack A

**Target:** 14 new problems
**Levels:** 3–5 (L3: 3, L4: 7, L5: 4)
**Categories:** All 7 categories, with mixed seeded for the first time
**Multi-step:** At least 3 problems with ≥ 2 steps
**Required metadata:** id, boardSize, category, level, tags, toPlay, title, description, initialStones, answers, hints, explanation, successMessage, failureMessage
**Human review:** All problems pass the 12-item checklist from `docs/CONTENT_QUALITY_PLAN_v0.15.md`
**Validation:** `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all pass
**Non-goals:** No runtime logic changes, no new categories, no schema changes, no UI

## 8. Risks and Review Notes

- **Count-based audit cannot assess tactical quality.** A problem may be correctly categorized and leveled but still be poorly designed. Human review is essential.
- **Level metadata may be inaccurate.** Some L2 problems might belong at L3, and vice versa. The audit reports counts as-is.
- **Multi-step metadata reflects step count, not reading depth.** A 2-step problem may be trivial or deep depending on the position.
- **Difficulty drift.** Pack A's L4–5 emphasis could produce problems too hard for a one-year learner. Authors should calibrate conservatively.
- **Review burden.** 14 problems with full metadata + human review is feasible for a single PR but should not grow beyond this without justification.
- **Mixed category is new territory.** There is no authored mixed problem to reference. First mixed problems should follow the simplest template (two plausible moves, one correct).
