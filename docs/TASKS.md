# Project Task Queue

> This file is the task entry point for opencode.  
> Always read `AGENTS.md`, `docs/PROJECT_SPEC.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/QUALITY_CHECKLIST.md`, and the relevant release/content/design notes before implementing any task.

---

# Current Phase

v0.2.1a Supabase foundation setup after v0.2 design approval.

Current strategy:

```text
1. Preserve the stable v0.1.3 local MVP
2. Keep the app Docker-deployable
3. Use Supabase Cloud as external managed backend in v0.2
4. Keep missing Supabase env from breaking local anonymous mode
5. Add foundation only before Auth UI / child profile / server progress
6. Avoid AI/payment/teacher/leaderboard scope creep
```

---

# Completed

## Milestone 0: Local Dev + Docker Runtime

Status: completed.

Acceptance:

- `npm run dev` works.
- `npm run build` works.
- `docker compose -f docker-compose.dev.yml up` works.
- `docker compose up --build` works.
- `http://localhost:3000` is reachable.

---

## Milestone 1: SVG GoBoard Component

Status: completed.

Delivered:

- `src/components/board/GoBoard.tsx` — SVG 棋盘主组件
- `src/components/board/Stone.tsx` — 棋子渲染
- `src/components/board/BoardHighlight.tsx` — 高亮标记
- `src/components/board/BoardPoint.tsx` — 可点击空交叉点
- `src/lib/board.ts` — 类型定义 + 工具函数

---

## Milestone 2: Problem Schema and Sample Problems

Status: completed.

Delivered:

- `src/lib/problems.ts` — Problem 类型 + 验证 + 加载工具
- `src/data/problems.json` — initial sample problem set
- Basic Go-logic validation for invalid initial board states

---

## Milestone 3: ProblemPlayer Single-Question Flow

Status: completed.

Delivered:

- `src/components/problem/ProblemPlayer.tsx` — 题目播放器
- `src/components/problem/ProblemHeader.tsx` — 题目标题/分类/难度
- `src/components/problem/HintPanel.tsx` — 渐进式提示
- `src/components/problem/FeedbackDialog.tsx` — 答对/答错反馈
- `src/app/demo/page.tsx` — 题目演示路由，does not write learning progress

---

## Milestone 4: Levels and Daily Practice

Status: completed.

Delivered:

- `src/app/page.tsx` — 首页入口
- `src/app/practice/page.tsx` — 今日练习页
- `src/app/levels/page.tsx` — 闯关地图页
- `src/app/levels/[chapterId]/page.tsx` — 章节关卡页
- `src/lib/chapters.ts` — 章节/关卡结构数据
- `src/lib/practice.ts` — 每日练习选题 + 会话管理

Acceptance:

- 首页可以进入今日练习
- 首页可以进入闯关地图
- 今日练习可以连续完成多题
- 练习完成后显示总结
- 闯关页至少能进入一个关卡并完成其中题目

---

## Milestone 5: Progress, Stars, Wrong Book

Status: completed.

Delivered:

- `src/lib/progress.ts` — localStorage 进度管理
- `src/app/wrong-book/page.tsx` — 错题本页面
- `src/app/page.tsx` — 首页显示星星数和待复习错题数
- `src/app/practice/page.tsx` — 集成进度记录、星星奖励
- `src/app/levels/[chapterId]/page.tsx` — 集成进度记录
- `src/app/demo/page.tsx` — **不写入**真实学习进度
- `src/components/problem/ProblemPlayer.tsx` — `onAttempt` 记录每次点击尝试，`onResult` 记录最终结果

Acceptance:

- localStorage key: `children-go-app:v0.1:progress`
- 做错题进入错题本
- 错题复习做对后状态更新（active → reviewing → mastered）
- 星星奖励不重复发放（首次答对 +1，完成每日练习 +5）
- mastered 错题不再显示在错题本
- 刷新页面后进度仍存在
- `/demo` 不污染学习进度

---

## Milestone 6: Report and Product Polish

Status: completed.

Delivered:

- `src/lib/report.ts` — 学习报告统计
- `src/app/report/page.tsx` — 学习报告页
- `src/app/page.tsx` — 首页新增学习报告入口
- `src/app/globals.css` — 样式调整
- `src/app/layout.tsx` — 元数据更新

Acceptance:

