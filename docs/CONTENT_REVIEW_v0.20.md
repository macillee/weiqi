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
| END-014 | endgame | 4 | endgame, corner, sente | Take a sente move in the corner to prevent white from connecting through the corner extension |
| END-015 | endgame | 4 | endgame, center, connect | Connect a 4-stone black + shape by filling the center to make a single 5-stone group |
| END-016 | endgame | 5 | endgame, territory, reading | Compare three empty areas (two corners + center) and take the largest by territory |
| MIX-004 | mixed | 3 | mixed, escape-or-connect, reading | Connect a surrounded middle pair to a friendly right-side stone via (5, 3) rather than escape outward |
| MIX-005 | mixed | 4 | mixed, cut, reading | Cut between two single white stones on the top row at (4, 2) to prevent connection |
| MIX-006 | mixed | 4 | mixed, life-or-territory, reading | Extend outward from a 2×2 black block to gain a safe extension, choosing life over territory |
| MIX-007 | mixed | 5 | mixed, attack-or-defend, reading | Attack the weaker side — black (0, 6) takes white's last column liberty, forcing white to defend |
| MIX-008 | mixed | 5 | mixed, endgame-or-safety, reading | Block white's connection between (4, 3) and (4, 5) by playing (4, 4), choosing safety over outside territory |

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
- **Initial board:** 5 black stones along the top edge (1,1)/(2,1)/(3,1)/(4,1)/(5,1), 3 black stones down the left edge (1,2)/(1,3)/(1,4), 3 white stones mirroring on the right (5,2)/(5,3)/(5,4). The empty pocket at (1,0) and along the top row (0,1)/(0,2)/(0,3)/(0,4) is white's only intrusion path.
- **Answer:** (1, 0) — block the entry point from the top-left.
- **Why it's the right answer:** playing at (1, 0) blocks white's only descent route to the left edge. Other top-row moves ((2, 0) / (3, 0) / (4, 0)) are away from the intrusion path.
- **Copy:** 3 hints, "想一想白棋会从哪里钻进来" wording is calm and question-based, not blaming.

### END-014 — 角上先手 (level 4)
- **Initial board:** 3 black stones in the upper-left corner (0,0)/(1,0)/(0,1) plus 1 black at (1,2) (the corner-extension stone), 2 white stones at (2,0) and (2,2).
- **Answer:** (0, 2) — block white's connection back to the corner.
- **Why it's the right answer:** (0, 2) is the sente point that prevents white from connecting (2, 0) — (2, 2) through the corner. Other reasonable moves like (1, 1) are also on the table, but (0, 2) is the textbook sente block.
- **Copy:** 3 hints, "先堵住白棋，不让它连上" keeps the sente concept child-friendly.

### END-015 — 中央连棋 (level 4)
- **Initial board:** 4 black stones in a + pattern at (4,3)/(4,5)/(3,4)/(5,4) — the 4 cross arms are NOT connected to each other (each is a single-stone group). 6 white stones at the outer corners (3,3)/(5,3)/(3,5)/(5,5) and the upper/lower edges (4,2)/(4,6). The center (4,4) is empty.
- **Answer:** (4, 4) — connect the 4 black cross arms into a single 5-stone group.
- **Why it's the right answer:** playing at (4, 4) is adjacent to all 4 cross arms and joins them into a single 5-stone group. Without (4, 4), the 4 cross arms are 4 separate single-stone groups.
- **Copy:** 3 hints, "四颗黑棋 (4,3)(4,5)(3,4)(5,4) 是分开的" / "中间是 (4, 4)，可以连上四颗棋" walks the child through the connect-the-cross reasoning.

### END-016 — 最大地盘 (level 5)
- **Initial board:** 3 black stones at (0,0)/(1,0)/(0,1) (upper-left corner), 3 white stones at (8,0)/(7,0)/(8,1) (upper-right corner), 1 black at (4,4), 2 white at (3,4)/(5,4). The central area (4,5) and (5,5) and (3,5) is mostly empty.
- **Answer:** (4, 5) — claim the central territory.
- **Why it's the right answer:** the center has the most open space; extending from (4, 4) into the center claims the largest frame.
- **Copy:** 3 hints, "抢到中央就能围出最大的地盘" frames the value as a concrete goal, not a rank.

