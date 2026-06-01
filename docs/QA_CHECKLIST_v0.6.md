# QA Checklist — v0.6 UX Polish

> Project: 小棋童围棋闯关
> Version target: v0.6
> Purpose: manual acceptance checklist for the v0.6 UX polish series
> (v0.6.0a planning, v0.6.0b labels, v0.6.0c celebration, v0.6.0d audio,
> v0.6.0e hint presentation).

See `docs/RELEASE_NOTES_v0.6.md` for the per-slice summary, known
limitations, and next-phase recommendation. This checklist focuses on
manual acceptance only.

---

# 1. Scope Confirmation

Before QA, confirm v0.6 scope:

- [ ] Chinese board coordinate labels added (v0.6.0b).
- [ ] Correct-answer celebration animation added (v0.6.0c).
- [ ] Toggleable answer audio added (v0.6.0d), default = enabled, persists
      across refresh.
- [ ] Progressive hint cards + deterministic `(x, y)` board hint markers
      added (v0.6.0e).
- [ ] v0.5 learning loop (practice, level/chapter, wrong book, report,
      spaced review, weekly report) still works.

Confirm **not** included in v0.6:

- [ ] No new problems / no problem data edits.
- [ ] No problem schema changes.
- [ ] No answer validation changes.
- [ ] No spaced review scheduling changes.
- [ ] No weekly report aggregation changes.
- [ ] No `package.json` / `package-lock.json` changes.
- [ ] No SQL / Supabase / RLS changes.
- [ ] No authentication, payment, teacher/admin, leaderboard, board-size,
      SGF import/export, multiplayer, or AI-generated content.
- [ ] No redesign or layout overhaul.

---

# 2. Environment Check

- [ ] Node version matches `.nvmrc` / `package.json` `engines` (no upgrade
      attempted during QA).
