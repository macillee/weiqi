# 儿童围棋网页版学习软件项目文档

> 项目暂定名：小棋童围棋闯关  
> 当前版本：v0.1 MVP 规划文档  
> 目标读者：产品负责人、opencode 开发代理、Codex Review、后续维护者  
> 文档目标：明确产品边界、学习体系、页面结构、数据模型、开发任务与验收标准。

---

# 0. 文档使用说明

本项目文档用于指导一个面向儿童围棋训练的 Web App 开发。

建议在 GitHub 仓库中按如下结构保存：

```text
/docs
  PROJECT_SPEC.md
  /agents
    opencode-task-plan.md
    codex-review-guidelines.md
README.md
.github/
  pull_request_template.md
  ISSUE_TEMPLATE/
    feature_task.md
```

第一阶段先不要急着写大量代码。建议先把本文档提交到仓库，再让 opencode 按 milestone 小步开发，最后用 Codex Review 审查 PR。

---

# 1. 产品概述

## 1.1 产品定位

本产品是一个面向学棋约 1 年儿童的网页版围棋训练软件。

第一版核心不是完整围棋对弈平台，而是：

> 基于 9 路棋盘的儿童围棋闯关做题系统。

产品通过每日练习、闯关题、错题复习、星星奖励和家长学习报告，帮助儿童提升以下能力：

- 数气
- 吃子
- 逃子
- 连接
- 切断
- 基础死活
- 基础布局方向感

## 1.2 目标用户

### 儿童用户

年龄范围：6–10 岁。

棋力范围：

- 学棋 6–12 个月；
- 会基本规则；
- 能理解气、提子、打吃、连接、断点、眼；
- 可以完成简单 9 路棋题；
- 读棋和死活能力仍不稳定。

儿童用户核心需求：

- 题目短；
- 反馈快；
- 画面清楚；
- 不要太复杂；
- 有闯关和奖励；
- 每天练习时间控制在 5–15 分钟。

### 家长用户

家长核心需求：

- 知道孩子有没有练习；
- 知道孩子练得怎么样；
- 知道孩子哪里薄弱；
- 不希望孩子沉迷复杂游戏；
- 希望软件能形成学习闭环。

### 老师用户

老师端不是 v0.1 核心功能，但后续可以支持：

- 班级管理；
- 学生进度查看；
- 布置题目；
- 自建题库；
- 导入 SGF；
- 查看错题分布。

---

# 2. MVP 范围

## 2.1 v0.1 目标

v0.1 目标是做出一个可以真实给儿童试玩的最小可用产品。

核心目标：

> 儿童能打开网页，完成 9 路围棋题，获得反馈、星星、错题记录和简单学习报告。

## 2.2 v0.1 必须包含

- 9 路棋盘组件；
- 单步题展示；
- 点击落子；
- 答案判断；
- 答对/答错反馈；
- 提示功能；
- 闯关列表；
- 每日练习；
- 错题本；
- 星星奖励；
- localStorage 保存学习进度；
- 100 道左右基础题；
- 简单学习报告。

## 2.3 v0.1 暂不包含

以下功能不要进入第一版，避免范围失控：

- 人人在线对弈；
- AI 对弈；
- AI 复盘；
- 复杂多步死活题；
- 19 路棋盘；
- 老师后台；
- 支付系统；
- 视频课程；
- 排行榜；
- 复杂社交系统。

## 2.4 v0.1 技术边界

第一版优先使用：

- Next.js；
- React；
- TypeScript；
- Tailwind CSS；
- SVG 棋盘；
- 本地 JSON 题库；
- localStorage 存储进度。

后端、数据库、登录可以放到 v0.2。

---

# 3. 产品原则

## 3.1 儿童优先

所有交互和文案都应适合 6–10 岁儿童。

禁止使用过度抽象、成人化的术语。

推荐：

```text
白棋只剩一口气，黑棋应该下在哪里？
```

不推荐：

```text
请寻找当前局面中的最优战术手段。
```

## 3.2 每次练习短而有效

