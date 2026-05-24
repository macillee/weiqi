# Project Task Queue

> This file is the task entry point for opencode.  
> Always read `AGENTS.md`, `docs/PROJECT_SPEC.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/QUALITY_CHECKLIST.md`, and the relevant release/content/design notes before implementing any task.

---

# Current Phase

v0.4.0d delivered — tag/category metadata refinement complete (51 problems, canonical tags). Next: post-v0.4 stabilization / release notes.

Current strategy:

```text
1. Preserve the stable v0.1.3 local MVP
2. Keep the app Docker-deployable with Supabase Cloud as external backend
3. Missing Supabase env must not break local anonymous mode
4. v0.4.0b content pack completed (12 new problems, 51 total)
5. v0.4.0c content validation and regression checks completed
6. v0.4.0d tag/category metadata refinement completed
7. Post-v0.4 stabilization / release notes (next)
8. Avoid AI/payment/teacher/leaderboard scope creep
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

# Next Task: Post-v0.4 Stabilization / Release Notes

## Goal

Finalize the v0.4 content series. Compile release notes, verify end-to-end behavior, and prepare for the next development phase.

---

# Future Roadmap

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

---

# Task Discipline

opencode must not skip ahead.

If a task reveals missing requirements:

1. document the gap;
2. propose a small change;
3. do not silently add large features;
4. keep the PR reviewable.
