# v0.11 — Deployment / Supabase Environment Hardening

> Project: 小棋童围棋闯关
> Release: v0.11
> Date: 2026-06-05

---

## 1. Release Summary

v0.11 is a deployment hardening series that makes Docker Compose pass
optional Supabase environment variables, adds CI Docker build
verification, and replaces the stale v0.2 deployment strategy with
current documentation. No runtime learning features, schemas, or
problem data were changed.

The release consists of three slices plus this stabilization:

- v0.11.0a — Next phase plan (planning, PR #126 / Issue #125)
- v0.11.0b — Docker Compose Supabase env passthrough + `.env.example` guidance (PR #128 / Issue #127)
- v0.11.0c — CI Docker build verification + deployment documentation refresh (PR #130 / Issue #129)
- v0.11.0d — Stabilization / release notes and QA checklist (this PR)

---

## 2. Direction and Rationale

v0.10 shipped daily-practice skill filtering. v0.11.0a evaluated five
candidate directions and selected **Deployment / Supabase environment
hardening** because:

- Docker Compose did not pass Supabase environment variables, making
  cloud-sync mode impossible in Docker without manual workarounds.
- `.env.example` lacked guidance on optional fallback behavior and
  Docker env setup.
- CI did not verify Docker build, so build regressions were caught only
  by manual testing.
- `docs/DEPLOYMENT_STRATEGY_v0.2.md` was stale (written for v0.2;
  codebase had progressed through v0.3–v0.10).
- Low risk — no schema, data, or runtime UI changes.
- Every subsequent feature benefits from a reliable deployment and
  configuration foundation.

The full rationale and slice boundaries are recorded in
`docs/NEXT_PHASE_PLAN_v0.11.md`.

---

## 3. Slice Summary

### v0.11.0a — Next Phase Plan (PR #126)

- Planning document `docs/NEXT_PHASE_PLAN_v0.11.md`.
- 5 candidate directions evaluated; deployment / Supabase environment
  hardening selected.
- 3 implementation slices defined (b, c, d) with explicit non-goals.
- Docs-only.

### v0.11.0b — Docker Compose Supabase Env Passthrough (PR #128)

- `docker-compose.yml` and `docker-compose.dev.yml` now use optional
  `env_file: .env.local (required: false)` to read Supabase public env
  vars when `.env.local` exists.
- Missing `.env.local` preserves local anonymous mode.
- No `${VAR:-}` passthrough in `environment` section — avoids empty-string
  override of `env_file` values.
- `environment` only contains `NODE_ENV` and `NEXT_TELEMETRY_DISABLED`.
- `.env.example` expanded with guidance on optional Supabase setup,
  Docker usage via `.env.local`, and service-role key safety warning.
- README updated to mention Docker Compose reads Supabase vars from
  `.env.local` when present.
- No `src/` code or Supabase client behavior changed.

### v0.11.0c — CI Docker Build Verification + Deployment Documentation Refresh (PR #130)

- `.github/workflows/ci.yml` — added `docker compose build` step after
  existing lint/typecheck/test/build/E2E gates.
- `docs/DEPLOYMENT.md` — new deployment document replacing stale
  `docs/DEPLOYMENT_STRATEGY_v0.2.md`. Covers current deployment modes,
  Docker Compose env behavior, environment variables, cloud-failure
  tolerance, validation commands, and current baseline.
- `docs/DEPLOYMENT_STRATEGY_v0.2.md` — removed.
- CI does not start Docker services or run E2E against Docker.

---

## 4. Docker / Env Behavior After v0.11

| Scenario | Behavior |
|---|---|
| No `.env.local` | App starts in local anonymous mode |
| `.env.local` with both Supabase vars | Docker Compose reads vars via `env_file`; app enters cloud-sync mode |
| Missing one of two vars | App treats Supabase as unconfigured; local anonymous mode |

Docker Compose env design:

- `env_file: .env.local (required: false)` reads `.env.local` when present.
- `environment` section contains only `NODE_ENV` and `NEXT_TELEMETRY_DISABLED`.
- No Supabase public vars in `environment` — prevents empty-string override.

CI pipeline after v0.11:

| Step | Gate |
|---|---|
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Unit tests | `npm run test` |
| Build | `npm run build` |
| E2E smoke | `npm run test:e2e` |
| Docker build | `docker compose build` |

---

## 5. Compatibility / Unchanged Areas

- No `src/` source files modified.
- No problem data changes (`src/data/problems.json` unchanged).
- No `ProblemStep` schema changes.
- No `src/lib/supabase/` client code changes.
- No SQL / Supabase behavior changes.
- No runtime UI redesign.
- Local anonymous mode remains fully functional without Supabase env.
- Daily practice skill filtering (v0.10) behavior unchanged.

---

## 6. Validation Status

| Check | Result |
|---|---|
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run test` | 351 passed (21 files) |
| `npm run build` | Compiled successfully |
| `npm run test:e2e` | 6 passed |
| `docker compose build` | CI step added; verified in CI for PR #130 |

This stabilization PR is documentation-only and does not change any code,
test, config, package, or behavior file.

---

## 7. Known Limitations / Non-Goals

- **No Docker service start in CI.** CI verifies the build only; it does
  not start the container or run E2E against Docker.
- **No shell env / `--env-file` passthrough.** Docker Compose only reads
  `.env.local` via `env_file`; shell env vars and `docker compose
  --env-file` do not inject Supabase public vars into the container.
- **No schema or data changes.** Problem library remains 77 problems.
- **No runtime code changes.** No new features, no UI changes.
- **No AI opponent / AI review / payment / teacher / admin / leaderboard /
  board-size / SGF / multiplayer work.**

---

## 8. Next Phase Recommendation

v0.11 completes the deployment hardening series. The next phase should
return to product feature work. Candidate directions:

| Direction | User impact | Effort | Risk | Notes |
|---|---|---|---|---|
| A. Deeper multi-step (3+ step, ProblemStep schema v2) | High pedagogically | 3–5 slices | Medium | Schema migration required; observe v0.10 multi-step gating usage first. |
| B. Further content expansion beyond 77 | High for daily variety | 2–3 slices | Low | Diminishing returns after v0.10 skill filtering. |
| C. UI explainability for practice selection | Medium — child-facing | 1–2 slices | Low | "复习" badge or indicator; no algorithm change. |
| D. Release automation maturity | None user-facing | 1 slice | Low | Visual regression, performance benchmarks. |

The recommended primary direction for `v0.12.0a` planning is **A — deeper
multi-step support** if usage data supports it, or **B — content
expansion** if multi-step observation period is still too short.

---

## 9. Release Decision Template

```text
Release: v0.11
Date:
Tester:
Environment:

Docker build verified (CI or local): yes/no
Docker compose up without .env.local works: yes/no
.env.local cloud-sync path works (if Supabase available): yes/no
Deployment docs accurate: yes/no
Known limitations accepted: yes/no
No out-of-scope features introduced: yes/no

Decision:
[ ] Approved for v0.11 stabilization
[ ] Not approved — see notes

Notes:
```
