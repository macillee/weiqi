# Project Task Queue

> This file is the task entry point for opencode.  
> Always read `AGENTS.md`, `docs/PROJECT_SPEC.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/QUALITY_CHECKLIST.md`, and the relevant release/content/design notes before implementing any task.

---

# Current Phase

v0.17.0a Parent Review Integration Surface Plan delivered — planning document covering goal/constraints, v0.16 assets, 4 candidate integration surfaces (recommended: developer debug panel), session boundary plan, data flow, privacy/safety review, UI/UX principles, slice plan (b–d), and v0.17.0b acceptance criteria.

v0.17.0b Parent Review Debug Surface Prototype delivered — local-only developer debug page at `/dev/session-summary`, mapping helper `src/lib/session-summary-input.ts`, full `ParentSessionSummary` rendering with category/level tables, strengths/shaky/next-focus sections, empty state, developer warning, privacy boundary, 12 new tests (545 total across 28 files).

v0.17.0c Parent Review Debug Surface QA / Wording Validation delivered — QA validation report at `docs/PARENT_REVIEW_DEBUG_QA_v0.17.md`, 4 new regression tests covering problem-ID privacy, shaky concepts rendering, suggested next focus rendering, and multi-step count rendering. All Chinese parent wording reviewed (non-judgmental, guidance-oriented). No functional, privacy, wording, or accessibility defects found.

v0.17.0d v0.17 Stabilization / Release Notes delivered — release notes at `docs/RELEASE_NOTES_v0.17.md`, QA checklist at `docs/QA_CHECKLIST_v0.17.md`. v0.17 series complete. Next: v0.18.0a — Parent Review Next Phase Plan.

v0.18.0a PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18 delivered — planning document covering goal/constraints, v0.17 assets, conservative session boundary/history modeling directions, and v0.18.0b acceptance criteria.

