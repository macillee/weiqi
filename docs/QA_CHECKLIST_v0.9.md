# QA Checklist — v0.9 Infrastructure / E2E / CI Hardening

> Project: 小棋童围棋闯关
> Version target: v0.9
> Purpose: manual acceptance + CI validation checklist for the v0.9
> infrastructure series (v0.9.0a planning, v0.9.0b CI setup, v0.9.0c E2E
> smoke tests, v0.9.0d stabilization).

See `docs/RELEASE_NOTES_v0.9.md` for the per-slice summary, CI/E2E
inventory, known limitations, and next-phase recommendation. This
checklist focuses on acceptance validation.

---

# 1. Scope Confirmation

Before QA, confirm v0.9 scope:

- [ ] CI workflow exists (`.github/workflows/ci.yml`) and runs on
      push/PR to `main`.
- [ ] CI gates: lint, typecheck, unit tests, build, E2E.
- [ ] Playwright E2E test suite exists (6 tests, `npm run test:e2e`).
- [ ] E2E covers: home, `/levels`, `/levels/capture`, `/demo`,
      `/practice`, `/settings`.
- [ ] E2E does not require Supabase env, login, or child profile.
- [ ] All pre-existing lint and typecheck errors were resolved (PR #109).

Confirm **not** included in v0.9:

- [ ] No problem schema changes.
- [ ] No runtime UI behavior changes.
- [ ] No `src/lib/chapters.ts` or `src/lib/practice.ts` changes.
- [ ] No problem data changes (`src/data/problems.json` untouched).
- [ ] No SQL / Supabase / RLS changes.
- [ ] No authentication, payment, teacher/admin, leaderboard, board-size,
      SGF import/export, multiplayer, or AI-generated content.
- [ ] No redesign or layout overhaul.

---

# 2. CI Gate Validation

Run or verify from CI output:

- [ ] `npm run lint` exits 0.
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run test` exits 0 (326 tests, 21 files).
- [ ] `npm run build` compiles successfully.
- [ ] `npm run test:e2e` exits 0 (6 tests).

CI failure behavior:

- [ ] CI workflow runs on every push to `main`.
- [ ] CI workflow runs on every PR to `main`.
- [ ] All gates must pass for CI to be green.
- [ ] Playwright traces are uploaded on E2E failure.
- [ ] CI is visible in the PR check list (required status check).

---

# 3. Local Validation Commands

Run these locally to verify v0.9 setup:

- [ ] `npm run lint` — no errors.
- [ ] `npm run typecheck` — no errors.
- [ ] `npm run test` — 326 passed (21 files).
- [ ] `npm run build` — compiled successfully.
- [ ] `npm run test:e2e` — 6 passed (Chromium, ~3–4s).

Note: `npm run test:e2e` requires the Next.js dev server or standalone
server running on port 3100, or the Playwright webServer config must be
able to build/start the standalone server.

---

# 4. Local Anonymous Mode (No Supabase Env)

With no Supabase env configured:

- [ ] Home page loads.
- [ ] `/practice`, `/levels`, `/wrong-book`, `/report`, `/settings`,
      `/demo` all load without errors.
- [ ] No "云端" or sync error toast appears in the local-only flow.
- [ ] No login-required redirect occurs.

---

# 5. E2E Smoke — Home

Run `npx playwright test e2e/home.spec.ts` or verified via full suite:

- [ ] Home page renders with h1 containing "欢迎回来，小棋手！"
- [ ] Navigation links present: 今日练习, 闯关地图, 错题本, 学习报告

---

# 6. E2E Smoke — Levels (`/levels`)

- [ ] `/levels` renders heading "闯关地图".
- [ ] All 6 chapter titles visible: 吃子小岛, 逃跑森林, 连接桥,
      布局城堡, 死活山洞, 官子山谷.

---

# 7. E2E Smoke — Chapter (`/levels/capture`)

- [ ] `/levels/capture` renders chapter title "吃子小岛".
- [ ] Description "学会吃掉对方的棋子" visible.
- [ ] Level entries visible (第 1 关 through 第 10 关).
- [ ] Back link "← 返回闯关地图" visible.

---

# 8. E2E Smoke — Demo (`/demo`)

- [ ] `/demo` renders problem ID buttons (e.g. CAP-001, ESC-001).
- [ ] Board SVG is rendered (accessible role "img" with label "9x9 Go board").
- [ ] "显示提示" button visible.
- [ ] "/demo" does not write learning progress (verify via `/report`
      no star/attempt increase).

---

# 9. E2E Smoke — Practice (`/practice`)

- [ ] `/practice` renders heading "今日练习".
- [ ] Description "每天练一练，棋力天天涨！" visible.
- [ ] "开始练习" button visible.
- [ ] Page works without Supabase env.

---

# 10. E2E Smoke — Settings (`/settings`)

- [ ] `/settings` renders heading "设置".
- [ ] "声音设置" section header visible.
- [ ] Audio toggle (role="switch") visible and defaults to checked (on).
- [ ] Page does not require authentication.

---

# 11. v0.8 Wiring Regression

- [ ] All 6 chapters are navigable from `/levels`.
- [ ] Capture, escape, connect_cut, opening, life_death, endgame
      chapter pages load level entries.
- [ ] Multi-step problems appear in their respective chapter levels.
- [ ] `/practice` (daily practice) selects from the full 77-problem pool.

---

# 12. v0.7 Content Regression

- [ ] END-005~END-008 (endgame) load via `/demo` or chapter flow.
- [ ] OP-006~OP-009 (opening) load correctly.
- [ ] CAP-018, ESC-011, CC-014, LD-010 load correctly.

---

# 13. v0.6 Polish Regression

- [ ] Chinese coordinate labels visible on board (一 through 九 on all 4 sides).
- [ ] Correct-answer star celebration animation triggers on correct tap.
- [ ] Audio toggle persists across page refresh.
- [ ] Progressive hint cards render with numbered badges and fade-in.
- [ ] Hint board markers display as outlined rings (distinct from correct/wrong).

---

# 14. Wrong Book / Report / Spaced Review Smoke

- [ ] `/wrong-book` loads correctly in local mode.
- [ ] `/report` loads correctly in local mode.
- [ ] Completing a practice problem updates review schedule.
- [ ] Due problems surface in `/practice` selection.

---

# 15. Release Decision Checklist

```text
Release: v0.9
Date:
Tester:
Environment:

CI gates pass (lint/typecheck/test/build/e2e): yes/no
E2E suite passes (6 tests): yes/no
Local anonymous mode functional: yes/no
Known limitations accepted: yes/no
No out-of-scope features introduced: yes/no

Decision:
[ ] Approved for v0.9 stabilization
[ ] Not approved — see notes

Notes:
```

---

# 16. v0.9 Completion Criteria

v0.9 is considered stabilized only when:

- sections 2–14 of this checklist pass on `main` at the stabilization
  commit;
- CI gates (lint, typecheck, test, build, e2e) all pass;
- all v0.9 known limitations in `docs/RELEASE_NOTES_v0.9.md` section 9
  are accepted as documented;
- no AI / payment / teacher / admin / leaderboard / multiplayer /
  board-size / SGF / schema work was introduced;
- the next task (`v0.10.0a` planning) is opened separately and does
  **not** include implementation.
