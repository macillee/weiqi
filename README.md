# 小棋童围棋闯关

> Children-friendly Go (Weiqi) problem-solving web app.
> 本仓库另有 [English version](README.en.md)。

面向学棋约 1 年儿童（7–9 岁）的网页版围棋训练软件。聚焦**短时、专注、可验证**的儿童做题训练体验，不是完整的围棋对弈平台。

## 当前进度（截至 v0.6.0c）

- **题库**：65 道题（56 单步 + 9 多步），覆盖 6 个分类、5 个难度等级
  - 分类：吃子 (20)、连接/切断 (14)、逃子 (11)、死活 (11)、布局 (5)、官子 (4)
  - 等级：1 (10) / 2 (32) / 3 (13) / 4 (5) / 5 (5)
- **核心功能**：今日练习、闯关模式、错题本、星星奖励、学习报告
- **进阶学习**：多步题、分级复习间隔（Spaced Review）、家长周报
- **账号同步（可选）**：邮箱注册登录、孩子档案、服务端进度、localStorage → 云端导入
- **UX 优化**：9 路 SVG 棋盘、棋盘中文坐标（一～九）、答对星星粒子动画
- **测试**：`npm run test` 通过 258 个测试（17 个测试文件）
- **构建**：`npm run build` 通过；`docker compose up --build` 可在本地一键运行

下一阶段：v0.6.0d **答题音效反馈**（可在设置中关闭）。

## 项目目标

通过 9 路围棋闯关题、每日练习、错题复习、星星奖励和学习报告，帮助儿童提升基础围棋能力。

第一版重点不是完整对弈平台，而是一个清晰、可验证、可持续迭代的儿童围棋做题训练系统。

## 已交付能力（精选）

- **9 路 SVG 棋盘**：自定义组件、点击交互、可点击空交叉点、坐标标签、答对粒子动画
- **题目系统**：单步题 + 多步题（每步独立提示、答错反馈、棋盘状态切换）
- **练习模式**：今日练习（按等级/复习混合选题）、闯关地图（按章节/关卡组织）
- **进度系统**：localStorage 持久化、星星奖励（首次答对 +1、完成今日练习 +5）、错题本 active → reviewing → mastered 三态
- **分级复习**：按结果（失败/有错/有提示/完全正确）自动安排下次复习时间，最长 30 天
- **学习报告**：累计统计 + 当前周报（尝试数、正确率、提示使用、完成数、错题数、待复习数）
- **可选云端**（Supabase）：邮箱注册登录、孩子档案、服务端进度读写、本地进度一键导入
- **演示路由**：`/demo` 不写入真实学习进度，可安全试玩

## 暂不实现（明确范围之外）

- 在线对弈 / 多人对战
- AI 复盘 / AI 对手
- 老师 / 家长后台管理系统
- 支付 / 订阅
- 排行榜 / 社交
- 19 路棋盘 / 完整对局平台
- SGF 导入导出
- 多步题超过 2 步的产品化

## 技术栈

- **框架**：Next.js 16 App Router、React 19、TypeScript 5
- **样式**：Tailwind CSS 4
- **棋盘**：自研 SVG 组件（`src/components/board/GoBoard.tsx`）
- **状态**：localStorage 进度 + React state
- **测试**：Vitest + jsdom（17 个测试文件，258 个测试）
- **可选后端**：Supabase Cloud（仅在用户配置环境变量时启用）

## 运行环境

- 推荐：Node.js 22
- 最低：Node.js 20.19+
- Docker：`node:22-alpine`

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 质量校验
npm run lint
npm run typecheck
npm run test
npm run build
```

访问 `http://localhost:3000`。本地匿名模式无需任何环境变量，开箱即用。

## Docker 部署

```bash
# 开发模式（带热更新）
docker compose -f docker-compose.dev.yml up

# 生产形态本地运行
docker compose up --build
```

可选：在 `.env.local` 中配置 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 启用云端账号、孩子档案与进度同步。**未配置时不影响任何本地功能**。

## 项目结构（节选）

```text
src/
  app/                  Next.js App Router 页面
    page.tsx            首页（统计 + 入口）
    practice/           今日练习
    levels/             闯关地图 + 章节关卡
    wrong-book/         错题本
    report/             学习报告 + 周报
    settings/           设置（重置进度、退出登录）
    login/              登录 / 注册
    children/           孩子档案管理
    demo/               演示路由（不写入进度）
  components/
    board/              棋盘 SVG 组件
    problem/            题目播放器、反馈、提示、动画
    progress/           进度同步相关 UI
  lib/
    problems.ts         题目类型 + 验证
    progress.ts         localStorage 进度
    practice.ts         每日练习选题
    chapters.ts         章节/关卡
    report.ts           报告聚合
    weekly-report.ts    周报聚合
    spaced-review.ts    分级复习算法
    multi-step-problem.ts 多步题工具
    supabase/           可选云端（auth / child-profiles / server-progress）
  data/
    problems.json       本地题库（65 道）
docs/
  PROJECT_SPEC.md       产品规格
  DEVELOPMENT_GUIDE.md  开发指南
  TASKS.md              任务队列与里程碑
  QUALITY_CHECKLIST.md  质量检查清单
  RELEASE_NOTES_*.md    各版本发布说明
  NEXT_PHASE_PLAN_*.md  下一阶段规划
```

## 文档索引

- [项目规格](docs/PROJECT_SPEC.md)
- [开发指南](docs/DEVELOPMENT_GUIDE.md)
- [任务队列](docs/TASKS.md)
- [质量检查清单](docs/QUALITY_CHECKLIST.md)
- [opencode 任务计划](docs/agents/opencode-task-plan.md)
- [Codex Review 指南](docs/agents/codex-review-guidelines.md)
- 发布说明：`docs/RELEASE_NOTES_v0.1.md` / `v0.3.0.md` / `v0.4.md` / `v0.5.md`

## 推荐开发流程

```text
文档 → opencode 开发 → PR → Codex Review → 人工确认 → 合并
```

每个 PR 必须通过：

- `npm run lint`
- `npm run typecheck`
- `npm run test`（目前 258 个测试）
- `npm run build`
- 必要时 `docker compose up --build`

## 范围与纪律

- 保持 PR 小而专注，避免把基础设施、UI、业务逻辑、文档改动混在一起。
- 保持儿童面向的文案简短、温暖、具体。
- 任何超出 v0.6 范围（AI、支付、老师后台、19 路、完整对局等）的功能，必须先在 `docs/NEXT_PHASE_PLAN_*.md` 中规划，再单独排期。
- 在没有对应设计文档之前，不要静默引入大功能。

## 当前 Definition of Done

- 儿童可以在浏览器完成今日练习，错题进入错题本
- 棋盘点击无明显错误，答错答对反馈可靠
- 多步题能逐步推进，提示按步重置
- 错题本 active / reviewing / mastered 状态正确流转
- 周报能展示本周尝试数、正确率、提示数、完成数、错题数、待复习数
- localStorage 进度刷新后仍存在；可在设置中重置
- 邮箱登录、孩子档案、服务端进度同步可选启用；缺失环境变量不破坏任何功能
- README 与项目文档随版本持续更新
- Codex Review 未发现阻塞级问题
