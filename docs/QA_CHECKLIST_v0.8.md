# QA Checklist — v0.8 Content Wiring

> Project: 小棋童围棋闯关
> Version target: v0.8
> Purpose: manual acceptance checklist for the v0.8 content-wiring series
> (v0.8.0a planning, v0.8.0b capture/escape/connect_cut wiring,
> v0.8.0c life_death/endgame/opening wiring, v0.8.0d multi-step wiring).

See `docs/RELEASE_NOTES_v0.8.md` for the per-slice summary, final chapter
inventory, known limitations, and next-phase recommendation. This checklist
focuses on manual acceptance only.

---

# 1. Scope Confirmation

Before QA, confirm v0.8 scope:

- [ ] 53 previously unwired problems are now wired into chapters
      (21 in v0.8.0b, 23 in v0.8.0c, 9 in v0.8.0d).
- [ ] All 77 problems are reachable via chapters and daily practice.
- [ ] No new problems were added — `src/data/problems.json` is unchanged.
- [ ] v0.6 UX polish (labels, celebration, audio, hints) still works.
- [ ] v0.7 content (12 new problems) still loads correctly.

Confirm **not** included in v0.8:

- [ ] No problem data changes (`src/data/problems.json` untouched).
- [ ] No problem schema changes.
- [ ] No answer validation changes.
- [ ] No `practice.ts` changes (daily practice picks up wired problems
      automatically via `getAllProblemIds()`).
- [ ] No ProblemPlayer / runtime UI changes.
- [ ] No spaced review scheduling changes.
- [ ] No weekly report aggregation changes.
- [ ] No `package.json` / `package-lock.json` changes.
- [ ] No SQL / Supabase / RLS changes.
- [ ] No authentication, payment, teacher/admin, leaderboard, board-size,
      SGF import/export, multiplayer, or AI-generated content.
- [ ] No redesign or layout overhaul.

---

# 2. Environment Check