### MIX-004 — 连还是跑 (level 3)
- **Initial board:** 2 black stones in a horizontal pair at (3,3)/(4,3) (the middle pair), 1 black at (6,3) (a separate right-side stone). 6 white stones surrounding the middle pair: (2,3) on the left, (3,2)/(4,2) on the top, (3,4)/(4,4) on the bottom. The middle pair has 2 group liberties at (5,3) and the unoccupied corners.
- **Answer:** (5, 3) — connect the middle pair to the right-side stone.
- **Why it's the right answer:** (5, 3) bridges the middle pair to (6, 3), giving the three stones a single shared liberty network. Escaping outward would leave the middle pair in atari.
- **Copy:** 3 hints, "数一数黑棋 (3,3) 和 (4,3) 这块棋还有几口气" makes the reading concrete.

### MIX-005 — 断还是连 (level 4)
- **Initial board:** 2 white stones at (3,2) and (5,2) (a two-stone pair on the top row, separated by an empty (4,2)). 2 black stones at (2,2) and (2,5).
- **Answer:** (4, 2) — cut between the two white stones.
- **Why it's the right answer:** (4, 2) sits between (3, 2) and (5, 2) and separates them into two single-stone groups. The two white stones are no longer adjacent and cannot connect. The other reasonable cuts in the area (e.g. (4, 3)) are not on the line between the two white stones and would not actually prevent the connection.
- **Copy:** 3 hints, "在 (4,2) 落子可以把白棋左右分开" makes the cut reasoning concrete and child-friendly.

### MIX-006 — 活还是占 (level 4)
- **Initial board:** 4 black stones forming a 2×2 block at (4,4)/(5,4)/(4,5)/(5,5), 4 white stones at the outer corners (3,3)/(6,3)/(3,6)/(6,6). The black block has 4 outer-edge liberties.
- **Answer:** (4, 3) — extend outward from the top-center of the block.
- **Why it's the right answer:** (4, 3) is the central top liberty that connects the block to a safe extension. The other top-edge move (5, 3) is also a valid answer per the same logic.
- **Copy:** 3 hints, "想一想黑棋还剩几口气" frames the survival decision.

### MIX-007 — 攻还是守 (level 5)
- **Initial board:** 3 black stones at (1,1)/(2,1)/(1,2) (upper-left L), 3 white stones at (7,7)/(8,7)/(7,8) (lower-right L), 2 white stones at (0,7)/(0,8) (lower-left corner). The black corner is safe; the white corner at (0,7)/(0,8) has only 2 liberties at (0,6) and (1,7).
- **Answer:** (0, 6) — attack white at (0, 7) by taking its last liberty on the column.
- **Why it's the right answer:** white at (0, 7) has only 2 liberties: (0, 6) and (1, 7). Black at (0, 6) threatens the atari and forces white to defend. This is the textbook "attack the weak" move.
- **Copy:** 3 hints, "攻击是最好的防守" introduces a foundational Go proverb in child-friendly form.

### MIX-008 — 防还是占 (level 5)
- **Initial board:** 2 white stones at (4,3) and (4,5) (two separate white stones on column 4, with a one-space gap at (4,4)). 3 black stones forming a vertical wall at (2,3)/(2,4)/(2,5).
- **Answer:** (4, 4) — block white's connection between (4,3) and (4,5).
- **Why it's the right answer:** (4, 4) sits directly between the two white stones on the column-4 line. After black (4, 4), the two white stones (4, 3) and (4, 5) each become single-stone groups with no shared liberty — they cannot connect. The earlier wrong design used (3, 4) which left (4, 4) empty and let white connect through it.
- **Copy:** 3 hints, "白棋的 (4, 3) 和 (4, 5) 在一条线上想连起来" / "中间是 (4, 4)" / "在 (4, 4) 落子把白棋左右分开" frames the defensive priority.

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
