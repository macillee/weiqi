# v0.15.0d — Intermediate Problem Pack A Validation Report

## 1. Scope and Method

- **Pack A IDs reviewed:** CAP-021, CAP-022, ESC-013, ESC-014, CC-017, CC-018, LD-013, OP-011, OP-012, END-011, END-012, MIX-001, MIX-002, MIX-003
- **Source file inspected:** `src/data/problems.json` (101 problems total)
- **Validation method:** Script-assisted structural validation + manual tactical/text review
- **Data corrections made:** None — all Pack A problems pass structural, coordinate, and schema checks
- **New problems added:** None

## 2. Matrix Verification

| Metric | Expected | Actual | Status |
|---|---|---|---|
| Total Pack A problems | 14 | 14 | ✅ |
| L3 problems | 3 | 3 (OP-011, END-011, MIX-001) | ✅ |
| L4 problems | 7 | 7 (CAP-021, ESC-013, CC-017, LD-013, OP-012, END-012, MIX-002) | ✅ |
| L5 problems | 4 | 4 (CAP-022, ESC-014, CC-018, MIX-003) | ✅ |
| Multi-step problems | 3 | 3 (CAP-022, CC-018, MIX-001) | ✅ |
| Multi-step categories | capture, connect_cut, mixed | CAP-022, CC-018, MIX-001 | ✅ |
| All problems L3–5 | 14 | All 14 are L3–5 | ✅ |
| Total library count | 101 | 101 | ✅ |
| Total L3–5 count | 58 | 58 | ✅ |

### Category breakdown

| Category | L3 | L4 | L5 | Total |
|---|---|---|---|---|
| capture | 0 | 1 | 1 | 2 |
| escape | 0 | 1 | 1 | 2 |
| connect_cut | 0 | 1 | 1 | 2 |
| life_death | 0 | 1 | 0 | 1 |
| opening | 1 | 1 | 0 | 2 |
| endgame | 1 | 1 | 0 | 2 |
| mixed | 1 | 1 | 1 | 3 |
| **Total** | **3** | **7** | **4** | **14** |

Target matrix from `docs/CONTENT_INVENTORY_v0.15.md` matches exactly. ✅

## 3. Schema and Metadata Validation

All 14 Pack A problems were inspected for the following:

| Check | Result |
|---|---|
| Stable unique ID | ✅ All 14 IDs are unique |
| Known category | ✅ All 7 categories valid |
| Level 3–5 | ✅ All problems L3–5 |
| boardSize 9 | ✅ All set to 9 |
| `toPlay` valid | ✅ All set to `"black"` |
| Tags include category-aligned tag | ✅ Each has at least one matching tag |
| At least 2 hints | ✅ All have 2–3 hints |
| title/description present | ✅ All present |
| explanation present | ✅ All present |
| successMessage present | ✅ All present |
| failureMessage present | ✅ All present, no harsh wording |
| No duplicate tags | ✅ No duplicate tags found |
| Answer point within board (0–8) | ✅ All answers in range |
| Answer point empty in initial position | ✅ All answers on empty intersections |
| Initial stones within board | ✅ All stones in 0–8 range |
| No duplicate initial stones | ✅ No duplicate coordinates |
| Multi-step `totalSteps` matches step count | ✅ CAP-022, CC-018, MIX-001 all correct |

## 4. Tactical / Human Review Notes

### CAP-021 (L4 capture) — 包围吃子
- **Concept:** Encircle a 3-stone white line from the remaining open side
- **Category:** Appropriate — classic capture scenario
- **Level:** L4 plausible; requires counting which side is open
- **Answer uniqueness:** Only (4,4) puts all 3 white stones in atari; alternative moves leave white with multiple liberties
- **Wording:** Clear and concrete for a child
- **Follow-up:** None recommended

### CAP-022 (L5 capture, multi-step) — 征吃白棋
- **Concept:** 2-step ladder-like capture sequence; black ataris from outside, white extends, black captures
- **Category:** Appropriate — capture race reading
- **Level:** L5 plausible; requires reading ahead 2 moves
- **Answer uniqueness:** Step 1 requires the correct atari direction; step 2 follows naturally
- **Wording:** "征吃" is appropriate for this level
- **Follow-up:** None recommended