- [ ] Node version matches `.nvmrc` / `package.json` `engines`.
- [ ] `.env.local` is **not** required for this QA pass.
- [ ] Missing `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      does not block any v0.8 behavior.

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

# 5. Chapter Map — All Expected Chapters Present

- [ ] `/levels` renders a chapter map with 6 chapters:
  - [ ] 吃子小岛 (capture, 🏝️)
  - [ ] 逃跑森林 (escape, 🌲)
  - [ ] 连接桥 (connect_cut, 🌉)
  - [ ] 布局城堡 (opening, 🏰)
  - [ ] 死活山洞 (life_death, 🏯) — **new in v0.8.0c**
  - [ ] 官子山谷 (endgame, 🌄) — **new in v0.8.0c**

---

# 6. Chapter Flow — Capture (吃子小岛)

New wired levels (v0.8.0b + v0.8.0d):

- [ ] Level 6 (capture-6): CAP-011, CAP-012 loads and plays correctly.
- [ ] Level 7 (capture-7): CAP-013, CAP-014 loads and plays correctly.
- [ ] Level 8 (capture-8): CAP-018 loads and plays correctly.
- [ ] Level 9 (capture-9): CAP-015, CAP-016, CAP-017 loads and plays.
- [ ] Level 10 (capture-10): MULTI-001, MULTI-004, MULTI-005 loads and
      plays (multi-step regression — see section 11).

---

# 7. Chapter Flow — Escape (逃跑森林)

New wired levels (v0.8.0b + v0.8.0d):

- [ ] Level 4 (escape-4): ESC-006, ESC-007, ESC-008 loads and plays.
- [ ] Level 5 (escape-5): ESC-011 loads and plays correctly.
- [ ] Level 6 (escape-6): ESC-009, ESC-010 loads and plays correctly.
- [ ] Level 7 (escape-7): MULTI-009 loads and plays (multi-step).

---

# 8. Chapter Flow — Connect/Cut (连接桥)

New wired levels (v0.8.0b + v0.8.0d):

- [ ] Level 4 (connect-cut-4): CC-007, CC-008, CC-011 loads and plays.
- [ ] Level 5 (connect-cut-5): CC-009, CC-014 loads and plays.
- [ ] Level 6 (connect-cut-6): CC-012, CC-013 loads and plays.
- [ ] Level 7 (connect-cut-7): MULTI-003, MULTI-008 loads and plays
      (multi-step).

---

# 9. Chapter Flow — Opening (布局城堡)

New wired levels (v0.8.0c):

- [ ] Level 3 (opening-3): OP-004, OP-007, OP-008 loads and plays.
- [ ] Level 4 (opening-4): OP-005, OP-009, OP-006 loads and plays.

---

# 10. Chapter Flow — Life/Death (死活山洞) — New Chapter

New chapter created in v0.8.0c, extended in v0.8.0d:

- [ ] Level 1 (life-death-1): LD-001, LD-002, LD-007 loads and plays.
- [ ] Level 2 (life-death-2): LD-003, LD-004, LD-006 loads and plays.
- [ ] Level 3 (life-death-3): LD-010 loads and plays correctly.
- [ ] Level 4 (life-death-4): LD-008, LD-009 loads and plays.
- [ ] Level 5 (life-death-5): MULTI-002, MULTI-006, MULTI-007 loads and
      plays (multi-step).

---

# 11. Chapter Flow — Endgame (官子山谷) — New Chapter

New chapter created in v0.8.0c:

- [ ] Level 1 (endgame-1): END-001, END-002, END-004 loads and plays.
- [ ] Level 2 (endgame-2): END-005, END-003, END-006 loads and plays.
- [ ] Level 3 (endgame-3): END-007, END-008 loads and plays.

---

# 12. Multi-Step Regression (in All Relevant Chapters)

For multi-step problems now wired in chapters:

- [ ] Step indicator shows current / total steps.
- [ ] Correct tap advances to next step; board state updates correctly.
- [ ] Wrong tap shows step-specific failure message.
- [ ] Each step has independent hints.
- [ ] Final correct step shows explanation + success message.
- [ ] All 9 multi-step problems load from their chapter level:
  - [ ] MULTI-001, MULTI-004, MULTI-005 (capture-10)
  - [ ] MULTI-002, MULTI-006, MULTI-007 (life-death-5)
  - [ ] MULTI-003, MULTI-008 (connect-cut-7)
  - [ ] MULTI-009 (escape-7)

---

# 13. Practice Flow Smoke

- [ ] Correct first tap → success feedback, +1 star (first time only),
      next problem advances.
- [ ] Wrong tap → warm failure message; problem stays on board.
- [ ] After 2 wrong taps → correct answer is revealed.
- [ ] Hints reveal one card at a time when "显示提示" is tapped.
- [ ] Daily practice completion gives +5 once per day (not duplicated).
- [ ] Daily practice can select from the expanded wired pool (all 77
      problems are eligible candidates via `getAllProblemIds()`).

---

# 14. v0.6 Polish Regression — Chinese Board Coordinate Labels

- [ ] Top edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Bottom edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Left edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Right edge shows 一 二 三 四 五 六 七 八 九.
- [ ] Labels do **not** overlap stones, grid lines, or hint markers.

---

# 15. v0.6 Polish Regression — Correct-Answer Celebration

- [ ] Correct answer triggers a sparkle/star animation overlay.
- [ ] Animation auto-dismisses after ~1.5s.
- [ ] Animation does **not** appear on wrong answers.
- [ ] Animation does **not** block tapping "下一题" or "继续".

---

# 16. v0.6 Polish Regression — Audio Feedback

- [ ] `/settings` → "声音设置" toggle is on by default.
- [ ] Correct answer plays a short positive tone.
- [ ] Wrong answer plays a short distinct tone.
- [ ] Turning the toggle off silences both tones.
- [ ] Refreshing after toggle-off preserves the off state.

---

# 17. v0.6 Polish Regression — Hint Presentation

- [ ] Hints reveal one card at a time with numbered badges.
- [ ] Each revealed card has a 💡 icon and visible/total counter.
- [ ] Once all hints are visible, "显示提示" button is hidden.
- [ ] Deterministic `(x, y)` hints show a small outlined ring on the
      board; directional-only hints show cards but no ring.
- [ ] On correct answer, hint rings are hidden (green overlay shown).
- [ ] On wrong answer, hint rings are hidden (red overlay shown).

---

# 18. v0.7 Content Regression

New v0.7 problems are now wired and reachable in chapters:

- [ ] END-005~008 load correctly from endgame chapter.
- [ ] OP-006~009 load correctly from opening chapter.
- [ ] CAP-018 loads correctly from capture chapter.
- [ ] ESC-011 loads correctly from escape chapter.
- [ ] CC-014 loads correctly from connect_cut chapter.
- [ ] LD-010 loads correctly from life_death chapter.

---

# 19. Wrong Book Regression (`/wrong-book`)

- [ ] Wrong-book entry is created after a real wrong answer in
      `/practice` or level/chapter (not from `/demo`).
- [ ] Reviewing the entry correctly transitions `active → reviewing`.
- [ ] A second correct review transitions `reviewing → mastered`.
- [ ] Mastered entries no longer appear in the active wrong book.

---

# 20. Report Regression (`/report`)

- [ ] Report loads without error in local mode.
- [ ] Star total, attempts, accuracy, first-try accuracy, and category
      progress all render consistently.
- [ ] Weekly overview card appears when the current week has activity.

---

# 21. Spaced Review Smoke Check

- [ ] Completing a problem updates its review schedule entry.
- [ ] Failed problems schedule sooner than clean-success ones.
- [ ] Due problems still surface in `/practice` selection.

---

# 22. Build / Test Smoke Check

- [ ] `npm run test` passes on `main` at the v0.8 stabilization commit
      (expected: 326 tests / 21 files, matching the release notes).
- [ ] `npm run build` compiles without TypeScript errors.
- [ ] No new dependency was added (verify `package.json` and
      `package-lock.json` are unchanged versus the start of v0.8).

This stabilization PR itself is documentation-only; the test / build
numbers above are the values captured against `main` after v0.8.0d
(PR #101) merged.

---

# 23. Mobile / Viewport Sanity

- [ ] App is usable on a common phone viewport (≈ 360–414 CSS px wide).
- [ ] Board, labels, hint cards, and celebration overlay all render
      without horizontal scroll.
- [ ] Settings audio toggle is reachable and tappable on mobile.

---

# 24. Release Decision Template

```text
Release: v0.8
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.8 stabilization
[ ] Not approved — see notes

Notes:
```

---

# 25. v0.8 Completion Criteria

v0.8 is considered stabilized only when:

- sections 3–21 of this checklist pass on `main` at the stabilization
  commit;
- `npm run test` and `npm run build` pass (section 22);
- all v0.8 known limitations in `docs/RELEASE_NOTES_v0.8.md` section 6
  are accepted as documented;
- no AI / payment / teacher / admin / leaderboard / multiplayer /
  board-size / SGF / schema / problem-data work was introduced;
- the next task (`v0.9.0a` planning) is opened separately and does
  **not** include implementation.