v0.18.0b PARENT_REVIEW_SESSION_BOUNDARY_CONTRACT_v0.18 delivered — session boundary vocabulary, current-session vs daily vs historical summary definitions, reset/retention behavior, sparse/empty/mixed result handling, local-only assumptions, privacy/data minimization rules, parent gate requirements, future testing requirements, and v0.18.0c recommendation (PR #204).

v0.18.0c Minimal Local Session History Model and Contract Validation delivered — pure TS helpers (`parent-review-session-history.ts`), contract validation (`validateSessionContract`), privacy boundary enforcement (`toParentReviewSafeAggregate`, `checkPrivacyBoundary`), 36 new tests (573 total across 29 files) (PR #206). Next: v0.18.0d — parent review session history QA and stabilization.

v0.18.0d Parent Review Session History QA / Stabilization delivered — boundary edge-case test expansion (10 new tests, 583 total across 29 files), null/undefined guard fix for `buildHistoricalSummary`, QA report at `docs/PARENT_REVIEW_SESSION_HISTORY_QA_v0.18.md` (PR #207).

v0.18.0e v0.18 Stabilization / Release Notes delivered — `docs/RELEASE_NOTES_v0.18.md` (v0.18.0a–v0.18.0d) and `docs/QA_CHECKLIST_v0.18.md` (PR #208). v0.18 series complete. Next: v0.19.0a — Local AI/Engine UX Next-Phase Plan.

v0.19.0a Local AI / Engine UX Next-Phase Plan delivered — `docs/AI_ENGINE_UX_PLAN_v0.19.md` re-anchors v0.13 / v0.14 engine assets, evaluates 4 UX directions, and scopes v0.19.0b / v0.19.0c to **pure helpers, contracts, tests, and feature-flag contracts**. Component / page / `ProblemPlayer` integration is named as a gated follow-up, not part of v0.19.0b/0c. v0.19.0d closes the v0.19 series with engine privacy boundary hardening, release notes, and QA checklist. v0.1 boundary respected; planning-only slice, no code change. Next: v0.19.0b — engine hint projection pure helper.

v0.19.0b Engine Hint Projection Pure Helper delivered — `src/lib/engine-hint.ts` exposes pure `buildEngineHint(input)` returning `{ kind: "no-hint", reason }` or `{ kind: "hint", point, reason }`; feature-flag contract `ENGINE_HINT_PROJECTION` defaults off via `getEngineHintProjectionFlag()` (env → runtime setter → default resolution, env wins), off-state is byte-identical to v0.18; **15 new tests** cover flag off / default / runtime-over-default / env-over-runtime (both directions), low-confidence, no top moves, single top move, second-move-equals-attempted / -authored, malformed coordinates, occupied intersection, child-friendly reason rules (≤150 chars, no banned phrases, no winrate / rank / rating), determinism, and multi-step input. **No component / page / `ProblemPlayer` change in this slice** — helper is the deliverable, consumer wiring is a gated follow-up. Next: v0.19.0c — wrong-move engine explanation for multi-step pure helper.

v0.19.0c Wrong-Move Engine Explanation (Multi-Step) Pure Helper delivered — `src/lib/child-engine-explain.ts` exposes pure `explainChildEngine(input)` returning a `LocalReviewResult`-shaped object; `source` is `"engine-assisted"` only when signal agrees with authored answer AND confidence is `medium` or `high` (otherwise `"rule-template"` fallback); rank-aware refinement when both ranks are finite; extended `validateChildEngineExplain()` covers length ≤150, banned phrases (carried from `ai-review.ts` plus engine-specific: 胜率 / winrate / rating / score / 得分 / visits / playouts / etc.) with **case-insensitive** matching, source enum, non-empty concept; **23 new tests** cover: engine-assisted on high/medium confidence, rule-template fallback on low / disagree / malformed signal, all 7 categories, banned-phrase sweep across 4 signal × 7 category combinations, determinism, rank-aware refinement (close-by / far), malformed rank safety (null / undefined / NaN / 0), hint-aware rule-template fallback, multi-step input, unknown category fallback, the validator (valid / empty / too-long / banned / bad-source), and 5 case-insensitive banned-phrase variants (WinRate / WIN RATE / SCORE / Rating / Visits). **No consumer wiring; no change to `ProblemPlayer` / `FeedbackDialog` / server action**. Next: v0.19.0d — engine privacy boundary hardening / release notes / QA checklist.

Current strategy:

```text
1. Preserve the stable v0.1.3 local MVP
2. Keep the app Docker-deployable with Supabase Cloud as external backend
3. Missing Supabase env must not break local anonymous mode
4. v0.4 content series completed (4 slices: plan, content, validation, metadata)
5. v0.5 content series completed (4 slices)
6. v0.6.0a next phase plan completed (direction: UX polish)
7. v0.6.0b Chinese board coordinate labels completed (PR #72)
8. v0.6.0c success animations and star effects completed (PR #76)
9. v0.6.0d toggleable audio feedback completed (PR #78)
10. v0.6.0e hint presentation polish completed (PR #80)
11. v0.6 stabilization completed — release notes and QA checklist published (PR #82)
12. v0.6 follow-up fix completed — /practice last-problem async race (PR #84)
13. v0.7.0a next phase plan completed — primary direction: content balancing
14. v0.7.0b content pack completed — 12 new problems (77 total)
15. v0.7.0c content validation and regression completed
16. v0.7 stabilization completed — release notes and QA checklist published
17. v0.8.0a next phase plan completed — primary direction: chapter/daily-practice wiring
18. v0.8.0b wire capture + escape + connect_cut completed — 21 new problems wired (45 total)
19. v0.8.0c wire life_death + endgame + opening completed — 23 new problems wired (68 total)
20. v0.8.0d wire multi-step problems completed — 9 multi-step problems wired (77 total, full library)
21. v0.8 stabilization completed — release notes and QA checklist published
22. v0.9.0a next phase plan completed — primary direction: infrastructure / E2E / CI hardening
23. v0.9.0b GitHub Actions CI + Playwright setup completed
24. v0.9.0c E2E smoke tests for core flows completed — 6 tests across home, levels, chapter, demo, practice, settings
25. v0.9 stabilization completed — release notes and QA checklist published
26. v0.10.0a next phase plan completed — primary direction: daily-practice skill filtering / level-aware selection
27. v0.10.0b category-balanced selection with basic level clamping completed — 10 problems, max 3 per category, level clamp guided by progress
   28. v0.10.0c spaced review integration completed — due reviews + wrong problems prioritized in selection
   29. v0.10.0d multi-step awareness completed — multi-step problems gated by single-step eligibility
   30. v0.10 stabilization completed — release notes and QA checklist published
   31. v0.11.0a next phase plan completed — primary direction: Deployment / Supabase environment hardening
   32. v0.11.0b Docker Supabase env passthrough completed — Docker Compose passes optional Supabase vars, .env.example expanded
   33. v0.11.0c CI Docker build verification + deployment docs refresh completed — CI catches Docker build regressions, deployment doc current
   34. v0.11.0d stabilization completed — release notes and QA checklist published
   35. v0.12.0a next phase plan completed — primary direction: AI-first intermediate progression / AI coach & sparring
   36. v0.12.0b AI feasibility spike completed — recommended: local-first Go AI / rule-assisted coach with optional local LLM
   37. v0.12.0c level calibration completed — intermediate learners skip introductory content
   38. v0.12.0d local rule-assisted review coach completed — deterministic offline Chinese feedback after wrong answers (PR #140)
   39. v0.12.0e intermediate content expansion completed — 10 new human-reviewed level 3-5 problems + pipeline doc (PR #142)
   40. v0.12 stabilization completed — release notes and QA checklist published (PR #143)
   41. v0.13.0a local engine feasibility plan completed — evaluates KataGo integration for local move analysis without network dependency (PR #145)
    42. v0.13.0b local engine adapter contract and sample config completed — adapter interface, config shape, setup guide, and fallback behavior defined (PR #147)
    43. v0.13.0c server-only engine adapter implementation completed — engine-config.ts, engine-adapter.ts, 20 tests, timeout fallback, injectable execFile/existsSync (PR #150)
     44. v0.13.0d engine-assisted review behind feature flag completed — ai-review.ts enrichment with engine signal, server action bridge, FeedbackDialog label, 16 new tests, stale async guard (PR #152)
    45. v0.13.0e v0.13 QA / stabilization / release notes completed — conflict marker cleanup, release notes, QA checklist (PR #154)
    46. v0.14.0a engine-assisted review UX evaluation / local diagnostics plan completed — UX evaluation questions, manual observation protocol, diagnostics needs, and conservative v0.14 slice plan (PR #156)
    47. v0.14.0b manual UX observation checklist for engine-assisted review completed — structured per-problem and session-level templates, decision criteria, and QA addendum (PR #158)
     48. v0.14.0c local engine diagnostics contract completed — TypeScript pseudo-contract, data minimization, server/client boundary, last-analysis lifecycle, and v0.14.0d implementation target (PR #160)
     49. v0.14.0d optional developer diagnostics helper completed — server-only getLocalEngineDiagnostics(), sanitized booleans, last-analysis lifecycle, 14 tests (PR #162)
     50. v0.14.0e v0.14 QA / stabilization / release notes completed — release notes, QA checklist, task queue update (PR #164)
     51. v0.15.0a content quality / intermediate problem expansion plan completed — plan targeting level 3–5, quality dimensions, audit requirements, Pack A requirements, human review checklist (PR #166)
     52. v0.15.0b content inventory / gap audit for level 3–5 problems completed — category-by-level matrix, intermediate coverage analysis, multi-step audit, Pack A target matrix (PR #168)
     53. v0.15.0c Intermediate Problem Pack A completed — 14 new level 3-5 problems, 3 multi-step, first mixed problems, 8 new tests (PR #170)
      54. v0.15.0d Pack A content validation and regression completed — validation report, 12 regression tests, matrix/schema/text verified, no data defects found (PR #172)
       55. v0.15.0e v0.15 stabilization / release notes / QA checklist completed — release notes, QA checklist, task queue update (PR #174)
       56. v0.16.0a learning session review / parent progress insight plan completed — planning document covering parent questions, safe signals, data boundaries, pseudo-contract, wording principles, slice plan, and risks (PR #176)
       57. v0.16.0b session review data contract and local aggregation plan completed — contract document covering source data assumptions, data minimization, TypeScript pseudo-contract, aggregation algorithm, heuristics, parent note templates, privacy checklist, and v0.16.0c guidance (PR #178)
       58. v0.16.0c Parent Session Summary Helper completed — pure local summarizeLearningSession() helper, sanitized ParentSessionSummary output, 17 unit tests covering aggregation, parent notes, deterministic output, and privacy boundaries (PR #182)
       59. v0.16.0d Parent Session Summary Validation / QA completed — validation report covering contract alignment, input/output boundaries, aggregation, parent wording, 12 new regression tests (29 total), no defects found (PR #186)
       60. v0.16.0e Parent Session Summary Stabilization / Release Notes completed — release notes and QA checklist for v0.16, v0.16 series complete, next: v0.17.0a planning (PR #189)
61. v0.17.0a Parent Review Integration Surface Plan completed — compares 4 candidate integration surfaces, recommends developer debug panel, defines session boundary, data flow, privacy review, UI/UX principles, and v0.17.0b acceptance criteria (PR #192)
          62. v0.17.0b Parent Review Debug Surface Prototype completed — developer debug page at /dev/session-summary, mapping helper buildSessionSummaryInput(), full ParentSessionSummary rendering, privacy boundary, 12 new tests (545 total across 28 files)
           63. v0.17.0c Parent Review Debug Surface QA / Wording Validation completed — QA report at docs/PARENT_REVIEW_DEBUG_QA_v0.17.md, 4 new regression tests, all Chinese wording reviewed (non-judgmental), no defects found (PR #196)
           64. v0.17.0d v0.17 Stabilization / Release Notes completed — release notes and QA checklist for v0.17, v0.17 series complete, next: v0.18.0a planning (PR #198)
65. v0.18.0a PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18 completed — conservative session boundary/history modeling approach (PR #202)
66. v0.18.0b PARENT_REVIEW_SESSION_BOUNDARY_CONTRACT_v0.18 completed — session boundary vocabulary, privacy/data minimization rules, parent gate requirements, future testing requirements (PR #204)
67. v0.18.0c Minimal Local Session History Model and Contract Validation completed — pure TS helpers (`EnrichedAttempt`, `CurrentSessionState`, `CompletedSession`, `DailySummary`, `HistoricalSummary`, `ParentReviewSafeSession`), contract validation (`validateSessionContract`), privacy boundary enforcement (`toParentReviewSafeAggregate`, `checkPrivacyBoundary`), 36 new tests (573 total across 29 files) (PR #206).
68. v0.18.0d Parent Review Session History QA / Stabilization completed — boundary edge-case test expansion (10 new tests, 583 total across 29 files), null/undefined guard fix for `buildHistoricalSummary`, QA report at `docs/PARENT_REVIEW_SESSION_HISTORY_QA_v0.18.md`. Next: v0.18.0e — v0.18 release notes / QA checklist.
69. v0.18.0e v0.18 Stabilization / Release Notes completed — `docs/RELEASE_NOTES_v0.18.md`, `docs/QA_CHECKLIST_v0.18.md`, v0.18 series complete. Next: v0.19.0a — Local AI/Engine UX Next-Phase Plan (PR #208).
70. v0.19.0a Local AI / Engine UX Next-Phase Plan completed — `docs/AI_ENGINE_UX_PLAN_v0.19.md` re-anchors v0.13 / v0.14 engine assets, evaluates 4 UX directions, scopes v0.19.0b / v0.19.0c to pure helpers / contracts / tests / feature-flag contracts. Component / page / `ProblemPlayer` integration is a gated follow-up, not part of 0b/0c. v0.1 boundary respected; planning-only slice. Next: v0.19.0b — engine hint projection pure helper.
71. v0.19.0b Engine Hint Projection Pure Helper completed — `src/lib/engine-hint.ts` (pure `buildEngineHint()`), feature-flag contract `ENGINE_HINT_PROJECTION` (env → runtime → default; env wins; off by default), **15 new tests** covering flag off / default / runtime-over-default / env-over-runtime (both directions) / low-confidence / no / single top move / second-move equals attempted or authored / malformed / occupied / determinism / multi-step. **No component / page / `ProblemPlayer` change in this slice**; consumer wiring is a gated follow-up. Next: v0.19.0c — wrong-move engine explanation for multi-step pure helper.
72. v0.19.0c Wrong-Move Engine Explanation (Multi-Step) Pure Helper completed — `src/lib/child-engine-explain.ts` (pure `explainChildEngine()` returning a `LocalReviewResult`), `source` is `engine-assisted` only on agree + medium/high confidence, rank-aware refinement when both ranks are finite, extended `validateChildEngineExplain()` for length / banned / source / empty with **case-insensitive** banned-phrase matching. **23 new tests** cover engine-assisted on high/medium, rule-template fallback on low / disagree / malformed signal, all 7 categories, banned-phrase sweep across 4 signal × 7 category, determinism, rank refinement (close-by / far), malformed rank safety (null / undefined / NaN / 0), hint-aware rule-template fallback, multi-step input, unknown category fallback, the validator (valid / empty / too-long / banned / bad-source), and 5 case-insensitive banned-phrase variants (WinRate / WIN RATE / SCORE / Rating / Visits). **No consumer wiring; no `ProblemPlayer` / `FeedbackDialog` / server action change**. Next: v0.19.0d — engine privacy boundary hardening / release notes / QA checklist.
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
- `docs/DEPLOYMENT.md` — Docker app deployment with Supabase Cloud as external backend (replaces stale v0.2 strategy doc)
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

## v0.2.1b Auth UI

Status: completed.

Delivered:

- `src/lib/supabase/auth-actions.ts` — `signInWithEmail()`, `signUpWithEmail()`, `signOutUser()` helpers (never throw, return `AuthResult`).
- `src/app/login/page.tsx` — login/sign-up page with email + password form, input validation, loading state, error display, and mode toggle.
- `src/app/page.tsx` — home page shows session email + sign-out button when authenticated, "登录 / 注册" link when not, nothing when Supabase not configured. Sign-out has loading state and error display.
- `src/app/settings/page.tsx` — settings page shows account section with session status and sign-out/login buttons. Sign-out has loading state and error display.
- `src/__tests__/auth-actions.test.ts` — 6 tests for missing-env behavior.
- `docs/REVIEW_NOTES_v0.2.1b.md` — review findings and validation results.
- Graceful degradation: when Supabase env is missing, `/login` shows a clear "云端功能尚未配置" message and local mode remains fully functional.

Acceptance:

- `npm run build` passes.
- `npm run test` passes (97 tests).
- User can sign up with email + password.
- User can sign in with email + password.
- User can sign out.
- Session persists after refresh (via `useSupabaseAuth` hook).
- Unauthenticated local mode still works fully.
- Missing Supabase env hides auth UI gracefully.
- No v0.2.2+ features introduced.

---

## v0.2.2 Child Profile

Status: completed.

Delivered:

- `docs/migrations/001_child_profiles.sql` — child_profiles table with RLS policies and updated_at trigger.
- `src/lib/supabase/child-profiles.ts` — CRUD operations (fetch, create, update, delete) with error handling and missing-env fallback. createChildProfile explicitly sets parent_user_id from session.
- `src/lib/selected-child.ts` — localStorage persistence for selected child profile ID, per-parent storage key.
- `src/app/children/page.tsx` — child profile management page: list, create, select. Redirects to home if not authenticated.
- `src/app/page.tsx` — home page shows "孩子档案" link when authenticated.
- `src/app/settings/page.tsx` — settings page shows "管理孩子档案" button when authenticated.
- `docs/REVIEW_NOTES_v0.2.2.md` — review findings and validation results.

Review fixes applied:

- createChildProfile now calls `client.auth.getSession()` and writes `parent_user_id: session.user.id` to satisfy NOT NULL constraint and RLS `with check` policy.
- progress-source.ts cleaned to local-only stub; zero server progress code.

Explicitly NOT delivered in v0.2.2:

- No server progress / server wrong book / server report.
- No localStorage import.
- No AI, payment, teacher/admin backend.

Acceptance:

- `npm run build` passes.
- `npm run test` passes (97 tests).
- Authenticated parent can create and select child profiles.
- Unauthenticated users continue in local anonymous mode.
- Missing Supabase env does not break any page.
- No v0.2.3+ features introduced.

---

## v0.2.3a Server Progress Schema

Status: completed.

Delivered:

- `docs/migrations/002_server_progress.sql` — full SQL migration:
  - `profiles` table with RLS (select/insert/update)
  - `problem_attempts` table with import idempotency fields (`imported_from`, `imported_source_key`, `imported_source_hash`) and `problem_attempts_import_hash_unique` partial unique index
  - `wrong_problems` table with composite PK and status check constraint
  - `progress_summary` table with `text[]` arrays
  - All required indexes
  - RLS policies for all tables (child ownership via `exists` subquery)
  - UPDATE policies with both `using` + `with check` for `wrong_problems` and `progress_summary`
  - `updated_at` triggers for `profiles`, `wrong_problems`, `progress_summary`
  - `problem_attempts` is append-only (no UPDATE policy)
- `docs/REVIEW_NOTES_v0.2.3a.md` — schema review, RLS review, build/test results

Explicitly NOT delivered in v0.2.3a:

- No business page integration.
- No server-progress.ts library.
- No server mode in progress-source.ts.

Acceptance:

- `npm run build` passes.
- `npm run test` passes (97 tests).
- SQL schema matches `SUPABASE_DESIGN_v0.2.md`.
- RLS policies complete and correct.
- No business page changes.

---

## v0.2.3b Server Progress Library

Status: completed.

Delivered:

- `src/lib/supabase/server-progress.ts` — server progress library:
  - `loadServerProgress(childProfileId)` — reads progress_summary + wrong_problems, maps snake_case to camelCase
  - `syncAttemptToServer(childProfileId, attempt, progressUpdate, wrongProblemUpdate)` — writes problem_attempts (append-only), upserts progress_summary, upserts wrong_problems
  - `loadReportData(childProfileId)` — reads problem_attempts + wrong_problems + progress_summary, maps snake_case to camelCase
  - All functions safely handle missing Supabase env (return error, never throw)
  - All functions use existing `classifySupabaseError` for error classification
  - child_profile_id must be passed explicitly by caller; no guessing or localStorage reads
- `src/__tests__/server-progress.test.ts` — 10 tests:
  - Missing Supabase env: all three functions return safe error
  - Error handling: classified errors on Supabase failure
  - Data mapping: snake_case to camelCase for all three tables
  - PGRST116 (no row) handled gracefully
- `docs/REVIEW_NOTES_v0.2.3b.md` — review findings and validation results

Explicitly NOT delivered in v0.2.3b:

- No business page integration (practice, wrong-book, report unchanged).
- No server mode in progress-source.ts.
- No localStorage import.

Acceptance:

- `npm run build` passes.
- `npm run test` passes (107 tests).
- server-progress.ts exists with loadServerProgress, syncAttemptToServer, loadReportData.
- No business page changes.
- No v0.2.3c+ features introduced.

---

## v0.2.3c Server Progress Page Integration

Status: completed.

Delivered:

- `src/lib/progress-source.ts` — progress source abstraction with server mode detection:
  - `getProgressMode(parentUserId)` — returns "server" only when Supabase configured + authenticated + child selected
  - `recordAttemptWithSync(parentUserId, ...)` — saves to localStorage first, then syncs to server if server mode
  - `recordDailyPracticeCompleteWithSync(parentUserId)` — same pattern for daily practice complete
  - `updateWrongProblemReviewWithSync(parentUserId, problemId, isCorrect)` — syncs wrong problem review to server
  - `loadReportWithSource(parentUserId)` — loads from server in server mode, falls back to local on failure
- `src/app/practice/page.tsx` — integrated with progress-source:
  - Attempt recording uses `recordAttemptWithSync`
  - Daily practice complete uses `recordDailyPracticeCompleteWithSync`
  - Shows sync status ("进度已同步 ☁️") on success
  - Shows gentle error message on sync failure, does not block next problem
- `src/app/wrong-book/page.tsx` — integrated with progress-source:
  - Review attempts use `updateWrongProblemReviewWithSync`
  - Local wrong problem state transitions unchanged (active → reviewing → mastered)
  - Server failure does not block wrong book usage
- `src/app/report/page.tsx` — integrated with progress-source:
  - Server mode: loads from `loadReportData`, falls back to local on failure
  - Local mode: continues using `computeReportStats` from localStorage
  - Shows error message when server fails but local data is shown
- `src/lib/report.ts` — added `computeReportStatsFromProgress(progress, attemptsOverride?)` for computing stats from arbitrary progress data (used by server report)
- `src/__tests__/progress-source.test.ts` — 15 tests:
  - getProgressMode: unconfigured, unauthenticated, no child selected, server mode
  - recordAttemptWithSync: local mode saves, server mode syncs, server failure returns error
  - recordDailyPracticeCompleteWithSync: local and server mode
  - updateWrongProblemReviewWithSync: local and server mode
  - loadReportWithSource: local fallback, server success, server failure fallback

Explicitly NOT delivered in v0.2.3c:

- No localStorage import (v0.2.4).
- No import prompt, import marker, or conflict merge.
- No AI, payment, teacher/admin backend.

Acceptance:

- `npm run build` passes.
- `npm run test` passes (126 tests).
- Unconfigured Supabase env: all pages fully functional in local mode.
- Unauthenticated users: full local anonymous mode.
- Authenticated but no child selected: local mode.
- Authenticated + child selected: practice attempts sync to server.
- Wrong-book review state syncs to server.
- Report reads server data when available, falls back to local on failure.
- Server failure does not block learning flow.
- No v0.2.4 localStorage import.

---

## v0.2.4a Import Detection + Prompt UI

Status: delivered.

Delivered:

- `src/lib/progress-import.ts` — import detection module:
  - `detectImportEligibility()` — checks localStorage for existing v0.1.x progress, returns typed status (`no_local_progress`, `eligible_for_import`, `already_imported`)
  - `markImportOffered()` — records that the import prompt was shown so it won't reappear
  - Safe without `window`, `localStorage`, or with malformed data; never throws
  - `PROGRESS_KEY` exported from `progress.ts` for shared reference
- `src/components/progress/ImportPromptBanner.tsx` — minimal UI prompt component:
  - Shows only when: Supabase configured + authenticated + child selected + local progress eligible for import
  - Displays attempt count and stars from local progress
  - Explains that local progress can be imported later (does not claim import has happened)
  - "知道了" dismiss button marks import as offered
- `src/app/page.tsx` — home page integrates `ImportPromptBanner` between stats and navigation cards
- `src/__tests__/progress-import.test.ts` — 9 tests:
  - no local progress (empty localStorage)
  - no local progress (zero attempts + zero stars)
  - eligible for import (attempts present)
  - eligible for import (stars > 0 but no attempts)
  - already imported (offered key set)
  - malformed localStorage data
  - localStorage access failure
  - markImportOffered writes timestamp
  - markImportOffered handles localStorage failure
- `docs/TASKS.md` — updated to mark v0.2.4a as delivered

Explicitly NOT delivered in v0.2.4a:

- No local progress write to Supabase.
- No server progress SQL schema modification.
- No conflict merge logic.
- No deletion, clearing, or mutation of localStorage progress.
- No change to progress recording semantics in practice, wrong-book, or report.
- No AI, payment, teacher/admin backend.

Acceptance:

- `npm run build` passes.
- `npm run test` passes (135 tests).
- Detection helper exists in `src/lib/progress-import.ts`.
- UI prompt shows only in authenticated + selected-child flow on home page.
- Prompt explains local progress can be imported later; does not claim import has happened.
- All existing local anonymous mode and server mode behavior unchanged.
- No v0.2.4b+ features introduced.

---

# ✅ v0.2.4b Import Implementation — COMPLETED (2026-05-21)

## What was done

- `src/lib/progress-import.ts`: added `checkAlreadyImported`, `importLocalProgressToServer`, `markImportCompleted`, `hasImportCompletedLocally`, `buildAttemptHash`
- `src/components/progress/ImportPromptBanner.tsx`: full import UI (5 states: pending/importing/success/failure/already_imported)
- `src/__tests__/progress-import-v2.test.ts`: 9 tests for all new functions (1 skipped — deep Supabase mock chain)
- Idempotent import via `imported_from` + `imported_source_key` + `imported_source_hash`
- Merge strategy: `Math.max` for stars/streak, union for problem IDs
- Empty progress short-circuits before Supabase check (no false `not_configured` error)
- All 144 tests pass; build passes

## PR

- Branch: `feat/v0.2.4b-import-local-progress`
- PR: #13

---

# ✅ v0.2.4c Import Validation / Error Recovery / Hardening — COMPLETED (2026-05-22)

## What was done

- `src/lib/progress-import.ts`:
  - Exported `buildAttemptHash` for testing
  - Added retry logic for transient Supabase failures (max 3 retries, exponential backoff)
  - Improved error handling: non-retryable errors thrown immediately, retryable errors retried
  - Idempotent import via `imported_source_hash` + unique partial index (safe retry after partial failure)
- `src/components/progress/ImportPromptBanner.tsx`:
  - Improved error recovery UI: shows specific error message from `result.error?.message`
  - Added reassurance message: "💡 重试不会重复导入已成功的数据"
  - Retry button clears previous error state before retrying
- `src/__tests__/progress-import-hash.test.ts`: 6 tests for `buildAttemptHash` determinism
  - Stable hash for same inputs
  - Different hashes for different problemIds
  - Different hashes for different timestamps
  - Hash format validation
  - Edge cases (empty problemId, special characters)
- `docs/TASKS.md` — updated to mark v0.2.4c as delivered

## Validation path

Manual validation (requires Supabase env):

1. **Happy path**: Local progress exists → click "导入到云端" → success state shown with attempt/wrongProblem counts
2. **Idempotency**: Repeat import → "进度已导入" state (already_imported)
3. **Error recovery**: Disconnect network → click import → failure state with retry button → reconnect → click retry → success
4. **Partial failure safety**: If some batches succeed and later batch fails, retry imports only unimported attempts (due to `imported_source_hash` unique index)
5. **Local storage intact**: After import, check localStorage → progress unchanged
6. **Tests**: `npm run test` passes (159 tests)
7. **Build**: `npm run build` passes

## PR

- Branch: `feat/v0.2.4c-import-validation-error-recovery`
- PR: #17

---

## v0.3.0a Learning Depth Planning — COMPLETED (2026-05-23)

## What was done

- `docs/LEARNING_DEPTH_PLAN_v0.3.md`: planning document defining five feature slices (v0.3.0a–e), data model changes, spaced review algorithm, local/server compatibility, and explicit AI Report out-of-scope boundary.
- `docs/TASKS.md`: updated to mark v0.3.0a as delivered and set next task to v0.3.0b.

## Slices defined

- v0.3.0a: planning and boundaries (this task, docs-only)
- v0.3.0b: multi-step problem schema/data model
- v0.3.0c: multi-step problem player UI
- v0.3.0d: spaced review scheduling
- v0.3.0e: parent weekly report

---



# ✅ v0.3.0b Multi-Step Problem Schema / Data Model — COMPLETED (2026-05-23)

## What was done

- Extended `Problem` type in `src/lib/problems.ts` with `ProblemStep` type:
  - `ProblemStep` includes: `step`, `addedStones`, `removedStones`, `answers`, `hints`, `explanation`, `successMessage`, `failureMessage`, `wrongMoves`
  - `Problem` now includes optional `steps` array and `totalSteps` field
- Updated `validateProblem` function to support multi-step validation:
  - Backward compatible: single-step problems validate as before
  - Multi-step validation: step ordering, per-step answers/hints/coordinates
  - Validates `addedStones` and `removedStones` coordinates
- Added 3 sample multi-step problems to `src/data/problems.json`:
  - `MULTI-001`: two-step capture problem
  - `MULTI-002`: two-step life-and-death problem  
  - `MULTI-003`: two-step connect problem
- Added tests in `src/__tests__/problems.test.ts`:
  - `validates a valid multi-step problem`
  - `fails when step ordering is invalid`
  - `fails when step answer coordinates are out of range`
- Updated test count from 36 to 39 problems
- `npm run test` passes (159 tests)
- `npm run build` passes

## PR

- Branch: `feat/v0.3.0b-multi-step-problem-schema`
- PR: #26

---

# ✅ v0.3.0c Multi-Step Problem Player UI — COMPLETED (2026-05-23)

## What was done

- `src/components/problem/ProblemPlayer.tsx`: Extended to support multi-step problems
  - Detects multi-step problems via `steps` and `totalSteps` fields
  - Step-by-step progression with board state updates between steps
  - Step indicator shows current step / total steps
  - Hints reset per step (each step has its own hints)
  - Wrong answers recorded at problem level (not step level)
  - Single-step problems remain backward compatible
- `src/lib/multi-step-problem.ts`: New utility module with helper functions
  - `isMultiStepProblem()`: Detect multi-step problems
  - `computeBoardStonesForStep()`: Calculate board state for each step
  - `getCurrentStepData()`: Get step-specific data
- `src/__tests__/multi-step-problem.test.ts`: 15 tests covering multi-step behavior
  - Multi-step detection tests
  - Board state computation tests
  - Step data retrieval tests
  - Integration tests for multi-step flow
- `npm run test` passes (181 tests)
- `npm run build` passes

## PR

- Branch: `feat/v0.3.0c-multi-step-problem-player`
- PR: #34

---

# ✅ v0.3.0d Spaced Review Scheduling — COMPLETED (2026-05-23)

## What was done

- `src/lib/spaced-review.ts`: New utility module with deterministic scheduling functions
  - `classifyOutcome()`: Classifies result into failed / correct_with_wrong / correct_with_hint / clean
  - `computeNextReview()`: Pure function computing next review date and interval
  - `updateReviewSchedule()`: Updates review metadata in progress schedule
  - `getDueProblems()`: Returns problems due for review by date
  - Scheduling intervals: failed → 1d, correct with wrong/hint → 2d, clean initial → 4d, repeated clean → progressive doubling (capped at 30d)
- `src/lib/progress.ts`: Extended `StudentProgress` with `reviewSchedule` field
  - New `ReviewOutcome` and `ProblemReviewState` types
  - Backward compatible: old localStorage data merges with default empty reviewSchedule
- `src/app/practice/page.tsx`: Updates review schedule on problem completion
- `src/app/levels/[chapterId]/page.tsx`: Adds `onResult` handler for review schedule updates
- `src/app/wrong-book/page.tsx`: Updates review schedule on wrong-problem review completion
- `src/__tests__/spaced-review.test.ts`: 25 tests covering:
  - Failed problem due soon
  - Correct with wrong attempts schedules sooner than clean success
  - Correct with hint schedules sooner than clean success
  - Clean success schedules later
  - Repeated clean success increases interval progressively
  - Due review selector returns only due problems
  - Interval capped at 30 days
  - Backward compatibility with old progress data
  - Schedule priority ordering (failed < wrong < clean)
  - Multi-step completion schedules by problem id, not step id
- `npm run test` passes (228 tests)
- `npm run build` passes

## PR

- Branch: `feat/v0.3.0d-spaced-review-scheduling`
- PR: #40

## Out of Scope for v0.3.0d

- Parent weekly report (v0.3.0e) – completed
- AI-generated content
- Payment, teacher/admin backend, leaderboard

---

# ✅ v0.3.0e Parent Weekly Report — COMPLETED (2026-05-23)

## What was done

- `src/lib/weekly-report.ts`: New aggregation helper with `getWeekRange` (Mon–Sun boundary) and `computeWeeklyReport` (attempts, accuracy, hints, completions, wrong-book counts, due-review count).
- `src/app/report/page.tsx`: Weekly overview card displayed at top of report page when the current week has activity.
- `src/__tests__/weekly-report.test.ts`: 13 tests covering week window, accuracy, hints, wrong counts, due count, and no-activity edge cases.
- `npm run test` passes (241 tests)
- `npm run build` passes

## PR

- Branch: `feat/v0.3.0e-parent-weekly-report`
- PR: #42

---

# ✅ Post-v0.3 Stabilization / QA — COMPLETED (2026-05-24)

## What was done

- Regression review over all v0.3.0 behavior verified via 241 existing tests (17 files).
- Documentation cleanup in `docs/TASKS.md` (stale PR references fixed, current phase updated).

## PR

- Branch: `chore/post-v0.3-stabilization-qa`
- PR: #45

---

# ✅ v0.3.0 Release Notes and Manual QA Checklist — COMPLETED (2026-05-24)

## What was done

- `docs/RELEASE_NOTES_v0.3.0.md` — release notes and manual QA checklist for v0.3.0 Learning Depth milestone.

## PR

- Branch: `docs/v0.3.0-release-notes-qa-checklist`
- PR: #48

---

# ✅ v0.4.0a Content Expansion Plan — COMPLETED (2026-05-24)

## What was done

- `docs/CONTENT_EXPANSION_PLAN_v0.4.md` — expansion plan with slice boundaries, target counts, category distribution, quality rules, ID conventions, and tag recommendations.
## PR

- Branch: `docs/v0.4.0a-content-expansion-plan`
- PR: #50

---

# ✅ v0.4.0b First Multi-Step Content Pack — COMPLETED (2026-05-24)

## What was done

- Added 12 new problems to `src/data/problems.json` (6 single-step + 6 multi-step).
- Category distribution: capture +3, life_death +4, connect_cut +2, escape +2, opening +1.
- `docs/CONTENT_REVIEW_v0.4.0b.md` — content review documenting every new problem.
- Updated problem count test from 39 to 51.
- `npm run test` — 241 tests passed.
- `npm run build` — compiled successfully.

## PR

- Branch: `feat/v0.4.0b-first-content-pack`
- PR: #52

---

# ✅ v0.4.0c Content Validation and Regression Checks — COMPLETED (2026-05-24)

## What was done

- Reviewed all 51 problems for data and Go-logic correctness.
- Confirmed: no duplicate IDs, all coordinates valid, no zero-liberty groups, all answer points empty on relevant board state.
- Confirmed: all multi-step checks pass (sequential ordering, addedStones, removedStones, per-step hints/answers, board transitions).
- Verified no new v0.4.0b ID reuses an old non-MULTI ID prefix.
- Verified all 12 expected v0.4.0b IDs exist.
- Strengthened tests in `src/__tests__/problems.test.ts`:
  - explicit `validateAllProblems` pass test for full dataset
  - v0.4.0b added problem IDs existence check
  - no old-ID-number-reuse check
  - negative test: step 2 answer on addedStones-occupied point
- `docs/CONTENT_REVIEW_v0.4.0c.md` — validation and regression review.
- `npm run test` — 245 tests passed.
- `npm run build` — compiled successfully.

## PR

- Branch: `test/v0.4.0c-content-validation-regression`
- PR: #54

---

# ✅ v0.4.0d Tag / Category Metadata Refinement — COMPLETED (2026-05-24)

## What was done

- Reviewed tags for all 51 problems.
- Normalized `life-death` → `life_death` in MULTI-002, MULTI-006, MULTI-007 (3 problems).
- Confirmed: all problems have category-aligned tag, all multi-step problems include `multi-step`, no duplicate/empty tags.
- Canonical tag list documented (22 tags, lowercase kebab-case/snake_case).
- Category/tag mapping rules documented.
- Added 5 metadata tests:
  - category-aligned tag check
  - multi-step tag presence check
  - non-empty tag check
  - no duplicate tags check
  - canonical `life_death` check (no `life-death` variant)
- `docs/METADATA_REVIEW_v0.4.0d.md` — metadata review documenting canonical tags, mapping rules, changes, and validation.
- `npm run test` — 250 tests passed.
- `npm run build` — compiled successfully.

## PR

- Branch: `chore/v0.4.0d-tag-category-metadata`
- PR: #56

---

# ✅ Post-v0.4 Stabilization / Release Notes — COMPLETED (2026-05-24)

## What was done

- `docs/RELEASE_NOTES_v0.4.md` — v0.4.0 release notes and manual QA checklist.
- Content inventory documented (51 problems, category breakdown).
- All v0.4 slices summarized with delivery details and validation status.

## PR

- Branch: `docs/post-v0.4-stabilization-release-notes`
- PR: #58

---

# ✅ v0.5.0a Next Phase Plan — COMPLETED (2026-05-25)

## What was done

- Created `docs/NEXT_PHASE_PLAN_v0.5.md` with:
  - 4 candidate directions evaluated (content expansion, UX polish, multi-step depth, infrastructure)
  - Primary direction selected: content expansion to ~60+ problems
  - Rationale: fulfills original MVP scope, fills levels 4–5 and endgame gap, proven process from v0.4
  - 3 implementation slices defined (v0.5.0b content pack, v0.5.0c validation, v0.5.0d stabilization)
  - Explicit out-of-scope boundaries and acceptance rules
- No implementation work — planning only.

## PR

- Branch: `docs/v0.5.0a-next-phase-plan`
- PR: #60

---

# ✅ v0.5.0b — Content Pack: Levels 4–5 + Endgame — COMPLETED (2026-05-25)

## What was done

- Added 14 new single-step problems to `src/data/problems.json`:
  - CAP-015 through CAP-017 (capture, levels 4–5)
  - ESC-009 through ESC-010 (escape, levels 4–5)
  - CC-012 through CC-013 (connect_cut, levels 4–5)
  - LD-008 through LD-009 (life_death, levels 4–5)
  - OP-005 (opening, level 4)
  - END-001 through END-004 (endgame, levels 1–3)
- Problem count: 51 → 65
- Created `docs/CONTENT_REVIEW_v0.5.0b.md`
- Updated `src/__tests__/problems.test.ts`: count 51→65, added endgame to catTagMap
- All 250 tests pass, build succeeds

## PR

- Branch: `feat/v0.5.0b-levels-endgame-content`
- PR: #62

---

# ✅ v0.5.0c — Content Validation and Regression — COMPLETED (2026-05-25)

## What was done

- Added 8 validation tests in `src/__tests__/problems.test.ts`:
  - All 14 v0.5.0b IDs exist
  - v0.5.0b IDs beyond old ranges (no reuse)
  - Level 4 and 5 problems exist after v0.5.0b
  - Endgame category level range (1–3)
  - CAP-015 answer captures white (0 liberties after play)
  - CAP-017 answer fills only corner liberty at (0,0)
  - ESC-009 initial black group has >0 liberties
  - ESC-009 answers are empty points
- Created `docs/CONTENT_REVIEW_v0.5.0c.md`
- Updated `docs/TASKS.md`: marked v0.5.0c delivered, next → v0.5.0d
- Test count: 250 → 258
- No content bugs found in v0.5.0b problems

## PR

- Branch: `test/v0.5.0c-content-validation-regression`
- PR: #64

---

# ✅ v0.5.0d — Stabilization and Release Notes — COMPLETED (2026-05-25)

## What was done

- Created `docs/RELEASE_NOTES_v0.5.md` with:
  - Summary of v0.5.0a/b/c deliverables
  - Final content inventory (65 problems, categories, levels, single/multi-step split)
  - Known limitations and manual QA checklist
- Updated `docs/TASKS.md`: marked v0.5.0d delivered, next → v0.6.0a
- Docs-only task; no code or data changes

## PR

- Branch: `docs/v0.5.0d-stabilization-release-notes`
- PR: #66

---

# ✅ v0.6.0a — Next Phase Plan — COMPLETED (2026-05-26)

## What was done

- Created `docs/NEXT_PHASE_PLAN_v0.6.md` with:
  - 5 candidate directions evaluated (UX polish, multi-step depth, infrastructure, content balancing, deployment)
  - Primary direction selected: UX polish / child-facing gameplay refinement
  - Rationale: content is sufficient at 65 problems; known UX gaps directly affect children
  - 4 implementation slices defined (v0.6.0b board labels, v0.6.0c animations, v0.6.0d audio, v0.6.0e hints)
  - Explicit out-of-scope boundaries and acceptance rules
- Updated `docs/TASKS.md`: marked v0.6.0a delivered, next → v0.6.0b
- Docs-only task; no code or data changes

## PR

- Branch: `docs/v0.6.0a-next-phase-plan`
- PR: #68

---

# ✅ v0.6.0b — Chinese Board Coordinate Labels — COMPLETED (2026-05-30)

## What was done

- `src/components/board/GoBoard.tsx`:
  - Increased `BOARD_PADDING` from 30 to 40 to accommodate labels
  - Added `CHINESE_NUMBERS` constant (一 to 九)
  - Rendered Chinese numeral text labels on all four sides of the board
  - Labels placed in padding area outside grid, using `textAnchor="middle"` and `dominantBaseline="central"`
  - Font size 12px, color `#333` to match grid lines
- Labels consist of:
  - Top: 一 二 三 四 五 六 七 八 九 (column labels)
  - Bottom: same as top
  - Left: 一 二 三 四 五 六 七 八 九 (row labels)
  - Right: same as left
- No gameplay logic changes
- No problem data, schema, scheduling, weekly report, package/lockfile, SQL, payment, teacher/admin, leaderboard, board-size, or SGF changes
- `npm run test` passes (258 tests)
- `npm run build` passes

## PR

- Branch: `feat/v0.6.0b-chinese-board-coordinate-labels`
- PR: #72

---

# ✅ v0.6.0c — Success Animations and Star Effects — COMPLETED (2026-05-30)

## What was done

- `src/components/problem/CelebrationOverlay.tsx`: new component that renders 12 floating star/sparkle emoji particles with randomized positions, sizes, delays, and rotations. Auto-dismisses after 1.5 seconds.
- `src/app/globals.css`: added `@keyframes celebrate-star` animation (scale-in, float-up, fade-out) and `.animate-celebrate-star` utility class.
- `src/components/problem/ProblemPlayer.tsx`: integrated `CelebrationOverlay` wrapped around `GoBoard` in a `relative` container. Animation triggers on correct answer via `celebrateTrigger` counter that remounts the overlay component. Wrong answers do not trigger animation.
- `docs/TASKS.md`: marked v0.6.0c delivered, next → v0.6.0d.
- `npm run test` passes (258 tests).
- `npm run build` passes.

## PR

- Branch: `feat/v0.6.0c-success-animations-star-effects`
- PR: #76

---

# ✅ v0.6.0d — Toggleable Audio Feedback — COMPLETED (2026-06-01)

## What was done

- `src/lib/audioFeedback.ts`: new helper module
  - `playCorrect()` / `playWrong()` use Web Audio API generated tones (sine wave, ~140–160ms, gentle gain) with envelope ramp to avoid clicks
  - `loadAudioPreference()` / `isAudioEnabled()` / `setAudioEnabled(enabled)` persist user choice to `localStorage["children-go-app:v0.6:audio"]` (default = enabled)
  - All functions are no-op safe when `window` / `AudioContext` is unavailable (SSR, autoplay block, no Web Audio); never throw
  - `AudioContext` is created lazily, cached, and resumed on first call
- `src/__tests__/audioFeedback.test.ts`: 11 new tests covering default preference, persistence, malformed values, localStorage access errors, no-op when disabled, tone parameter shape, and graceful fallback when AudioContext is missing
- `src/components/problem/ProblemPlayer.tsx`: invokes `playCorrect()` on correct answers and `playWrong()` on wrong answers; both are fire-and-forget (`void`) so audio never blocks the answer flow
- `src/app/settings/page.tsx`: new "声音设置" card with on/off toggle (accessible `role="switch"`, `aria-checked`); state initialized from `loadAudioPreference()` on mount
- `docs/TASKS.md`: marked v0.6.0d delivered, next → v0.6.0e hint presentation polish
- `npm run test` passes (258 + 11 = 269 tests)
- `npm run build` passes
- No `package.json` / `package-lock.json` changes
- No problem data, schema, spaced review, weekly report, Supabase, or SQL changes

## PR

- Branch: `feat/v0.6.0d-audio-feedback`
- PR: #78

---

# ✅ v0.6.0e — Hint Presentation Polish — COMPLETED (2026-06-01)

## What was done

- `src/lib/hintCoordinate.ts`: new deterministic parser
  - `extractHintCoordinate(text, boardSize): {x,y} | null` — strict regex match on `(x, y)` with non-negative integers, both within `[0, boardSize)`
  - `extractHintCoordinates(hints, boardSize): Point[]` — convenience for an array
  - Direction words (上面/左边/中间 etc.) and malformed input return `null`; no natural-language guessing
- `src/components/board/BoardHighlight.tsx`: hint highlight is now a small **outlined** ring (`r * 0.4`, no fill) — visually distinct from the large filled green/red circles used for correct/wrong answers
- `src/components/problem/HintPanel.tsx`: progressive cards
  - Each revealed hint renders as a card with a numbered badge (1, 2, 3 …), 💡 icon, and visible/total counter
  - Newly revealed card gets a 0.4s fade-in animation via a new `hint-fade-in` keyframe in `globals.css`
  - Empty state distinguishes "no hints in problem" vs "hints available but none revealed"
  - "显示提示" button remains, hidden when all shown or no hints
- `src/components/problem/ProblemPlayer.tsx`: derives hint coordinates from the current step's revealed hints and adds them as `type: "hint"` highlights, gated by `result === null && !showAnswer && visibleCount > 0` so they never collide with correct/wrong overlays
- `src/__tests__/hintCoordinate.test.ts`: 15 tests covering parse, multi-occurrence, out-of-range, malformed, empty/null input, boardSize boundary
- `src/__tests__/HintPanel.test.tsx`: 9 tests covering empty state, progressive reveal, card count matches visibleCount, show-hint button visibility, click callback, and counter
- `src/app/globals.css`: added `@keyframes hint-fade-in` and `.animate-hint-fade-in` utility
- `docs/TASKS.md`: marked v0.6.0e delivered, next → v0.6 stabilization & release notes
- `npm run test` passes (269 + 24 = 293 tests, 20 files)
- `npm run build` passes
- No `package.json` / `package-lock.json` changes
- No problem data, schema, answer validation, spaced review, weekly report, Supabase, or SQL changes
- No new external dependencies

## Known limitation (documented)

- Hint coordinates are extracted only from the deterministic `(x, y)` text pattern. Hints that use directional language (上面, 左边, 中间, 角) intentionally do **not** produce a board indicator — this avoids fragile natural-language guessing. Card text remains the only signal in those cases.

## PR

- Branch: `feat/v0.6.0e-hint-presentation`
- PR: #80

---

# ✅ v0.6 Stabilization & Release Notes — COMPLETED (2026-06-01)

## What was done

- `docs/RELEASE_NOTES_v0.6.md` — v0.6 release notes covering v0.6.0a–e:
  direction and rationale, per-slice summary (PR #68/#72/#76/#78/#80),
  backward compatibility, known limitations (including
  deterministic-only hint coordinate parsing), validation status, and
  a short next-phase comparison.
- `docs/QA_CHECKLIST_v0.6.md` — manual QA checklist covering local
  anonymous mode, `/demo` isolation, practice / level / chapter flows,
  Chinese board labels, correct-answer celebration, audio
  enable/disable + refresh persistence, progressive hint cards,
  deterministic board hint markers and overlap rules with
  correct/wrong overlays, wrong book, report, spaced review smoke
  check, build/test smoke check, and mobile sanity.
- `docs/TASKS.md` — current phase updated to v0.6 stabilization
  complete, next task set to v0.7.0a planning, future roadmap cleaned
  to remove the stale "v0.6.0e (optional)" trailing line and to
  introduce a v0.7.0 planning entry.
- Docs-only change. No code, test, config, package, lockfile, schema,
  problem data, audio, animation, hint, coordinate-label, spaced
  review, weekly report, wrong book, progress, Supabase, or SQL
  behavior was modified.
- `npm run test` and `npm run build` were not re-run for this PR —
  no code paths changed. The numbers cited in the release notes
  (299 tests / 20 files) were captured against `main` at `ac94ffb`
  immediately after v0.6.0e (PR #80) merged.

## Next phase recommendation

`v0.7.0a` should be a planning-only slice that selects a single
direction. Recommended primary: **content balancing** (more endgame,
more opening, better level 3–5 distribution) — addresses the v0.5
limitations and continues the proven v0.4 / v0.5 expansion pattern.
Recommended secondary if content gap is judged non-pressing:
**infrastructure / E2E / CI hardening**. See
`docs/RELEASE_NOTES_v0.6.md` section 7 for the full comparison.

## PR

- Branch: `docs/v0.6-stabilization-release-notes`
- PR: #82 (closes #81)

---

# ✅ v0.6 Follow-up: /practice Last-Problem Async Race Fix — COMPLETED (2026-06-02)

## What was done

- `src/app/practice/page.tsx`:
  - `handleNext` now calls `setPhase("summary")` in the same
    batched update as `setSession(updated)` when the advanced
    session is `completed`, so the `"playing"` branch never sees
    an out-of-bounds `session.currentIndex`. The async
    `recordDailyPracticeCompleteWithSync` call happens **after**
    the phase flip, so the `"summary"` branch re-renders during
    the await window.
  - Render branch gated on `!session.completed` plus a defensive
    `if (!problem) return null` belt-and-suspenders guard.
- `src/__tests__/practice-page.test.tsx` (new, 2 tests):
  - End-of-session regression: with a deferred
    `recordDailyPracticeCompleteWithSync` Promise, asserts the
    summary phase is rendered synchronously and ProblemPlayer is
    never rendered with an undefined / `"MISSING"` problem during
    the await window.
  - Non-final advance: with two problems, `onNext` on the first
    problem stays in playing phase and does **not** call
    `recordDailyPracticeCompleteWithSync`.
- `npm run test` passes (301 tests / 21 files).
- `npm run build` passes.
- No `package.json` / `package-lock.json` changes.
- No problem data, schema, ProblemPlayer, audio, animation, hint,
  coordinate-label, spaced review, weekly report, Supabase, or
  SQL changes.

## PR

- Branch: `fix/practice-completion-race`
- PR: #84 (closes #83)

---

# ✅ v0.7.0a — Next Phase Plan — COMPLETED (2026-06-02)

## What was done

- `docs/NEXT_PHASE_PLAN_v0.7.md` — next phase plan covering:
  - context: v0.6 polish + stabilization + follow-up fix shipped;
    65 problems across 6 categories; level 2 dominance;
    endgame / opening thin.
  - 4 candidate directions evaluated (content balancing, deeper
    multi-step, infrastructure / E2E / CI, deployment / Supabase
    env hardening) with strengths, weaknesses, slice count, and
    fit-now verdict for each.
  - primary direction selected: **A — content balancing**
    (endgame + opening + level 3–5 rebalance), with rationale
    tied to v0.5 documented limitations and v0.6 UX readiness.
  - 3 implementation slices defined (v0.7.0b content pack,
    v0.7.0c content validation, v0.7.0d stabilization and release
    notes), each with goal, scope, acceptance criteria, and
    explicit non-goals.
  - out-of-scope boundaries and v0.7 acceptance rules
    (one PR per slice, no schema rewrite, no package / lockfile
    unless explicitly scoped, no AI / payment / teacher / admin /
    leaderboard / board-size / SGF / multiplayer).
- `docs/TASKS.md` updated: current phase set to v0.7.0a complete,
  next task set to v0.7.0b, future roadmap cleaned and extended
  with v0.7.0b/c/d entries.
- Docs-only change. No code, test, config, package, lockfile,
  schema, problem data, runtime, Supabase, or SQL behavior was
  modified.

## PR

- Branch: `docs/v0.7.0a-next-phase-plan`
- PR: #86 (closes #85)

---

# ✅ v0.7.0b — Content Pack: Endgame + Opening + Level 3–5 — COMPLETED (2026-06-03)

## What was done

- Added 12 new single-step problems to `src/data/problems.json`
  (problem count: 65 → 77):
  - **Endgame (4):** END-005 (L2 edge), END-006 (L3 corner),
    END-007 (L4 center connect), END-008 (L5 center defend)
  - **Opening (4):** OP-006 (L5 tengen), OP-007 (L3 approach),
    OP-008 (L3 corner secure), OP-009 (L4 extend)
  - **Level 3–5 rebalance (4):** CAP-018 (L3 big-group capture),
    ESC-011 (L3 escape from atari), CC-014 (L3 cut),
    LD-010 (L3 make first eye)
- All 12 problems: 9×9, single-step, ≥2 hints, soft
  `failureMessage`, category-aligned tag, answer points empty,
  no zero-liberty initial groups.
- `src/__tests__/problems.test.ts`:
  - count test 65 → 77
  - endgame level range test updated 1–3 → 1–5
    (END-007 L4 + END-008 L5 added)
  - new v0.7.0b block (15 tests):
    ID existence, beyond-range check, endgame +4 count,
    opening +4 count, OP-006 L5 opening, END-007 L4
    endgame, END-008 L5 endgame, level 3–5 ≥30, 9×9 /
    single-step consistency, and 6 review-time correctness
    checks (END-005 adjacency, END-007 connect, CAP-018
    liberties, ESC-011 atari, OP-006 tengen, LD-010 eye).
- `docs/CONTENT_REVIEW_v0.7.0b.md` — content review with
  problem table, category/level deltas, acceptance criteria
  coverage, per-problem verification, validation results.
- `docs/TASKS.md` — marked v0.7.0b delivered, next task set
  to v0.7.0c.
- `npm run test` passes (316 tests / 21 files).
- `npm run build` passes.
- No `package.json` / `package-lock.json` changes.
- No schema, ProblemPlayer, audio, animation, hint,
  coordinate-label, spaced review, weekly report, Supabase,
  or SQL changes.
- No `chapters.ts` changes — v0.7.0b follows v0.5.0b
  convention of keeping new problems reachable via `/demo`
  and review but outside the daily practice rotation.
  Chapter wiring is a separate concern (deferred).

## PR

- Branch: `feat/v0.7.0b-content-pack`
- PR: TBD (closes #87)

---

# ✅ v0.7.0c — Content Validation and Regression — COMPLETED (2026-06-04)

## What was done

- Added 6 per-problem correctness checks in `src/__tests__/problems.test.ts`:
  - END-006: answer (3,3) empty, fills black corner wall gap
  - END-008: answer (3,3) empty, fills black formation internal gap
  - OP-007: answer (2,2) empty, proper knight approach to white corner
  - OP-008: answer (2,2) empty, proper knight enclosure from black corner
  - OP-009: answer (0,3) empty, proper edge extension
  - CC-014: answer (3,3) empty, cuts white groups at (3,2) and (3,4)
- Added `describe("per-property v0.7.0b validation")` block (4 tests):
  - All answer points empty in initial board state
  - All problems have ≥2 hints
  - All failureMessages avoid harsh wording
  - All problems have exactly 1 answer point
- Created `docs/CONTENT_REVIEW_v0.7.0c.md` — validation log with
  per-problem verification, final distribution (77 problems),
  and known limitations.
- Updated `docs/TASKS.md` — marked v0.7.0c delivered, next → v0.7.0d.
- `npm run test` passes: 326 tests (21 files).
- `npm run build` passes.

## Non-goals respected

- No new problem additions.
- No changes to `chapters.ts`, daily practice rotation,
  ProblemPlayer, audio, animation, hint presentation,
  coordinate labels, spaced review, weekly report, Supabase,
  SQL, package.json, or lockfile.

---

# ✅ v0.7.0d — Stabilization and Release Notes — COMPLETED (2026-06-04)

## What was done

- Created `docs/RELEASE_NOTES_v0.7.md` with:
  - v0.7 direction and rationale (content balancing selected in v0.7.0a)
  - v0.7.0b content additions (12 new problems, final library: 77)
  - v0.7.0c validation summary (10 new tests, CONTENT_REVIEW created)
  - Final content inventory (category and level distribution)
  - Known limitations and backward compatibility
  - Next-phase recommendation: v0.8.0a planning with chapter/daily-practice
    content wiring as the primary candidate
- Created `docs/QA_CHECKLIST_v0.7.md` with:
  - 18 sections covering scope confirmation, environment check,
    local anonymous mode, demo isolation, practice flow, level/chapter flow,
    v0.6 polish regression (labels, celebration, audio, hints),
    v0.7 content sanity (all 12 new problems), wrong book, report,
    spaced review, build/test smoke check, mobile sanity,
    release decision template, and completion criteria
- Updated `docs/TASKS.md`: current phase set to v0.7 stabilization complete,
  next task set to v0.8.0a, future roadmap updated
- Docs-only change. No code, test, config, package, lockfile,
  schema, problem data, runtime, Supabase, or SQL behavior was modified.

## PR

- Branch: `docs/v0.7.0d-stabilization-release-notes`
- PR: #93 (closes #92)

---

# ✅ v0.8.0a — Next Phase Plan — COMPLETED (2026-06-04)

## What was done

- `docs/NEXT_PHASE_PLAN_v0.8.md` — next phase plan covering:
  - context: v0.7 content balancing complete; 77 problems, 6 categories,
    levels 1–5; only 24 of 77 problems wired into chapters; remaining
    53 only reachable via `/demo` and spaced review.
  - 5 candidate directions evaluated (chapter/daily-practice content
    wiring, infrastructure/E2E/CI hardening, deployment/Supabase env
    hardening, deeper multi-step support, further content expansion)
    with strengths, weaknesses, estimated slice count, and fit-now
    verdict for each.
  - primary direction selected: **A — chapter/daily-practice content
    wiring** (wire the 53 unwired problems into `chapters.ts`), with
    rationale tied to the 69 % wiring gap, deferred commitment from
    v0.7.0b, and lowest risk among high-impact directions.
  - 3 implementation slices defined:
    - v0.8.0b: wire capture (CAP-011~018) + escape (ESC-006~011) +
      connect_cut (CC-007~014) into existing chapters
    - v0.8.0c: create new life_death and endgame chapters; wire
      LD-001~010, END-001~008, and remaining OP-004~009
    - v0.8.0d (optional): wire 9 multi-step problems (MULTI-001~009)
  - out-of-scope boundaries and v0.8 acceptance rules
    (one PR per slice, `chapters.ts` only, no schema/package/lockfile
    changes, no AI/payment/teacher/admin/leaderboard/board-size/SGF).
- `docs/TASKS.md` updated: current phase set to v0.8.0a complete,
  next task set to v0.8.0b, future roadmap extended with v0.8 entries.
- Docs-only change. No code, test, config, package, lockfile,
  schema, problem data, runtime, Supabase, or SQL behavior was modified.

## PR

- Branch: `docs/v0.8.0a-next-phase-plan`
- PR: #95 (closes #94)

---

# ✅ v0.8.0b — Wire Capture + Escape + Connect_Cut — COMPLETED (2026-06-04)

## What was done

- `src/lib/chapters.ts` — wired 21 single-step problems into existing
  chapters:

  **Capture (8):** CAP-011~CAP-018 across 4 new levels (capture-6~9)
  - capture-6: CAP-011 (L1), CAP-012 (L2)
  - capture-7: CAP-013 (L2), CAP-014 (L2)
  - capture-8: CAP-018 (L3)
  - capture-9: CAP-015 (L4), CAP-016 (L5), CAP-017 (L5)

  **Escape (6):** ESC-006~ESC-011 across 3 new levels (escape-4~6)
  - escape-4: ESC-006 (L2), ESC-007 (L2), ESC-008 (L2)
  - escape-5: ESC-011 (L3)
  - escape-6: ESC-009 (L4), ESC-010 (L5)

  **Connect/Cut (7):** CC-007~CC-009, CC-011~CC-014 across 3 new levels
  (connect-cut-4~6)
  - connect-cut-4: CC-007 (L2), CC-008 (L2), CC-011 (L2)
  - connect-cut-5: CC-009 (L3), CC-014 (L3)
  - connect-cut-6: CC-012 (L4), CC-013 (L5)

- `getAllProblemIds()` returns 45 unique IDs (24 existing + 21 new).
- No existing wired problem was removed or reordered.
- No multi-step, life_death, endgame, or opening problems were wired.
- No changes to `src/lib/practice.ts` — daily practice automatically
  picks up newly wired problems via existing `getAllProblemIds()`.
- `npm run test` passes (326 tests / 21 files — unchanged, no existing
  test asserted the previous wired count).
- `npm run build` passes.
- `docs/TASKS.md` updated — marked v0.8.0b delivered, next → v0.8.0c.

## Non-goals respected

- No problem data changes (`src/data/problems.json` untouched).
- No schema changes.
- No `practice.ts`, `ProblemPlayer`, UI, audio, animation, hint,
  coordinate-label, spaced review, weekly report, Supabase, SQL,
  package, or lockfile changes.

---

# ✅ v0.8.0c — Wire Life/Death + Endgame + Opening — COMPLETED (2026-06-04)

## What was done

- `src/lib/chapters.ts` — wired 23 single-step problems:

  **Life/Death (9):** LD-001~LD-004, LD-006~LD-010 across 4 new levels
  in a new `life_death` chapter (死活山洞, 🏯):
  - life-death-1: LD-001 (L2), LD-002 (L2), LD-007 (L2)
  - life-death-2: LD-003 (L3), LD-004 (L3), LD-006 (L3)
  - life-death-3: LD-010 (L3)
  - life-death-4: LD-008 (L4), LD-009 (L5)

  **Endgame (8):** END-001~END-008 across 3 levels in a new `endgame`
  chapter (官子山谷, 🌄):
  - endgame-1: END-001 (L1), END-002 (L2), END-004 (L2)
  - endgame-2: END-005 (L2), END-003 (L3), END-006 (L3)
  - endgame-3: END-007 (L4), END-008 (L5)

  **Opening (6):** extended existing `opening` chapter with 2 new levels:
  - opening-3: OP-004 (L1), OP-007 (L3), OP-008 (L3)
  - opening-4: OP-005 (L4), OP-009 (L4), OP-006 (L5)

- `getAllProblemIds()` returns 68 unique IDs (45 existing + 23 new).
- No existing wired problem was removed or reordered.
- No capture, escape, or connect_cut wiring was changed from v0.8.0b.
- No multi-step problems were wired.
- No changes to `src/lib/practice.ts`.
- `npm run test` passes (326 tests / 21 files — count unchanged).
- `npm run build` passes.
- `docs/TASKS.md` updated — marked v0.8.0c delivered, next → v0.8.0d.

## Non-goals respected

- No problem data changes (`src/data/problems.json` untouched).
- No schema changes.
- No `practice.ts`, `ProblemPlayer`, UI, audio, animation, hint,
  coordinate-label, spaced review, weekly report, Supabase, SQL,
  package, or lockfile changes.

---

# ✅ v0.8.0d — Wire Multi-Step Problems — COMPLETED (2026-06-04)

## What was done

- `src/lib/chapters.ts` — wired all 9 existing multi-step problems into their category-correct chapters:

  **Capture (3):** added capture-10 with MULTI-001 (L2), MULTI-004 (L2), MULTI-005 (L2)
  **Life/Death (3):** added life-death-5 with MULTI-002 (L3), MULTI-006 (L3), MULTI-007 (L3)
  **Connect/Cut (2):** added connect-cut-7 with MULTI-003 (L2), MULTI-008 (L2)
  **Escape (1):** added escape-7 with MULTI-009 (L2)

  Note: MULTI-009 is category `escape` in the actual problem data (not connect_cut as the v0.8.0a plan suggested), so it was placed in the escape chapter per the issue instruction to follow actual problem category.

- `getAllProblemIds()` returns 77 unique IDs — full problems.json library now wired.
- No existing wired problem was removed or reordered.
- No single-step wiring was changed from v0.8.0b/v0.8.0c.
- No changes to `src/lib/practice.ts`.
- `npm run test` passes (326 tests / 21 files — count unchanged, no existing test asserted prior wired count).
- `npm run build` passes.
- `docs/TASKS.md` updated — marked v0.8.0d delivered, next → v0.8 stabilization / release notes.

## Non-goals respected

- No problem data changes (`src/data/problems.json` untouched).
- No schema changes.
- No `practice.ts`, `ProblemPlayer`, UI, audio, animation, hint,
  coordinate-label, spaced review, weekly report, Supabase, SQL,
  package, or lockfile changes.

---

# ✅ v0.8 Stabilization & Release Notes — COMPLETED (2026-06-04)

## What was done

- `docs/RELEASE_NOTES_v0.8.md` — v0.8 release notes covering:
  direction and rationale (chapter/daily-practice wiring selected in
  v0.8.0a), v0.8.0b/c/d wiring summary with per-chapter problem tables,
  final chapter inventory (6 chapters, 36 levels, 77 problems, 68
  single-step + 9 multi-step), backward compatibility, known
  limitations (no skill filtering, 2-step only, no E2E/CI), validation
  status, and next-phase recommendation (v0.9.0a — infrastructure/E2E/CI
  hardening recommended primary).
- `docs/QA_CHECKLIST_v0.8.md` — manual QA checklist with 25 sections
  covering: scope confirmation, environment check, local anonymous mode,
  demo isolation, all 6 chapters flow (capture, escape, connect_cut,
  opening, life_death, endgame), multi-step regression, practice flow,
  v0.6 polish regression (labels, celebration, audio, hints), v0.7
  content regression, wrong book, report, spaced review, build/test
  smoke check, mobile sanity, release decision template, and completion
  criteria.
- `docs/TASKS.md` — current phase updated to v0.8 stabilization complete,
  next task set to v0.9.0a, future roadmap updated.
- Docs-only change. No code, test, config, package, lockfile,
  schema, problem data, runtime, Supabase, or SQL behavior was modified.

## PR

- Branch: `docs/v0.8-stabilization-release-notes`
- PR: #104 (closes #102)

---

# ✅ v0.9.0a — Next Phase Plan — COMPLETED (2026-06-04)

## What was done

- `docs/NEXT_PHASE_PLAN_v0.9.md` — next phase plan covering:
  - context: v0.8 content wiring complete; 77 problems all wired; manual
    QA checklist at 25 sections; no CI or E2E; daily practice lacks skill
    filtering; multi-step capped at 2 steps.
  - 5 candidate directions evaluated (infrastructure / E2E / CI hardening,
    deployment / Supabase env hardening, deeper multi-step support,
    further content expansion, daily-practice skill filtering) with
    strengths, weaknesses, estimated slice count, and fit-now verdict
    for each.
  - primary direction selected: **A — infrastructure / E2E / CI hardening**
    with rationale tied to v0.8 release notes recommendation, highest
    long-term ROI, and preparation for all future directions.
  - 3 implementation slices defined:
    - v0.9.0b: GitHub Actions CI + Playwright setup
    - v0.9.0c: E2E smoke tests for core flows
    - v0.9.0d (optional): release QA automation + stabilization
  - out-of-scope boundaries and v0.9 acceptance rules
    (one PR per slice, no mixing, package/lockfile changes scoped to
    v0.9.0b only, no schema change, no AI/payment/teacher/admin/
    leaderboard/board-size/SGF/multiplayer scope creep).
- `docs/TASKS.md` updated: current phase set to v0.9.0a complete,
  next task set to v0.9.0b, future roadmap updated.
- Docs-only change. No code, test, config, package, lockfile,
  schema, problem data, runtime, Supabase, or SQL behavior was modified.

## PR

- Branch: `docs/v0.9.0a-next-phase-plan`
- PR: #106 (closes #105)

---

# ✅ v0.9.0b — GitHub Actions CI + Playwright Setup — COMPLETED (2026-06-04)

## What was done

- `.github/workflows/ci.yml` — GitHub Actions workflow that:
  - Triggers on pushes to `main` and PRs against `main`.
  - Uses Node.js 22 with `npm ci`.
  - Installs Playwright Chromium browsers.
  - Runs `npm run lint`, `npm run typecheck`, `npm run test`,
    `npm run build`, and `npm run test:e2e` as hard gates.
  - Uploads Playwright traces on failure (7-day retention).
- `playwright.config.ts` — Playwright configuration:
  - Test directory: `./e2e`.
  - Chromium project only.
  - Web server: standalone server on port 3100.
  - `reuseExistingServer: !process.env.CI`.
  - 2 retries in CI, 0 locally.
  - `forbidOnly` in CI.
- `e2e/home.spec.ts` — one minimal smoke test:
  - Boots the app and navigates to `/`.
  - Asserts `h1` contains "欢迎回来，小棋手！".
  - Asserts navigation links (今日练习, 闯关地图, 错题本, 学习报告) are visible.
  - Does not depend on Supabase env variables.
  - Does not write real progress or require authentication.
- `package.json` — added `@playwright/test` dev dependency; added
  `test:e2e` script.
- `package-lock.json` — updated consistently.
- `docs/TASKS.md` — marked v0.9.0b delivered, next task → v0.9.0c.

## Prerequisite

This PR depends on PR #109 (lint/typecheck cleanup) which was merged
first so that `npm run lint` and `npm run typecheck` exit 0, enabling
CI hard gates.

## Validation

- `npm run lint`: exit 0 (after PR #109 cleanup).
- `npm run typecheck`: exit 0 (after PR #109 cleanup).
- `npm run test`: 326 tests / 21 files pass.
- `npm run build`: passes.
- `npm run test:e2e`: 1 test passes.

## Non-goals respected

- No comprehensive E2E test suite (deferred to v0.9.0c).
- No release QA automation (deferred to v0.9.0d).
- No `src/` source code changes in this PR.
- No changes to `src/lib/chapters.ts` or `src/lib/practice.ts`.
- No SQL/Supabase, AI, payment, teacher/admin, leaderboard, board-size,
  SGF, multiplayer, or app redesign work.

---

# ✅ v0.9.0c — E2E Smoke Tests for Core Flows — COMPLETED (2026-06-05)

## What was done

- Added 5 new Playwright test files to `e2e/`:
  - `e2e/levels.spec.ts` — `/levels` renders all 6 chapter entries
  - `e2e/chapter.spec.ts` — `/levels/capture` renders with levels
  - `e2e/demo.spec.ts` — `/demo` loads a problem with board and controls
  - `e2e/practice.spec.ts` — `/practice` shows idle state with start button
  - `e2e/settings.spec.ts` — `/settings` renders with audio toggle
- Existing `e2e/home.spec.ts` retained (1 test, home page smoke).
- Total E2E coverage: 6 tests across home, levels, chapter, demo, practice, settings.
- Tests pass without Supabase env, login, or child profile setup.
- Tests use stable user-facing text and role selectors where practical.
- No `src/` source files modified.
- No `package.json`, `package-lock.json`, `playwright.config.ts`, or CI workflow changes.
- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run test` — 326 passed (21 files).
- `npm run build` — compiled successfully.
- `npm run test:e2e` — 6 passed (3.8s, Chromium).
- `docs/TASKS.md` updated — marked v0.9.0c delivered, next → v0.9.0d.

## Non-goals respected

- No visual regression testing or golden screenshots.
- No performance benchmarking.
- No comprehensive wrong-book / report / spaced-review E2E coverage.
- No `src/` source code changes.
- No package or lockfile changes.
- No Playwright config or CI workflow changes.

---

# ✅ v0.9.0d — Release QA Automation and Stabilization — COMPLETED (2026-06-05)

## What was done

- `docs/RELEASE_NOTES_v0.9.md` — release notes covering:
  - v0.9 direction and rationale (infrastructure / E2E / CI hardening)
  - Prerequisite cleanup (PR #109)
  - v0.9.0a–c per-slice summary with PR references
  - CI inventory (triggers, gates, Node.js 22, Chromium)
  - E2E inventory (6 tests, what is / is not covered)
  - Current product baseline (77 problems, 77/77 wired)
  - Known limitations and next-phase recommendation
  - Recommended: v0.10.0a planning for daily-practice skill filtering
- `docs/QA_CHECKLIST_v0.9.md` — QA checklist covering:
  - CI gate validation
  - Local validation commands
  - E2E smoke per-route checklist
  - v0.8/v0.7/v0.6 regression checks
  - Release decision template and completion criteria
- `docs/TASKS.md` — marked v0.9 stabilization delivered, next → v0.10.0a

## Non-goals respected

- No changes to `src/` source files
- No changes to `e2e/` tests
- No changes to `.github/workflows/ci.yml` or `playwright.config.ts`
- No package or lockfile changes
- No problem data, schema, or runtime UI changes

---

# ✅ v0.10.0a — Next Phase Plan — COMPLETED (2026-06-05)

## Deliverables

- `docs/NEXT_PHASE_PLAN_v0.10.md` — next phase plan covering:
  - evaluation of all 5 required candidate directions
  - selected primary direction: daily-practice skill filtering / level-aware
    selection
  - 3 implementation slices (b, c, d) with acceptance criteria and
    non-goals
  - out-of-scope boundaries and v0.10 acceptance rules
- `docs/TASKS.md` — marked v0.10.0a delivered, next task set to v0.10.0b

## Branch

- `docs/v0.10.0a-next-phase-plan` → PR #116

---

# ✅ v0.10.0b — Category-Balanced Selection with Basic Level Clamping — COMPLETED (2026-06-05)

## Deliverables

- `src/lib/practice.ts` — `selectDailyProblems` signature updated to
  accept `StudentProgress | null`; round-robin category selection with
  max 3 per category; level clamp at `max(childMaxLevel, 2)` from
  completed/mastered problem IDs; empty-progress fallback preserves
  random selection.
- `src/app/practice/page.tsx` — passes current `progress` state to
  `selectDailyProblems`.
- `src/__tests__/practice.test.ts` — 8 new/updated selection tests: null
  progress fallback, empty progress fallback, null random fallback
  category-cap guard, stale completed IDs fallback, level clamp
  (low-level child), level clamp (high-level child), category balance,
  sparse pool.
- `docs/TASKS.md` — marked v0.10.0b delivered, next task → v0.10.0c.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 334 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed (3.2s) |

## Branch

- `feat/v0.10.0b-category-balanced-selection` → PR #118

---

# ✅ v0.10.0c — Spaced Review Integration — COMPLETED (2026-06-05)

## Deliverables

- `src/lib/practice.ts` — added `getPriorityProblems` helper that reserves
  up to 2 slots for due review problems (`nextReviewAt <= today`) and
  1 slot for a non-mastered wrong problem; priority selections count
  toward per-category caps; v0.10.0b category balance and level clamp
  preserved.
- `src/__tests__/practice.test.ts` — 7 new/updated review-priority tests: due
  review included, future review excluded, wrong problem included,
  duplicate prevention, category balance with review/wrong, mastered
  wrong excluded, unavailable due review ID ignored.
- `docs/TASKS.md` — marked v0.10.0c delivered, next task → v0.10.0d.
- `src/lib/spaced-review.ts` — not modified.

## Algorithm Summary

`getPriorityProblems(progress, candidates, today)`:
1. Scan `progress.reviewSchedule` for entries where `nextReviewAt <= today`
   and the problem ID exists in candidates; pick up to 2.
2. Scan `progress.wrongProblems` for non-mastered entries not already in
   review slots; pick 1.
3. Priority selections count toward category max-3 caps.
4. Remaining slots filled by v0.10.0b category-balanced round-robin.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 341 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed (3.5s) |

## Branch

- `feat/v0.10.0c-spaced-review-priority` → PR #120

---

# ✅ v0.10.0d — Multi-Step Awareness and Safe Exposure — COMPLETED (2026-06-05)

## Deliverables

- `src/lib/practice.ts` — added `isMultiStepProblem`, `getCategorySingleStepMaxLevel`, 
  and `isMultiStepEligible` helper functions. Multi-step problems are now excluded
  unless the child has completed at least one single-step problem in the same category
  AND their max level in that category is within 1 of the multi-step problem's level.
- `src/__tests__/practice.test.ts` — 11 new multi-step eligibility tests: ineligible
  when no single-step completed in category, ineligible when max level too low,
  eligible when within 1 level, ineligible due review not forced, ineligible wrong
  problem not forced, category balance preserved, safe fallback when filtering
  leaves too few candidates (asserts ineligible excluded), ineligible due review
  excluded even with sparse candidates, ineligible wrong problem excluded even
  with sparse candidates, all-ineligible sparse pool returns empty or single-step only.
- `docs/TASKS.md` — marked v0.10.0d delivered, next task → v0.10 stabilization.
- `src/data/problems.json` — not modified.
- `ProblemStep` schema — not changed.

## Algorithm Summary

`isMultiStepEligible(problem, progress, problems)`:
1. Check if problem is multi-step via `totalSteps > 1` or `steps.length > 0`.
2. Non-multi-step and mixed-category problems are always eligible.
3. For multi-step problems in a specific category:
   - Find all completed/mastered single-step problems in that category.
   - If none found → not eligible.
   - Get max level from those single-step problems.
   - Eligible if `problem.level - categoryMaxLevel <= 1`.

Multi-step filtering applied before `getPriorityProblems` and candidate pool
construction, so ineligible multi-step due reviews and wrong problems are not
forced into the session.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 351 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed |

## Branch

- `feat/v0.10.0d-multi-step-awareness` → PR #122

---

# ✅ v0.10 Stabilization / Release Notes — COMPLETED (2026-06-05)

## Deliverables

- `docs/RELEASE_NOTES_v0.10.md` — v0.10 release notes covering direction
  and rationale, per-slice summary (PR #116/#118/#120/#122), current
  behavior inventory, compatibility, validation status, known limitations,
  and next-phase recommendation.
- `docs/QA_CHECKLIST_v0.10.md` — manual QA checklist covering automated
  gates, local validation, daily-practice selection behavior (null/empty/
  stale fallback, category balance, level clamp, due review priority,
  wrong-problem priority, duplicate prevention, multi-step eligibility,
  sparse candidate behavior), E2E regression, content regression, v0.6
  polish regression, optional Supabase checks, and release decision
  template.
- `docs/TASKS.md` — marked v0.10 complete, next task → v0.11.0a.
- Docs-only change. No code, test, config, package, lockfile, schema,
  problem data, runtime, Supabase, or SQL behavior was modified.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 351 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed |

Validation values inherited from `main` after v0.10.0d (PR #122) merged.
This docs-only PR does not re-run validation checks.

## Branch

- `docs/v0.10-stabilization-release-notes` → PR #124

---

# ✅ v0.11.0a — Next Phase Plan — COMPLETED (2026-06-05)

## Deliverables

- `docs/NEXT_PHASE_PLAN_v0.11.md` — next phase plan evaluating 5 candidate
  directions (Deployment / Supabase env hardening, UI explainability,
  deeper multi-step, content expansion, release automation maturity).
  Selected primary direction: Deployment / Supabase environment hardening.
  Defined 3 implementation slices (v0.11.0b/c/d).
- `docs/TASKS.md` — marked v0.11.0a delivered, next task → v0.11.0b.
- Docs-only change. No code, test, config, package, lockfile, schema,
  problem data, runtime, Supabase, or SQL behavior was modified.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 351 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed |

Validation values inherited from `main` after v0.10 stabilization (PR #124)
merged. This docs-only PR does not re-run validation checks.

## Branch

- `docs/v0.11.0a-next-phase-plan` → PR #126

---

# ✅ v0.11.0b — Docker Compose Supabase Env Passthrough + `.env.example` Guidance — COMPLETED (2026-06-05)

## Deliverables

- `docker-compose.yml` — added `env_file: .env.local (required: false)` so
  Docker Compose reads Supabase vars from `.env.local` when present.
  Removed explicit `${VAR:-}` passthrough from `environment` to avoid
  empty-string override of `env_file` values.
- `docker-compose.dev.yml` — same `env_file` for dev mode.
- `.env.example` — expanded comments to clarify optional Supabase
  setup, local anonymous fallback, Docker usage via `.env.local`,
  and service-role key safety warning.
- `README.md` — updated Docker deployment section to mention that
  Docker Compose reads Supabase vars from `.env.local` when present.
- `docs/TASKS.md` — marked v0.11.0b delivered, next task → v0.11.0c.

## Docker/Env Behavior Summary

| Scenario | Behavior |
|---|---|
| No `.env.local` | App starts in local anonymous mode |
| `.env.local` with Supabase vars | Docker Compose reads vars via `env_file`; app enters cloud-sync mode |
| Missing one of two vars | App treats Supabase as unconfigured; local anonymous mode |

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 351 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed |
| `docker compose up --build` | Starts without Supabase env; reachable at localhost:3000 |

No `src/` source files, tests, E2E tests, CI workflow, package/lockfile,
problem data, schema, SQL/Supabase behavior changes were included.

## Branch

- `chore/v0.11.0b-docker-supabase-env` → PR #128

---

# ✅ v0.11.0c — CI Docker Build Verification + Deployment Documentation Refresh — COMPLETED (2026-06-05)

## Deliverables

- `.github/workflows/ci.yml` — added Docker build verification step
  (`docker compose build`) after existing lint/typecheck/test/build/E2E
  gates. Does not start the container or run E2E against Docker.
- `docs/DEPLOYMENT.md` — new deployment document replacing stale
  `docs/DEPLOYMENT_STRATEGY_v0.2.md`. Covers current deployment modes
  (local anonymous, Supabase cloud-sync, Docker production, Docker dev),
  Docker Compose env behavior, environment variables, cloud-failure
  tolerance, validation commands, current baseline, and out-of-scope
  boundaries.
- `docs/DEPLOYMENT_STRATEGY_v0.2.md` — removed (replaced by
  `docs/DEPLOYMENT.md`).
- `docs/TASKS.md` — marked v0.11.0c delivered, next task → v0.11.0d.

## CI Docker Build Summary

The new step runs `docker compose build` on `ubuntu-latest` after all
existing app validation gates. It catches Dockerfile or compose build
regressions without starting services or running E2E against Docker.

## Deployment Documentation Summary

Replaced the v0.2-era `DEPLOYMENT_STRATEGY_v0.2.md` with a current
`DEPLOYMENT.md` that accurately describes:

- Local anonymous mode (no Supabase env required).
- Optional Supabase cloud-sync mode via `.env.local`.
- Docker Compose production and dev configurations.
- `env_file: .env.local (required: false)` behavior.
- Current validation commands including `docker compose build`.
- Current feature baseline (77 problems, v0.10 skill filtering, CI gates).

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 351 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed |
| `docker compose build` | Not validated locally (Docker daemon not running); CI step added for verification |

No `src/` source files, tests, E2E tests, package/lockfile, problem data,
schema, SQL/Supabase runtime behavior changes were included.

## Branch

- `ci/v0.11.0c-docker-build-verification` → PR #130

---

# ✅ v0.11.0d — Stabilization / Release Notes — COMPLETED (2026-06-05)

## Deliverables

- `docs/RELEASE_NOTES_v0.11.md` — v0.11 release notes covering direction
  and rationale, per-slice summary (PR #126/#128/#130), Docker/env
  behavior table, CI pipeline table, compatibility, validation status,
  known limitations, and next-phase recommendation.
- `docs/QA_CHECKLIST_v0.11.md` — manual QA checklist covering environment
  setup, static validation, E2E validation, Docker validation, Supabase
  env behavior, core app regression smoke, CI expectations, deployment
  documentation, E2E regression, content/wiring regression, v0.10 skill
  filtering regression, v0.6 polish regression, sign-off template, and
  completion criteria.
- `docs/TASKS.md` — marked v0.11.0d delivered, v0.11 series complete,
  next task → v0.12.0a next phase planning.

## Validation

| Check | Result |
|---|---|
| `npm run build` | Compiled successfully |
| `npm run test` | 351 passed (21 files) |

Docs-only change. No code, test, config, package, lockfile, schema,
problem data, runtime, Supabase, or SQL behavior was modified.

## Branch

- `docs/v0.11.0d-stabilization-release-notes` → PR #TBD

---

# ✅ v0.12.0a — Next Phase Plan — COMPLETED (2026-06-05)

## Deliverables

- `docs/NEXT_PHASE_PLAN_v0.12.md` — next phase plan evaluating 5 candidate
  directions (AI-first intermediate progression, practice explainability,
  content expansion, deeper multi-step, Supabase sync hardening).
  Selected primary direction: **AI-first intermediate progression /
  AI coach & sparring for a one-year learner**. Defined 5 implementation
  slices (v0.12.0b–f).
- `docs/TASKS.md` — marked v0.12.0a delivered, next task → v0.12.0b.

## Validation

| Check | Result |
|---|---|
| `npm run build` | Compiled successfully |
| `npm run test` | 351 passed (21 files) |

Docs-only change. No code, test, config, package, lockfile, schema,
problem data, runtime, Supabase, or SQL behavior was modified.

## Branch

- `docs/v0.12.0a-next-phase-plan` → PR #TBD

---

# ✅ v0.12.0b — AI Feasibility Spike / Architecture Decision — COMPLETED (2026-06-05)

## Deliverables

- `docs/AI_FEASIBILITY_SPIKE_v0.12.md` — decision-grade feasibility
  report covering: product goal and constraints, 5 AI use-case
  candidates, 5 technical approach comparisons (LLM-only, KataGo/GTP,
  rule+templates, hybrid engine+LLM, AI content pipeline), deployment
  and runtime options, cost and latency model, privacy and safety
  constraints, child-appropriate UX constraints, recommended
  architecture decision, and proposed next implementation slice.
- `docs/TASKS.md` — marked v0.12.0b delivered, next task → v0.12.0c.

## Recommended Architecture Decision

**Local-first Go AI / rule-assisted coach, with optional local LLM
explanation; external LLM only as an opt-in adapter.**

- Rule/template baseline always available (pure TypeScript, no deps).
- Optional KataGo engine integration for 9×9 analysis (CPU, reduced
  playouts, local GTP sidecar).
- Optional local LLM via Ollama for warm Chinese explanations.
- External LLM API only if user explicitly configures it (opt-in).
- No data leaves the machine by default.
- New env vars: `AI_ENGINE_PATH` (optional), `AI_OLLAMA_URL` (optional),
  `AI_API_KEY` (opt-in external only).

## Validation

| Check | Result |
|---|---|
| `npm run build` | Compiled successfully |
| `npm run test` | 351 passed (21 files) |

Docs-only change. No code, test, config, package, lockfile, schema,
problem data, runtime, Supabase, or SQL behavior was modified.

## Branch

- `docs/v0.12.0b-ai-feasibility-spike` → PR #TBD

---

# ✅ v0.12.0c — Level Calibration / Intermediate Challenge Entry — COMPLETED (2026-06-06)

## Deliverables

- `src/lib/practice.ts` — added `calibrateEntryLevel(progress, available)`
  helper: returns `{ minLevel, isCalibrated }` based on mastered problem
  level distribution; threshold of 5 mastered problems per level tier;
  integrated into `selectDailyProblems` to filter out below-minLevel
  candidates while preserving due review / wrong problem priority from
  the full base candidate pool.
- `src/app/practice/page.tsx` — shows `中级练习` label when calibration
  raises the effective practice level above default.
- `src/__tests__/practice.test.ts` — 11 new tests: 6 for
  `calibrateEntryLevel` (null/empty progress, stale IDs, level-1
  mastery → minLevel 2, level-2 mastery → minLevel 3, below threshold),
  4 for selection with calibration (avoid level-1, preserve due review
  priority, preserve category balance, aggressive filter fallback), 1
  for determinism.
- `docs/TASKS.md` — marked v0.12.0c delivered, next task → v0.12.0d.

## Calibration Logic

- 5+ mastered level-2 problems → `minLevel: 3, isCalibrated: true`
- 5+ mastered level-1 problems → `minLevel: 2, isCalibrated: true`
- Below threshold → `minLevel: 1, isCalibrated: false`
- Calibration filters non-priority candidates; due review and wrong
  problems are selected from the full base pool before calibration.
- Falls back to uncalibrated pool if calibration leaves < 10 candidates.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 361 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed (4.8s) |

## Branch

- `feat/v0.12.0c-level-calibration` → PR #138

---

# Delivered: v0.12.0d — Bounded Local Rule-Assisted Review Coach

## Changed Files

- `src/lib/ai-review.ts` — new local rule/template coach module with
  `getLocalReview()` and `validateReviewOutput()` functions
- `src/components/problem/FeedbackDialog.tsx` — added `onShowCoach` and
  `coachMessage` props; renders `请老师帮忙` button and coach message
- `src/components/problem/ProblemPlayer.tsx` — integrated coach: tracks
  wrong move, calls `getLocalReview` on button click, passes result to
  FeedbackDialog, resets on try-again
- `src/__tests__/ai-review.test.ts` — 51 tests: category-specific feedback
  for all 7 categories, wrongMoves match, near-correct detection,
  hint-used path, missing/malformed input, determinism, validation
  (length, source, banned phrases), all-category validation sweep
- `docs/TASKS.md` — marked v0.12.0d delivered, next task → v0.12.0e

## Coach Behavior

- `getLocalReview(input)`: deterministic, local, offline
- Uses problem `wrongMoves` entry if attempted move matches
- Falls back to category-specific template messages, selected by input hash
- Detects near-correct moves (within 1 intersection) → "差一点点"
- Provides hint-used message variant when `usedHint === true`
- All output: Chinese, 1–3 sentences, ≤150 characters, one key concept
- No rank claims, no harsh criticism, no free-form chat, no network calls

## Practice UI Integration

- After a wrong answer, FeedbackDialog shows `请老师帮忙` button
- On click, calls `getLocalReview` with the wrong move coordinates
- Coach message displayed in amber-bordered box
- Button hidden once coach message shown; state resets on try-again
- No disruption to existing hint, answer, review, or progress flow

## Safety

- All coach output validated by `validateReviewOutput()` (≤150 chars,
  source === "rule-template", no banned phrases)
- No external network calls, no API keys, no login required
- No KataGo, Ollama, or LLM integration
- No data saved or transmitted

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 413 passed (22 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed (3.7s) |

## Branch

- `feat/v0.12.0d-local-rule-coach` → PR #140

---

# Delivered: v0.12.0f — Stabilization / Release Notes / QA Checklist

## What was done

- `docs/RELEASE_NOTES_v0.12.md` — release notes for v0.12 AI-first intermediate progression series.
- `docs/QA_CHECKLIST_v0.12.md` — manual QA checklist covering level calibration, local review coach, intermediate content, safety/privacy, Docker, and core regression.
- `docs/TASKS.md` — marked v0.12.0f delivered, v0.12 series complete, next task set to v0.13.0a.

## Validation

Docs-only change. No code, tests, E2E tests, CI, Docker, problem data, schema, package files, SQL/Supabase, or AI integration code was modified. Validation commands not re-run per docs-only rationale.

## Branch

- `docs/v0.12.0f-stabilization-release-notes` → PR #143

---

# Delivered: v0.13.0a — Local Go Engine Feasibility / KataGo Prototype Plan

## What was done

- `docs/LOCAL_GO_ENGINE_PLAN_v0.13.md` — feasibility and prototype plan evaluating KataGo CPU/Eigen integration for local move-analysis without network dependency.
- `docs/TASKS.md` — marked v0.13.0a delivered, next task set to v0.13.0b (Local Engine Adapter Contract / Sample Config).

## Validation

Docs-only change. No code, tests, E2E tests, CI, Docker, problem data, schema, package files, SQL/Supabase, or AI integration code was modified. Validation commands not re-run per docs-only rationale.

## Branch

- `docs/v0.13.0a-local-go-engine-plan` → PR #145

---

# Delivered: v0.13.0b — Local Engine Adapter Contract / Sample Config

## What was done

- `docs/ENGINE_ADAPTER_CONTRACT_v0.13.md` — adapter TypeScript contract, config shape, fallback behavior, privacy contract, setup guide, benchmark plan, and v0.13.0c next-task definition.
- `.env.example` — added commented optional `KATAGO_*` environment variables.
- `docs/DEPLOYMENT.md` — added optional KataGo setup section under Deployment Models.
- `docs/TASKS.md` — marked v0.13.0b delivered, next task set to v0.13.0c.

## Validation

Docs-only change. No code, tests, E2E tests, CI, Docker, problem data, schema, package files, SQL/Supabase, or AI integration code was modified. Validation commands not re-run per docs-only rationale.

## Branch

- `docs/v0.13.0b-engine-adapter-contract` → PR #147

---

# Delivered: v0.13.0c — Server-Only Local Engine Adapter with Timeout Fallback

## What was done

- `src/lib/engine-config.ts` — typed config reader for `KATAGO_*` env vars:
  - `parseEngineConfig()` reads `KATAGO_ENABLED`, `BIN_PATH`, `MODEL_PATH`, `CONFIG_PATH`, `VISITS`, `TIMEOUT_MS` with safe defaults (300 visits, 5000ms timeout)
  - `checkEngineAvailability(config, existsSync?)` validates enabled state, path existence, and file accessibility; injectable `existsSync` for testability
  - Invalid visits/timeout values clamped to defaults; `configPath` optional
- `src/lib/engine-adapter.ts` — server-only adapter (`import "server-only"`):
  - `getEngineAvailability(config, existsSync?)` — availability check delegating to config module
  - `buildAnalysisArgs(config, input)` — pure function building KataGo analysis command args (board size, initial stones, playout visits, model path, config path)
  - `parseAnalysisOutput(raw)` — parses KataGo JSONL analysis output into typed `MoveInfo[]`
  - `determineConfidence(topMoves)` — heuristic (low < 50 visits, medium 50–199, high ≥ 200)
  - `analyzeWrongMove(input, config, execFileFn?, existsSync?)` — main analysis entry point: checks availability, runs subprocess with configurable timeout via injected `execFileFn`, parses output, returns `Promise<EngineReviewSignal | null>` — all expected failures (disabled, unavailable, timeout, non-zero exit, malformed output) return `null`
  - `defaultExecFile(command, args, options)` — real `child_process.execFile` wrapper with promise + timeout kill; never called in tests
  - Types: `EngineReviewInput`, `MoveInfo`, `EngineReviewSignal`, `EngineAvailability`
- `src/__mocks__/server-only.ts` — vitest mock for `server-only` module (build-time marker unavailable in test environment)
- `src/types/server-only.d.ts` — ambient module declaration for TypeScript
- `vitest.config.ts` — added resolve alias for `server-only`
- `vitest.setup.ts` — added `vi.mock("server-only")`
- `src/__tests__/engine-adapter.test.ts` — 20 tests:
  - `engine-config`: env parsing (defaults, all vars, invalid clamps), availability checks (disabled, missing-binary, missing-model)
  - `engine-adapter`: `getEngineAvailability`, `buildAnalysisArgs` (empty board, initial stones), `analyzeWrongMove` (unavailable paths, success with parsed signal, confidence levels, timeout error, unparseable output, null ranks, timeout passthrough)

## Explicitly NOT delivered

- No UI integration (v0.13.0d).
- No KataGo binary, model file, or config committed to repo.
- No `package.json` / `package-lock.json` changes.
- No problem data, schema, Supabase, or SQL changes.
- No Docker or CI changes.
- No external dependencies added.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 436 passed (baseline; exact count grew with later slices) |
| `npm run build` | Compiled successfully |

## Branch

- `feat/v0.13.0c-server-engine-adapter`
- PR #150 (closes #149)

---

# Delivered: v0.13.0d — Engine-Assisted Review Behind Feature Flag

## What was done

- `src/lib/ai-review.ts`:
  - Added `EngineReviewSignalLike` type (client-safe subset of `EngineReviewSignal`)
  - Extended `LocalReviewResult.source` to `"rule-template" | "engine-assisted"`
  - Added `ENGINE_ASSISTED_MESSAGES` — 3 category-specific Chinese messages per category (≤150 chars)
  - `getLocalReview(input, engineSignal?)` — when engine signal confident + agrees with authored answer, returns engine-assisted messages; otherwise rule/template fallback
  - `validateReviewOutput` accepts both `"rule-template"` and `"engine-assisted"` sources
- `src/lib/review-actions.ts` (new, `'use server'`):
  - `requestEngineReview(input)` — parses `KATAGO_*` config, calls `analyzeWrongMove`, returns `EngineReviewSignal | null`
  - Returns null when disabled/unavailable/errors (no subprocess spawned when disabled)
- `src/components/problem/ProblemPlayer.tsx`:
  - `handleShowCoach` now async: shows rule/template message instantly, calls server action in background
  - Confident engine signal silently upgrades the coach message
  - **Stale async guard**: `coachRequestId` useRef counter incremented on try-again, next-step, and problem change; engine response discarded when counter does not match the request ID
  - All existing reset behavior preserved
- `src/components/problem/FeedbackDialog.tsx`:
  - `coachSource` prop — shows subtle `本地引擎辅助` label when `"engine-assisted"`
- `src/__tests__/ai-review.test.ts` — 16 new tests: engine-assisted source, confidence thresholds, disagree fallback, hint-used path, validation, all categories pass
- `src/__tests__/stale-engine-guard.test.tsx` — 3 new component-level stale async guard tests

## Feature flag / Fallback summary

| Scenario | Behavior |
|---|---|
| `KATAGO_ENABLED !== "true"` | Server action returns null; rule/template coach unchanged |
| Engine disabled/unavailable/timeout/error | Server action returns null; rule/template coach unchanged |
| Signal confident + agrees with answer | Engine-assisted messages used; `本地引擎辅助` label shown |
| Signal low confidence or disagrees | Rule/template fallback; no label |

## Server/Client boundary

- `engine-adapter.ts` and `engine-config.ts` — `import "server-only"`, never imported by client
- `review-actions.ts` — `'use server'`, client imports only action reference
- `ai-review.ts` — client-safe, defines own `EngineReviewSignalLike` type

## Explicitly NOT delivered

- No KataGo binary, model file, or config committed
- No `package.json` / `package-lock.json` changes
- No problem data, schema, Supabase, or SQL changes
- No Docker, CI, or E2E changes
- No external dependencies
- No settings page or diagnostics UI
- No free-form chat, raw winrate/scoreLead, or LLM integration

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 460 passed (24 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed (CI only; baseline from merged PR #152) |
| `docker compose build` | Exit 0 (CI only) |

## Branch

- `feat/v0.13.0d-engine-review-flag`
- PR #152 (closes #151)

---

# Delivered: v0.13.0e — Stabilization / Release Notes / QA Checklist

## Deliverables

- `docs/TASKS.md` — removed all conflict markers; preserved correct v0.13.0c (PR #150) and v0.13.0d (PR #152) history; marked v0.13.0e delivered, v0.13 complete, next task → v0.14.0a.
- `docs/RELEASE_NOTES_v0.13.md` — v0.13 release notes covering: optional local Go engine path, engine-assisted review, stale async guard, non-goals.
- `docs/QA_CHECKLIST_v0.13.md` — manual QA checklist covering: engine disabled, engine unavailable, engine-assisted with local KataGo, coach reset/async guard, safety/privacy, Docker, and validation.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 460 passed (24 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Not re-run (no E2E tests modified) |

## Branch

- `docs/v0.13.0e-stabilization-release-notes` → PR #154

---

# Delivered: v0.14.0a — Engine-Assisted Review UX Evaluation / Local Engine Diagnostics Plan

## What was done

- `docs/ENGINE_REVIEW_UX_DIAGNOSTICS_PLAN_v0.14.md` — planning document covering UX evaluation questions, manual observation protocol, local diagnostics needs, privacy constraints, candidate implementation options, conservative v0.14 slice plan (b–e), and v0.14.0b next-task definition.
- `docs/TASKS.md` — marked v0.14.0a delivered, next task set to v0.14.0b.

## Validation

Docs-only change. No code, tests, E2E tests, CI, Docker, problem data, schema, package files, SQL/Supabase, KataGo binary/model/config, or runtime app behavior was modified. Validation commands not re-run per docs-only rationale.

## Branch

- `docs/v0.14.0a-engine-review-ux-diagnostics-plan` → PR #156

---

# Delivered: v0.14.0b — Manual UX Observation Checklist for Engine-Assisted Review

## What was done

- `docs/UX_OBSERVATION_CHECKLIST_v0.14.md` — structured manual observation checklist with:
  - Three session setups (engine disabled, unavailable, optional available)
  - Per-problem observation form
  - Session summary form
  - Decision criteria for keep/improve/hide/diagnose/disable
  - Privacy/safety reminders
  - Sign-off template
- `docs/QA_CHECKLIST_v0.13.md` — added v0.14 observation addendum appendix pointing to the new checklist.
- `docs/TASKS.md` — marked v0.14.0b delivered, next task set to v0.14.0c.

## Validation

Docs-only change. No code, tests, E2E tests, CI, Docker, problem data, schema, package files, SQL/Supabase, KataGo binary/model/config, or runtime app behavior was modified. Validation commands not re-run per docs-only rationale.

## Branch

- `docs/v0.14.0b-ux-observation-checklist` → PR #158

---

# Delivered: v0.14.0c — Local Engine Diagnostics Contract, no UI

## What was done

- `docs/LOCAL_ENGINE_DIAGNOSTICS_CONTRACT_v0.14.md` — diagnostics contract covering:
  - TypeScript pseudo-contract with `LocalEngineDiagnostics`, `EngineLastAnalysisDiagnostics`, and typed status/reason/latency types
  - Data minimization rules (booleans not raw paths, no child data)
  - Server/client boundary (server-only, no `NEXT_PUBLIC_*`)
  - Last-analysis lifecycle table for all engine states
  - Parent/developer presentation principles
  - Risks and mitigations
  - v0.14.0d next-task definition
- `docs/TASKS.md` — marked v0.14.0c delivered, next task set to v0.14.0d.

## Validation

Docs-only change. No code, tests, E2E tests, CI, Docker, problem data, schema, package files, SQL/Supabase, KataGo binary/model/config, or runtime app behavior was modified. Validation commands not re-run per docs-only rationale.

## Branch

- `docs/v0.14.0c-local-engine-diagnostics-contract` → PR #160

---

# Delivered: v0.14.0d — Optional Developer Diagnostics Helper, local-only / server-only

## What was done

- `src/lib/engine-diagnostics.ts` — server-only diagnostics helper with:
  - `getLocalEngineDiagnostics()` returning `LocalEngineDiagnostics` with status, reasons, sanitized config booleans, and last-analysis state
  - No raw file paths, child data, board positions, winrate, or scoreLead in output
  - No `child_process` spawning or `analyzeWrongMove()` calls
  - Injectability for config, availability, lastAnalysis, and clock for testing
- `src/__tests__/engine-diagnostics.test.ts` — 14 unit tests covering:
  - disabled config → status disabled
  - enabled missing binary → enabled-unavailable with missing-binary reason
  - enabled missing model → enabled-unavailable with missing-model reason
  - enabled available → status available
  - missing-config reason when configPath not set
  - sanitized config exposes booleans only, never raw paths
  - default lastAnalysis is not-run
  - timeout → rule-template fallback
  - malformed-output → rule-template fallback
  - process-error → rule-template fallback
  - successful analysis → engine-assisted source
  - checkedAt deterministic with injected clock
  - no raw engine output, winrate, scoreLead, or board position
  - no child data or progress
- `docs/TASKS.md` — marked v0.14.0d delivered, next task set to v0.14.0e.

## Validation

```bash
npm run lint      # exit 0
npm run typecheck # exit 0
npm run test      # all tests pass
npm run build     # compiled successfully
```

## Branch

- `feat/v0.14.0d-engine-diagnostics-helper` → PR #162

---

# Delivered: v0.14.0e — Stabilization / Release Notes / QA Checklist

## Deliverables

- `docs/RELEASE_NOTES_v0.14.md` — v0.14 release notes covering: UX evaluation, diagnostics contract and helper, non-goals, unchanged scope.
- `docs/QA_CHECKLIST_v0.14.md` — manual QA checklist covering: environment setup, static validation, E2E/Docker, engine-assisted observation, diagnostics helper QA, privacy/safety, regression checks, sign-off.
- `docs/TASKS.md` — marked v0.14.0e delivered, v0.14 complete, next task → v0.15.0a.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | All tests pass |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Not re-run (no E2E tests modified; baseline from PR #162 CI: 6 passed) |
| `docker compose build` | Not re-run (no Docker/CI changes; baseline from PR #162 CI: exit 0) |

## Branch

- `docs/v0.14.0e-stabilization-release-notes` → PR #164

---

# Delivered: v0.15.0a — Content Quality / Intermediate Problem Expansion Plan

## What was done

- `docs/CONTENT_QUALITY_PLAN_v0.15.md` — decision-grade content plan with:
  - Goal and constraints (shift from engine/diagnostics to content quality)
  - Current content baseline (77 + 10 problems across 7 categories)
  - 12 content quality dimensions
  - Intermediate learner content targets (level 3–5 capture race, escape, connect/cut, life/death shape, opening direction, endgame, mixed review)
  - Proposed v0.15 slice plan (audit → Pack A → validation → stabilization)
  - Content inventory / gap audit requirements for v0.15.0b
  - Intermediate Problem Pack A requirements (12–16 problems, levels 3–5, category-balanced, human-reviewed)
  - Human review checklist (12-item per-problem checklist)
  - Risk and mitigation (9 risks)
  - Next task definition (v0.15.0b)
- `docs/TASKS.md` — marked v0.15.0a delivered, next task → v0.15.0b.

## Validation

Docs-only change. No code, tests, E2E, CI, Docker, package files, problem data, schema, SQL/Supabase, KataGo assets, Ollama/local LLM, external AI, settings page, diagnostics page, logging code, telemetry, API route, Server Action, or feature work was added. Validation commands not re-run per docs-only rationale.

## Branch

- `docs/v0.15.0a-content-quality-plan` → PR #166

---

# Delivered: v0.15.0b — Content Inventory / Gap Audit for Level 3–5 Problems

## What was done

- `docs/CONTENT_INVENTORY_v0.15.md` — audit report with 8 sections:
  - Category-by-level matrix (all 7 categories, levels 1–5, 87 problems)
  - Intermediate coverage analysis (life_death strong, mixed missing, L4–5 thin)
  - Multi-step audit (9 problems, only 3 at L3+, none above L2 outside life_death)
  - Potential review candidates (10 problems with concise explanations, capture/esca pe/connect_cut L1–2 skew)
  - Pack A target matrix: 14 problems, L3–5, all 7 categories, 3 multi-step targets
  - v0.15.0c scope definition
  - Risks and review notes
- `docs/TASKS.md` — marked v0.15.0b delivered, next task → v0.15.0c.

## Validation

Docs-only change. No code, tests, E2E, CI, Docker, package files, problem data, schema, SQL/Supabase, KataGo assets, Ollama/local LLM, external AI, settings page, diagnostics page, logging code, telemetry, API route, Server Action, or feature work was added. Validation commands not re-run per docs-only rationale.

## Branch

- `docs/v0.15.0b-content-inventory-audit` → PR #168

---

# Delivered: v0.15.0c — Intermediate Problem Pack A

## Deliverables

- `src/data/problems.json` — 14 new intermediate level 3-5 problems (101 total).
- `src/__tests__/problems.test.ts` — added mixed category to validation, 8 new test assertions for Pack A.
- `docs/TASKS.md` — marked v0.15.0c delivered, next task → v0.15.0d.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | All 482 tests pass |
| `npm run build` | Compiled successfully |

## Branch

- `feat/v0.15.0c-intermediate-problem-pack-a` → PR #170

---

# Delivered: v0.15.0d — Content Validation and Regression for Pack A

## Deliverables

- `docs/PACK_A_VALIDATION_v0.15.md` — full validation report with 8 sections: scope and method, matrix verification, schema/metadata validation, tactical/human review notes, multi-step regression review, regression checks, defects found (none), sign-off checklist.
- `src/__tests__/problems.test.ts` — 12 new regression tests: total library count 101, L3-5 count 58, per-category/level matrix assertion, answer emptiness, duplicate coordinates, text bounds, failure message wording, multi-step fields, mixed category tag.
- `docs/TASKS.md` — marked v0.15.0d delivered, next task → v0.15.0e.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | All 492 tests pass |
| `npm run build` | Compiled successfully |

## Branch

- `test/v0.15.0d-pack-a-validation-regression` → PR #172 (closes #171)

---

# Delivered: v0.15.0e — Stabilization / Release Notes / QA Checklist

## Deliverables

- `docs/RELEASE_NOTES_v0.15.md` — v0.15 release notes covering: content quality focus, delivered slices, product behavior changes, Pack A content summary, validation baseline, non-goals, known limitations.
- `docs/QA_CHECKLIST_v0.15.md` — manual QA checklist covering: environment setup, static validation, E2E/Docker, Pack A data QA, practice regression, privacy/safety, sign-off template.
- `docs/TASKS.md` — marked v0.15.0e delivered, v0.15 series complete, next task → v0.16.0a.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | All tests pass |
| `npm run build` | Compiled successfully |

Docs-only change. No code, tests, E2E, CI, Docker, package files, problem data, schema, SQL/Supabase, KataGo binary/model/config, Ollama/local LLM, external AI, settings page, diagnostics page, logging code, telemetry, API route, Server Action, or feature work was added.

## Branch

- `docs/v0.15.0e-stabilization-release-notes` → PR #174 (closes #173)

---

# Delivered: v0.16.0a — Learning Session Review / Parent Progress Insight Plan

## Deliverables

- `docs/PARENT_PROGRESS_INSIGHT_PLAN_v0.16.md` — decision-grade planning document with 10 sections: goal and non-goals, parent questions, candidate insight signals, data source and local-first boundary, session review output model (pseudo-contract), parent wording principles, v0.16 slice plan, v0.16.0b next task definition, risks and mitigations, decision recommendation.
- `docs/TASKS.md` — marked v0.16.0a delivered, next task → v0.16.0b.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | All tests pass |
| `npm run build` | Compiled successfully |

Docs-only change. No runtime code, tests, E2E, CI, Docker, package files, problem data, schema, SQL/Supabase, KataGo binary/model/config, Ollama/local LLM, external AI, settings page, diagnostics page, logging code, telemetry, API route, Server Action, UI, report UI, dashboard, persistence, or feature work was added.

## Branch

- `docs/v0.16.0a-parent-progress-insight-plan` → PR #176 (closes #175)

---

# Delivered: v0.16.0b — Session Review Data Contract and Local Aggregation Plan

## Deliverables

- `docs/SESSION_REVIEW_CONTRACT_v0.16.md` — contract document with 10 sections: goal and boundary, source data assumptions, data minimization rules, TypeScript pseudo-contract, aggregation algorithm, heuristics for strengths/shaky concepts/next focus, parent note template rules, privacy and safety checklist, implementation guidance for v0.16.0c, next task definition.
- `docs/TASKS.md` — marked v0.16.0b delivered, next task → v0.16.0c.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | All tests pass |
| `npm run build` | Compiled successfully |

Docs-only change. No runtime code, tests, E2E, CI, Docker, package files, problem data, schema, SQL/Supabase, KataGo binary/model/config, Ollama/local LLM, external AI, settings page, diagnostics page, logging code, telemetry, analytics, API route, Server Action, UI, report UI, dashboard, persistence, or feature work was added.

## Branch

- `docs/v0.16.0b-session-review-contract` → PR #178 (closes #177)

---

# Delivered: v0.16.0c — Parent Session Summary Helper, local-only / no UI

## Deliverables

- `src/lib/session-summary.ts` — pure local helper with:
  - `summarizeLearningSession(input)` — deterministic, no network/persistence/AI/engine dependency
  - Types: `LearningSessionSummaryInput`, `ParentSessionSummary`, `AttemptSummary`, `CategorySummary`, `LevelSummary`, `ProblemSummary`, `SignalQuality`
  - Empty input → sparse summary with warning
  - All-correct → positive parent note, strengths detection
  - Mixed results → weakest category/level detection from errors
  - Repeated wrong attempts → review-needed flag
  - High hint usage → hints summary
  - Multi-step difficulty → multi-step reading focus
  - Category/level aggregation
  - Chinese parent notes: non-judgmental, concise, data-driven
  - Privacy boundary enforcement: no raw board/move/engine/account/child identifiers in output
- `src/__tests__/session-summary.test.ts` — 17 unit tests covering:
  - empty input returns sparse summary and warning
  - all-correct session
  - mixed correct/incorrect session
  - weakest category detection
  - weakest level detection
  - high hint usage signal
  - repeated wrong attempts signal
  - multi-step difficulty signal
  - category/level aggregation
  - deterministic Chinese parent note for representative cases
  - output does not include raw board/move/engine/account/child identifiers
  - no dependency on Supabase, network, filesystem, AI, or engine modules
  - partial data with warnings
  - suggested next focus for weakest category
  - mixed category exposure
  - unknown category handling
  - correct problem summary classification

## Explicitly NOT delivered

- No UI, parent dashboard, child-facing summary
- No API routes or Server Actions
- No persistence writes
- No telemetry or analytics
- No Supabase writes or migrations
- No external AI, Ollama, KataGo, or diagnostics helpers
- No problem data changes
- No runtime practice flow changes
- No package or lockfile changes
- No Docker or CI changes

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 509 passed (26 files) |
| `npm run build` | Compiled successfully |

## Branch

- `feat/v0.16.0c-parent-session-summary-helper` → PR #182 (closes #180)

---

# Delivered: v0.16.0d — Parent Session Summary Validation / QA

## Deliverables

- `docs/SESSION_SUMMARY_VALIDATION_v0.16.md` — full QA validation report with 9 sections:
  - Scope and method
  - Contract alignment
  - Input boundary review
  - Output boundary review
  - Aggregation behavior review (13 scenarios)
  - Parent wording review (6 template patterns)
  - Regression test review (17 existing + 12 new tests)
  - Defects found / fixes made (none)
  - Sign-off checklist
- `src/__tests__/session-summary.test.ts` — 12 new targeted regression tests:
  - `reviewedAt` uses `sessionCompletedAt` when present
  - `reviewedAt` falls back to `sessionStartedAt`
  - `reviewedAt` becomes `unknown` when both absent
  - Two calls with same timestamp-less input are equal (determinism)
  - Duplicate attempts for same problemId count as one
  - Repeated attempts set retry signal consistently
  - Parent note does not contain harsh words
  - Serialized output does not contain sensitive privacy keys
  - Helper module has no imports from forbidden modules
  - Empty input sessionId is `"session-empty"`
  - Single-attempt sparse input with partial timestamps
  - Strengths not claimed from sparse data
- `src/lib/session-summary.ts` — no changes needed (no defects found)
- `docs/TASKS.md` — marked v0.16.0d delivered, next task → v0.16.0e

## Explicitly NOT delivered

- No UI, parent dashboard, or child-facing summary
- No API routes or Server Actions
- No persistence writes
- No telemetry or analytics
- No Supabase writes or migrations
- No external AI, Ollama, KataGo, or diagnostics helpers
- No problem data changes
- No runtime practice flow changes
- No package or lockfile changes
- No Docker or CI changes

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 521 passed (26 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## Branch

- `test/v0.16.0d-parent-session-summary-validation-qa` → PR #186 (closes #185)

---

# Delivered: v0.16.0e — Parent Session Summary Stabilization / Release Notes

## Deliverables

- `docs/RELEASE_NOTES_v0.16.md` — v0.16 release notes with 7 sections: summary, what changed (a–d), what did not change, privacy and data minimization, testing and validation, known limitations, recommended next phase (v0.17.0a planning)
- `docs/QA_CHECKLIST_v0.16.md` — QA checklist with 6 sections: scope checklist, manual helper behavior (10 scenarios), privacy checklist, wording checklist, regression checklist, release readiness checklist
- `docs/TASKS.md` — marked v0.16.0e delivered, v0.16 series complete, next task → v0.17.0a

## Explicitly NOT delivered

- No UI, parent dashboard, child-facing summary, runtime practice-flow change, API route, Server Action, telemetry, analytics, persistence, Supabase write/migration, external network call, external AI, Ollama/local LLM, KataGo behavior, diagnostics integration, schema/SQL migration, Docker/CI, package dependency, settings page, logging code, or unrelated feature work was added

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 521 passed (26 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## Branch

- `docs/v0.16.0e-parent-session-summary-stabilization` → PR #189 (closes #188)

---

# Delivered: v0.17.0a — Parent Review Integration Surface Plan

## Deliverables

- `docs/PARENT_REVIEW_INTEGRATION_PLAN_v0.17.md` — planning document with 10 sections:
  - Goal and constraints
  - Current assets from v0.16 (table)
  - 4 candidate integration surfaces compared (dev debug panel, Settings panel, end-of-session modal, weekly report extension)
  - Recommended first slice: developer/debug-only local review panel
  - Session boundary plan (simple all-history aggregation)
  - Data flow plan (local-only, no network/telemetry)
  - Privacy and safety review (10 concerns with mitigations)
  - UI/UX principles for future implementation
  - Recommended v0.17 slice plan (b–d)
  - Acceptance criteria for v0.17.0b
- `docs/TASKS.md` — marked v0.17.0a delivered, queue v0.17.0b

## Explicitly NOT delivered

- No UI, parent dashboard, child-facing summary, runtime practice-flow change, API route, Server Action, telemetry, analytics, persistence, Supabase write/migration, external network call, external AI, Ollama/local LLM, KataGo behavior, diagnostics integration, schema/SQL migration, Docker/CI, package dependency, settings page, logging code, or unrelated feature work

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 521 passed (26 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## Branch

- `docs/v0.17.0a-parent-review-integration-plan` → PR #192 (closes #191)

---

# ✅ v0.17.0b Parent Review Debug Surface Prototype — COMPLETED (2026-06-09)

## What was done

- `src/lib/session-summary-input.ts`: `buildSessionSummaryInput()` mapping helper reads `StudentProgress`, resolves problem category/level via `getProblemById()`, builds `AttemptSummary[]` with monotonic attemptCount per problemId, derives timestamps from first/last attempt `createdAt`.
- `src/app/dev/session-summary/page.tsx`: debug page (client component) that calls `loadProgress()` → `buildSessionSummaryInput()` → `summarizeLearningSession()` in `useEffect`, renders full `ParentSessionSummary`: signal quality/totals banner, category table, level table, strengths (green), shaky concepts (amber), next focus (blue), parent note (green), warnings, empty state with link to `/practice`, developer warning banner, session ID/timestamp footer.
- `src/__tests__/session-summary-input.test.ts`: 5 unit tests for mapping helper — empty progress, attempt metadata, monotonic attemptCount, timestamps, unknown category.
- `src/__tests__/session-summary-debug.test.tsx`: 6 rendering tests — empty state, debug copy, local-only disclaimer, sanitized fields, privacy boundary (forbidden keys absent), strengths section, warnings.
- All 533 existing tests continue to pass (28 files).
- Lint, typecheck, build all pass.

## Explicitly NOT delivered

- No UI parent dashboard, child-facing summary, normal navigation link, API route, Server Action, telemetry, analytics, persistence, Supabase write, external AI, engine/KataGo, diagnostics, runtime practice-flow changes, or unpinned dependencies.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 545 passed (28 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

---

# ✅ v0.18.0a PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18 — COMPLETED (2026-06-10)

## What was done

- `docs/PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18.md`: conservative session boundary/history modeling planning document with:
  - Goal/constraints and v0.17 assets
  - 7 candidate integration directions (session boundary first)
  - Privacy-first design and conservative approach
  - Slice plan (a–d) for v0.18.0a–b
  - Clear guidance for next phase: session boundary/history modeling

- `docs/TASKS.md`: updated task queue:
  - v0.18.0a PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18 delivered
  - v0.18.0b planned for session boundary/history contract
  - Current strategy entry 65 (PR #202)

## Explicitly NOT delivered

- No parent UI components
- No session boundary implementation
- No history modeling algorithms
- No API routes or Server Actions
- No runtime changes

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 545 passed (28 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## Branch

- `docs/v0.18.0a-parent-review-next-phase-plan` → PR #202

---

# ✅ v0.18.0b PARENT_REVIEW_SESSION_BOUNDARY_CONTRACT_v0.18 — COMPLETED (2026-06-10)

## What was done

- `docs/PARENT_REVIEW_SESSION_BOUNDARY_CONTRACT_v0.18.md`: comprehensive session boundary and history modeling contract with:
  - Session boundary vocabulary (6 canonical terms)
  - Current-session vs daily vs historical summary definitions
  - Reset / retention behavior table (10 actions)
  - Sparse / empty / mixed result behavior (8 data scenarios)
  - Local-only assumptions (9 guaranteed invariants)
  - Privacy / data minimization rules (14 excluded fields)
  - Parent gate requirements (5 gates, 5 preconditions, 5 future UI issues)
  - Future testing requirements (data scenarios, privacy, storage, UI)
  - Recommendation: v0.18.0c mini local session history model (delivered PR #206)
- `docs/TASKS.md`: updated to mark v0.18.0b delivered, queue v0.18.0c

## Explicitly NOT delivered

- No parent-facing UI components
- No session boundary implementation
- No history modeling algorithms
- No storage schema changes
- No API routes or Server Actions
- No runtime code changes

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 537 passed (28 files) |
| `npm run build` | Compiled successfully |

## Branch

- `docs/v0.18.0b-parent-review-session-boundary-contract` → PR #204

---

# ✅ v0.17.0c Parent Review Debug Surface QA / Wording Validation — COMPLETED (2026-06-09)

## What was done

- `docs/PARENT_REVIEW_DEBUG_QA_v0.17.md`: QA validation report covering developer-only surface boundary, local-only/no-persistence boundary, privacy boundary (no raw coordinates, board state, engine metrics, account IDs, child identity, problem IDs), parent wording validation (all Chinese strings reviewed, non-judgmental), empty/sparse state QA, accessibility/layout review, and release-readiness checklist.
- `src/__tests__/session-summary-debug.test.tsx`: 4 new rendering/QA regression tests — problem IDs not rendered, shaky concepts section renders when present, suggested next focus section renders when present, multi-step attempt and completion counts rendered.
- All QA boundaries pass. No functional, privacy, wording, or accessibility defects found.

## Explicitly NOT delivered

- No parent dashboard, child-facing summary, normal navigation link, API route, Server Action, telemetry, analytics, persistence, Supabase write, external AI, engine/KataGo, diagnostics, runtime practice-flow changes, or unpinned dependencies.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 537 passed (28 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## Branch

- `test/v0.17.0c-parent-review-debug-qa` → PR #196 (closes #195)

---

# ✅ v0.17.0d v0.17 Stabilization / Release Notes — COMPLETED (2026-06-09)

## Deliverables

- `docs/RELEASE_NOTES_v0.17.md` — release notes covering v0.17 goal, delivered slices (v0.17.0a–c), file inventory, what did not change, developer/debug-only route behavior, privacy and data minimization, testing and validation baseline (537 tests, 28 files), known limitations, recommended next phase (v0.18.0a planning).
- `docs/QA_CHECKLIST_v0.17.md` — QA checklist with 7 sections: scope checklist, static validation, `/dev/session-summary` manual QA (developer surface, session overview, category table, level table, strengths, shaky concepts, suggested next focus, parent note, warnings, empty state, footer), privacy/data minimization checklist, Chinese parent wording checklist, accessibility/layout checklist, release sign-off template.
- `docs/TASKS.md` — marked v0.17.0d delivered, v0.17 series complete, next task → v0.18.0a.
- `docs/TASKS.md` — marked v0.18.0a PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18 delivered, next task → v0.18.0b: session boundary/history modeling contract.

## Explicitly NOT delivered

- No parent dashboard, child-facing summary, normal navigation link, API route, Server Action, telemetry, analytics, persistence, Supabase write, external AI, engine/KataGo, diagnostics, runtime practice-flow changes, or unpinned dependencies.

## Validation

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 537 passed (28 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | Passed in CI |
| Docker build verification | Passed in CI |

## Branch

- `docs/v0.17.0d-stabilization-release-notes` → PR #198 (closes #197)

---

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

## v0.4.0 — Content Expansion

- Expand problem library from 39 to ~50–60 problems.
- Add multi-step content packs (capture, life_death, connect_cut, escape).
- Fill category gaps (life_death, opening).
- Refine tags and metadata.

## v0.5.0 — Content Expansion (continued)

- v0.5.0a: next phase plan (completed)
- v0.5.0b: content pack — levels 4–5 + endgame (completed)
- v0.5.0c: content validation and regression (completed)
- v0.5.0d: stabilization and release notes (completed)

## v0.6.0 — UX Polish and Gameplay Refinement

- v0.6.0a: next phase plan (completed)
- v0.6.0b: Chinese board coordinate labels (completed, PR #72)
- v0.6.0c: success animations and star effects (completed, PR #76)
- v0.6.0d: toggleable audio feedback (completed, PR #78)
- v0.6.0e: hint presentation polish (completed, PR #80)
- v0.6 stabilization: release notes + QA checklist (completed, PR #82)
- v0.6 follow-up: /practice last-problem async race fix (completed, PR #84)

## v0.7.0 — Content Balancing (Endgame + Opening + Level 3–5)

- v0.7.0a: next phase plan (completed, PR #86 / issue #85)
- v0.7.0b: endgame + opening + level 3–5 content pack (completed, PR #89 / issue #87)
- v0.7.0c: content validation and regression (completed, PR #91 / issue #90)
- v0.7.0d: stabilization and release notes (completed, PR TBD / issue #92)

## v0.8.0 — Content Wiring

- v0.8.0a: next phase plan (completed, PR #95 / issue #94)
- v0.8.0b: wire capture + escape + connect_cut (completed, PR #97 / issue #96)
- v0.8.0c: wire life_death + endgame + opening (completed, PR #99 / issue #98)
- v0.8.0d: wire multi-step problems (completed, PR #101 / issue #100)
- v0.8 stabilization: release notes + QA checklist (completed)

## v0.9.0 — Infrastructure / E2E / CI Hardening

- v0.9.0a: next phase plan (completed, PR #106 / issue #105)
- v0.9.0b: GitHub Actions CI + Playwright setup (completed, PR #110 / issue #107)
- v0.9.0c: E2E smoke tests for core flows (completed, PR #112 / issue #111)
- v0.9.0d: release QA automation + stabilization (completed, PR #114 / issue #113)

## v0.10.0 — Daily-Practice Skill Filtering / Level-Aware Selection

- v0.10.0a: next phase plan (completed, PR #116 / issue #115)
- v0.10.0b: category-balanced selection with basic level clamping (completed, PR #118)
- v0.10.0c: spaced review integration (completed, PR #120)
- v0.10.0d: multi-step awareness and safe exposure (completed, PR #122)
- v0.10 stabilization: release notes + QA checklist (completed, PR #124)

## v0.11.0 — Deployment / Supabase Environment Hardening

- v0.11.0a: next phase plan (completed)
- v0.11.0b: Docker compose Supabase env passthrough + .env.example guidance (completed)
- v0.11.0c: CI Docker build verification + deployment documentation refresh (completed)
- v0.11.0d: stabilization / release notes (completed)

## v0.12.0 — AI-First Intermediate Progression ✅ COMPLETE

- v0.12.0a: next phase plan (completed)
- v0.12.0b: AI feasibility spike / architecture decision (completed)
- v0.12.0c: level calibration / intermediate challenge entry (completed)
- v0.12.0d: bounded local AI review / rule-assisted coach prototype (completed)
- v0.12.0e: intermediate content expansion and human-reviewed pipeline (completed)
- v0.12.0f: stabilization / release notes (completed)

## v0.13.0 — Local Go Engine Feasibility / KataGo Prototype Plan — COMPLETE

- v0.13.0a: local engine feasibility and KataGo prototype plan (completed)
- v0.13.0b: local engine adapter contract / sample config (completed)
- v0.13.0c: implement server-only engine adapter with timeout fallback (completed)
- v0.13.0d: integrate engine-assisted review behind feature flag (completed)
- v0.13.0e: QA / stabilization / release notes (completed)

## v0.14.0 — Engine-Assisted Review UX Evaluation — COMPLETE

- v0.14.0a: engine-assisted review UX evaluation / local engine diagnostics plan (completed)
- v0.14.0b: manual UX evaluation notes / QA checklist extension (completed)
- v0.14.0c: local engine diagnostics contract, no UI (completed)
- v0.14.0d: optional developer diagnostics helper, local-only / server-only (completed)
- v0.14.0e: v0.14 stabilization / release notes (completed)

## v0.15.0 — Content Quality / Intermediate Problem Expansion ✅ COMPLETE

- v0.15.0a: content quality / intermediate problem expansion plan (completed)
- v0.15.0b: content inventory / gap audit for level 3–5 problems (completed)
- v0.15.0c: Intermediate Problem Pack A (completed)
- v0.15.0d: content validation and regression for Pack A (completed)
- v0.15.0e: stabilization / release notes / QA checklist (completed)

## v0.16.0 — Learning Session Review / Parent Progress Insight ✅ COMPLETE

- v0.16.0a: learning session review / parent progress insight plan (completed)
- v0.16.0b: session review data contract and local aggregation plan (completed)
- v0.16.0c: parent session summary helper, local-only / no UI (completed)
- v0.16.0d: parent session summary validation / QA (completed)
- v0.16.0e: parent session summary stabilization / release notes (completed)

## v0.17.0 — Parent Review Integration Surface ✅ COMPLETE

- v0.17.0a: parent review integration surface plan (completed)
- v0.17.0b: parent review debug surface prototype, local-only / no persistence (completed)
- v0.17.0c: parent review debug surface QA / wording validation (completed)
- v0.17.0d: v0.17 stabilization / release notes (completed)

## v0.18.0 — Parent Review Next Phase Plan ✅ COMPLETE

- v0.18.0a: parent review next phase plan (completed)
- v0.18.0b: session boundary/history modeling contract (completed)
- v0.18.0c: minimal local session history model / contract validation (completed — PR #206)
- v0.18.0d: parent review session history QA and stabilization (completed)
- v0.18.0e: v0.18 release notes / QA checklist (next)

# Task Discipline

opencode must not skip ahead.

If a task reveals missing requirements:

1. document the gap;
2. propose a small change;
3. do not silently add large features;
4. keep the PR reviewable.