### ESC-013 (L4 escape) — 向中央逃跑
- **Concept:** Black escapes from edge confinement toward the center
- **Category:** Appropriate — escape under pressure
- **Level:** L4 plausible; the diagonal escape path is non-obvious
- **Answer uniqueness:** Multiple escape paths exist but (2,4) maximizes liberties
- **Wording:** Clear
- **Follow-up:** None recommended

### ESC-014 (L5 escape) — 双重包围中逃跑
- **Concept:** Black escapes from a double encirclement with an outward diagonal extension
- **Category:** Appropriate — advanced escape
- **Level:** L5 plausible; the position requires reading the escape route against surrounding white stones
- **Answer uniqueness:** The correct diagonal is the only direction with enough space
- **Wording:** Clear
- **Follow-up:** None recommended

### CC-017 (L4 connect_cut) — 切断白棋（五）
- **Concept:** Find the cutting point in a white square/block shape
- **Category:** Appropriate — cut theme
- **Level:** L4 plausible; the square shape weakness is a known intermediate pattern
- **Answer uniqueness:** The cutting point is clearly the only empty intersection that separates white
- **Wording:** Consistent with existing CC-012–CC-016 naming
- **Follow-up:** None recommended

### CC-018 (L5 connect_cut, multi-step) — 两步切断
- **Concept:** Two-step cut: first cut separates white groups, second move blocks reconnection
- **Category:** Appropriate — deep reading cut
- **Level:** L5 plausible; requires reading 2 moves ahead
- **Answer uniqueness:** Step 1 cut point is forced; step 2 block is the only way to maintain separation
- **Wording:** Clear
- **Follow-up:** None recommended

### LD-013 (L4 life_death) — 做眼活棋
- **Concept:** Make two eyes in the corner; fill the key point to create a living shape
- **Category:** Appropriate — life/death shape recognition
- **Level:** L4 plausible; corner eye-making is a fundamental intermediate skill
- **Answer uniqueness:** The key point (2,2) is the only move that guarantees two eyes
- **Wording:** Clear
- **Follow-up:** None recommended

### OP-011 (L3 opening) — 占大场
- **Concept:** Choose the best empty corner in response to opponent's corner enclosure
- **Category:** Appropriate — opening direction
- **Level:** L3; basic corner selection is appropriate for level 3
- **Answer uniqueness:** Any empty corner is acceptable; the problem accepts (2,2) as the response to white's (6,6)
- **Wording:** Clear and child-appropriate
- **Follow-up:** None recommended

### OP-012 (L4 opening) — 方向选择
- **Concept:** After all 4 corners are occupied, choose the center/big point
- **Category:** Appropriate — opening strategy
- **Level:** L4 plausible; selecting the first big-point outside corners is a level 4 skill
- **Answer uniqueness:** (4,4) is the standard answer but edge points are also reasonable
- **Wording:** Clear
- **Follow-up:** None recommended

### END-011 (L3 endgame) — 缩小地盘（一）
- **Concept:** Reduce white's territory from the edge
- **Category:** Appropriate — endgame reduction
- **Level:** L3; simple edge reduction is a level 3 concept
- **Answer uniqueness:** The invasion point (0,4) is the standard reduction point
- **Wording:** Clear
- **Follow-up:** None recommended

### END-012 (L4 endgame) — 收官要点
- **Concept:** Identify the largest remaining endgame point
- **Category:** Appropriate — endgame big-point selection
- **Level:** L4 plausible; requires evaluating relative size of endgame moves
- **Answer uniqueness:** (5,1) is the clear big point
- **Wording:** Clear
- **Follow-up:** None recommended

