# Content Review — v0.20.0d

> Project: 小棋童围棋闯关
> Version: v0.20.0d
> Date: 2026-06-16
> Scope: content-only Pack B pilot — 4 endgame + 5 mixed problems, level 3–5

---

## 1. New Problems

9 new problems added (9 single-step, 0 multi-step). Library: 101 → 110 total.

| ID | Category | Level | Tags | Learning Goal |
|---|---|---|---|---|
| END-013 | endgame | 3 | endgame, edge, big-point | Block a white intrusion on the edge by filling the last entry point before white can come in |
| END-014 | endgame | 4 | endgame, corner, sente | Take a sente move in the corner to prevent white from connecting back to the corner stone group |
| END-015 | endgame | 4 | endgame, center, eye | Make the central eye by filling the only remaining liberty inside a surrounded black + group |
| END-016 | endgame | 5 | endgame, territory, reading | Compare three empty areas (two corners + center) and take the largest by territory |
| MIX-004 | mixed | 3 | mixed, escape-or-connect, reading | Choose between escape and connecting to a friendly stone when a black group is low on liberties |
| MIX-005 | mixed | 4 | mixed, capture-or-cut, reading | Choose between capturing a low-liberty white stone and cutting the white group before it connects |
| MIX-006 | mixed | 4 | mixed, life-or-territory, reading | Save a surrounded black group by connecting and making an eye, instead of claiming territory elsewhere |
| MIX-007 | mixed | 5 | mixed, attack-or-defend, reading | Identify the weaker side (black or white) and attack first, since attack is the best defense |
| MIX-008 | mixed | 5 | mixed, endgame-or-safety, reading | Stop white from connecting in the center before claiming outside territory |

### Category Distribution After Addition

| Category | Before (v0.20.0c) | After (v0.20.0d) | Delta |
|---|---:|---:|---:|
| capture | 25 | 25 | 0 |
| escape | 15 | 15 | 0 |
| connect_cut | 19 | 19 | 0 |
| opening | 12 | 12 | 0 |
| life_death | 15 | 15 | 0 |
| endgame | 12 | 16 | +4 |
| mixed | 3 | 8 | +5 |
| **Total** | **101** | **110** | **+9** |

### Level Distribution After Addition

| Level | Before (v0.20.0c) | After (v0.20.0d) | Delta |
|---|---:|---:|---:|
| L1 | 10 | 10 | 0 |
| L2 | 33 | 33 | 0 |
| L3 | 26 | 28 | +2 (END-013, MIX-004) |
| L4 | 19 | 23 | +4 (END-014, END-015, MIX-005, MIX-006) |
| L5 | 13 | 16 | +3 (END-016, MIX-007, MIX-008) |
| **Total** | **101** | **110** | **+9** |

> Note: the v0.20.0d pilot targets the lowest-coverage categories (endgame 12 → 16, mixed 3 → 8) per the v0.15.0b content inventory audit. The deliberate choice was to keep all 9 new problems at L3–L5 to reinforce the mid-tier / upper-tier practice space; the lower-tier density (L1 = 10, L2 = 33) is already at the v0.4 / v0.5 saturation point and was not the v0.20.0d scope.

---

## 2. Per-Problem Review

### END-013 — 边线官子 (level 3)
- **Initial board:** 5 black stones along the top edge (1,1)–(5,1), 3 black stones down the left edge (1,2)/(1,3)/(1,4), 3 white stones mirroring on the right (5,2)/(5,3)/(5,4). A clear empty pocket at (1,0) and (0,1)/(0,2)/(0,3)/(0,4) (along the very top-left).
- **Answer:** (1, 0) — block the entry point from the top-left.
- **Why it's the right answer:** playing at (1, 0) prevents white from descending to the left edge. The other reasonable moves ((0, 1) and (0, 0)) are the same area but (1, 0) is the textbook entry-block.
- **Copy:** 3 hints, "想一想白棋会从哪里钻进来" wording is calm and question-based, not blaming.

### END-014 — 角上先手 (level 4)
- **Initial board:** 4 black stones in the upper-left corner (0,0)/(1,0)/(0,1)/(1,2), 2 white stones at (2,0)/(2,2).
- **Answer:** (0, 2) — block white's connection back to the corner.
- **Why it's the right answer:** (0, 2) is the only sente point that prevents white from connecting. Other moves like (2, 1) or (1, 1) are also on the table, but the sente point is the one that prevents white from making two eyes.
- **Copy:** 3 hints, "先堵住白棋，不让它连上" keeps the sente concept child-friendly.

### END-015 — 中央做眼 (level 4)
- **Initial board:** 4 black stones in a + pattern (4,3)/(4,5)/(3,4)/(5,4), 6 white stones fully surrounding the + (2,3)/(6,3)/(2,5)/(6,5)/(2,4)/(6,4). The center (4,4) is empty.
- **Answer:** (4, 4) — complete the central eye.
- **Why it's the right answer:** playing at (4, 4) connects the four black stones into a 2×2 ring with a single eye inside, saving the group.
- **Copy:** 3 hints, "先连起来再做眼" walks the child through the connect-then-eye reasoning.