每日练习建议 8–10 道题。

单次练习时间控制在 5–15 分钟。

不要设计无限刷题或强刺激机制。

## 3.3 先训练基础能力

v0.1 不追求复杂布局和 AI 分析。

基础能力优先级：

1. 数气；
2. 吃子；
3. 逃子；
4. 连接；
5. 切断；
6. 基础死活；
7. 简单布局方向。

## 3.4 反馈必须温和

错误反馈不能打击孩子。

推荐：

```text
差一点！先数一数白棋还有几口气。
```

不推荐：

```text
错误。
```

## 3.5 第一版宁可简单，也要闭环

学习闭环优先级高于功能数量。

闭环应包括：

```text
做题 → 反馈 → 错题记录 → 复习 → 学习报告
```

---

# 4. 学习体系设计

## 4.1 能力模块

v0.1 包含以下学习模块：

| 模块 | 优先级 | 说明 |
|---|---:|---|
| 吃子 | P0 | 最容易建立成就感 |
| 逃子 | P0 | 训练防守意识 |
| 连接与切断 | P0 | 学棋一年儿童的重要能力 |
| 死活基础 | P0 | 训练眼形和关键点 |
| 布局基础 | P1 | 训练开局方向感 |
| 官子入门 | P2 | 第一版可少量包含或暂缓 |

## 4.2 吃子训练

题型：

- 找最后一口气；
- 直接提子；
- 打吃；
- 双打吃；
- 接不归；
- 简单征子；
- 简单枷吃。

儿童说明示例：

```text
白棋只剩一口气，黑棋能吃掉它吗？
```

能力目标：

- 会数对方的气；
- 会找到最后一口气；
- 知道什么时候可以直接提子；
- 初步理解一手棋可以攻击多个目标。

## 4.3 逃子训练

题型：

- 增加气；
- 连回自己的棋；
- 往外跑；
- 反打吃；
- 避免被征吃。

儿童说明示例：

```text
黑棋快被吃了，应该往哪里跑？
```

能力目标：

- 会数自己的气；
- 能发现危险；
- 会找增加气的方向；
- 能理解连接比乱跑更安全。

## 4.4 连接与切断

题型：

- 找断点；
- 补断点；
- 切断对方；
- 虎口连接；
- 边上渡过。

儿童说明示例：

```text
黑棋有一个断点，应该补在哪里？
```

能力目标：

- 知道自己的棋要连起来；
- 知道对方的棋可以切断；
- 初步理解棋形弱点。

## 4.5 死活基础

题型：

- 真眼假眼；
- 做一只眼；
- 做两只眼；
- 破眼；
- 简单扑；
- 简单点眼；
- 缩小眼位。

儿童说明示例：

```text
黑棋怎样才能做出两只眼？
```

能力目标：

- 能区分真眼和假眼；
- 知道两只眼才能活；
- 能找到做活关键点；
- 能找到破眼关键点。

## 4.6 布局基础

题型：

- 占角；
- 守角；
- 挂角；
- 拆边；
- 找大场；
- 避免小棋。

儿童说明示例：

```text
开局的时候，哪里比较大？
```

能力目标：

- 知道开局优先角、边、中央；
- 初步理解大场；
- 不在没有价值的位置乱下。

---

# 5. 题库规划

## 5.1 v0.1 题库数量

建议 v0.1 准备 100 道题：

| 模块 | 数量 |
|---|---:|
| 吃子 | 30 |
| 逃子 | 15 |
| 连接切断 | 20 |
| 死活基础 | 25 |
| 布局基础 | 10 |

后续 v0.2 扩展到 300–350 道题。

## 5.2 难度等级

每道题有 `level` 字段。

| Level | 说明 |
|---:|---|
| 1 | 单步直觉题，一眼可见 |
| 2 | 需要数气或找断点 |
| 3 | 需要读 1 步应对 |
| 4 | 需要读 2 步变化，v0.1 少量或不做 |
| 5 | 多变化综合题，v0.1 不做 |

v0.1 主要使用 Level 1–3。

