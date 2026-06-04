# QA Checklist — v0.7 Content Balancing

> Project: 小棋童围棋闯关
> Version target: v0.7
> Purpose: manual acceptance checklist for the v0.7 content balancing series
> (v0.7.0a planning, v0.7.0b content pack, v0.7.0c validation, v0.7.0d
> stabilization).

See `docs/RELEASE_NOTES_v0.7.md` for the per-slice summary, final content
inventory, known limitations, and next-phase recommendation. This checklist
focuses on manual acceptance only.

---

# 1. Scope Confirmation

Before QA, confirm v0.7 scope:

- [ ] 12 new problems added (END-005~008, OP-006~009, CAP-018, ESC-011,
      CC-014, LD-010) — library is 77 total.
- [ ] v0.7.0c validation tests added and passing.
- [ ] v0.6 UX polish (labels, celebration, audio, hints) still works.

Confirm **not** included in v0.7:

- [ ] No problem schema changes.
- [ ] No runtime UI behavior changes.
- [ ] No answer validation changes.
- [ ] No spaced review scheduling changes.
- [ ] No weekly report aggregation changes.
- [ ] No `package.json` / `package-lock.json` changes.
- [ ] No SQL / Supabase / RLS changes.
- [ ] No `chapters.ts` changes (chapter wiring deferred).
- [ ] No daily practice rotation changes (deferred).
- [ ] No authentication, payment, teacher/admin, leaderboard, board-size,
      SGF import/export, multiplayer, or AI-generated content.
- [ ] No redesign or layout overhaul.

---

# 2. Environment Check