### MIX-001 (L3 mixed, multi-step) — 吃还是连
- **Concept:** Cross-category decision: connect your own stones or capture an opponent stone? Both options are plausible; reading ahead reveals the better choice.
- **Category:** Appropriate — mixed cross-category
- **Level:** L3/4; the trade-off is accessible but requires multi-step reading
- **Answer uniqueness:** The sequence is forced for the optimal outcome
- **Wording:** Clear, presents a genuine dilemma
- **Follow-up:** None recommended

### MIX-002 (L4 mixed) — 攻还是守
- **Concept:** Attack-or-defend decision: choose the move that both attacks white and defends black
- **Category:** Appropriate — mixed attack/defense
- **Level:** L4 plausible; dual-purpose moves are intermediate skill
- **Answer uniqueness:** The dual-purpose point is the clear best move
- **Wording:** Clear
- **Follow-up:** None recommended

### MIX-003 (L5 mixed) — 地还是活
- **Concept:** Endgame-or-safety decision: secure the corner or take larger territory elsewhere
- **Category:** Appropriate — mixed endgame/safety
- **Level:** L5 plausible; evaluating when defense is bigger than offense is advanced
- **Answer uniqueness:** The corner defect is urgent; other moves let white invade
- **Wording:** Clear
- **Follow-up:** None recommended

## 5. Multi-step Regression Review

### CAP-022
- `totalSteps`: 2 ✅
- Step fields: answer, hint, explanation, successMessage, failureMessage all present ✅
- Step 1 answer (4,2) is empty in initial position ✅
- Step 2 `addedStones` correctly represent the position after step 1 ✅
- Step 2 answer (4,1) is valid in the post-step-1 board ✅
- Sequence is understandable: atari from outside → white extends → black captures ✅
- No runtime logic change required ✅

### CC-018
- `totalSteps`: 2 ✅
- Step fields: all present ✅
- Step 1 answer (4,4) is empty in initial position ✅
- Step 2 answer (4,5) is empty in the initial position and still empty after step 1 ✅
- Sequence: cut between white groups → block reconnection ✅
- No runtime logic change required ✅

### MIX-001
- `totalSteps`: 2 ✅
- Step fields: all present ✅
- Step 1 answer (2,4) is empty in initial position ✅
- Step 2 `addedStones` correctly represent the position after step 1 (black (2,4) + white (2,5)) ✅
- Sequence: connect & cut → continue attack ✅
- No runtime logic change required ✅

## 6. Regression Checks

| Check | Status |
|---|---|
| Existing problem count tests updated (87→101) | ✅ Updated in PR #170 |
| Category metadata supports `mixed` | ✅ Added in PR #170 |
| Demo smoke count expects 101 | ✅ Updated in PR #170 (`e2e/demo.spec.ts`) |
| Daily practice/category selection tests pass | ✅ All 482 unit tests pass |
| Multi-step validators pass | ✅ All multi-step problems pass validation |
| Local anonymous mode behavior unchanged | ✅ No runtime changes |
| Engine/diagnostics behavior unchanged | ✅ No engine/diagnostics changes |

## 7. Defects Found / Fixes Made

**No defects found.** All 14 Pack A problems pass structural validation, coordinate checks, schema checks, and multi-step validation. No data corrections were made.

The only changes made during the v0.15.0c PR review cycle were:
- E2E demo count updated (87→101) — disclosed in PR #170
- TASKS.md L3–5 count corrected (44→58) — disclosed in PR #170

These were not Pack A data defects but CI and documentation alignment fixes.

## 8. Sign-off Checklist

- [x] 14 Pack A problems present.
- [x] Matrix matches target (L3=3, L4=7, L5=4, total=14).
- [x] 3 multi-step problems present (CAP-022, CC-018, MIX-001).
- [x] All Pack A answer points are empty legal points on the board.
- [x] No duplicate IDs or stone coordinates.
- [x] Chinese text reviewed — clear, child-appropriate, no harsh wording.
- [x] Failure messages are child-friendly (e.g., "想一想" / "看看" prompts).
- [x] Tests pass (482 unit tests, all CI gates).
- [x] Build passes.
- [x] E2E and Docker pass in CI.
- [x] No runtime/UI/schema changes were introduced beyond problem data and test alignment.
