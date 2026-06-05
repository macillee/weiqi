# QA Checklist — v0.11 Deployment / Supabase Environment Hardening

> Project: 小棋童围棋闯关
> Version target: v0.11
> Purpose: manual acceptance + automated validation checklist for the
> v0.11 deployment hardening series (v0.11.0a planning, v0.11.0b Docker
> Compose env passthrough, v0.11.0c CI Docker build + deployment docs,
> v0.11.0d stabilization).

See `docs/RELEASE_NOTES_v0.11.md` for the per-slice summary, Docker/env
behavior, known limitations, and next-phase recommendation. This
checklist focuses on acceptance validation.

---

# 1. Environment Setup

- [ ] Fresh checkout of `main` at the stabilization commit.
- [ ] Node.js 22 installed.
- [ ] `npm ci` completes without errors.
- [ ] No `.env.local` present (default local anonymous mode).
- [ ] Optional: `.env.local` created with both
      `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      from a Supabase project.

---

# 2. Static Validation

- [ ] `npm run lint` exits 0.
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run test` exits 0 (351 tests, 21 files).
- [ ] `npm run build` compiles successfully.

---

# 3. E2E Validation

- [ ] `npm run test:e2e` exits 0 (6 tests).

---

# 4. Docker Validation

- [ ] `docker compose build` completes without errors.
- [ ] `docker compose up --build` starts without `.env.local`; app
      reachable at `http://localhost:3000`.
- [ ] Local anonymous path works in Docker (home page, practice,
      wrong book, report, settings).
- [ ] Optional: `.env.local` with both Supabase vars →
      `docker compose up --build` → cloud-sync mode becomes available.

---

# 5. Supabase Env Behavior

- [ ] No `.env.local` → app runs in local anonymous mode; no Supabase
      UI visible.
- [ ] Only one of two Supabase vars set → app treats Supabase as
      unconfigured; local anonymous mode.
- [ ] Both Supabase vars set via `.env.local` → app enables auth,
      child profiles, and cloud-sync mode.
- [ ] Service-role key is never used in browser container or
      client-side code.
- [ ] Supabase network failure → app shows error but preserves local
      page state.

---

# 6. Regression — Core App Smoke

- [ ] Home page loads with stats and navigation.
- [ ] Daily practice works (start, solve, feedback, summary).
- [ ] Wrong book works (active, reviewing, mastered transitions).
- [ ] Report page loads with statistics.
- [ ] Settings / reset local progress works.
- [ ] No login forced in local anonymous mode.
- [ ] `/demo` loads a problem without writing real progress.

---

# 7. CI Expectations

- [ ] CI pipeline order: lint → typecheck → unit → build → E2E →
      Docker build.
- [ ] Docker build step runs `docker compose build`.
- [ ] Docker build verification fails the pipeline on Docker build
      failure.
- [ ] CI does not start Docker services.
- [ ] CI does not run E2E against Docker.

---

# 8. Deployment Documentation

- [ ] `docs/DEPLOYMENT.md` exists and accurately describes current
      Docker Compose and Supabase env behavior.
- [ ] Stale `docs/DEPLOYMENT_STRATEGY_v0.2.md` no longer exists.
- [ ] `.env.example` documents optional Supabase setup and `.env.local`
      Docker usage.
- [ ] README Docker section mentions `.env.local` auto-read.

---

# 9. Regression — E2E Smoke

- [ ] Home, levels, chapter, demo, practice, settings smoke tests pass.
- [ ] `npm run test:e2e` — 6 passed.

---

# 10. Regression — Content and Wiring

- [ ] 77 / 77 wired content remains unchanged.
- [ ] All 6 chapters navigable from `/levels`.

---

# 11. Regression — v0.10 Skill Filtering

- [ ] Category-balanced selection still applies (max 3 per category).
- [ ] Level clamp still applies.
- [ ] Due review and wrong-problem priority still apply.
- [ ] Multi-step eligibility gating still applies.

---

# 12. Regression — v0.6 Polish

- [ ] Chinese coordinate labels visible on board.
- [ ] Correct-answer star celebration animation triggers.
- [ ] Audio toggle persists across page refresh.
- [ ] Progressive hint cards render with numbered badges and fade-in.
- [ ] Hint board markers display as outlined rings.

---

# 13. Sign-Off Template

```text
Release: v0.11
Date:
Tester:
Branch / PR:
Environment:

Commands run:
- npm run lint:
- npm run typecheck:
- npm run test:
- npm run build:
- npm run test:e2e:
- docker compose build:
- docker compose up --build:

Docker mode tested (no .env.local): yes/no
Supabase cloud-sync mode tested: yes/no / N/A (no credentials)
Known issues:

Decision:
[ ] Approved for v0.11 stabilization
[ ] Not approved — see notes

Notes:
```

---

# 14. v0.11 Completion Criteria

v0.11 is considered stabilized only when:

- sections 2–12 of this checklist pass on `main` at the stabilization
  commit;
- CI gates (lint, typecheck, test, build, E2E, Docker build) all pass;
- Docker compose starts and app is reachable without `.env.local`;
- all v0.11 known limitations in `docs/RELEASE_NOTES_v0.11.md` section 7
  are accepted as documented;
- no AI / payment / teacher / admin / leaderboard / multiplayer /
  board-size / SGF / schema work was introduced;
- the next task is opened separately and does **not** include
  implementation.
