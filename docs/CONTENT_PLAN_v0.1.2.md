# Content Plan — v0.1.2

> Project: 小棋童围棋闯关  
> Version target: v0.1.2  
> Purpose: small-batch content expansion with strict Go-logic review

---

# 1. Goal

v0.1.2 focuses on content expansion, not new product systems.

Current content state after v0.1.1:

```text
24 reviewed problems
9x9 board
single-move problems
local JSON data
```

v0.1.2 target:

```text
36 reviewed problems
+12 new problems
no new product systems
```

The goal is to make the app more useful for child testing while preserving the stable v0.1 learning loop.

---

# 2. Scope

Allowed:

- Add 12 new problems to `src/data/problems.json`.
- Keep all new problems on 9x9 board.
- Keep all new problems single-move only.
- Add basic child-friendly explanations and hints.
- Add `docs/CONTENT_REVIEW_v0.1.2.md` after content is created.
- Optionally strengthen lightweight validation helpers if needed.

Not allowed:

- Login.
- Database.
- Supabase.
- AI opponent.
- AI review.
- Payment.
- Teacher/admin backend.
- Multi-step problem engine.
- 13x13 or 19x19 problem sets.
- Large-scale generated problem batch.
- Major UI redesign.

---

# 3. Target Problem Count

| Version | Total Problems | New Problems | Notes |
|---|---:|---:|---|
| v0.1.0 | 9 | — | Initial MVP sample set |
| v0.1.1 | 24 | 15 | Stabilization + reviewed expansion |
| v0.1.2 target | 36 | 12 | Small-batch content expansion |

Do not exceed 36 problems in v0.1.2 unless explicitly approved.

---

# 4. Recommended Category Distribution

Add 12 problems with this target split:

| Category | Current Direction | New Count | Reason |
|---|---|---:|---|
| capture | eating stones / atari | +3 | Core beginner skill |
| escape | saving stones / increasing liberties | +2 | Core beginner skill |
| connect_cut | connecting and cutting | +3 | Core beginner tactical skill |
| life_death | basic life/death concepts | +4 | Current category is underrepresented |

Priority: add simple `life_death` problems, but avoid complex dead/alive reading.

---

# 5. Life-and-Death Problem Rules

v0.1.2 may introduce basic life-and-death problems, but only simple one-move shapes.

Allowed life/death patterns:

- fill the opponent's last liberty in a simple capturing shape;
- save a group by increasing liberties;
- identify a basic eye-like point only when the move is legal and pedagogically clear;
- connect to make a group safer;
- simple false-eye or eye-shape concept only if the answer is unambiguous.

Avoid:

- multi-step reading;
- ko;
- seki;
- complicated eye-space judgment;
- snapback unless the shape is extremely clear;
- any answer that plays inside one's own true eye and teaches the wrong habit;
- any self-atari or self-capture unless the problem is explicitly about illegal/bad moves, which v0.1.2 should avoid.

Rule of thumb:

```text
If the reviewer needs more than 20 seconds to verify the answer, the problem is too complex for v0.1.2.
```

---

# 6. Problem Authoring Requirements

Every new problem must satisfy:

- `boardSize` is `9`.
- `toPlay` is usually `black` unless there is a clear reason.
- Coordinates are 0-based.
- `x` increases left to right.
- `y` increases top to bottom.
- `initialStones` has no duplicate coordinates.
- Every answer coordinate is empty in the initial position.
- Every answer coordinate is inside the board.
- Initial position contains no zero-liberty group.
- The answer matches the title and description.
- The answer is understandable by a child who has studied Go for about one year.
- Hints move from general observation to concrete direction.
- Feedback is warm and short.

---

# 7. Copywriting Rules

Good child-facing copy:

```text
白棋只剩一口气，黑棋应该下在哪里？
```

```text
黑棋快被吃了，往哪里跑更安全？
```

```text
两颗黑棋中间有一个断点，怎么连起来？
```

Avoid adult/abstract copy:

```text
寻找局部最优战术手段。
```

```text
请判断该局部死活状态。
```

```text
基于全局形势选择最高胜率一手。
```

---

# 8. Suggested New Problem IDs

Recommended ID ranges for v0.1.2:

```text
CAP-011 to CAP-013
ESC-006 to ESC-007
CC-007 to CC-009
LD-001 to LD-004
```

Use these exact IDs unless a conflict exists.

---

# 9. Required Review Document

After adding problems, create:

```text
docs/CONTENT_REVIEW_v0.1.2.md
```

It must include:

- total problem count;
- previous problem count;
- new problem count;
- category breakdown;
- every new problem ID;
- title;
- category;
- level;
- answer coordinate(s);
- Go-logic review notes;
- child-suitability notes;
- validation status.

---

# 10. Suggested `CONTENT_REVIEW_v0.1.2.md` Template

```markdown
# Content Review — v0.1.2

> Project: 小棋童围棋闯关  
> Version: v0.1.2  
> Date: YYYY-MM-DD

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
| capture |  |  |
| escape |  |  |
| connect_cut |  |  |
| life_death |  |  |
| opening |  |  |
| endgame |  |  |
| mixed |  |  |

# 3. New Problems

| ID | Category | Level | Answer(s) | Go-logic Notes | Child Suitability |
|---|---|---:|---|---|---|
| CAP-011 | capture |  |  |  |  |
| CAP-012 | capture |  |  |  |  |
| CAP-013 | capture |  |  |  |  |
| ESC-006 | escape |  |  |  |  |
| ESC-007 | escape |  |  |  |  |
| CC-007 | connect_cut |  |  |  |  |
| CC-008 | connect_cut |  |  |  |  |
| CC-009 | connect_cut |  |  |  |  |
| LD-001 | life_death |  |  |  |  |
| LD-002 | life_death |  |  |  |  |
| LD-003 | life_death |  |  |  |  |
| LD-004 | life_death |  |  |  |  |

# 4. Validation Status

- `validateAllProblems`: pass/fail
- No duplicate IDs: pass/fail
- All coordinates inside board: pass/fail
- All answers are empty points: pass/fail
- No zero-liberty initial groups: pass/fail
- All new problems manually Go-reviewed: pass/fail

# 5. Known Content Limitations

- Note any category gaps.
- Note any problems that should be revisited.

# 6. Conclusion

[ ] Approved for v0.1.2  
[ ] Not approved — see notes
```

---

# 11. Validation Requirements

Routine validation for v0.1.2 content changes:

```bash
npm run build
npm run test
```

Also verify:

```text
validateAllProblems passes
problems.json total count is 36
CONTENT_REVIEW_v0.1.2.md matches problems.json
```

Docker validation is not required for content-only changes unless dependency/build configuration changes.

---

# 12. Review Focus

Reviewer should check:

1. Does the answer actually work in the position?
2. Is the move legal?
3. Is the answer point empty?
4. Does the description match the actual shape?
5. Are hints accurate and not misleading?
6. Is the explanation child-friendly?
7. Does the problem duplicate an existing problem too closely?
8. Does it keep v0.1.2 within small-batch content expansion scope?

---

# 13. Completion Criteria

v0.1.2 content expansion is complete only when:

- `src/data/problems.json` contains exactly 36 problems.
- All new problems pass validation.
- All new problems have manual review notes.
- `docs/CONTENT_REVIEW_v0.1.2.md` is complete.
- `npm run build` passes.
- `npm run test` passes.
- No v0.2 features are introduced.
