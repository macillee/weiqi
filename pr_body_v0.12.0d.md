Closes #139

## Changed Files

- `src/lib/ai-review.ts` — new local rule/template coach module with `getLocalReview()` and `validateReviewOutput()` functions
- `src/components/problem/FeedbackDialog.tsx` — added `onShowCoach` and `coachMessage` props; renders `请老师帮忙` button and coach message in amber-bordered box
- `src/components/problem/ProblemPlayer.tsx` — integrated coach: tracks wrong move, calls `getLocalReview` on button click, passes result to FeedbackDialog, resets on try-again
- `src/__tests__/ai-review.test.ts` — 51 tests covering category-specific feedback, wrongMoves match, near-correct detection, hint-used path, missing/malformed input, determinism, validation (length, source, banned phrases), all-category validation sweep
- `docs/TASKS.md` — marked v0.12.0d delivered, next task → v0.12.0e

## Rule/Template Coach Behavior

- `getLocalReview(input)`: deterministic, local, fully offline
- Uses problem `wrongMoves` entry when attempted move matches
- Falls back to category-specific template messages (capture, escape, connect_cut, life_death, opening, endgame, mixed, fallback)
- Detects near-correct moves (within 1 intersection) → "差一点点！再仔细看看旁边。"
- Provides hint-used message variant when `usedHint === true`
- All output: Chinese, 1–3 short sentences, ≤150 characters, one key Go concept
- No rank claims, no harsh criticism, no free-form chat, no network calls
- `validateReviewOutput()` enforces all safety bounds

## Practice UI Integration

- After a wrong answer, FeedbackDialog shows `请老师帮忙` button
- On click, calls `getLocalReview` with the wrong move coordinates, correct answer, and hint usage
- Coach message displayed in amber-bordered box
- Button hidden once coach message shown; state resets on try-again
- No disruption to existing hint, answer, review, or progress flow
- No automatic interruption after every move

## Safety/Privacy Summary

- No external network calls, no API keys, no login required
- No KataGo, Ollama, or LLM integration
- No data saved or transmitted
- All output validated by `validateReviewOutput()` (≤150 chars, source === "rule-template", no banned phrases)
- No personal data collected

## Test Summary

51 new tests in `src/__tests__/ai-review.test.ts`:
- Category-specific feedback for all 7 categories (14 tests)
- wrongMoves entry match and non-match (2 tests)
- Near-correct move detection and non-detection (2 tests)
- Missing correctMove, missing/empty wrongMoves (3 tests)
- Hint-used message variant (1 test)
- Deterministic output (1 test)
- Different output for different inputs (1 test)
- Non-empty message/concept/source (3 tests)
- `validateReviewOutput`: valid, too long, wrong source, banned phrases (7 tests)
- All-category + hint validation sweep (14 tests)

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 413 passed (22 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed (3.7s) |

No KataGo, Ollama, external AI API, package dependency, problem data/schema, Supabase/server-side behavior, Docker/CI, payment, teacher/admin, leaderboard, board-size, SGF, multiplayer, or broad redesign work included.
