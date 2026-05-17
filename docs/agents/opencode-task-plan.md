# opencode 开发任务计划

> 项目：小棋童围棋闯关  
> 版本：v0.1 MVP  
> 目标：按小步 PR 实现儿童围棋网页版做题系统。

---

# 1. 总体开发原则

opencode 开发时必须遵守：

- 文档优先，严格按 `docs/PROJECT_SPEC.md` 实现；
- v0.1 不做后端、不做登录、不做 AI、不做在线对弈；
- 每个 PR 只解决一个 milestone；
- 组件职责清晰，避免把业务逻辑堆在页面里；
- 题库数据与 UI 逻辑分离；
- TypeScript 类型必须清晰；
- 移动端点击体验必须可用；
- 儿童文案必须温和、短、明确。

---

# 2. 推荐分支

```text
feature/project-scaffold
feature/go-board
feature/problem-player
feature/levels-practice
feature/progress-wrong-book
feature/report-polish
```

---

# 3. Milestone 1：项目骨架

## 目标

初始化项目，使仓库具备可运行的 Next.js 基础结构。

## 任务

- 初始化 Next.js App Router 项目；
- 使用 TypeScript；
- 配置 Tailwind CSS；
- 配置 ESLint；
- 建立目录结构；
- 创建首页；
- 创建基础 layout；
- 创建文档中规划的路由占位页。

## 推荐目录

```text
/src
  /app
  /components
  /lib
  /data
```

## 验收

- `npm run dev` 能启动；
- 首页可访问；
- TypeScript 无错误；
- lint 通过；
- 不引入无关大型依赖。

---

# 4. Milestone 2：GoBoard 棋盘组件

## 目标

完成可点击的 9 路 SVG 围棋棋盘。

## 任务

- 实现 `GoBoard.tsx`；
- 支持 9 路棋盘；
- 支持棋子渲染；
- 支持点击交叉点；
- 支持高亮；
- 支持最后一手标记；
- 支持 disabled 状态。

## 组件接口

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

## 验收

- 棋盘比例正常；
- 9x9 交叉点准确；
- 棋子位于交叉点；
- 点击返回正确 x/y；
- 移动端点击区域足够大；
- 点击已有棋子不触发作答。

---

# 5. Milestone 3：题目播放器

## 目标

实现单题作答流程。

## 任务

- 定义 Problem 类型；
- 创建本地 `problems.json`；
- 至少添加 5 道样例题；
- 实现 `ProblemPlayer`；
- 判断用户答案；
- 显示答对/答错反馈；
- 支持提示逐条展示；
- 支持下一题。

## 验收

- 至少 5 道题可以正常做；
- 答案判断准确；
- 答错反馈温和；
- 提示可逐条显示；
- 答错 2 次后显示正确答案。

---

# 6. Milestone 4：闯关与每日练习

## 目标

形成完整练习入口。

## 任务

- 实现首页入口；
- 实现 `/practice` 今日练习；
- 实现 `/levels` 闯关地图；
- 实现章节关卡；
- 实现练习完成总结页；
- 每日练习选择 10 道题。

## 验收

- 首页能进入今日练习；
- 首页能进入闯关地图；
- 每日练习能完整完成；
- 完成后显示结果总结；
- 题目顺序和分类合理。

---

# 7. Milestone 5：进度、错题本、星星

## 目标

形成学习闭环。

## 任务

- 实现 localStorage 进度保存；
- 记录 attempts；
- 记录 wrongProblems；
- 实现 `/wrong-book`；
- 实现错题复习；
- 实现星星奖励；
- 实现基础徽章逻辑。

## localStorage key

```text
children-go-app:v0.1:progress
```

## 验收

- 页面刷新后进度不丢；
- 做错题进入错题本；
- 错题复习做对后状态更新；
- 星星奖励不重复发放；
- 错题 mastered 后不再显示在错题本。

---

# 8. Milestone 6：学习报告与打磨

## 目标

让产品可以给儿童和家长试用。

## 任务

- 实现 `/report`；
- 统计完成题数；
- 统计正确率；
- 统计首次正确率；
- 统计模块掌握度；
- 给出家长建议；
- 优化儿童 UI；
- 扩充题库到 100 道；
- 完成基础测试。

## 验收

- 报告数据准确；
- UI 适合儿童；
- 移动端基本可用；
- 100 道题可加载；
- 主要流程无阻塞 bug。

---

# 9. 禁止提前实现的内容

v0.1 不要做：

- 登录；
- 数据库；
- AI 对弈；
- AI 复盘；
- 在线匹配；
- 支付；
- 老师后台；
- 复杂多步变化树；
- 排行榜；
- 社交系统。

如确实需要，请先开 issue 说明原因，不要直接进 PR。

---

# 10. PR 要求

每个 PR 必须包含：

- Summary；
- Scope；
- Test Plan；
- Screenshots，如果涉及 UI；
- 已知问题；
- 是否偏离文档设计。

PR 越小越好，便于 Codex Review。