- 报告数据准确（正确率、首次做对率、星星、连续天数）
- 最强/最弱分类基于首次做对率计算
- 各分类进度条显示完成比例
- 无学习记录时显示引导页面
- UI 适合儿童使用

---

## v0.1 Release QA / Manual Acceptance

Status: completed by user testing with one small bug fixed and no other blocking issues reported.

References:

- `docs/QA_CHECKLIST_v0.1.md`
- `docs/RELEASE_NOTES_v0.1.md`

---

## v0.1.1 Stabilization

Status: completed.

Delivered:

- `vitest.config.ts` — Vitest configuration with jsdom environment
- `src/__tests__/board.test.ts` — Tests for board utility functions
- `src/__tests__/problems.test.ts` — Tests for problem validation
- `src/__tests__/progress.test.ts` — Tests for progress tracking, wrong problem transitions, and daily practice
- `src/__tests__/report.test.ts` — Tests for report statistics computation
- `src/__tests__/practice.test.ts` — Tests for practice session management
- `src/lib/progress.ts` — Added `resetProgress()` function
- `src/app/settings/page.tsx` — Settings page with progress reset confirmation
- `src/app/page.tsx` — Added subtle `设置` link at bottom of home page
- `package.json` — Added `npm run test` and `npm run test:watch` scripts
- `docs/CONTENT_REVIEW_v0.1.1.md` — Reviewed 24-problem content state

Acceptance:

- `npm run build` passes.
- `npm run test` passes.
- Docker validation is required only when Docker/dependency/build-config changed or before release/tag.
- Resetting local progress returns home, wrong book, and report to empty states.
- Existing v0.1.0 user flow remains intact.

---

## v0.1.2 Content Expansion

Status: completed.

Delivered:

- `src/data/problems.json` — expanded from 24 to 36 problems (+12)
- `docs/CONTENT_REVIEW_v0.1.2.md` — content review documentation
- `docs/CONTENT_PLAN_v0.1.2.md` — content expansion plan

New problems:

- `CAP-011` to `CAP-013` (capture, +3)
- `ESC-006` to `ESC-007` (escape, +2)
- `CC-007` to `CC-009` (connect_cut, +3)
- `LD-001` to `LD-004` (life_death, +4)

Acceptance:

- `src/data/problems.json` contains exactly 36 problems.
- All new problem IDs are unique.
- All new answer coordinates are empty points and inside the 9x9 board.
- No initial stone group has zero liberties.
- `validateAllProblems` passes.
- `docs/CONTENT_REVIEW_v0.1.2.md` is complete and matches `problems.json`.
- `npm run build` passes.
- `npm run test` passes.
- No v0.2 features are introduced.

---

## v0.1.3 Content Review / Product Polish

Status: completed.

Delivered:

- `src/__tests__/problems.test.ts` — strengthened problem data tests (36 count, v0.1.2 IDs, hints≥2, failureMessage tone, successMessage length)
- `src/data/problems.json` — copy polish for 8 problems (CAP-002, CAP-007, CAP-009, CAP-011, ESC-002, ESC-003, ESC-007, LD-002)
- `docs/PLAYTEST_v0.1.3.md` — adult smoke playtest session recorded
- `docs/ROADMAP_v0.2.md` — remains planning-only
- No v0.2 features introduced

Acceptance:

- `npm run build` passes.
- `npm run test` passes (66 tests).
- `docs/PLAYTEST_v0.1.3.md` has actual session record.
- `docs/ROADMAP_v0.2.md` exists and remains planning-only.
- Problem tests cover the 36-problem content state.
- Existing 36 problems still pass validation.
- No v0.2 features are introduced.

---

## v0.2 Design Documents

Status: approved.

Delivered:

- `docs/ROADMAP_v0.2.md` — v0.2 roadmap and account/sync direction
- `docs/SUPABASE_DESIGN_v0.2.md` — schema, RLS, client data layer, implementation phases, cloud-failure tolerance
- `docs/DATA_MIGRATION_v0.2.md` — localStorage import, merge, idempotency, failure handling
- `docs/QA_CHECKLIST_v0.2.md` — Auth, child profile, RLS, server progress, migration, regression QA
- `docs/DEPLOYMENT_STRATEGY_v0.2.md` — Docker app deployment with Supabase Cloud as external backend
- `docs/DESIGN_REVIEW_v0.2.md` — design review findings with severity ratings

Key decisions:

- App remains Docker-deployable.
- Supabase Cloud is external managed backend for v0.2.
- Full Supabase self-hosting is out of scope for v0.2.
- Missing Supabase env must not break local anonymous mode.
- Login remains optional during v0.2 transition.
- JSON remains the problem source in v0.2.
- Offline queue / retry is deferred to v0.2.x.
- First implementation task is split into v0.2.1a setup only and v0.2.1b Auth UI.

---

## v0.2.1a Supabase Foundation Setup

Status: completed.

Delivered:

- `@supabase/supabase-js` ^2.106.0 installed.
- `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `src/lib/supabase/client.ts` — `isSupabaseConfigured()`, `createSupabaseClient()` (reads env at call time for testability; returns `null` when env missing; never throws on import).
- `src/lib/supabase/auth.ts` — `useSupabaseAuth()` hook (reads session, listens to auth state changes, safe no-op when Supabase not configured).
- `src/lib/supabase/supabase-error.ts` — error classification (`network_error`, `server_error`, `auth_error`, `permission_error`, `unknown`).
- `src/__tests__/supabase-client.test.ts` — 11 tests covering missing-env behavior (isSupabaseConfigured, createSupabaseClient, import safety).
- `src/__tests__/supabase.test.ts` — 13 tests for error classification, sync messages, and recoverable error detection.
- `docs/REVIEW_NOTES_v0.2.1a.md` — review findings and Docker validation record.

Acceptance:

- `npm run build` passes.
- `npm run test` passes (91 tests).
- `docker compose up --build` passes.
- App works without Supabase env: home, daily practice, wrong book, report, settings remain usable.
- Supabase helper returns `null` or safe no-op when env is missing.
- No v0.2.1b+ features introduced.

---

# Next Task: v0.2.1b Auth UI

## Goal

Add login, logout, and session restore UI while keeping local anonymous mode working.

## References

- `docs/ROADMAP_v0.2.md`
- `docs/SUPABASE_DESIGN_v0.2.md`
- `docs/DEPLOYMENT_STRATEGY_v0.2.md`
- `docs/QA_CHECKLIST_v0.2.md`
- `docs/DEVELOPMENT_GUIDE.md`
- `docs/QUALITY_CHECKLIST.md`

## Scope

1. Add login page (`/login`):
   - Email + password form.
   - Input validation and error display.
   - Loading state during authentication.
   - Redirect to home after successful login.
2. Add sign-up support to the login page:
   - Toggle between sign-in and sign-up mode.
   - Confirm password field.
   - Basic validation (email format, password length).
3. Add logout UI:
   - Sign out button visible when authenticated.
   - Clears Supabase session.
   - Returns to home / local mode.
4. Session restore:
   - `useSupabaseAuth` already provides session state.
   - Show authenticated state in UI (e.g. email display).
   - Persist session across page refresh.
5. Keep local anonymous mode unchanged:
   - Unauthenticated users see the full v0.1 local flow.
   - Login is optional; no forced redirect.
   - Account-related UI is subtle (e.g., settings page link).

## Out of Scope

Do not implement in v0.2.1b:

- child profile UI
- database migrations
- server progress
- server wrong book
- server report
- localStorage import
- Supabase self-hosting Docker stack
- AI
- payment
- teacher/admin backend
- leaderboard
- 13x13 / 19x19 expansion

## Acceptance

- `npm run build` passes.
- `npm run test` passes.
- User can sign up with email + password.
- User can sign in with email + password.
- User can sign out.
- Session persists after refresh.
- Unauthenticated local mode still works fully.
- Missing Supabase env hides or disables auth UI gracefully.
- No v0.2.2+ features are introduced.

---

# Future Roadmap

## v0.2.2 — Child Profile

- Create/select child profile.
- Parent owns child data.
- RLS verified for child profile access.

## v0.2.3 — Server Progress

- Save attempts to Supabase.
- Save wrong problem state.
- Save progress summary.
- Report reads server mode.

## v0.2.4 — Local Import

- Detect local progress.
- Explicit import prompt.
- Idempotent import.
- Conflict handling.

## v0.3.0 — Learning Depth

- Multi-step problems.
- Spaced review scheduling.
- Parent weekly report.

---

# Task Discipline

opencode must not skip ahead.

If a task reveals missing requirements:

1. document the gap;
2. propose a small change;
3. do not silently add large features;
4. keep the PR reviewable.