## 5.3 题目标签

每道题可以有多个标签，用于错题统计和后续推荐。

推荐标签：

```text
capture
atari
liberty-counting
escape
connect
cut
tiger-mouth
life-and-death
true-eye
false-eye
make-eye
kill
opening
corner
side
big-point
```

## 5.4 题目 JSON Schema

v0.1 使用单步题 JSON。

```ts
type StoneColor = "black" | "white";

type Stone = {
  x: number; // 0-based
  y: number; // 0-based
  color: StoneColor;
};

type Point = {
  x: number;
  y: number;
};

type ProblemCategory =
  | "capture"
  | "escape"
  | "connect_cut"
  | "life_death"
  | "opening"
  | "endgame"
  | "mixed";

type Problem = {
  id: string;
  boardSize: 9 | 13 | 19;
  category: ProblemCategory;
  level: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  toPlay: StoneColor;
  title: string;
  description: string;
  initialStones: Stone[];
  answers: Point[];
  hints: string[];
  explanation: string;
  successMessage: string;
  failureMessage: string;
  wrongMoves?: Array<{
    x: number;
    y: number;
    message: string;
  }>;
};
```

## 5.5 示例题目

```json
{
  "id": "CAP-001",
  "boardSize": 9,
  "category": "capture",
  "level": 1,
  "tags": ["capture", "liberty-counting", "one-move"],
  "toPlay": "black",
  "title": "找到最后一口气",
  "description": "白棋只剩一口气，黑棋应该下在哪里？",
  "initialStones": [
    { "x": 3, "y": 3, "color": "white" },
    { "x": 2, "y": 3, "color": "black" },
    { "x": 3, "y": 2, "color": "black" },
    { "x": 4, "y": 3, "color": "black" }
  ],
  "answers": [
    { "x": 3, "y": 4 }
  ],
  "hints": [
    "先数一数白棋周围还有几个空点。",
    "白棋现在只剩下面一口气。",
    "黑棋下在白棋下面，就可以吃掉白棋。"
  ],
  "explanation": "黑棋下在白棋最后一口气上，白棋没有气，就被提掉了。",
  "successMessage": "真棒！你找到了白棋最后一口气。",
  "failureMessage": "再看看白棋周围，哪里还是空的？"
}
```

---

# 6. 页面与用户流程

## 6.1 路由规划

```text
/
首页

/practice
今日练习

/levels
闯关地图

/levels/[chapterId]
章节关卡

/problems/[problemId]
做题页

/wrong-book
错题本

/report
学习报告

/profile
个人中心
```

v0.1 可以省略 `/profile` 的复杂功能。

## 6.2 首页

首页目标：让孩子知道今天该做什么。

模块：

- 欢迎语；
- 今日练习入口；
- 闯关入口；
- 错题本入口；
- 星星数；
- 连续学习天数；
- 当前称号。

示例：

```text
欢迎回来，小棋手！

今天的任务：
[开始今日 10 题]

我的进度：
星星：36
连续学习：5 天
当前称号：吃子小能手

[闯关地图]
[错题本]
[学习报告]
```

## 6.3 今日练习页

每日推荐 10 道题。

推荐规则：

```text
4 道错题复习
4 道当前等级题
2 道挑战题
```

如果错题不足，用当前等级题补齐。

流程：

```text
进入今日练习
→ 展示第 1 题
→ 点击棋盘作答
→ 显示反馈
→ 下一题
→ 完成 10 题
→ 显示总结
```

## 6.4 闯关地图页

章节建议：

```text
第 1 章：吃子小岛
第 2 章：逃跑森林
第 3 章：连接桥
第 4 章：死活山谷
第 5 章：布局城堡
```

每章包含 4 个普通关卡和 1 个小测验关卡。

## 6.5 做题页

页面元素：

- 顶部进度；
- 星星显示；
- 题目标题；
- 题目描述；
- SVG 棋盘；
- 提示按钮；
- 重新开始按钮；
- 反馈弹窗；
- 下一题按钮。

交互规则：

