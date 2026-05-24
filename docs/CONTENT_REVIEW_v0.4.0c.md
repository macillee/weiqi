# Content Review — v0.4.0c Validation and Regression

> Project: 小棋童围棋闯关
> Version: v0.4.0c
> Date: 2026-05-24

---

## 1. Scope

This review performs content validation and regression checks on the v0.4.0b problem pack (51 problems). No new problems were added.

---

## 2. Validation Checks

| Check | Result |
|---|---|
| No duplicate IDs | pass |
| All coordinates inside 9x9 board | pass |
| All answers are empty points on the relevant board state | pass |
| No zero-liberty initial groups | pass |
| Multi-step step ordering (sequential from 1) | pass |
| Each multi-step step has ≥1 answer and ≥1 hint | pass |
| Multi-step `addedStones` do not overlap existing stones | pass |
| Multi-step `removedStones` reference stones that exist | pass |
| Multi-step step answers are empty/playable after prior transitions | pass |
| No new v0.4.0b ID reuses an old non-MULTI ID prefix | pass |
| All 12 expected v0.4.0b IDs exist in the dataset | pass |
| `validateAllProblems` passes (zero errors) | pass |
| `failureMessage` length reasonable (7–17 chars, mean 12.2) | pass |

---

## 3. Bugs Found and Fixed

No bugs were found. All 51 problems pass `validateAllProblems`.

---

## 4. Problem Count and Category Distribution

| Category | Single-step | Multi-step | Total |
|---|---:|---:|---:|
| capture | 14 | 3 | 17 |
| escape | 8 | 1 | 9 |
| connect_cut | 10 | 2 | 12 |
| life_death | 6 | 3 | 9 |
| opening | 4 | 0 | 4 |
| **Total** | **42** | **9** | **51** |

### ID Ranges

| Prefix | IDs |
|---|---|
| CAP | CAP-001 through CAP-014 |
| ESC | ESC-001 through ESC-008 |
| CC | CC-001 through CC-009, CC-011 (CC-010 intentionally skipped) |
| LD | LD-001 through LD-004, LD-006, LD-007 (LD-005 intentionally skipped) |
| OP | OP-001 through OP-004 |
| MULTI | MULTI-001 through MULTI-009 |

---

## 5. Test Results

| Check | Result |
|---|---|
| `npm run test` (vitest) | 244 passed (17 files) |
| `npm run build` (next build) | compiled successfully |

---

## 6. Tests Strengthened

The following tests were added to `src/__tests__/problems.test.ts`:

- **`all problems pass validateAllProblems`** — explicitly verifies `validateAllProblems` returns `{valid: true}` for the full 51-problem dataset
- **`v0.4.0b added problem IDs exist`** — checks all 12 expected new IDs (6 single-step + 6 multi-step) are present
- **`v0.4.0b single-step IDs use numbers beyond old ranges (no accidental reuse)`** — verifies each new single-step ID has a number > the old max for its prefix, preventing accidental reuse of an existing ID

---

## 7. Known Content Limitations

- Multi-step problems limited to 2-step sequences (schema supports more, not product-tested).
- No multi-step opening problems.
- No endgame category problems.
- opening is the smallest category at 4 problems.

---

## 8. Conclusion

- [x] Validated — v0.4.0c content validation and regression checks complete
- [ ] Not approved — see notes
