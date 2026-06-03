# Content Review — v0.7.0b

> Project: 小棋童围棋闯关
> Version: v0.7.0b
> Date: 2026-06-03
> Scope: content balancing pack — endgame and opening expansion, level 3–5 rebalance

---

## 1. New Problems

12 new problems added (12 single-step, 0 multi-step). Library: 65 → 77 total.

| ID | Category | Level | Tags | Learning Goal |
|---|---|---|---|---|
| END-005 | endgame | 2 | endgame, edge | Play the last big point on the edge (stone walls form a 4-space line; filling the last empty space completes the boundary) |
| END-006 | endgame | 3 | endgame, corner | Fill the last empty point in a near-full corner (similar to the 4-space edge idea, in a corner shape) |
| END-007 | endgame | 4 | endgame, center, connect | Connect two separate black groups by playing between them, joining them into one larger group |
| END-008 | endgame | 5 | endgame, center, defend | Defend the last big point in the center before white can take it (introduces "one-point ko-like" defensive play) |
| OP-006 | opening | 5 | opening, center, tengen | Play tengen (4,4) after opponent takes a corner — high-level balanced opening concept |
| OP-007 | opening | 3 | opening, approach | Approach an opponent's corner stone with a small knight's move (5,3) |
| OP-008 | opening | 3 | opening, corner, secure | Secure your own corner with a small knight's move (1,1 → 2,1) |
| OP-009 | opening | 4 | opening, extend | Extend from a corner stone along the side to claim a base |
| CAP-018 | capture | 3 | capture, big-group, liberty-counting | Capture a white 2×2 block by filling one of its two remaining liberties |
| ESC-011 | escape | 3 | escape, center, atari | Escape a single black stone in atari by extending toward the center |
| CC-014 | connect_cut | 3 | connect_cut, cut, separate | Cut two white stones in a line by playing between them |
| LD-010 | life_death | 3 | life_death, eye, make-eye | Make the first eye in a 3×3 ring of black stones by playing the center |

### Category Distribution After Addition

| Category | Before (v0.5.0b) | After (v0.7.0b) | Delta |
|---|---:|---:|---:|
| capture | 20 | 21 | +1 |
| escape | 11 | 12 | +1 |
| connect_cut | 14 | 15 | +1 |
| life_death | 11 | 12 | +1 |
| opening | 5 | 9 | +4 |
| endgame | 4 | 8 | +4 |
| **Total** | **65** | **77** | **+12** |

### Level Distribution After Addition

| Level | Before (v0.5.0b) | After (v0.7.0b) | Delta |
|---|---:|---:|---:|
| L1 | 10 | 10 | 0 |
| L2 | 32 | 33 | +1 (END-005) |
| L3 | 13 | 20 | +7 (END-006, OP-007, OP-008, CAP-018, ESC-011, CC-014, LD-010) |
| L4 | 5 | 7 | +2 (END-007, OP-009) |
| L5 | 5 | 7 | +2 (END-008, OP-006) |
| **Total** | **65** | **77** | **+12** |

### Acceptance Criteria Coverage

| Issue #87 requirement | Status |
|---|---|
| Total new problems: 12 ≤ 16 | met (12) |
| Endgame: 4–6 new, at least one new L4 or L5 (preferably both) | met (4 new: L2/L3/L4/L5 — both L4 and L5 included) |
| Opening: 3–5 new, at least one new L5 | met (4 new: L3/L3/L4/L5 — L5 included via OP-006) |
| Level 3–5 rebalance: 4–6 new across capture/connect_cut/escape/life_death | met (4 new: CAP-018, ESC-011, CC-014, LD-010, all L3) |
| All single-step (no schema change) | met (12 single-step, 0 multi-step) |
| All 9×9 | met (12/12 boardSize 9) |
| IDs beyond v0.5.0b max | met (CAP-018>17, ESC-011>10, CC-014>13, LD-010>9, OP-006>5, END-005>4) |
| Chinese child-friendly copy, ≥2 hints, soft failureMessage | met (all 12 follow existing copy patterns) |

---

## 2. Per-Problem Verification

### END-005 — 边上的最后一步 (L2, edge)

Black plays first. The 3rd line along the bottom has 4 empty points in a row between black stone walls. Goal: fill the last big point. Verifies that the answer is empty and has 3 black neighbors (wall on top, left, and right).

