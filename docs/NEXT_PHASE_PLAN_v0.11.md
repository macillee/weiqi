# v0.11 — Next Phase Plan: Deployment / Supabase Environment Hardening

> Project: 小棋童围棋闯关
> Phase: v0.11.0a — planning
> Date: 2026-06-05
> Status: Planning complete — ready for implementation

---

## 1. Phase Summary

v0.10 shipped daily-practice skill filtering: category-balanced selection,
level clamping, spaced review priority, wrong-problem priority, and
multi-step awareness. The product now selects appropriate problems for
each child's skill level. v0.9 hardened CI and E2E automation.

However, deployment and Supabase configuration remain minimally
documented and untested outside of local development:

- Docker compose does not pass Supabase environment variables.
- `.env.example` lists only two variables with no guidance on where
  to find values or what happens when they are missing.
- `docs/DEPLOYMENT_STRATEGY_v0.2.md` describes the intended model but
  has not been validated against the current Docker setup since v0.2.
- No CI step verifies that the Docker build succeeds or that the app
  starts correctly in production mode.
- First-run developer experience requires reading scattered docs to
  understand the optional Supabase fallback behavior.

This plan selects **Deployment / Supabase environment hardening** as the
primary v0.11 direction and defines three implementable slices.

---

## 2. Candidate Direction Evaluation

### A. Deployment / Supabase Environment Hardening

**Strengths:**
- Improves first-run DX for developers and deployers.
- Docker compose currently omits Supabase env passthrough; fixing this
  is a concrete, low-risk improvement.
- `.env.example` lacks guidance; adding comments reduces onboarding
  friction.
- CI does not verify Docker build; adding a Docker smoke step catches
  build regressions early.
- `docs/DEPLOYMENT_STRATEGY_v0.2.md` is stale; updating it brings
  documentation in line with the current codebase (v0.2–v0.10).
- Every future feature (multi-step expansion, UI explainability, content)
  benefits from a reliable deployment foundation.
- Low risk — no schema, data, or runtime UI changes.

**Weaknesses / Risks:**
- No direct child-facing impact.
- Docker-in-CI adds build time to the pipeline.
- If Docker build is flaky in CI, it may cause false-negative failures.

**Estimated Slice Count:** 3

**Verdict:** Primary direction — improves operational reliability and
developer onboarding, recommended by v0.10 release notes section 8.

---

### B. UI Explainability for Practice Selection

**Strengths:**
- Medium user impact — children and parents could see why a problem was
  selected (review, wrong problem, category balance, multi-step readiness).
- No algorithm change — only presentation layer.
- Could be as simple as a "复习" badge on review problems.

**Weaknesses / Risks:**
- Risk of UI clutter for young children (6–10 years old).
- Design decisions (badge vs. copy vs. color) require iteration.
- May create expectations about selection transparency that are hard to
  maintain if the algorithm changes.
- Less urgent now that v0.10 already improves selection quality; the
  selection is better even without explanation.

**Estimated Slice Count:** 1–2

**Verdict:** Defer — selection quality is now good enough that
explainability is a polish item, not a gap. Revisit after deployment
hardening and further playtesting.

---

### C. Deeper Multi-Step Support (3+ Steps, Opening/Endgame Variants)

**Strengths:**
- High pedagogical value — multi-step problems teach deeper reading.

**Weaknesses / Risks:**
- Requires `ProblemStep` schema v2 — schema migration, authoring, and
  validation.
- 3–5 slices of work.
- Harder to test and review than deployment or documentation changes.
- Current multi-step content (9 problems, 2 steps each) was wired in
  v0.8 and gated in v0.10; the team should observe usage before
  expanding the format.
- No child has yet encountered multi-step problems through normal daily
  practice (they must first complete single-step prerequisites).

**Estimated Slice Count:** 3–5

**Verdict:** Defer — premature until deployment is reliable and the team
has usage data on current multi-step problems filtered through v0.10
gating.

---

### D. Further Content Expansion Beyond 77 Problems

