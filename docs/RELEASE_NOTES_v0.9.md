# v0.9 — Infrastructure / E2E / CI Hardening

> Project: 小棋童围棋闯关
> Release: v0.9
> Date: 2026-06-05

---

## 1. Release Summary

v0.9 is an infrastructure hardening series that adds automated CI and
Playwright E2E smoke tests to the project. Before v0.9, all PRs were
validated manually — lint, typecheck, unit tests, and build were run
locally, and the QA checklist had grown to 25 sections.

No new problem content, schema changes, or runtime UI changes were
introduced. The release lays the foundation for safer, faster validation
of future product work.

The release follows a prerequisite cleanup (PR #109) and three slices
(v0.9.0a–c) plus this stabilization (v0.9.0d), each delivered as its own
PR:

- PR #109 — Prerequisite lint/typecheck cleanup (required before CI)
- v0.9.0a — Next phase plan (planning, PR #106)
- v0.9.0b — GitHub Actions CI + Playwright setup (PR #110)
- v0.9.0c — E2E smoke tests for core flows (PR #112)
- v0.9.0d — Stabilization and release notes (this PR)

---

## 2. Direction and Rationale

v0.8 content wiring shipped the full 77-problem library into chapter and
daily-practice flows, but the manual QA checklist had ballooned to 25
sections. v0.9.0a evaluated five candidate directions (infrastructure/CI,
deployment hardening, deeper multi-step, further content expansion,
daily-practice skill filtering) and selected **infrastructure / E2E / CI
hardening** because:

- **Manual QA does not scale.** 25 sections in the v0.8 QA checklist
  demonstrates that manual regression becomes increasingly labor-intensive
  as the chapter and problem count grows.
- **Highest long-term ROI.** Every future slice — content, multi-step,
  skill filtering — benefits from automated regression coverage.
- **v0.8 release notes explicitly recommended this direction.**
- **Low risk.** No schema, data, or runtime behavior changes.

The full rationale and slice boundaries are recorded in
`docs/NEXT_PHASE_PLAN_v0.9.md`.

---

## 3. Prerequisite Cleanup (PR #109)

Before CI could be enforced, pre-existing lint and TypeScript errors had
to be resolved:

- `src/__tests__/problems.test.ts` — unused variable `i`, unused import
  `validateBoard`, `p` redeclared in same block
- `src/__tests__/server-progress.test.ts` — unused parameter `p`
- `src/__tests__/weekly-report.test.ts` — unused import `describe`
- `src/__tests__/practice-page.test.tsx` — unused parameter `p`
- `src/components/board/GoBoard.tsx` — unused import `isPointOnBoard`
- `src/__tests__/progress-import-v2.test.ts` — `any` type usage,
  `done` callback misuse
- `src/app/settings/page.tsx` — renamed `setAudioEnabled` conflict
  (import vs local function)
- `vitest.config.ts` — excluded `e2e/` from vitest test discovery
  (Playwright files should not be picked up by vitest)

After cleanup: `npm run lint` and `npm run typecheck` both exit 0.

---

## 4. Slice Summary

### v0.9.0a — Next Phase Plan (PR #106)

- Planning document `docs/NEXT_PHASE_PLAN_v0.9.md`.
- 5 candidate directions evaluated; infrastructure/CI selected.
- 3 implementation slices defined (b, c, d) with explicit non-goals.
- Docs-only.

### v0.9.0b — GitHub Actions CI + Playwright Setup (PR #110)

- Created `.github/workflows/ci.yml` with:
  - Triggers: push to `main`, PR to `main`
  - Node.js 22 with npm cache
  - Steps: `npm ci`, Playwright browser install, lint, typecheck,
    unit tests, build, E2E smoke tests
  - Playwright trace upload on failure
- Added `playwright.config.ts` with:
  - Chromium-only setup
  - Dev dependency: `@playwright/test`
  - Standalone server build for CI; dev server reuse for local
- Added `e2e/home.spec.ts` — boots and renders the home page
- Added `npm run test:e2e` script to `package.json`
- Fixed pre-existing lint/typecheck errors (PR #109)
- `npm run test`: 326 passed (21 files)
- `npm run build`: compiled successfully

### v0.9.0c — E2E Smoke Tests for Core Flows (PR #112)

Added 5 new Playwright test files (total E2E coverage: 6 tests):

| File | Route / Flow | Key assertions |
|---|---|---|
| `e2e/levels.spec.ts` | `/levels` | All 6 chapter titles visible |
| `e2e/chapter.spec.ts` | `/levels/capture` | Chapter title, levels 1–10, back link |
| `e2e/demo.spec.ts` | `/demo` | Problem ID buttons, board SVG, hint button |
| `e2e/practice.spec.ts` | `/practice` | Idle heading, description, start button |
| `e2e/settings.spec.ts` | `/settings` | Heading, sound section, audio toggle |

All tests pass without Supabase env, login, or child profile setup.
No `src/`, `package.json`, Playwright config, or CI workflow changes.

---

## 5. CI Inventory

| Configuration | Value |
|---|---|
| Provider | GitHub Actions |
| Triggers | Push to `main`, PR to `main` |
| Node.js | 22 (with npm cache) |
| Package install | `npm ci` |
| Playwright browsers | Chromium (with system deps) |
| Hard gates | `lint` → `typecheck` → `test` → `build` → `test:e2e` |
| Failure artifact | Playwright traces uploaded to `test-results/` (7-day retention) |

---

## 6. E2E Inventory

| Suite | Tests | Routes | Coverage |
|---|---|---|---|
| `home.spec.ts` | 1 | `/` | Home page boots, 4 nav links visible |
| `levels.spec.ts` | 1 | `/levels` | All 6 chapter entries render |
| `chapter.spec.ts` | 1 | `/levels/capture` | Chapter page loads with level entries |
| `demo.spec.ts` | 1 | `/demo` | Problem selector, board SVG, hint button render |
| `practice.spec.ts` | 1 | `/practice` | Idle state with start button visible |
| `settings.spec.ts` | 1 | `/settings` | Heading, sound section, audio toggle render |
| **Total** | **6** | | |

**Intentionally not covered:**
- Wrong-book, report, and spaced-review comprehensive flows
- Visual regression (golden screenshots)
- Performance benchmarking
- Mobile/narrow-viewport rendering
- Auth / Supabase-connected flows
- Audio tone quality (hardware-dependent)

---

## 7. Current Stable Product Baseline

| Item | Status |
|---|---|
| Total problems | 77 |
| Wired into chapters | 77 / 77 (100 %) |
| Chapters | 6 (capture, escape, connect_cut, opening, life_death, endgame) |
| Local anonymous mode | Fully functional without Supabase env |
| Supabase sync | Optional; unchanged from v0.2 |
| v0.6 UX polish | Chinese labels, celebration, audio, progressive hints |
| v0.7 content | 12 endgame/opening/L3–5 problems present |
| v0.8 wiring | Full library reachable in daily practice and chapter flow |

---

## 8. Backward Compatibility

- Problem schema unchanged.
- Runtime UI behavior unchanged.
- `practice.ts` unchanged.
- `chapters.ts` unchanged.
- Progress/wrong-book/spaced-review/weekly-report unchanged.
- Supabase server mode unchanged; missing env does not break local mode.
- No `package-lock.json` changes beyond the initial `@playwright/test`
  addition in v0.9.0b.
- No SQL migrations or Supabase integration changes.

---

## 9. Known Limitations

- **E2E suite is smoke-level, not exhaustive.** Wrong-book, report, and
  spaced-review flows have no automated coverage.
- **No visual regression testing.** Golden screenshots were intentionally
  omitted to keep the E2E suite lightweight.
- **No performance benchmarking.** CI does not measure bundle size,
  first-contentful-paint, or runtime performance.
- **No deployment/Supabase env hardening.** Docker compose and Supabase
  local setup documentation remains minimal.
- **No daily-practice skill filtering.** `selectDailyProblems` still
  selects randomly from the full 77-problem pool.
- **No 3+ step problems or ProblemStep schema v2.**
- **E2E webServer setup requires improvement.** The current config builds
  and starts the standalone server, which can be slow on lower-end
  machines. Future work should optimize this.

---

## 10. Validation Status

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 (enforced by CI) |
| `npm run typecheck` | Exit 0 (enforced by CI) |
| `npm run test` | 326 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed (Chromium, ~3–4s) |
| CI workflow | All gates pass on push/PR to `main` |
| `package.json` | Changed only in v0.9.0b (added `@playwright/test`, `test:e2e` script) |
| `package-lock.json` | Changed only in v0.9.0b |
| Problem schema | Unchanged |
| Supabase / SQL | Unchanged |
| Runtime UI code | Unchanged |

This stabilization PR is documentation-only and does not change any code,
test, config, package, or behavior file, so it does not re-run the
validation checks; the numbers above are the values captured against
`main` after v0.9.0c (PR #112) merged.

For acceptance testing against this release, see
`docs/QA_CHECKLIST_v0.9.md`.

---

## 11. Next Phase Recommendation

The next slice should be a **planning-only `v0.10.0a` task** that picks a
single direction. v0.9 establishes the infrastructure foundation; the next
phase should evaluate product-facing improvements.

Short comparison of candidate directions for v0.10:

| Direction | User impact | Effort | Risk | Notes |
|---|---|---|---|---|
| A. Daily-practice skill filtering / level-aware selection | Medium — better daily variety | 1–2 slices | Low | Algorithmic change to `selectDailyProblems` only; no schema change. |
| B. Deployment / Supabase env hardening | Low — ops-only | 1 slice | Low | Docker polish, env validation, first-run DX. |
| C. Deeper multi-step (3+ step, opening/endgame multi-step) | High pedagogically | 3–5 slices | Medium | Requires `ProblemStep` schema v2; harder to author and review. |
| D. Further content expansion | High for daily variety | 2–3 slices | Low | Continue adding problems beyond 77; diminishing novelty returns. |
| E. Release automation maturity | None user-facing | 1 slice | Low | Improve E2E webServer, add more regression coverage; incremental over v0.9. |

**Recommended primary direction for v0.10.0a planning:** A — Daily-practice
skill filtering / level-aware selection. Rationale:

- Directly improves daily practice quality without new content.
- No schema change — `selectDailyProblems` is a pure function in
  `practice.ts`.
- v0.9 CI now provides automated regression coverage for practice and
  chapter flows, making algorithmic changes safer to ship.
- Better selection benefits every child immediately, regardless of how
  many problems exist in the library.
- Does not close the door on C or D for v0.10.0b+.

B (deployment hardening) is the recommended **secondary** candidate if the
team judges infrastructure to be more pressing than skill filtering.

`v0.10.0a` itself should be docs-only: a `NEXT_PHASE_PLAN_v0.10.md` that
chooses one direction, defines 1–3 slices, and lists explicit non-goals.
It must **not** start implementation.

---

## 12. Release Decision Template

```text
Release: v0.9
Date:
Tester:
Environment:

QA checklist completed: yes/no
Blocking bugs: yes/no
Known limitations accepted: yes/no

Decision:
[ ] Approved for v0.9 stabilization
[ ] Not approved — see notes

Notes:
```
