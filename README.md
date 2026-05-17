# 小棋童围棋闯关

面向学棋约 1 年儿童的网页版围棋训练软件。

## 项目目标

通过 9 路围棋闯关题、每日练习、错题复习、星星奖励和学习报告，帮助儿童提升基础围棋能力。

第一版重点不是完整对弈平台，而是一个清晰、可验证、可持续迭代的儿童围棋做题训练系统。

## v0.1 MVP 范围

- 9 路 SVG 棋盘
- 单步围棋题
- 本地 JSON 题库
- 今日练习
- 闯关模式
- 错题本
- 星星奖励
- 简单学习报告
- localStorage 保存进度

v0.1 暂不做：

- 在线对弈
- AI 复盘
- 老师后台
- 支付系统
- 登录系统
- 多步复杂死活
- 19 路棋盘

## 推荐技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- SVG Board
- localStorage

后续 v0.2 再考虑 Supabase Auth + Postgres/RLS 做账号和多设备同步。

## 文档

- [项目规格文档](docs/PROJECT_SPEC.md)
- [opencode 开发任务计划](docs/agents/opencode-task-plan.md)
- [Codex Review 指南](docs/agents/codex-review-guidelines.md)

## 推荐开发流程

```text
文档 → opencode 开发 → PR → Codex Review → 人工确认 → 合并
```

## v0.1 Definition of Done

- 儿童可以在浏览器完成今日练习
- 至少有 100 道有效题目
- 棋盘点击无明显错误
- 答案判断可靠
- 错题本工作正常
- 学习报告能展示基础统计
- 本地进度刷新不丢失
- 移动端基本可用
- README 和项目文档完整
- Codex Review 未发现阻塞级问题
