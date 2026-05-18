# Content Review — v0.1.1

> Project: 小棋童围棋闯关  
> Version: v0.1.1  
> Date: 2026-05-18

---

# 1. Problem Count

| Metric | Value |
|---|---:|
| Total problems | 24 |
| Previous count (v0.1.0) | 9 |
| New problems in this batch | 15 |

# 2. Category Breakdown

| Category | Count | Level Range |
|---|---:|---:|
| capture (吃子) | 10 | 1–2 |
| escape (逃子) | 5 | 1–2 |
| connect_cut (连接与切断) | 6 | 1–2 |
| opening (布局) | 3 | 1 |
| life_death (死活) | 0 | — |
| endgame (官子) | 0 | — |
| mixed (综合) | 0 | — |

# 3. New Problems (v0.1.1 batch)

| ID | Category | Level | Title | Go-logic Notes |
|---|---|---:|---|---|
| CAP-006 | capture | 2 | 双打吃 | 中间点同时打吃两颗白棋，棋理正确 |
| CAP-007 | capture | 2 | 断开打吃 | 切断同时打吃，棋理正确 |
| CAP-008 | capture | 2 | 找到打吃的位置 | 两口气堵住一口，棋理正确 |
| CAP-009 | capture | 2 | 包围打吃 | 边上包围形状简单，棋理正确 |
| CAP-010 | capture | 2 | 角上打吃 | 角上棋子气少，棋理正确 |
| ESC-002 | escape | 2 | 往外跑 | 逃出打吃方向正确，棋理正确 |
| ESC-003 | escape | 1 | 连回自己的棋 | 连接逃跑，棋理正确 |
| ESC-004 | escape | 2 | 反方向跑 | 避开包围方向，棋理正确 |
| ESC-005 | escape | 2 | 增加气 | 长气逃跑，棋理正确 |
| CC-003 | connect_cut | 1 | 虎口连接 | 虎口形状连接，棋理正确 |
| CC-004 | connect_cut | 2 | 切断两颗白棋 | 断点准确，棋理正确 |
| CC-005 | connect_cut | 1 | 补断点 | 补棋形弱点，棋理正确 |
| CC-006 | connect_cut | 2 | 分断白棋 | 切断后白棋分离，棋理正确 |
| OP-002 | opening | 1 | 占另一个角 | 开局占角原则，棋理正确 |
| OP-003 | opening | 1 | 守角 | 小飞守角基础，棋理正确 |

# 4. Validation Status

- `validateAllProblems`: **passed** — all 24 problems pass schema and Go-logic validation.
- No duplicate IDs.
- All coordinates within 9x9 board range.
- No duplicate stone positions.
- All answer points are empty intersections.
- No zero-liberty initial groups.
- All problems have at least 1 answer and 1 hint.

# 5. Coverage Notes

- life_death, endgame, mixed categories have 0 problems.
- v0.1.2 should add life_death problems as priority (P0 in project spec).
- All current problems are level 1–2, appropriate for children who studied Go for ~1 year.
- No level 3+ problems yet; acceptable for v0.1.1.

# 6. Conclusion

The 24-problem set is valid and appropriate for the v0.1.1 scope.
No blocking issues found.
Content expansion to 30–50 problems is recommended for v0.1.2.
