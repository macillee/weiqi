# Metadata Review — v0.4.0d

> Project: 小棋童围棋闯关
> Version: v0.4.0d
> Date: 2026-05-24

---

## 1. Canonical Tags

All tags use lowercase, underscore-separated words (no hyphens, no spaces).

| Canonical Tag | Usage Count | Description |
|---|---|---|
| `capture` | 18 | Capture-related problems |
| `atari` | 19 | Atari technique |
| `liberty-counting` | 7 | Counting liberties |
| `two-stones` | 3 | Two-stone group |
| `three-stones` | 1 | Three-stone group |
| `double-atari` | 1 | Double atari technique |
| `cut` | 7 | Cutting opponent's stones |
| `center` | 1 | Center of the board |
| `corner` | 6 | Corner of the board |
| `edge` | 3 | Edge of the board |
| `escape` | 9 | Escape problems |
| `choice` | 2 | Multiple-choice style |
| `connect` | 7 | Connecting own stones |
| `weak-point` | 8 | Opponent's weak point |
| `big-point` | 1 | Big opening point |
| `life_death` | 9 | Life-and-death problems |
| `extend` | 4 | Extending to gain liberties |
| `two-eyes` | 3 | Making two eyes |
| `opening` | 4 | Opening problems |
| `multi-step` | 9 | Multi-step sequence |
| `sequence` | 4 | Sequential technique |
| `extension` | 2 | Extending to connect |

---

## 2. Category / Tag Mapping Rules

| Category | Required Tag(s) | Optional Technique Tags |
|---|---|---|
| `capture` | `capture` | `atari`, `liberty-counting`, `cut`, `double-atari`, `two-stones`, `three-stones`, `center`, `corner`, `edge` |
| `escape` | `escape` | `liberty-counting`, `connect`, `choice`, `corner` |
| `connect_cut` | `connect` or `cut` | `weak-point`, `atari`, `choice` |
| `life_death` | `life_death` | `atari`, `extend`, `edge`, `capture`, `two-eyes` |
| `opening` | `opening` | `corner`, `big-point` |

---

## 3. Changes Made

### `src/data/problems.json`

Fixed tag inconsistency: normalized `"life-death"` → `"life_death"` in 3 multi-step problems to match the canonical form used by all single-step life_death problems.

| Problem ID | Before | After |
|---|---|---|
| MULTI-002 | `"multi-step", "life-death", "two-eyes"` | `"multi-step", "life_death", "two-eyes"` |
| MULTI-006 | `"multi-step", "life-death", "two-eyes"` | `"multi-step", "life_death", "two-eyes"` |
| MULTI-007 | `"multi-step", "life-death", "two-eyes"` | `"multi-step", "life_death", "two-eyes"` |

No other fields changed.

---

## 4. Tests Added

5 new metadata tests in `src/__tests__/problems.test.ts`:

| Test | What it checks |
|---|---|
| `every problem has at least one category-aligned tag` | Each problem's tags include the category-matching tag |
| `every multi-step problem includes 'multi-step' tag` | All 9 multi-step problems have the `multi-step` tag |
| `no empty or whitespace-only tags` | All tag strings are non-empty |
| `no duplicate tags within a single problem` | No problem has repeated tags |
| `life_death tag is canonical (no life-death variant)` | Ensures only `life_death` is used |

---

## 5. Validation Results

| Check | Result |
|---|---|
| `npm run test` | 250 passed (17 files) |
| `npm run build` | compiled successfully |
| Tag consistency | All tags canonical, no hyphens |
| Category/tag alignment | All 51 problems have category-aligned tag |
| Multi-step tag | All 9 multi-step problems include `multi-step` |
| No duplicate tags | All problems have unique tag sets |
| No empty tags | All tags are non-empty strings |

---

## 6. Conclusion

- [x] v0.4.0d metadata refinement complete
- [ ] Not approved — see notes