### END-016 — 最大地盘 (level 5)
- **Initial board:** 3 black stones at (0,0)/(1,0)/(0,1) (upper-left corner), 3 white stones at (8,0)/(7,0)/(8,1) (upper-right corner), 1 black at (4,4), 2 white at (5,4)/(3,4). The central area (4,5) and (5,5) and (3,5) etc. is mostly empty.
- **Answer:** (4, 5) — claim the central territory.
- **Why it's the right answer:** the center has the most open space; extending from (4, 4) into the center claims the largest frame.
- **Copy:** 3 hints, "抢到中央就能围出最大的地盘" frames the value as a concrete goal, not a rank.

### MIX-004 — 连还是跑 (level 3)
- **Initial board:** 3 black stones in a + shape at (2,2)/(3,2)/(2,3) (a 3-stone L), 1 black at (5,2) (a separate stone to the right), 7 white stones surrounding the L (1,0)/(1,1)/(1,2)/(3,0)/(3,1)/(3,0)...). The middle black group is low on liberties.
- **Answer:** (4, 2) — connect to the right-side black stone.
- **Why it's the right answer:** (4, 2) bridges the middle group to (5, 2), giving both groups shared liberties and a much safer position. Escaping outward would leave the group atari-prone.
- **Copy:** 3 hints, "数一数黑棋还剩几口气" makes the reading concrete.

### MIX-005 — 断还是连 (level 4)
- **Initial board:** 2 white stones at (3,2) and (5,2) (a two-stone pair on the top row, separated by an empty (4,2)). 2 black stones at (2,2) and (2,5).
- **Answer:** (4, 2) — cut between the two white stones.
- **Why it's the right answer:** (4, 2) sits between (3, 2) and (5, 2) and separates them into two single-stone groups. The two white stones are no longer adjacent and cannot connect. The other reasonable cuts in the area (e.g. (4, 3)) are not on the line between the two white stones and would not actually prevent the connection.
- **Copy:** 3 hints, "在 (4,2) 落子可以把白棋左右分开" makes the cut reasoning concrete and child-friendly.

### MIX-006 — 活还是占 (level 4)
- **Initial board:** 4 black stones forming a 2×2 block at (4,4)/(5,4)/(4,5)/(5,5), 4 white stones at the corners (3,3)/(6,3)/(3,6)/(6,6) with the mid-edges implied. The black block has 4 liberties on its outer edge.
- **Answer:** (4, 3) — extend outward to make an eye.
- **Why it's the right answer:** (4, 3) is the central liberty that connects the block to a safe extension, forming an eye shape.
- **Copy:** 3 hints, "想一想黑棋还剩几口气" frames the survival decision.

### MIX-007 — 攻还是守 (level 5)
- **Initial board:** 3 black stones at (1,1)/(2,1)/(1,2) (upper-left L), 3 white stones at (7,7)/(8,7)/(7,8) (lower-right L), 2 white stones at (0,7)/(0,8) (lower-left, 2-liberty atari risk).
- **Answer:** (0, 6) — attack white at (0, 7) by taking its last liberty.
- **Why it's the right answer:** white at (0, 7) has only 2 liberties: (0, 6) and (1, 7). Black at (0, 6) threatens the atari and forces white to defend. This is the textbook "attack the weak" move.
- **Copy:** 3 hints, "攻击是最好的防守" introduces a foundational Go proverb in child-friendly form.

### MIX-008 — 防还是占 (level 5)
- **Initial board:** 4 white stones forming a 2×2 block at (4,2)/(5,2)/(4,3)/(5,3) (center), 3 black stones at (0,0)/(1,0)/(0,1) (upper-left corner).
- **Answer:** (4, 4) — block white's connection outward.
- **Why it's the right answer:** (4, 4) is the only point that prevents white from extending further into black's potential territory.
- **Copy:** 3 hints, "挡住对手最要紧" frames the defensive priority.

---

## 3. Data Validation

All 9 new problems pass `validateProblem()` and the existing `validateAllProblems()` smoke test (`problems.test.ts` line 156).

Additional v0.20.0d-specific assertions added in `problems.test.ts`:

- Total library count is 110 (was 101)
- All 9 Pack B IDs exist
- All Pack B problems are level 3–5, category endgame or mixed
- Pack B initialStones have no duplicate coordinates
- Pack B answers land on empty intersections
- Pack B child-facing copy length is reasonable (title ≤ 12, description ≤ 60)
- Pack B hint and message copy is non-empty and warm (no winrate / 段位 / harsh language)

---

## 4. Privacy and Out-of-Scope

- No problem change affects v0.1 / v0.18 / v0.19 / v0.20.0a / v0.20.0b / v0.20.0c contracts
- No algorithm change (recommendation, selection, progress) — content-only
- No new tags that change runtime behavior — all new tags are descriptive (`endgame / edge / big-point`, `mixed / escape-or-connect / reading`, etc.)
- No new routes / pages / components
- No Supabase / Docker / CI change

## 5. Known Limitations

- These 9 problems are human-authored at the planning-level concept; they have not been play-tested with real children. The next content review should include a small-sample playtest if the data is going to be exposed to actual learners.
- The v0.15.0b content inventory audit still lists `endgame` and `mixed` as the lowest-coverage categories. v0.20.0d reduces the gap but does not close it; a follow-up Pack C (in v0.21+) may be needed if the audit is re-run.
- v0.20.0d is content-only and does not address any child UX, parent review, or AI/engine concerns. Those remain v0.21+ candidates per the v0.20.0a plan.