- [ ] Node version matches `.nvmrc` / `package.json` `engines`.
- [ ] `.env.local` is **not** required for this QA pass.
- [ ] Missing `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      does not block any v0.7 behavior.
- [ ] `npm install` was not re-run (lockfile unchanged in v0.7).

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

# 5. Practice Flow (`/practice`)

Single-step problem:

- [ ] Correct first tap → success feedback, +1 star (first time only),
      next problem advances.
- [ ] Wrong tap → warm failure message; problem stays on board.
- [ ] After 2 wrong taps → correct answer is revealed.
- [ ] Hints reveal one card at a time when "显示提示" is tapped.
- [ ] Daily practice completion gives +5 once per day (not duplicated).

Multi-step problem (e.g. MULTI-001):

- [ ] Step indicator shows current / total.
- [ ] Correct tap advances to next step; board state updates.
- [ ] Wrong tap shows step-specific failure message.
- [ ] Each step has independent hints.
- [ ] Final correct step shows explanation + success message.

---

# 6. Level / Chapter Flow (`/levels` and `/levels/[chapterId]`)

- [ ] Level map renders with chapters and unlock/progress state.
- [ ] Entering a chapter shows its problem queue.
- [ ] Correct answer advances to next problem in chapter.
- [ ] Wrong answer shows failure message and stays on the problem.
- [ ] Hints reveal progressively (same behavior as `/practice`).
- [ ] Multi-step problems advance step-by-step inside chapters.

---

# 7. v0.6 Polish Regression — Chinese Board Coordinate Labels

- [ ] Top edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Bottom edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Left edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Right edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Labels do **not** overlap stones, grid lines, or hint markers.
- [ ] Labels appear in `/demo`, `/practice`, `/levels/[chapterId]`,
      and `/wrong-book` review.

---

# 8. v0.6 Polish Regression — Correct-Answer Celebration

- [ ] Correct answer triggers a sparkle/star animation overlay.
- [ ] Animation auto-dismisses after ~1.5s.
- [ ] Animation does **not** appear on wrong answers.
- [ ] Animation does **not** block tapping "下一题" or "继续".
- [ ] Animation works on `/practice`, level/chapter, and `/wrong-book`
      review.

---

# 9. v0.6 Polish Regression — Audio Feedback

Default state:

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

# 10. v0.6 Polish Regression — Hint Presentation

Card behavior:

- [ ] With hints unrevealed: panel shows the "显示提示" button.
- [ ] First tap on "显示提示" reveals the first hint card with a
      numbered badge (1), 💡 icon, and counter (e.g. `1 / 3`).
- [ ] Each subsequent tap reveals the next hint with a fade-in animation.
- [ ] Once all hints are visible, the "显示提示" button is hidden.
- [ ] A problem with **no** hints shows a distinct empty state.

Board hint markers:

- [ ] When a revealed hint contains a deterministic in-range `(x, y)`,
      a small outlined ring appears at that intersection.
- [ ] The hint ring is visually **distinct** from the filled green
      correct ring and filled red wrong ring.
- [ ] Hints with **only** directional / natural-language text reveal a
      card but produce **no** board ring.
- [ ] Future / not-yet-revealed hints do **not** show a board ring.

Overlap rules:

- [ ] On correct answer: the green correct overlay is shown; hint
      rings are hidden.
- [ ] On wrong answer: the red wrong overlay is shown; hint rings are
      hidden.
- [ ] On "显示答案" (showAnswer) state: hint rings are hidden.

---

# 11. v0.7 Content Sanity

New endgame problems:

- [ ] END-005 (L2 edge endgame) is reachable via `/demo` and loads
      without error.
- [ ] END-006 (L3 corner endgame) is reachable via `/demo` and loads
      without error.
- [ ] END-007 (L4 center connect) is reachable; the answer (4,4)
      concept of joining two groups works as expected.
- [ ] END-008 (L5 center defend) is reachable; higher-level endgame
      example loads correctly.

New opening problems:

- [ ] OP-006 (L5 tengen) is reachable; answer (4,4) tengen concept
      displays correctly.
- [ ] OP-007 (L3 approach) is reachable; loads without error.
- [ ] OP-008 (L3 corner secure) is reachable; loads without error.
- [ ] OP-009 (L4 edge extension) is reachable; loads without error.

Level 3–5 rebalance:

- [ ] CAP-018 (L3 capture big group) loads and the single-step capture
      at (4,1) works conceptually.
- [ ] ESC-011 (L3 escape to center) loads without error.
- [ ] CC-014 (L3 cut) loads without error.
- [ ] LD-010 (L3 make first eye) loads without error.

---

# 12. Wrong Book Regression (`/wrong-book`)

- [ ] Wrong-book entry is created after a real wrong answer in
      `/practice` or level/chapter (not from `/demo`).
- [ ] Reviewing the entry correctly transitions `active → reviewing`.
- [ ] A second correct review transitions `reviewing → mastered`.
- [ ] Mastered entries no longer appear in the active wrong book.
- [ ] A wrong answer on a `reviewing` / `mastered` entry returns it to
      `active`.

---

# 13. Report Regression (`/report`)

- [ ] Report loads without error in local mode.
- [ ] Star total, attempts, accuracy, first-try accuracy, and category
      progress all render consistently with recorded sessions.
- [ ] Strongest / weakest category is computed from first-try accuracy.
- [ ] Weekly overview card appears when the current week has activity
      and is hidden otherwise.
- [ ] Empty state renders for a brand-new browser profile.

---

# 14. Spaced Review Smoke Check

- [ ] Completing a problem updates its review schedule entry.
- [ ] Failed problems schedule sooner than clean-success ones.
- [ ] Repeated clean success progressively pushes the next review
      further out.
- [ ] Due problems still surface in `/practice` selection.

---

# 15. Build / Test Smoke Check

- [ ] `npm run test` passes on `main` at the v0.7 stabilization commit
      (expected: 326 tests / 21 files, matching the release notes).
- [ ] `npm run build` compiles without TypeScript errors.
- [ ] No new dependency was added (verify `package.json` and
      `package-lock.json` are unchanged versus the start of v0.7).

This stabilization PR itself is documentation-only; the test / build
numbers above are the values captured against `main` after v0.7.0c
(PR #91) merged.

---

# 16. Mobile / Viewport Sanity

- [ ] App is usable on a common phone viewport (≈ 360–414 CSS px wide).
- [ ] Board, labels, hint cards, and celebration overlay all render
      without horizontal scroll.
- [ ] Settings audio toggle is reachable and tappable on mobile.

---

# 17. Release Decision Template

```text
Release: v0.7
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.7 stabilization
[ ] Not approved — see notes

Notes:
```

---

# 18. v0.7 Completion Criteria

v0.7 is considered stabilized only when:

- sections 3–14 of this checklist pass on `main` at the stabilization
  commit;
- `npm run test` and `npm run build` pass (section 15);
- all v0.7 known limitations in `docs/RELEASE_NOTES_v0.7.md` section 6
  are accepted as documented;
- no AI / payment / teacher / admin / leaderboard / multiplayer /
  board-size / SGF / schema work was introduced;
- the next task (`v0.8.0a` planning) is opened separately and does
  **not** include implementation.