1. 用户点击棋盘空点；
2. 系统判断是否在 `answers` 中；
3. 答对显示成功反馈；
4. 答错显示失败反馈；
5. 答错 2 次后显示正确答案；
6. 错题写入错题本；
7. 点击下一题。

## 6.6 错题本

错题本显示：

- 当前错题数量；
- 按分类统计；
- 最近错题；
- 开始复习按钮。

复习规则：

- 做错进入错题本；
- 复习做对 1 次，状态变为 reviewing；
- 连续复习做对 2 次，状态变为 mastered；
- mastered 后不在错题本中展示。

## 6.7 学习报告

报告内容：

- 本周完成题数；
- 正确率；
- 首次正确率；
- 错题数量；
- 连续学习天数；
- 最强模块；
- 需要加强模块；
- 家长建议。

示例：

```text
本周学习报告

完成题目：68 道
正确率：76%
连续学习：5 天
最强能力：吃子
需要加强：死活、连接

建议：下周每天复习 3 道死活题，重点练习真假眼。
```

---

# 7. 交互与棋盘组件

## 7.1 棋盘实现方式

v0.1 推荐使用 SVG 实现棋盘。

原因：

- 线条和棋子缩放清晰；
- 交叉点点击区域容易控制；
- 容易绘制最后一手、提示点、正确点、错误点；
- 9 路棋盘实现成本低。

## 7.2 GoBoard 组件接口

```ts
type StoneColor = "black" | "white";

type Stone = {
  x: number;
  y: number;
  color: StoneColor;
};

type HighlightType = "correct" | "wrong" | "hint" | "lastMove";

type Highlight = {
  x: number;
  y: number;
  type: HighlightType;
};

type GoBoardProps = {
  size: 9 | 13 | 19;
  stones: Stone[];
  disabled?: boolean;
  lastMove?: { x: number; y: number };
  highlights?: Highlight[];
  onPointClick?: (x: number, y: number) => void;
};
```

## 7.3 棋盘交互规则

- 只能点击空点；
- 点击已有棋子不触发作答；
- 点击棋盘外无效；
- 答题完成后棋盘 disabled；
- 答错后可以继续尝试；
- 答错达到最大次数后显示答案并 disabled。

## 7.4 v0.1 是否需要完整围棋规则

v0.1 不需要完整规则引擎。

但建议实现基础工具函数：

```ts
isPointOnBoard(point, size)
isPointEmpty(point, stones)
getNeighbors(point, size)
getGroup(point, stones, size)
countLiberties(group, stones, size)
```

这些函数可以用于后续扩展，也能辅助生成提示。

---

# 8. 本地状态与数据存储

v0.1 使用 localStorage。

## 8.1 本地状态结构

```ts
type StudentProgress = {
  stars: number;
  streakDays: number;
  lastPracticeDate?: string;
  completedProblemIds: string[];
  masteredProblemIds: string[];
  wrongProblems: Record<string, WrongProblemState>;
  attempts: AttemptRecord[];
  achievements: string[];
};

type WrongProblemState = {
  problemId: string;
  wrongCount: number;
  correctReviewCount: number;
  lastWrongAt: string;
  lastReviewAt?: string;
  status: "active" | "reviewing" | "mastered";
};

type AttemptRecord = {
  problemId: string;
  selectedX: number;
  selectedY: number;
  isCorrect: boolean;
  usedHint: boolean;
  timeSpentSeconds: number;
  createdAt: string;
};
```

## 8.2 localStorage key

```text
children-go-app:v0.1:progress
```

## 8.3 数据迁移预留

后续 v0.2 加登录和数据库时，应提供本地进度上传能力。

预留函数：

```ts
exportProgressToJson()
importProgressFromJson(json)
syncLocalProgressToServer()
```

---

# 9. 后端与数据库规划 v0.2

v0.1 不强制做后端，但文档先预留数据库设计。

## 9.1 推荐后端方案

- Next.js API Routes 或 Server Actions；
- Supabase Auth；
- Supabase Postgres；
- Row Level Security；
- Supabase Storage 用于后续头像、音效等资源。

