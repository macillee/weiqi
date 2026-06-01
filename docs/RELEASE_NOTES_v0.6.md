# v0.6 — UX Polish and Child-Facing Gameplay Refinement

> Project: 小棋童围棋闯关
> Release: v0.6
> Date: 2026-06-01

---

## 1. Release Summary

v0.6 is a UX polish series focused on the daily learning experience for children
aged ~7–9. No new problems, no schema changes, no scheduling or weekly report
changes — only the way the existing 65-problem library feels to play.

The release follows five small slices (v0.6.0a–e), each delivered as its own PR:

- v0.6.0a — Next phase plan (planning, PR #68)
- v0.6.0b — Chinese board coordinate labels (PR #72)
- v0.6.0c — Success animations and star effects (PR #76)
- v0.6.0d — Toggleable answer audio feedback (PR #78)
- v0.6.0e — Progressive hint cards and deterministic board hint markers (PR #80)

This is a pure UX release. No problem data, no problem schema, no answer
validation logic, no spaced review scheduling, no weekly report aggregation,
no Supabase or SQL changes, no package or lockfile changes, and no new external
dependencies were introduced across v0.6.

---

## 2. Direction and Rationale

v0.5 brought the problem library to 65 problems across 6 categories and levels
1–5, fulfilling the original MVP content target. v0.6.0a evaluated five candidate
directions (UX polish, deeper multi-step, infrastructure / CI, content balancing,
deployment hardening) and selected **UX polish** because:

- Children are the target users; the app had no Chinese board labels, no
  celebratory feedback, no audio, and minimal hint affordance.
- Each polish slice could be a single small PR — easy to review, easy to revert.
- No content or schema risk: every change is presentation-only.

The full rationale and slice boundaries are recorded in
`docs/NEXT_PHASE_PLAN_v0.6.md`.

---

## 3. Slice Summary

### v0.6.0a — Next Phase Plan (PR #68)

- Planning document `docs/NEXT_PHASE_PLAN_v0.6.md`.
- 5 candidate directions evaluated; UX polish selected.
- 4 implementation slices defined (b, c, d, e) with explicit non-goals.
- Docs-only.

### v0.6.0b — Chinese Board Coordinate Labels (PR #72)

- Chinese numerals 一–九 rendered on all four sides of the SVG board.
- Board padding increased to keep labels outside the playing grid.
- No gameplay logic, problem data, or schema changes.
- Files: `src/components/board/GoBoard.tsx`.

### v0.6.0c — Success Animations and Star Effects (PR #76)

- New `CelebrationOverlay` component renders 12 floating star/sparkle
  particles on correct answer; auto-dismisses after ~1.5s.
- CSS-only animation via a new `celebrate-star` keyframe — no new dependencies.
- Wrong answers do **not** trigger celebration.
- Files: `src/components/problem/CelebrationOverlay.tsx`,
  `src/components/problem/ProblemPlayer.tsx`, `src/app/globals.css`.

### v0.6.0d — Toggleable Answer Audio Feedback (PR #78)

- New `src/lib/audioFeedback.ts` plays short Web Audio API tones for
  correct / wrong answers (sine wave, ~140–160ms, gentle envelope).
- Lazy `AudioContext` creation, resumed on first call.
- SSR / autoplay-block / missing-`AudioContext` paths are safe no-ops.
- Preference persisted to `localStorage["children-go-app:v0.6:audio"]`
  (default = enabled); refresh-stable.
- New "声音设置" toggle on `/settings` (`role="switch"`, `aria-checked`).
- Audio calls are fire-and-forget — they never block the answer flow.
- No new dependencies; no `package.json` / `package-lock.json` changes.
- Files: `src/lib/audioFeedback.ts`, `src/components/problem/ProblemPlayer.tsx`,
  `src/app/settings/page.tsx`, `src/__tests__/audioFeedback.test.ts`.

### v0.6.0e — Hint Presentation Polish (PR #80)

- Progressive hint cards in `HintPanel`: numbered badge (1, 2, 3…), 💡 icon,
  visible/total counter, fade-in animation, distinct empty states.
- New deterministic parser `src/lib/hintCoordinate.ts`:
  `extractHintCoordinate(text, boardSize)` matches `(x, y)` strictly and
  returns `null` for direction words or out-of-range values — no
  natural-language guessing.
- Hint highlight in `BoardHighlight` rendered as a small **outlined** ring
  (`r * 0.4`, no fill), visually distinct from the filled green/red
  correct/wrong overlays.
- `ProblemPlayer` only emits hint markers for **currently revealed** hints
  whose text contains a parseable in-range `(x, y)`. Future hint
  coordinates and direction-only hints never appear on the board. Hint
  markers are suppressed once a correct/wrong overlay or `showAnswer` is
  active so they can never overlap.
- Files: `src/lib/hintCoordinate.ts`, `src/components/board/BoardHighlight.tsx`,
  `src/components/problem/HintPanel.tsx`, `src/components/problem/ProblemPlayer.tsx`,
  `src/app/globals.css`, `src/__tests__/hintCoordinate.test.ts`,
  `src/__tests__/HintPanel.test.tsx`.

---

## 4. Backward Compatibility

- All 65 problems unchanged (counts, IDs, answers, hints, success/failure copy).
- Problem schema unchanged; `validateAllProblems` still passes.
- Single-step and multi-step `ProblemPlayer` flows behave the same on
  correct / wrong / hint paths; v0.6 only adds presentation layers.
- Spaced review scheduling, wrong book transitions, daily practice star
  rules, and weekly report aggregation all unchanged.
- localStorage progress format unchanged; existing progress merges cleanly.
- Supabase server mode unchanged; missing Supabase env still does not break
  local anonymous mode.
- Audio defaults to **enabled** but can be turned off in `/settings`;
  preference persists across refresh.

---

## 5. Known Limitations

- **Deterministic-only hint coordinate parsing.** Board hint markers only
  appear for hints whose text contains an in-range `(x, y)` pair. Hints
  that describe a region in natural language (e.g. 上面, 左边, 中间, 角)
  intentionally produce **no** board indicator — the card text remains
  the only signal. This is by design to avoid fragile NLP guessing on
  child-facing copy.
- **Audio is Web Audio tone-based, not sample-based.** No audio files are
  shipped. On browsers without `AudioContext` (or with autoplay blocked
  before first interaction) audio is silently a no-op.
- **Celebration is correct-answer only.** There is no wrong-answer
  animation, no end-of-session celebration, and no per-streak bonus
  animation.
- **No new content.** v0.6 does not add problems, categories, or levels;
  the v0.5 content limitations still apply (4 endgame problems, level 2
  dominance, 9×9 only, multi-step capped at 2 steps).
- **No light/dark mode toggle.** v0.6 keeps the existing single visual
  theme; new UI inherits it.

---

## 6. Validation Status

| Check                | Result                                          |
|----------------------|-------------------------------------------------|
| `npm run test`       | 299 passed (20 files) on `main` at `ac94ffb`    |
| `npm run build`      | Compiled successfully across v0.6.0b–e PRs      |
| `package.json`       | Unchanged across v0.6                           |
| `package-lock.json`  | Unchanged across v0.6                           |
| Problem data         | Unchanged (65 problems, 6 categories)           |
| Schema               | Unchanged                                       |
| Supabase / SQL       | Unchanged                                       |

Per-slice validation is recorded in each merged PR and in `docs/TASKS.md`.

This stabilization PR itself is documentation-only and does not change any
code, test, config, package, or behavior file, so it does not re-run
`npm run test` / `npm run build`; the numbers above were captured against
`main` after v0.6.0e merged.

For acceptance testing against this release, see
`docs/QA_CHECKLIST_v0.6.md`.

---

## 7. Next Phase Recommendation

The next slice should be a **planning-only `v0.7.0a` task** that picks a
single direction. v0.6 closes out the UX polish theme cleanly, so the next
phase should not silently continue UX work.

Short comparison of candidate directions for v0.7:

| Direction                                      | User impact | Effort  | Risk | Notes |
|------------------------------------------------|-------------|---------|------|-------|
| A. Content balancing (more endgame / opening / level 4–5) | High for daily variety | 2–3 slices | Low  | Continues proven v0.4/v0.5 pattern; addresses documented level-2 dominance and thin endgame. |
| B. Deeper multi-step (3+ step problems, opening/endgame multi-step) | High pedagogically | 3–5 slices | Medium | Touches schema + UI + content; harder to author. |
| C. Infrastructure / E2E / CI hardening          | None user-facing | 1–2 slices | Low | Playwright smoke, CI polish, pre-commit; safe but invisible. |
| D. Deployment / Supabase env hardening          | None user-facing | 1 slice | Low | Docker compose polish, env validation; limited audience. |

**Recommended primary direction for v0.7.0a planning:** A (content
balancing). Rationale:

- v0.5 release notes already flagged endgame thinness, opening at 5 with
  no level 5, and level 2 dominance — these gaps directly affect daily
  practice quality.
- Content expansion is a low-risk, well-rehearsed pattern in this repo
  (v0.4 and v0.5 both shipped cleanly under it).
- v0.6 has shown the UX is now polished enough that more content will be
  rewarding to play, not just listed.

C (infrastructure) is the recommended **secondary** candidate if v0.7.0a
planning concludes the content gap is not yet pressing.

`v0.7.0a` itself should be docs-only: a `NEXT_PHASE_PLAN_v0.7.md` that
chooses one direction, defines 2–4 slices, and lists explicit non-goals.
It must **not** start implementation.

---

## 8. Release Decision Template

```text
Release: v0.6
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.6 stabilization
[ ] Not approved — see notes

Notes:
```
