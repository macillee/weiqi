# v0.9 Next Phase Plan

> Project: 小棋童围棋闯关
> Version: v0.9.0a (planning)
> Date: 2026-06-04

---

## 1. Context

v0.8 content wiring is complete and stabilized:

- v0.8.0a: next phase plan selected chapter / daily-practice content wiring
  as the primary v0.8 direction (`docs/NEXT_PHASE_PLAN_v0.8.md`).
- v0.8.0b: wired 21 single-step capture / escape / connect_cut problems
  (PR #97).
- v0.8.0c: wired 23 single-step life_death / endgame / opening problems;
  created two new chapters (死活山洞, 官子山谷) and extended the opening
  chapter (PR #99).
- v0.8.0d: wired 9 multi-step problems (PR #101).
- v0.8 stabilization: release notes and QA checklist published (PR #104).

Library state at the start of v0.9:

- **77 total problems** (68 single-step, 9 multi-step), all wired.
- 6 chapters, 36 levels, full category coverage.
- Daily practice (`selectDailyProblems`) draws from all 77 wired
  problems via `getAllProblemIds()`.
- v0.6 UX polish (Chinese labels, celebration, audio, progressive
  hints) remains stable.
- v0.7 content balancing (endgame + opening + L3–5 rebalance) remains
  stable.

### Gaps

- **No automated regression coverage.** Every PR since v0.4 has relied
  on unit tests + manual QA checklists. The QA checklist for v0.8 had
  25 sections; manual regression is increasingly labor-intensive.
- **No CI pipeline.** Lint, typecheck, test, and build are all run
  locally before each PR. There is no enforcement on push or PR open.
- **Daily practice lacks skill filtering.** `selectDailyProblems`
  selects randomly from the full wired pool without adjusting for the
  child's current skill, level, or recent performance.
- **Multi-step capped at 2 steps.** No 3+ step problems or opening /
  endgame multi-step content exists.
- **No deployment hardening.** Docker compose and Supabase env setup
  documentation is minimal; first-run behavior relies on the developer
  reading `.env.example`.

---

## 2. Candidate Directions

### A. Infrastructure / E2E / CI Hardening

Add Playwright smoke tests, GitHub Actions CI for lint + typecheck +
test + build, deterministic release QA automation, and regression
coverage for chapter / practice / demo / local-anonymous flows.

Strengths:

- **Highest long-term maintainability ROI.** Every future slice —
  content, multi-step, skill filtering — benefits from automated
  regression coverage. The manual QA checklist pattern has worked for
  v0.5–v0.8 but is increasingly labor-intensive as the chapter and
  problem count grows.
- **No user-facing risk.** No schema, data, or runtime behavior
  changes. CI runs in GitHub Actions; Playwright tests are dev
  dependencies only.
- **Clear slice boundaries.** CI setup, smoke tests, and release QA
  can ship as independent PRs.
- **Independent of content decisions.** Can proceed regardless of
  whether the next content direction is expansion, multi-step, or
  skill filtering.
- **v0.8 release notes explicitly recommend this as the primary v0.9
  direction.** The recommendation was based on the observation that
  the manual QA checklist pattern is increasingly labor-intensive.

Weaknesses / risks:

- **No user-facing change.** Parents and children see no difference.
- **Adds CI dependencies.** Playwright runner, `@playwright/test`
  package, and a GitHub Actions workflow — `package.json` and
  `package-lock.json` will change. This is a significant deviation
  from the "no package/lockfile change" convention maintained since
  v0.5.
- **Easy to under-scope.** A Playwright config that nobody runs in CI
  is worse than no config. CI enforcement must be real: PRs should
  not merge if CI fails.
- **Playwright test authoring has a learning curve.** The team must
  write and maintain E2E tests; this is ongoing maintenance work.
- **CI runtime cost.** GitHub Actions free-tier minutes are limited;
  a full Playwright suite may take 5–10 minutes per PR.

Estimated slice count: 3 implementation slices.

### B. Deployment / Supabase Environment Hardening

Polish Docker compose workflow, document Supabase local setup, add env
validation helpers, improve first-run developer experience, better error
messages when Supabase is unconfigured.

Strengths:

- **Low effort, mostly documentation.** One slice can cover the bulk.
- **Reduces onboarding friction** for new contributors and parents
  re-running the stack.
- **Low risk.** No schema, data, or runtime changes; docs and env
  helpers only.

Weaknesses / risks:

- **No user-facing change.** Only relevant for self-hosting contributors.
- **Limited audience.** The app works fine without Supabase env; local
  Supabase is not used by anonymous mode.
- **Easy to scope-creep** into "rewrite the Docker setup" without clear
  acceptance criteria.
- **Not time-sensitive.** Existing Docker workflow works.

Estimated slice count: 1 implementation slice.

### C. Deeper Multi-Step Support

Add 3+ step problems, opening/endgame multi-step problems, and polish
step-transition UX. Likely requires `ProblemStep` schema v2.

Strengths:

- **High pedagogical value.** Longer problem chains teach deeper reading
  and planning.
- **Differentiates the product.** No other children Go app offers
  guided multi-step problems of this style.
- **All 77 problems are now wired** — new multi-step content will be
  immediately usable in daily practice.

Weaknesses / risks:

- **Schema change required.** `ProblemStep` was designed for 2 steps;
  3+ steps may require array-length constraints, step-type metadata,
  or branching logic. This is the first schema change since v0.3.
- **Touches schema + data + UI.** At minimum: type change + validation
  update + ProblemPlayer step-transition polish. Larger PRs, harder to
  review.
- **Content creation is harder.** Multi-step opening and endgame
  problems are significantly more difficult to author than single-step
  ones.
- **No immediate user benefit for the 77 existing problems.** Existing
  problems stay at 2 steps; only new problems benefit.
- **Could be planned later** without blocking more urgent work.

Estimated slice count: 4–5 implementation slices (schema, player UX,
content pack, validation, stabilization).

### D. Further Content Expansion

Continue adding problems beyond 77, targeting further level 3–5
rebalance, more endgame, and more opening variety.

Strengths:

- **Proven, well-rehearsed pattern.** Three consecutive content series
  (v0.4, v0.5, v0.7) all shipped cleanly.
- **Low product risk.** No schema, UI, or dependency change.
- **All new problems are immediately usable in daily practice** thanks
  to v0.8 wiring — this was not the case for v0.4/v0.5/v0.7.

Weaknesses / risks:

- **Diminishing novelty returns.** Four consecutive content/wiring
  series without any infrastructure improvement feels repetitive.
- **77 problems is a reasonable library size** for a children Go app
  targeting ~1 year of experience. More problems do not directly
  improve practice quality if selection is random.
- **Skill filtering is more impactful.** Better problem selection
  (Direction E) improves daily practice quality more than adding more
  problems to a random pool.
- **Better to invest in infrastructure first** so that future content
  additions can be validated against automated regression coverage.

Estimated slice count: 2–3 implementation slices.

### E. Daily-Practice Skill Filtering / Level-Aware Selection

Adjust `selectDailyProblems` based on child performance, level, due
review, and category mix. Avoid overwhelming children with high-level or
multi-step content too early.

Strengths:

- **Medium user impact.** Directly improves daily practice quality by
  selecting problems that match the child's current skill level.
- **No schema change.** `selectDailyProblems` is a pure function in
  `practice.ts`; changes are algorithmic only.
- **Small, reviewable slice.** One implementation slice can cover the
  bulk.
- **Complementary with infrastructure.** Can follow CI setup in v0.9
  without conflict.

Weaknesses / risks:

- **Algorithm design is non-trivial.** Balancing level, category mix,
  due reviews, and avoiding repetition requires careful tuning and
  testing.
- **Requires performance data to be meaningful.** A child with no
  history gets random selection; the algorithm only improves with more
  data.
- **No content change.** The problem pool remains 77; only the
  selection logic changes.
- **Hard to validate without real usage data.** Unit tests can verify
  constraints, but pedagogical quality requires real playtesting.

Estimated slice count: 1–2 implementation slices.

---

## 3. Selected Primary Direction: A — Infrastructure / E2E / CI Hardening

**Rationale:**

1. **Highest long-term ROI.** Every future slice — content (D), deeper
   multi-step (C), skill filtering (E) — benefits from automated
   regression coverage. The manual QA checklist pattern worked for
   v0.5–v0.8 but is increasingly labor-intensive; 25 sections in the
   v0.8 QA checklist is a clear signal that manual regression does not
   scale.

2. **v0.8 release notes explicitly recommend this direction.** The
   recommendation was based on the observation that the manual QA
   checklist pattern is increasingly labor-intensive as the chapter and
   problem count grows.

3. **Prepares the ground for future directions.** Once CI is in place:
   - Skill filtering (E) can be validated against automated smoke
     tests for practice/chapter flows.
   - Deeper multi-step (C) can be validated against automated
     step-transition regression.
   - Content expansion (D) can be validated against automated chapter
     wiring checks.

4. **Low risk.** No schema, data, or runtime behavior changes. CI runs
   in GitHub Actions; Playwright tests are dev dependencies only.

5. **Clear slice boundaries.** The three slices (CI setup, E2E smoke
   tests, release QA) are independent and reviewable.

**Why not B, C, D, or E now:**

- **B (deployment)** is low-effort but also low-impact. It can be a
  single slice in any future phase; it does not block or enable other
  work.
- **C (deeper multi-step)** requires a schema change that should have
  its own dedicated planning task if revisited. Infrastructure does not
  block C — they are orthogonal — but infrastructure makes C safer to
  implement.
- **D (further content)** would be the fourth consecutive content
  series. Infrastructure investment now makes future content additions
  safer and faster to validate.
- **E (skill filtering)** is the best candidate for v0.9.0b+ if
  infrastructure ships quickly. It directly improves daily practice
  quality without new content. However, it benefits from having
  automated regression coverage for practice/chapter flows first.

---

## 4. Proposed Slices

### v0.9.0b — GitHub Actions CI + Playwright Setup

- **Goal:** Add a GitHub Actions workflow that runs lint, typecheck,
  test, and build on every push and PR. Install Playwright as a dev
  dependency with a minimal smoke test that validates the app boots and
  the home page renders.
- **Scope:** `.github/workflows/ci.yml`, `package.json` (add
  `@playwright/test`), `e2e/` directory with one smoke test,
  `playwright.config.ts`.
- **Acceptance criteria:**
  - GitHub Actions workflow runs on every push to `main` and on every
    PR against `main`.
  - Workflow runs `npm run lint` (if available), `npm run typecheck`
    (if available), `npm run test`, and `npm run build`.
  - Workflow fails the PR if any step exits non-zero.
  - Playwright smoke test boots the app and asserts the home page
    renders without error.
  - `npm run test:e2e` script added to `package.json`.
  - `package.json` and `package-lock.json` are updated with
    `@playwright/test` and any necessary browsers.
  - `npm run test` (unit tests) still passes.
  - `npm run build` still passes.
- **Non-goals:**
  - No comprehensive E2E test suite (deferred to v0.9.0c).
  - No release QA automation (deferred to v0.9.0d).
  - No schema, problem data, runtime code, `practice.ts`,
    `ProblemPlayer`, or UI changes.
  - No changes to `src/lib/` or `src/app/` source code.
  - No Playwright tests that exercise practice/chapter/wrong-book
    flows (only a home-page smoke test).

### v0.9.0c — E2E Smoke Tests for Core Flows

- **Goal:** Add Playwright smoke tests that cover the core learner-facing
  flows: chapter navigation, practice session, demo isolation, and
  local anonymous mode.
- **Scope:** `e2e/` directory (new test files only). No changes to
  `src/` source code.
- **Acceptance criteria:**
  - E2E tests cover:
    - Home page renders with chapter cards.
    - `/levels` renders all 6 chapters.
    - `/levels/capture` loads and shows level nodes.
    - `/demo` loads a problem; correct tap shows success feedback.
    - `/practice` starts a session and shows a problem.
    - `/settings` loads with audio toggle.
  - All E2E tests pass in CI (`npm run test:e2e`).
  - Unit tests (`npm run test`) still pass.
  - Build (`npm run build`) still passes.
- **Non-goals:**
  - No visual regression testing.
  - No performance benchmarking.
  - No comprehensive wrong-book / report / spaced-review E2E coverage
    (smoke only).
  - No changes to `src/` source code.

### v0.9.0d (optional) — Release QA Automation + Stabilization

- **Goal:** Automate the release QA checklist where possible; add E2E
  tests for v0.6/v0.7 regression items (Chinese labels, celebration,
  audio, hints, v0.7 content). Publish release notes and update
  TASKS.md.
- **Scope:** `e2e/` directory (additional test files), `docs/` directory.
- **Acceptance criteria:**
  - E2E tests cover v0.6 regression items (labels visible, celebration
    on correct answer, audio toggle, hint cards).
  - E2E tests cover v0.7 regression items (endgame / opening problems
    load in chapters).
  - Release notes and QA checklist for v0.9 published.
  - `docs/TASKS.md` updated: v0.9 stabilization delivered, next task
    identified.
- **Non-goals:**
  - No 100% manual QA replacement — some items (e.g. audio tone quality,
    mobile viewport) remain manual.
  - No schema, problem data, or runtime code changes.

---

## 5. Out-of-Scope for v0.9

- New problem categories or new problem metadata shapes.
- 3+ step multi-step problems or any `ProblemStep` schema v2.
- 13×13 / 19×19 board sizes or SGF import / export.
- User login, authentication, parent / child profile changes beyond
  what already exists in v0.2.
- Database migrations, RLS changes, or new Supabase functionality.
- Payment, subscription, teacher / admin backend, leaderboard, social
  features.
- AI-generated content, AI opponent, AI review.
- Full app redesign or layout overhaul.
- Changes to `src/data/problems.json`.
- Changes to `src/lib/practice.ts` selection algorithm (skill filtering
  is deferred to a future phase).
- Docker / Supabase environment hardening — can be a single slice in a
  future phase.

---

## 6. Acceptance Rules for v0.9 Tasks

1. **One reviewable PR per slice.** v0.9.0b / 0c / 0d each ship in
   their own PR. No slice may contain CI setup + E2E tests + docs in a
   single PR.
2. **No mixing unrelated areas.** v0.9.0b is CI setup + Playwright
  install only; v0.9.0c is E2E test files only; v0.9.0d is additional
  E2E tests + docs only.
3. **Package / lockfile changes are explicitly scoped.** v0.9.0b is the
   only slice that adds `@playwright/test` and updates
   `package.json` / `package-lock.json`. Subsequent slices must not
   modify these files unless adding a Playwright plugin or utility that
   is clearly scoped in the slice definition.
4. **No problem schema change unless selected in this plan.** `Problem`
   and `ProblemStep` shapes stay exactly as v0.3 left them.
5. **No AI / payment / teacher / admin / leaderboard / board-size / SGF
   / multiplayer scope creep.** Any such proposal must be filed as a new
   planning task before it can ship.
6. **Each PR body must include** `Closes #ISSUE_NUMBER`, a changed-files
   summary, `npm run test` + `npm run build` results, and an explicit
   scope statement.
7. **`docs/TASKS.md` is updated** at the end of every slice with the
   completed block and the next task reference.
8. **PRs stay open for ChatGPT review** per `AGENTS.md`.
9. **No test count regressions.** CI/E2E slices must not reduce the
   existing unit test count; they add E2E tests in a separate directory.
10. **E2E tests must not modify app state.** Playwright tests run against
    a build; they must not write to localStorage or Supabase in a way
    that persists between runs.

---

## 7. Decision Log

- Direction A (Infrastructure / E2E / CI Hardening) was selected because
  the manual QA checklist pattern is increasingly labor-intensive (25
  sections in v0.8) and does not scale as the chapter and problem count
  grows. Automated regression coverage is the highest-ROI investment
  before further product work.
- Direction E (Daily-Practice Skill Filtering) is the recommended
  secondary direction for v0.10 if CI ships cleanly in v0.9. It
  directly improves daily practice quality and benefits from having
  automated regression coverage for practice/chapter flows.
- Direction C (Deeper Multi-Step) remains deferred. It requires a
  `ProblemStep` schema change that should have its own dedicated
  planning task.
- Direction D (Further Content Expansion) is explicitly not selected.
  Infrastructure investment now makes future content additions safer and
  faster to validate.
- Direction B (Deployment Hardening) is low-priority; it can be a single
  slice in any future phase.