**Strengths:**
- Tangible variety increase.
- v0.4 / v0.5 / v0.7 established a proven content-authoring process.

**Weaknesses / Risks:**
- Diminishing returns after v0.8 full wiring and v0.10 smarter selection.
- v0.10 skill filtering now distributes problems effectively; adding more
  content is less impactful than when selection was random.
- Content authoring is more expensive than infrastructure improvement.
- 77 problems cover 6 categories and 5 levels; the gap is primarily in
  level 4–5 and opening/endgame, not total count.

**Estimated Slice Count:** 2–3

**Verdict:** Defer — deployment hardening should come first so that
future content ships on a reliable foundation. Revisit after v0.11.

---

### E. Release Automation Maturity

**Strengths:**
- Incremental over v0.9 CI foundation.
- Could add Docker build verification, more E2E coverage, or visual
  regression gates.

**Weaknesses / Risks:**
- No user-facing impact.
- v0.9 CI/E2E coverage is already sufficient to gate product work.
- Docker build verification overlaps with direction A (deployment
  hardening); better to include it there.

**Estimated Slice Count:** 1

**Verdict:** Defer — the Docker CI component is better placed under
direction A as part of deployment hardening. Remaining E2E maturity
(visual regression, performance) can wait.

---

## 3. Selected Primary Direction

**Deployment / Supabase environment hardening.**

Justification:

- v0.10 release notes (section 8) explicitly recommended this direction
  as the primary candidate for v0.11.
- v0.10.0a (NEXT_PHASE_PLAN_v0.10.md, section 2B) evaluated this
  direction and deferred it to v0.11, noting it would be the right next
  step after skill filtering.
- Docker compose does not pass Supabase environment variables, making
  cloud-sync mode impossible in Docker without manual workarounds.
- CI does not verify Docker build, so build regressions are caught only
  by manual testing.
- Deployment documentation is stale (written for v0.2; codebase has
  progressed through v0.3–v0.10).
- Low risk — no schema, data, or runtime UI changes.
- Every subsequent feature (multi-step, content, UI) benefits from a
  reliable deployment and configuration foundation.

---

## 4. Slices

### Slice 1 (v0.11.0b): Docker Compose Supabase Env Passthrough + `.env.example` Guidance

**Goal:** Make cloud-sync mode work out of the box in Docker and improve
first-run developer experience.

**Rough Scope:**

- `docker-compose.yml` — add `env_file: .env.local` or explicit
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` passthrough
  with documentation comments.
- `docker-compose.dev.yml` — same env passthrough for dev mode.
- `.env.example` — add comments explaining:
  - Where to find Supabase URL and anon key (Supabase dashboard).
  - That both variables are optional and the app works fully without them.
  - That `.env.local` is the target file (gitignored).
- Documentation — update any first-run instructions to mention
  `.env.local` setup.

**Acceptance Criteria:**

- `docker compose up --build` starts the app and makes it reachable at
  `http://localhost:3000` without Supabase env.
- When `.env.local` contains valid Supabase credentials, Docker compose
  passes them through and the app enters server-sync mode.
- `.env.example` contains clear guidance on optional Supabase setup.
- `npm run build` and `npm run test` pass.
- No runtime code changes in `src/`.

**Non-goals:**

- No changes to `src/lib/supabase/` client code.
- No new Docker images or multi-stage build changes.
- No CI Docker build step (deferred to slice 2).
- No schema or data changes.
- No problem content changes.

---

### Slice 2 (v0.11.0c): CI Docker Build Verification + Deployment Documentation Refresh

**Goal:** Ensure CI catches Docker build regressions and bring deployment
documentation up to date with the current codebase.

**Rough Scope:**

- `.github/workflows/ci.yml` — add a Docker build step (after existing
  gates) that runs `docker compose build` and verifies the image builds
  successfully. Does not need to start the container or run E2E against
  it.
