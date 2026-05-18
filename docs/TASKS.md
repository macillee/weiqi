# Project Task Queue

> This file is the task entry point for opencode.  
> Always read `AGENTS.md`, `docs/PROJECT_SPEC.md`, and `docs/DEVELOPMENT_GUIDE.md` before implementing any task.

---

# Current Phase

v0.1 local-first MVP.

Current development strategy:

```text
1. Stable local Next.js + Docker foundation
2. SVG GoBoard component
3. Problem schema and sample data
4. ProblemPlayer single-question flow
5. Daily practice and levels
6. localStorage progress and wrong book
7. Learning report and polish
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
- 首页演示：9 路棋盘 + 点击记录 + 重置/禁用按钮

---

## Milestone 2: Problem Schema and Sample Problems

Status: completed.

Delivered:

- `src/lib/problems.ts` — Problem 类型 + 验证 + 加载工具
- `src/data/problems.json` — 9 道示例题目

---

## Milestone 3: ProblemPlayer Single-Question Flow

Status: completed.

Delivered:

- `src/components/problem/ProblemPlayer.tsx` — 题目播放器
- `src/components/problem/ProblemHeader.tsx` — 题目标题/分类/难度
- `src/components/problem/HintPanel.tsx` — 渐进式提示
- `src/components/problem/FeedbackDialog.tsx` — 答对/答错反馈
- `src/app/demo/page.tsx` — 题目演示路由

---

## Milestone 4: Levels and Daily Practice

Status: completed.

Delivered:

- `src/app/page.tsx` — 首页入口（今日练习、闯关地图、题目演示）
- `src/app/practice/page.tsx` — 今日练习页（选题 → 连续做题 → 总结）
- `src/app/levels/page.tsx` — 闯关地图页（章节列表）
- `src/app/levels/[chapterId]/page.tsx` — 章节关卡页（关卡列表 → 做题）
- `src/lib/chapters.ts` — 章节/关卡结构数据
- `src/lib/practice.ts` — 每日练习选题 + 会话管理
- `src/components/problem/ProblemPlayer.tsx` — 新增 `onResult` 回调

Acceptance:

- 首页可以进入今日练习
- 首页可以进入闯关地图
- 今日练习可以连续完成多题
- 练习完成后显示总结
- 闯关页至少能进入一个关卡并完成其中题目

---

# Next Task: Milestone 5 — Progress, Stars, Wrong Book

## Goal

Create the local learning loop.

## Scope

- localStorage progress.
- attempts record.
- wrong problem tracking.
- star rewards.
- wrong book route.
- wrong problem review.

---

# Upcoming Task: Milestone 6 — Report and Product Polish

## Goal

Make the app usable for real child/parent testing.

## Scope

- Learning report.
- Accuracy stats.
- category-level mastery summary.
- child-friendly UI polish.
- 100 total problems.

---

# Task Discipline

opencode must not skip ahead.

If a task reveals missing requirements:

1. document the gap;
2. propose a small change;
3. do not silently add large features;
4. keep the PR reviewable.