## 9.2 数据表设计

### students

```sql
create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  age int,
  current_level int default 1,
  stars int default 0,
  streak_days int default 0,
  last_practice_date date,
  created_at timestamptz default now()
);
```

### problems

```sql
create table problems (
  id text primary key,
  title text not null,
  description text not null,
  board_size int not null,
  category text not null,
  level int not null,
  tags jsonb not null default '[]'::jsonb,
  to_play text not null,
  initial_stones jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  hints jsonb not null default '[]'::jsonb,
  explanation text,
  success_message text,
  failure_message text,
  status text default 'published',
  created_at timestamptz default now()
);
```

### attempts

```sql
create table attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  problem_id text not null references problems(id),
  selected_x int not null,
  selected_y int not null,
  is_correct boolean not null,
  used_hint boolean default false,
  time_spent_seconds int,
  created_at timestamptz default now()
);
```

### wrong_problems

```sql
create table wrong_problems (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  problem_id text not null references problems(id),
  wrong_count int default 1,
  correct_review_count int default 0,
  last_wrong_at timestamptz,
  last_review_at timestamptz,
  next_review_at timestamptz,
  status text default 'active',
  unique(student_id, problem_id)
);
```

### achievements

```sql
create table achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text,
  condition_type text not null,
  condition_value int not null
);
```

### student_achievements

```sql
create table student_achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  achievement_id text not null references achievements(id),
  unlocked_at timestamptz default now(),
  unique(student_id, achievement_id)
);
```

---

# 10. 推荐与学习算法

## 10.1 每日练习推荐

v0.1 使用规则推荐，不使用 AI。

每日练习 10 题：

```text
40% 错题复习
40% 当前等级题
20% 挑战题
```

具体：

```text
4 道错题
4 道当前等级题
2 道 level + 1 题
```

如果错题不足，当前等级题补齐。

## 10.2 错题复习

错题状态：

```text
active → reviewing → mastered
```

规则：

- 做错：进入 active；
- 复习做对一次：进入 reviewing；
- 连续复习做对两次：进入 mastered；
- mastered 不再显示在错题本。

## 10.3 掌握度计算

v0.1 简化公式：

```text
掌握度 = 首次正确率 × 70% + 错题复习完成率 × 30%
```

按模块计算：

- 吃子掌握度；
- 逃子掌握度；
- 连接切断掌握度；
- 死活掌握度；
- 布局掌握度。

---

# 11. 激励系统

## 11.1 星星规则

| 行为 | 奖励 |
|---|---:|
| 首次答对 | +1 |
| 连续答对 5 题 | +3 |
| 完成今日练习 | +5 |
| 复习错题成功 | +2 |
| 连续学习 3 天 | +5 |
| 连续学习 7 天 | +15 |

## 11.2 徽章规则

v0.1 徽章：

| 徽章 ID | 名称 | 条件 |
|---|---|---|
| first_correct | 第一次答对 | 第一次答对任意题 |
| daily_done | 今日完成 | 完成一次每日练习 |
| streak_3 | 坚持 3 天 | 连续学习 3 天 |
| streak_7 | 坚持 7 天 | 连续学习 7 天 |
| capture_20 | 吃子小能手 | 吃子题做对 20 道 |
| life_20 | 死活小侦探 | 死活题做对 20 道 |
| review_10 | 复习小达人 | 错题复习成功 10 道 |
| level_1_done | 第一章通关 | 完成第一章 |

## 11.3 激励边界

允许：

- 星星；
- 徽章；
- 轻量动画；
- 温和音效；
- 章节通关。

避免：

- 抽卡；
- 排行榜刺激；
- 无限刷题；
- 大量弹窗；
- 强付费诱导。

---

# 12. 前端组件规划

## 12.1 组件目录