- `docs/DEPLOYMENT_STRATEGY_v0.2.md` — refresh to reflect current
  codebase state (v0.2–v0.10 changes: Supabase client library, auth,
  child profiles, server progress, local import, skill filtering, CI
  gates). Rename to `docs/DEPLOYMENT.md` or keep the existing filename.
- Remove or note any sections that are obsolete (e.g. implementation
  sequence references that have been completed).

**Acceptance Criteria:**

- CI workflow includes a Docker build step that fails the pipeline if
  `docker compose build` fails.
- `docs/DEPLOYMENT_STRATEGY_v0.2.md` (or renamed equivalent) accurately
  reflects the current codebase, Docker setup, and Supabase configuration.
- Existing CI gates (lint, typecheck, test, build, E2E) still pass.
- `npm run build` and `npm run test` pass.

**Non-goals:**

- No Docker compose service start or E2E-against-Docker in CI.
- No changes to `src/` source code.
- No new E2E tests.
- No schema or data changes.

---

### Slice 3 (v0.11.0d): Stabilization / Release Notes

**Goal:** Stabilize the v0.11 deployment hardening series and publish
release notes plus QA checklist.

**Rough Scope:**

- `docs/RELEASE_NOTES_v0.11.md` — summary of v0.11.0a/b/c deliverables.
- `docs/QA_CHECKLIST_v0.11.md` — manual QA checklist for Docker
  deployment, Supabase env passthrough, CI Docker build, and regression.
- `docs/TASKS.md` — mark v0.11 complete, set next phase.

**Acceptance Criteria:**

- Release notes document all v0.11 slices with validation results.
- QA checklist covers Docker deployment, Supabase env, CI Docker step,
  and regression.
- `npm run build` and `npm run test` pass.

**Non-goals:**

- No code or test changes.
- No schema or data changes.

---

## 5. Out-of-Scope for v0.11

The following items are explicitly out of scope for the entire v0.11
phase:

- **Schema changes** — `Problem`, `ProblemStep`, `StudentProgress`, and
  all other schemas remain unchanged.
- **Problem content** — no new problems, no edits to existing problems.
- **Problem data** — `src/data/problems.json` is not modified.
- **Runtime UI behavior** — no new pages, no redesign, no layout changes.
- **`src/lib/supabase/` client code** — no changes to Supabase client,
  auth, child-profiles, server-progress, or error handling logic.
- **New E2E tests** — existing smoke tests are sufficient.
- **Supabase self-hosting** — out of scope per v0.2 design.
- **Service role keys** — never exposed in browser container.
- **AI / payment / teacher / admin / leaderboard** — excluded from v0.11.
- **Board-size expansion / SGF import-export / multiplayer** — excluded
  from v0.11.
- **App redesign** — no new pages or visual redesigns.
- **3+ step multi-step support** — deferred.
- **UI explainability for practice selection** — deferred.

---

## 6. Acceptance Rules for v0.11 Slices

1. **One reviewable PR per slice.** Each slice is self-contained and can
   be reviewed, merged, and deployed independently.
2. **No mixing unrelated product areas.** A slice PR touches only Docker
   files, CI config, env files, documentation, or test files as
   explicitly scoped.
3. **No package/lockfile changes unless explicitly scoped.** Slice 2 may
   require a Docker-related CI dependency change; if so, it must be
   justified in the PR body.
4. **No schema change.** No `Problem`, `ProblemStep`, or database schema
   modifications.
5. **No CI/E2E config changes unless explicitly scoped.** Slice 2 is the
   only slice that may modify CI workflow; slices 1 and 3 must not.
6. **No AI/payment/teacher/admin/leaderboard/board-size/SGF scope creep.**
7. **Each PR must pass `npm run lint`, `npm run typecheck`, `npm run test`,
   `npm run build`, and `npm run test:e2e`.**

---

## 7. Validation

This planning document is docs-only:

| Check | Status |
|---|---|
| `src/` modified | No |
| `e2e/` modified | No |
| CI config modified | No |
| `package.json` modified | No |
| `package-lock.json` modified | No |
| Problem data modified | No |
| Schema modified | No |
| Runtime UI code modified | No |
