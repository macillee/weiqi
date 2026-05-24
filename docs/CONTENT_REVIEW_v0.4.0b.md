# Content Review — v0.4.0b

> Project: 小棋童围棋闯关
> Version: v0.4.0b
> Date: 2026-05-24

---

# 1. Problem Count

| Metric | Value |
|---|---:|
| Total problems | 51 |
| Previous count | 39 |
| New problems in this batch | 12 |

---

# 2. Category Breakdown

| Category | Single-step | Multi-step | Total |
|---|---:|---:|---:|
| capture | 14 | 3 | 17 |
| escape | 8 | 1 | 9 |
| connect_cut | 10 | 2 | 12 |
| life_death | 6 | 3 | 9 |
| opening | 4 | 0 | 4 |
| **Total** | **42** | **9** | **51** |

---

# 3. New Problem Detail

## CAP-014 (single-step capture, level 2)

- Target: Capture a white stone from atari on a center point
- Answer: (4,5)
- Hints: 3 progressive hints (general → specific)
- Validation: coordinate valid, answer empty, no zero-liberty initial group, no duplicate stones

## MULTI-004 (multi-step capture, level 2)

- Target: Two-step capture of a two-stone white group
- Step 1 answer: (4,4) — atari
- Step 2 answer: (4,5) — capture after white extends
- Validation: step order valid, per-step answers valid, board transitions deterministic

## MULTI-005 (multi-step capture, level 2)

- Target: Two-step ladder chase of white
- Step 1 answer: (4,5) — atari from side
- Step 2 answer: (5,7) — follow-up capture
- Validation: step order valid, per-step answers valid, board transitions deterministic

## LD-006 (single-step life_death, level 2)

- Target: Save a single black stone from atari on the edge
- Answer: (4,2) — extend toward center
- Hints: 3 progressive hints
- Validation: coordinate valid, answer empty, no zero-liberty initial group

## LD-007 (single-step life_death, level 3)

- Target: Save a three-stone black triangle group from atari
- Answer: (3,1) — extend right
- Hints: 3 progressive hints
- Validation: correct black group has exactly 1 liberty; answer extends to safety

## MULTI-006 (multi-step life_death, level 3)

- Target: Two-step escape from atari (extend out of danger)
- Step 1 answer: (3,4) — extend down
- Step 2 answer: (3,6) — extend again after white chases
- Validation: step order valid, per-step answers validated as empty points, board transitions deterministic

## MULTI-007 (multi-step life_death, level 3)

- Target: Two-step escape from atari (extend out of danger)
- Step 1 answer: (5,6) — extend down
- Step 2 answer: (5,8) — extend again after white chases
- Validation: step order valid, per-step answers validated as empty points, board transitions deterministic

## CC-011 (single-step connect_cut, level 2)

- Target: Cut between two white stones
- Answer: (3,3)
- Hints: 3 progressive hints
- Validation: coordinate valid, answer empty, no duplicate with existing problems

## MULTI-008 (multi-step connect_cut, level 2)

- Target: Two-step cut-and-atari sequence
- Step 1 answer: (3,5) — cut between white stones, both atari'd
- Step 2 answer: (4,6) — atari the other white group after one escapes
- Validation: step order valid, per-step answers validated as empty points, board transitions deterministic

## ESC-008 (single-step escape, level 2)

- Target: Escape a black stone from three-sided atari in center
- Answer: (4,5) — extend down
- Hints: 3 progressive hints
- Validation: coordinate valid, answer empty, no zero-liberty initial group

## MULTI-009 (multi-step escape, level 2)

- Target: Two-step escape from atari
- Step 1 answer: (4,5) — extend down
- Step 2 answer: (3,5) — dodge pursuit
- Validation: step order valid, per-step answers valid, board transitions deterministic

## OP-004 (single-step opening, level 1)

- Target: Occupy an empty corner
- Answer: (2,2), (6,2), or (6,6) — any empty corner
- Hints: 3 progressive hints about corner priority
- Validation: same pattern as OP-002 with white in different corner

---

# 4. ID Ranges Used

| Prefix | New IDs |
|---|---|
| CAP | CAP-014 |
| ESC | ESC-008 |
| CC | CC-011 |
| LD | LD-006, LD-007 |
| OP | OP-004 |
| MULTI | MULTI-004 through MULTI-009 |

---

# 5. Validation Status

| Check | Result |
|---|---|
| `validateAllProblems` | pass |
| No duplicate IDs | pass |
| All coordinates inside 9x9 board | pass |
| All answers are empty points | pass |
| No zero-liberty initial groups | pass |
| Multi-step step ordering | pass |
| Multi-step board transitions | pass |
| Multi-step per-step hint count ≥ 1 | pass |
| Multi-step step 2 answer not in addedStones | pass |
| All new problems manually Go-reviewed | pass |
| Existing 39 problems unchanged | pass |
| `npm run test` (241 tests) | pass |
| `npm run build` | pass |

---

# 6. Category Distribution Comparison

| Category | Before | After | Delta |
|---|---:|---:|---:|
| capture | 14 | 17 | +3 |
| escape | 7 | 9 | +2 |
| connect_cut | 10 | 12 | +2 |
| life_death | 5 | 9 | +4 |
| opening | 3 | 4 | +1 |
| **Total** | **39** | **51** | **+12** |

---

# 7. Known Content Limitations

- Multi-step problems limited to 2-step sequences (schema supports more, not product-tested).
- No multi-step opening problems (opening multi-step content deferred to future slice).
- No endgame category problems.
- life_death and opening remain the smallest categories at 9 and 4 problems respectively.

---

# 8. Conclusion

- [x] Approved for v0.4.0b
- [ ] Not approved — see notes