```text
/src
  /app
  /components
    /board
      GoBoard.tsx
      BoardPoint.tsx
      Stone.tsx
      BoardHighlight.tsx
    /problem
      ProblemPlayer.tsx
      ProblemHeader.tsx
      HintPanel.tsx
      FeedbackDialog.tsx
    /progress
      StarsBadge.tsx
      StreakBadge.tsx
      AchievementToast.tsx
    /layout
      AppShell.tsx
      ChildFriendlyButton.tsx
  /lib
    problems.ts
    progress.ts
    board.ts
    recommendation.ts
    achievements.ts
  /data
    problems.json
```

## 12.2 核心组件

### GoBoard

职责：

- 渲染棋盘；
- 渲染棋子；
- 处理点击；
- 显示高亮；
- 不负责题目判断。

### ProblemPlayer

职责：

- 接收 Problem；
- 管理当前作答状态；
- 判断答案；
- 调用进度保存；
- 显示反馈。

### HintPanel

职责：

- 管理提示显示；
- 一次只显示一个新提示；
- 记录是否使用提示。

### FeedbackDialog

职责：

- 答对反馈；
- 答错反馈；
- 答案展示；
- 下一题按钮。

---

# 13. 开发任务拆分

## 13.1 Milestone 1：项目骨架

目标：项目能跑起来。

任务：

- 初始化 Next.js + TypeScript；
- 配置 Tailwind CSS；
- 建立目录结构；
- 添加基础 layout；
- 添加首页；
- 添加路由；
- 配置 ESLint/Prettier。

验收：

- `npm run dev` 正常启动；
- 首页可访问；
- TypeScript 无错误；
- lint 通过。

## 13.2 Milestone 2：棋盘组件

目标：完成 9 路棋盘交互。

任务：

- 实现 SVG 棋盘；
- 支持 9 路；
- 支持棋子渲染；
- 支持点击交叉点；
- 支持最后一手标记；
- 支持高亮点。

验收：

- 棋盘比例正常；
- 9x9 交叉点正确；
- 点击能返回 x/y；
- 棋子位置准确；
- 移动端可点击。

## 13.3 Milestone 3：题目播放器

目标：能完成一道题。

任务：

- 定义 Problem 类型；
- 加载本地 JSON；
- 实现 ProblemPlayer；
- 判断答案；
- 显示正确/错误反馈；
- 支持提示；
- 支持下一题。

验收：

- 至少 5 道题可正常完成；
- 答案判断准确；
- 错误反馈温和；
- 提示可逐条显示。

## 13.4 Milestone 4：闯关与每日练习

目标：形成基础学习流程。

任务：

- 实现闯关地图；
- 实现章节和关卡；
- 实现每日练习题目选择；
- 实现练习完成页。

验收：

- 可以从首页进入今日练习；
- 可以从闯关地图进入关卡；
- 每日练习包含 10 道题；
- 完成后显示总结。

## 13.5 Milestone 5：进度与错题本

目标：形成学习闭环。

任务：

- localStorage 保存进度；
- 记录 attempts；
- 记录 wrongProblems；
- 实现错题本页面；
- 实现错题复习；
- 实现星星奖励。

验收：

- 刷新页面后进度不丢失；
- 做错题进入错题本；
- 错题复习成功后状态更新；
- 星星数量正确增加。

## 13.6 Milestone 6：学习报告与打磨

目标：可以给儿童和家长试用。

任务：

- 实现学习报告；
- 统计完成题数；
- 统计正确率；
- 统计模块掌握度；
- 优化儿童 UI；
- 补齐 100 道题；
- 基础测试。

验收：

- 报告数据准确；
- UI 适合儿童；
- 100 道题可加载；
- 主要流程无阻塞 bug。

---

# 14. 验收标准

## 14.1 功能验收

v0.1 发布前必须满足：

- 首页可访问；
- 今日练习可完成；
- 闯关模式可完成至少 1 章；
- 棋盘点击准确；
- 答案判断准确；
- 提示可用；
- 错题本可用；
- 学习报告可用；
- localStorage 进度不丢；
- 移动端浏览器基本可用。

## 14.2 内容验收

题目必须满足：

