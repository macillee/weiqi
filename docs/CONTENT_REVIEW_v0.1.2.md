# Content Review — v0.1.2

> Project: 小棋童围棋闯关  
> Version: v0.1.2  
> Date: 2026-05-18

---

# 1. Problem Count

| Metric | Value |
|---|---:|
| Total problems | 36 |
| Previous count | 24 |
| New problems in this batch | 12 |

# 2. Category Breakdown

| Category | Count | Level Range |
|---|---:|---:|
| capture | 13 | 1–3 |
| escape | 7 | 1–3 |
| connect_cut | 9 | 1–3 |
| life_death | 4 | 2–3 |
| opening | 3 | 1–2 |
| endgame | 0 | — |
| mixed | 0 | — |

# 3. New Problems

| ID | Category | Level | Answer(s) | Go-logic Notes | Child Suitability |
|---|---|---:|---|---|---|
| CAP-011 | capture | 1 | (4,7) | 边上白棋 (4,8) 被左右黑棋夹住，只剩上面一口气，棋理正确 | 简单数气，适合初学者 |
| CAP-012 | capture | 2 | (6,5) | 两颗白棋 (6,3)-(6,4) 被四面包围，只剩下面一口气，棋理正确 | 两颗子吃子，难度适中 |
| CAP-013 | capture | 2 | (0,2) | 角上两颗白棋 (0,0)-(0,1) 被右边黑棋挡住，只剩下面一口气，棋理正确 | 角上吃子，形状清晰 |
| ESC-006 | escape | 2 | (4,2) | 黑棋 (4,1) 在边上被三面包围，只剩下面一口气，往下跑增加气，棋理正确 | 方向明确，适合练习 |
| ESC-007 | escape | 2 | (3,7) | 两颗黑棋 (3,5)-(3,6) 被三面包围，只剩下面一口气，往下跑增加气，棋理正确 | 往下长气，概念清晰 |
| CC-007 | connect_cut | 2 | (5,4) | 两颗黑棋 (4,4)-(6,4) 中间有断点，连上后气变多，棋理正确 | 基础连接，形状简单 |
| CC-008 | connect_cut | 2 | (4,6) | 两颗白棋 (3,6)-(5,6) 中间有断点，切断后分开，棋理正确 | 基础切断，形状清晰 |
| CC-009 | connect_cut | 3 | (5,6) | 两颗黑棋 (5,5)-(5,7) 纵向排列，中间被白棋威胁，连上后安全，棋理正确 | 纵向连接，稍有难度 |
| LD-001 | life_death | 2 | (1,1) | 角上黑棋 (0,0)-(0,1)-(1,0) 被白棋 (0,2)-(2,0) 挡住，只剩 (1,1) 一口气，下在此处长气救活，棋理正确 | 长气救活，非填眼 |
| LD-002 | life_death | 2 | (4,1)/(5,1) | 边上黑棋 (4,0)-(5,0) 被两边白棋夹住，往下长增加气，棋理正确 | 长气逃跑，概念清晰 |
| LD-003 | life_death | 3 | (2,3) | 四颗黑棋 (1,1)-(2,1)-(1,2)-(2,2) 被七颗白棋包围，只剩 (2,3) 一口气，下在此处长气救活，棋理正确 | 长气救活，非填眼 |
| LD-004 | life_death | 3 | (3,3) | 三颗白棋 (2,2)-(2,3)-(3,2) 被六颗黑棋包围，只剩 (3,3) 一口气，下在此处提掉白棋，棋理正确 | 包围吃子，形状清晰 |

# 4. Validation Status

- `validateAllProblems`: **pass**
- No duplicate IDs: **pass**
- All coordinates inside board: **pass**
- All answers are empty points: **pass**
- No zero-liberty initial groups: **pass**
- All new problems manually Go-reviewed: **pass**
- `npm run build`: **pass**
- `npm run test`: **pass** (59 tests)

# 5. Known Content Limitations

- endgame 和 mixed 类别仍为 0 道题。
- life_death 类别刚引入，仅 4 题，均为基础单步形状。
- 所有问题仍为 9x9 单步，未引入多步阅读。
- 难度范围 1-3，适合学棋约一年的儿童。

# 6. Conclusion

[x] Approved for v0.1.2  
[ ] Not approved — see notes
