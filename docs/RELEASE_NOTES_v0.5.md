# v0.5 — Content Expansion Series

> Project: 小棋童围棋闯关
> Release: v0.5
> Date: 2026-05-25

---

## What's New

v0.5 expands the problem library from 51 to 65 problems, adds the endgame category, and
fills gaps at difficulty levels 4 and 5 across existing categories.

### v0.5.0a — Next Phase Plan

- Evaluated 4 candidate directions (content expansion, UX polish, multi-step depth, infrastructure)
- Selected content expansion to ~60+ problems as the primary direction
- Defined 3 implementation slices: v0.5.0b (content), v0.5.0c (validation), v0.5.0d (stabilization)

### v0.5.0b — Levels 4–5 + Endgame Content Pack

- Added 14 new single-step problems (51 → 65 total)
- **Capture (3)**: CAP-015 (level 4), CAP-016 (level 5), CAP-017 (level 5)
- **Escape (2)**: ESC-009 (level 4), ESC-010 (level 5)
- **Connect/Cut (2)**: CC-012 (level 4), CC-013 (level 5)
- **Life & Death (2)**: LD-008 (level 4), LD-009 (level 5)
- **Opening (1)**: OP-005 (level 4)
- **Endgame (4)**: END-001 (level 1), END-002 (level 2), END-003 (level 3), END-004 (level 2)
- Review-time fixes applied to CAP-015, CAP-017, and ESC-009

### v0.5.0c — Content Validation and Regression

- Added 8 validation tests (250 → 258 total) covering:
  - All 14 v0.5.0b IDs exist; no ID ranges reused
  - Levels 4–5 present; endgame level range 1–3
  - CAP-015/CAP-017 capture correctness verified
  - ESC-009 liberty and answer-point checks
- No content bugs found in v0.5.0b problems

---

## Final Content Inventory

### By Category

| Category | Count |
|---|---|
| capture | 20 |
| connect_cut | 14 |
| escape | 11 |
| life_death | 11 |
| opening | 5 |
| endgame | 4 |
| **Total** | **65** |

### By Type

| Type | Count |
|---|---|
| Single-step | 56 |
| Multi-step | 9 |

### By Level

| Level | Problems |
|---:|---:|
| 1 | 10 |
| 2 | 32 |
| 3 | 13 |
| 4 | 5 |
| 5 | 5 |

---

## Known Limitations

- **Endgame**: only 4 problems, levels 1–3; no level 4–5 endgame content
- **Opening**: 5 problems, no level 5 content
- **Level distribution**: level 2 dominates (32/65), levels 4–5 are thin
- **Multi-step**: 9 problems total, all 2-step; no 3+ step problems
- **Board size**: 9×9 only

---

## Manual QA Checklist

| # | Check | Expected |
|---|---|---|
| 1 | App loads in local anonymous mode | No login required; no Supabase env needed |
| 2 | Problem list / category navigation | 65 problems listed; category filter works |
| 3 | Level 4 problems reachable | e.g. CAP-015, CAP-016, ESC-009 load correctly |
| 4 | Level 5 problems reachable | e.g. CAP-017, ESC-010, LD-009 load correctly |
| 5 | Endgame problems reachable | END-001 through END-004 render with correct board |
| 6 | Single-step play | Tap a point → correctness feedback shown |
| 7 | Multi-step play | Existing MULTI-001~009: steps advance correctly |
| 8 | Hints display | Each hint shows the correct coordinate |
| 9 | Wrong-answer tracking | Wrong taps recorded and shown in session |
| 10 | Spaced review | Scheduling prompt appears after session |
| 11 | Weekly report | Report renders correctly after content expansion |
| 12 | `npm run test` | 258 passed, 0 failed |
| 13 | `npm run build` | Compiled successfully, no type errors |
| 14 | `docker compose up --build` | App runs and is reachable on localhost |

---

## Test Results

| Check | Result |
|---|---|
| `npm run test` | 258 passed (17 files) |
| `npm run build` | Compiled successfully |