- 所有题目有唯一 ID；
- 所有题目有 title；
- 所有题目有 description；
- 所有题目有至少 1 个 answer；
- 所有题目坐标合法；
- 所有 initialStones 不重复；
- 所有题目至少有 1 条 hint；
- 儿童文案不超过 30 字为宜；
- 不出现成人化、打击式表达。

## 14.3 技术验收

- TypeScript 编译通过；
- lint 通过；
- 核心工具函数有测试；
- 棋盘组件无明显布局错误；
- 无控制台严重错误；
- 移动端点击区域不小于 32px；
- 页面加载速度可接受。

---

# 15. 测试计划

## 15.1 单元测试

优先测试：

- 坐标合法性；
- 邻居点计算；
- 空点判断；
- 答案判断；
- 题目数据校验；
- 推荐算法；
- 星星奖励；
- 错题状态变化。

## 15.2 组件测试

优先测试：

- GoBoard 渲染；
- ProblemPlayer 答题流程；
- HintPanel 提示流程；
- FeedbackDialog 状态展示。

## 15.3 人工测试

测试清单：

- 儿童是否能独立完成今日练习；
- 是否能理解题目说明；
- 是否知道哪里点击；
- 答错后是否愿意继续；
- 家长是否看得懂学习报告。

---

# 16. 后续路线图

## v0.1

- 本地题库；
- localStorage；
- 9 路单步题；
- 闯关；
- 今日练习；
- 错题本；
- 学习报告。

## v0.2

- 用户登录；
- Supabase 数据库；
- 多设备同步；
- 家长账号；
- 题库后台导入；
- 300 道题。

## v0.3

- 多步题；
- 简单变化图；
- 13 路题；
- 更完整的掌握度模型；
- 家长周报。

## v0.4

- 老师端；
- 班级；
- 作业；
- 学生报告；
- 老师自建题。

## v1.0

- 成熟题库；
- 稳定学习闭环；
- 家长端；
- 老师端；
- 付费课程或题库扩展。

---

# 17. 决策记录

## ADR-001：v0.1 使用本地 JSON 而不是数据库

原因：

- 快速验证产品；
- 降低开发复杂度；
- 方便题库迭代；
- 避免过早设计账号系统。

## ADR-002：v0.1 使用 SVG 棋盘

原因：

- 9 路棋盘交互简单；
- SVG 缩放清晰；
- 易于高亮和点击；
- 比 Canvas 更容易维护。

## ADR-003：v0.1 只做单步题

原因：

- 适合学棋一年儿童；
- 容易实现；
- 容易验收；
- 题库制作成本较低。

## ADR-004：v0.1 不做 AI

原因：

- AI 不是验证 MVP 的必要条件；
- 儿童围棋训练的第一价值是题目体系和学习闭环；
- 过早接入 AI 会增加成本和不确定性。

---

# 18. 风险与控制

## 18.1 风险：题目质量不足

控制：

- 先做 20 道高质量样例；
- 给真实儿童试用；
- 根据错题率调整难度；
- 不盲目堆题量。

## 18.2 风险：功能范围膨胀

控制：

- v0.1 明确不做后端、不做 AI、不做对弈；
- 所有新增需求进入 backlog；
- 每个 milestone 只解决一个目标。

## 18.3 风险：儿童不愿意使用

控制：

- 每次练习短；
- 反馈温和；
- 成就即时；
- UI 清楚；
- 不做复杂解释。

## 18.4 风险：代码被代理开发得过散

控制：

- 文档先行；
- 分支清晰；
- PR 小步提交；
- Codex Review 重点检查组件边界和状态管理。

---

# 19. v0.1 Definition of Done

v0.1 完成标准：

- 儿童可以在浏览器完成今日练习；
- 至少有 100 道有效题目；
- 棋盘点击无明显错误；
- 答案判断可靠；
- 错题本工作正常；
- 学习报告能展示基础统计；
- 本地进度刷新不丢失；
- 移动端基本可用；
- README 和项目文档完整；
- Codex Review 未发现阻塞级问题。