- [ ] `.env.local` is **not** required for this QA pass.
- [ ] Missing `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      does not block any v0.6 polish behavior.
- [ ] `npm install` was not re-run (lockfile unchanged in v0.6).

---

# 3. Local Anonymous Mode (No Supabase Env)

With no Supabase env configured:

- [ ] Home page loads.
- [ ] `/practice`, `/levels`, `/wrong-book`, `/report`, `/settings`,
      `/demo` all load without errors.
- [ ] No "云端" or sync error toast appears in the local-only flow.
- [ ] No login-required redirect occurs.

---

# 4. Demo Route Isolation

- [ ] Open `/demo` and play through a problem (correct and wrong taps).
- [ ] Open `/report` — star total and attempts did **not** increase
      from the `/demo` interaction.
- [ ] Open `/wrong-book` — no new wrong-book entry was created by
      `/demo`.

---

# 5. Chinese Board Coordinate Labels (v0.6.0b)

- [ ] Top edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Bottom edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Left edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Right edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Labels do **not** overlap stones, grid lines, or hint markers.
- [ ] Labels remain visible on common mobile viewport widths.
- [ ] Labels appear in `/demo`, `/practice`, `/levels/[chapterId]`,
      and `/wrong-book` review.

---

# 6. Practice Flow (`/practice`)

Single-step problem:

- [ ] Correct first tap → success feedback, +1 star (first time only),
      next problem advances.
- [ ] Wrong tap → warm failure message; problem stays on board.
- [ ] After 2 wrong taps → correct answer is revealed (existing v0.1
      behavior unchanged).
- [ ] Hints reveal one card at a time when "显示提示" is tapped.
- [ ] Daily practice completion gives +5 once per day (not duplicated).

Multi-step problem (e.g. MULTI-001):

- [ ] Step indicator shows current / total.
- [ ] Correct tap advances to next step; board state updates.
- [ ] Wrong tap shows step-specific failure message.
- [ ] Each step has independent hints.
- [ ] Final correct step shows explanation + success message.

---

# 7. Level / Chapter Flow (`/levels` and `/levels/[chapterId]`)

- [ ] Level map renders with chapters and unlock/progress state.
- [ ] Entering a chapter shows its problem queue.
- [ ] Correct answer advances to next problem in chapter.
- [ ] Wrong answer shows failure message and stays on the problem.
- [ ] Hints reveal progressively (same behavior as `/practice`).
- [ ] Multi-step problems advance step-by-step inside chapters.

---

# 8. Correct-Answer Celebration (v0.6.0c)

- [ ] Correct answer triggers a sparkle/star animation overlay.
- [ ] Animation auto-dismisses after ~1.5s.
- [ ] Animation does **not** appear on wrong answers.
- [ ] Animation does **not** block tapping "下一题" or "继续".
- [ ] Animation works on `/practice`, level/chapter, and `/wrong-book`
      review.

---

# 9. Audio Feedback (v0.6.0d)

Default state on a fresh profile (or first visit on a clean browser):

- [ ] Open `/settings` → "声音设置" toggle is **on**.
- [ ] Correct answer in `/practice` plays a short positive tone.
- [ ] Wrong answer plays a short distinct tone.

Toggle off:

- [ ] Turn the "声音设置" switch off.
- [ ] Correct and wrong answers play **no** sound.
- [ ] Refresh the browser → toggle is still **off**.
- [ ] Answers still play no sound after refresh.

Toggle back on:

- [ ] Turn the switch back on.
- [ ] Refresh → toggle is **on**, sound plays again.

Edge / safety:

- [ ] Page does not crash if the browser blocks autoplay before the
      first user interaction (silent no-op is acceptable).
- [ ] Audio call never blocks advancing to the next problem.

---

# 10. Hint Presentation (v0.6.0e)

Card behavior in `HintPanel`:

- [ ] With hints unrevealed: panel shows the "显示提示" button.
- [ ] First tap on "显示提示" reveals the first hint card with a
      numbered badge (1), 💡 icon, and counter (e.g. `1 / 3`).
- [ ] Each subsequent tap reveals the next hint with a fade-in animation.
- [ ] Once all hints are visible, the "显示提示" button is hidden.
- [ ] A problem with **no** hints shows a distinct empty state
      (not the same as "hints exist but none revealed").

Board hint markers:

- [ ] When a revealed hint contains a deterministic in-range `(x, y)`,
      a small outlined ring appears at that intersection.
- [ ] The hint ring is visually **distinct** from the filled green
      correct ring and filled red wrong ring.
- [ ] Hints with **only** directional / natural-language text (e.g.
      上面, 左边, 中间, 角) reveal a card but produce **no** board ring.
- [ ] Future / not-yet-revealed hints do **not** show a board ring,
      even if their text contains `(x, y)`.

Overlap rules:

- [ ] On correct answer: the green correct overlay is shown; hint
      rings are hidden / overridden.
- [ ] On wrong answer: the red wrong overlay is shown; hint rings are
      hidden / overridden.
- [ ] On "显示答案" (showAnswer) state: hint rings are hidden.
- [ ] Returning to a fresh problem restores normal hint-ring behavior.

---

# 11. Wrong Book Regression (`/wrong-book`)

- [ ] Wrong-book entry is created after a real wrong answer in
      `/practice` or level/chapter (not from `/demo`).
- [ ] Reviewing the entry correctly transitions `active → reviewing`.
- [ ] A second correct review transitions `reviewing → mastered`.
- [ ] Mastered entries no longer appear in the active wrong book.
- [ ] A wrong answer on a `reviewing` / `mastered` entry returns it to
      `active`.
- [ ] Hint card behavior and board hint markers work inside wrong book
      review (same rules as section 10).

---

# 12. Report Regression (`/report`)

- [ ] Report loads without error in local mode.
- [ ] Star total, attempts, accuracy, first-try accuracy, and category
      progress all render consistently with recorded sessions.
- [ ] Strongest / weakest category is computed from first-try accuracy.
- [ ] Weekly overview card appears when the current week has activity
      and is hidden otherwise.
- [ ] Empty state renders for a brand-new browser profile.

---

# 13. Spaced Review Smoke Check

- [ ] Completing a problem updates its review schedule entry.
- [ ] Failed problems schedule sooner than clean-success ones (no exact
      day verification needed — relative ordering is enough).
- [ ] Repeated clean success progressively pushes the next review
      further out.
- [ ] Due problems still surface in `/practice` selection.

---

# 14. Build / Test Smoke Check

- [ ] `npm run test` passes on `main` at the v0.6 stabilization commit
      (expected: 299 tests / 20 files, matching the release notes).
- [ ] `npm run build` compiles without TypeScript errors.
- [ ] No new dependency was added (verify `package.json` and
      `package-lock.json` are unchanged versus the start of v0.6).

This stabilization PR itself is documentation-only; the test / build
numbers above are the values captured against `main` after v0.6.0e
(PR #80) merged.

---

# 15. Mobile / Viewport Sanity

- [ ] App is usable on a common phone viewport (≈ 360–414 CSS px wide).
- [ ] Board, labels, hint cards, and celebration overlay all render
      without horizontal scroll.
- [ ] Settings audio toggle is reachable and tappable on mobile.

---

# 16. Release Decision Template

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

---

# 17. v0.6 Completion Criteria

v0.6 is considered stabilized only when:

- sections 3–13 of this checklist pass on `main` at the stabilization
  commit;
- `npm run test` and `npm run build` pass (section 14);
- all v0.6 known limitations in `docs/RELEASE_NOTES_v0.6.md` section 5
  are accepted as documented;
- no AI / payment / teacher / admin / leaderboard / multiplayer /
  board-size / SGF / schema work was introduced;
- the next task (`v0.7.0a` planning) is opened separately and does
  **not** include implementation.
