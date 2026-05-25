# Content Review — v0.5.0b

> Project: 小棋童围棋闯关
> Version: v0.5.0b
> Date: 2026-05-25

---

## 1. New Problems

14 new problems added (14 single-step, 0 multi-step). Library: 51 → 65 total.

| ID | Category | Level | Tags | Learning Goal |
|---|---|---|---|---|
| CAP-015 | capture | 4 | capture, atari, liberty-counting | Capture a 2-stone group from 3-side surround |
| CAP-016 | capture | 5 | capture, atari, liberty-counting | Capture a triangle-shaped 3-stone group |
| CAP-017 | capture | 5 | capture, atari, corner | Corner pursuit capture |
| ESC-009 | escape | 4 | escape, liberty-counting, extend | Escape a 2-stone group |
| ESC-010 | escape | 5 | escape, liberty-counting, sequence | Escape a 3-stone line on edge |
| CC-012 | connect_cut | 4 | cut, weak-point, atari | Cut a 3-stone line |
| CC-013 | connect_cut | 5 | cut, weak-point, capture | Cut with capture |
| LD-008 | life_death | 4 | life_death, two-eyes | Corner eye-making |
| LD-009 | life_death | 5 | life_death, two-eyes | Center eye-making in a 3×3 block |
| OP-005 | opening | 4 | opening, corner, big-point | Side extension after corner occupation |
| END-001 | endgame | 1 | endgame, corner | Play the last big point |
| END-002 | endgame | 2 | endgame, edge | Secure territory boundary |
| END-003 | endgame | 3 | endgame, edge | Reduce opponent territory |
| END-004 | endgame | 2 | endgame, connect | Connect under to save territory |

### Category Distribution After Addition

| Category | Before | After | Delta |
|---|---:|---:|---:|
| capture | 17 | 20 | +3 |
| escape | 9 | 11 | +2 |
| connect_cut | 12 | 14 | +2 |
| life_death | 9 | 11 | +2 |
| opening | 4 | 5 | +1 |
| endgame | 0 | 4 | +4 |
| **Total** | **51** | **65** | **+14** |

---

## 2. Validation

| Check | Result |
|---|---|
| No duplicate IDs | pass |
| All coordinates inside 9×9 board | pass |
| All answers empty points | pass |
| No zero-liberty initial groups | pass |
| Canonical tags | pass |
| Category-aligned tags | pass |
| `validateAllProblems` | pass |
| `npm run test` | 250 passed (17 files) |
| `npm run build` | compiled successfully |