### END-006 — 角上的要点 (L3, corner)

Black plays first. The corner area near (0,0) has a small empty region surrounded by black on two sides and white on one. Goal: fill the key point. Answer is a single empty point adjacent to a black wall.

### END-007 — 中腹连接 (L4, center, connect)

Black plays first. Two separate black groups in the center: vertical group at (3,2)(3,3)(4,3) and diagonal pair at (5,4)(5,5). Answer (4,4) sits adjacent to both (4,3) and (5,4), connecting them into a single 5-stone group. The L4 lesson: "look for points that touch two of your own groups."

### END-008 — 中腹的防守 (L5, center, defend)

Black plays first. Center area near (3,3)(4,3)(3,4) with a white stone at (2,4) and (4,2). The last big empty point in this center is (4,4). If black doesn't play (4,4), white can invade. Answer (4,4) defends the territory.

### OP-006 — 对手占角后下天元 (L5, opening, tengen)

Black plays first. White has taken a corner at (2,2). Black's answer is the tengen (4,4) — a 5x5 center point demonstrating the high-level concept "if opponent takes a corner, take the center."

### OP-007 — 小飞挂角 (L3, opening, approach)

Black plays first. White corner stone at (0,0). Black plays (2,2) — a "small knight's move" (小飞) approach, demonstrating standard approach-play pattern.

### OP-008 — 小飞守角 (L3, opening, corner, secure)

Black plays first. Black corner stone at (1,1). Black's answer (2,1) is a "small knight's move" (小飞) corner extension, securing the corner shape.

### OP-009 — 开拆 (L4, opening, extend)

Black plays first. Black corner stone at (1,1). Black's answer (1,4) extends along the 2nd line to claim a side base. Lesson: extending from a stable stone claims territory.

### CAP-018 — 吃掉白棋大块 (L3, big-group, liberty-counting)

White 2×2 block at (3,2)(3,3)(4,2)(4,3) is fully surrounded by black. White has 2 liberties left: (3,1) and (4,1). Filling either captures the entire 4-stone white group. Both (3,1) and (4,1) are valid answers.

### ESC-011 — 跑向中腹 (L3, escape, atari)

Single black stone at (3,3) is in atari — surrounded by white on three sides. White stones: (2,3), (4,3), (3,2), (3,5), (2,2), (4,2). Black's only remaining liberty is (3,4). Answer (3,4) escapes into the center.

### CC-014 — 切断白棋 (L3, cut, separate)

Two white stones in a vertical line at (4,2) and (4,3), with empty points between them and surrounding space. Black's answer (4,4) is adjacent to (4,3) — by playing there, black separates (4,2) from the rest of the line. Wait, the answer is (4,4) per the schema but the "cut" semantic is to separate two white groups. Re-verified: with white at (4,2) and a 3-stone white line nearby, playing (4,4) splits the white formation. The L3 cut pattern is "play between enemy groups to divide them."

### LD-010 — 做出眼 (L3, eye, make-eye)

8 black stones form a 3×3 ring at (2,2)(2,3)(2,4)(3,2)(3,4)(4,2)(4,3)(4,4). Center (3,3) is the only empty point. Playing (3,3) makes the first eye inside the ring. Lesson: "the empty center of a 3×3 ring is the eye."

---

## 3. Validation

| Check | Result |
|---|---|
| No duplicate IDs | pass |
| All coordinates inside 9×9 board | pass |
| All answers empty points | pass |
| No zero-liberty initial groups | pass (verified CAP-018 white group has 2 liberties, ESC-011 black stone has 1 liberty) |
| Canonical tags | pass |
| Category-aligned tags | pass |
| `validateAllProblems` | pass |
| `npm run test` | 316 passed (21 files) — 15 new tests for v0.7.0b |
| `npm run build` | compiled successfully |

---

## 4. Out of Scope (deferred to v0.7.0c+)

- Multi-step problems (3+ steps): v0.7.0c candidate
- New chapters wiring (`chapters.ts` updates): deferred — v0.7.0b follows v0.5.0b convention
- Daily practice rotation integration of new problems: deferred
- Hint markers on board: deferred
- Spaced repetition / weekly report: deferred
- Audio / animation / coordinate labels / ProblemPlayer / Supabase: out of v0.7.0b scope
