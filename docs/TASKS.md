# Project Task Queue

> This file is the task entry point for opencode.  
> Always read `AGENTS.md`, `docs/PROJECT_SPEC.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/QUALITY_CHECKLIST.md`, and the relevant release/content/design notes before implementing any task.

---

# Current Phase

v0.2 design review after v0.1.3 content review and product polish.

Current strategy:

```text
1. Preserve the stable v0.1.3 local MVP
2. Review account/sync design before coding
3. Keep v0.2 focused on parent account, child profile, server progress, and local import
4. Avoid AI/payment/teacher/leaderboard scope creep
5. Start implementation only after Supabase, migration, and QA docs are approved
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

Status: drafted, pending review.

Delivered:

- `docs/SUPABASE_DESIGN_v0.2.md` — schema, RLS, client data layer, implementation phases
- `docs/DATA_MIGRATION_v0.2.md` — localStorage import, merge, idempotency, failure handling
- `docs/QA_CHECKLIST_v0.2.md` — Auth, child profile, RLS, server progress, migration, regression QA

---

# Next Task: v0.2 Design Review

## Goal

Review and finalize v0.2 design before implementation.

## References

- `docs/ROADMAP_v0.2.md`
- `docs/SUPABASE_DESIGN_v0.2.md`
- `docs/DATA_MIGRATION_v0.2.md`
- `docs/QA_CHECKLIST_v0.2.md`
- `docs/DEVELOPMENT_GUIDE.md`
- `docs/QUALITY_CHECKLIST.md`

## Scope

1. Review database schema and table boundaries.
2. Review RLS policy approach.
3. Review localStorage import flow and conflict rules.
4. Review whether login remains optional during v0.2 transition.
5. Review whether JSON remains the problem source in v0.2.
6. Identify any missing QA cases before coding.
7. Update design docs based on review findings.
8. Prepare the first narrow implementation task only after design approval.

## Out of Scope

Do not implement during design review:

- Supabase dependency installation
- Auth UI
- Database migrations
- Server progress code
- Local import code
- AI
- Payment
- Teacher/admin backend
- Leaderboard
- 13x13 / 19x19 expansion

## Acceptance

- v0.2 design docs are reviewed.
- Open decisions are resolved or explicitly deferred.
- No implementation code is added.
- First implementation task is clearly scoped.

---

# Future Roadmap

## v0.2.1 — Auth Foundation

- Supabase dependency setup.
- Environment variable documentation.
- Login/logout.
- Session restore.
- Local mode still works.

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
