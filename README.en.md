# Little Go Player — Children's Weiqi Practice

> A children-friendly Go (Weiqi) problem-solving web app for kids with ~1 year of play experience.
> 中文版本请见 [README.md](README.md).

A web-based Go (Weiqi) training app for children (ages 7–9) who have been learning the game for about a year. It focuses on **short, focused, verifiable** practice sessions — not a full Go playing platform.

## Current Status (as of v0.6.0c)

- **Problem library**: 65 problems (56 single-step + 9 multi-step) across 6 categories and 5 difficulty levels
  - Categories: capture (20), connect/cut (14), escape (11), life & death (11), opening (5), endgame (4)
  - Levels: 1 (10) / 2 (32) / 3 (13) / 4 (5) / 5 (5)
- **Core features**: daily practice, level-based adventure mode, wrong book, star rewards, learning report
- **Deeper learning**: multi-step problems, spaced review scheduling, parent weekly report
- **Optional cloud sync (Supabase)**: email sign-up/sign-in, child profiles, server-side progress, localStorage → cloud import
- **UX polish**: 9×9 SVG board, Chinese coordinate labels (一–九), celebration star animation on correct answers
- **Tests**: `npm run test` — 258 passing across 17 test files
- **Build**: `npm run build` passes; `docker compose up --build` runs the app locally

Next up: **v0.6.0d — Audio feedback** (correct/wrong sounds), opt-out via Settings.

## Project Goal

Help children build foundational Go skills through 9×9 problem sets, daily practice, wrong-problem review, star rewards, and learning reports.

The first version is **not** a complete Go playing platform — it is a focused, verifiable, iteratively improvable training system for children.

## Delivered Capabilities (Highlights)

- **9×9 SVG board**: custom components, click interaction, interactive empty points, coordinate labels, celebration particles
- **Problem system**: single-step + multi-step problems (per-step hints, per-step feedback, board state transitions)
- **Practice modes**: daily practice (mixed selection by level and due reviews), level-based adventure (chapter/level map)
- **Progress**: localStorage persistence, star rewards (+1 first-correct, +5 daily completion), wrong book state machine (active → reviewing → mastered)
- **Spaced review**: outcome-based next-review scheduling (failed / correct with wrong / correct with hint / clean), capped at 30 days
- **Learning report**: lifetime stats + current-week overview (attempts, accuracy, hints used, completions, wrong-book counts, due reviews)
- **Optional cloud (Supabase)**: email auth, child profiles, server-side progress, local-to-cloud import
- **Demo route**: `/demo` never writes to learning progress — safe to try

## Explicitly Out of Scope

- Online multiplayer / real-time play
- AI opponent / AI review
- Teacher / parent admin backend
- Payments / subscriptions
- Leaderboard / social features
- 19×19 board / full-game platform
- SGF import / export
- Multi-step problems beyond 2 steps (schema supports more, not product-tested)

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Board**: custom SVG components (`src/components/board/GoBoard.tsx`)
- **State**: localStorage progress + React state
- **Tests**: Vitest + jsdom (17 files, 258 tests)
- **Optional backend**: Supabase Cloud (only enabled when env vars are configured)

## Requirements

- Recommended: Node.js 22
- Minimum: Node.js 20.19+
- Docker base image: `node:22-alpine`

## Local Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Quality checks
npm run lint
npm run typecheck
npm run test
npm run build
```

Open `http://localhost:3000`. Local anonymous mode works out of the box — no env vars required.

## Docker

```bash
# Development mode (with hot reload)
docker compose -f docker-compose.dev.yml up

# Production-like local run
docker compose up --build
```

Optional: configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` to enable cloud auth, child profiles, and progress sync. **Missing env vars never break any local feature.**

## Project Structure (Selected)

```text
src/
  app/                  Next.js App Router pages
    page.tsx            Home (stats + entry points)
    practice/           Daily practice
    levels/             Level map + chapter/level pages
    wrong-book/         Wrong book
    report/             Learning report + weekly card
    settings/           Settings (reset progress, sign out)
    login/              Sign in / sign up
    children/           Child profile management
    demo/               Demo route (does not write progress)
  components/
    board/              SVG board components
    problem/            Problem player, feedback, hints, animations
    progress/           Progress sync UI
  lib/
    problems.ts         Problem types + validation
    progress.ts         localStorage progress
    practice.ts         Daily practice session
    chapters.ts         Chapters and levels
    report.ts           Report aggregation
    weekly-report.ts    Weekly report aggregation
    spaced-review.ts    Spaced review scheduling
    multi-step-problem.ts Multi-step helpers
    supabase/           Optional cloud (auth / child profiles / server progress)
  data/
    problems.json       Local problem library (65 problems)
docs/
  PROJECT_SPEC.md       Product spec
  DEVELOPMENT_GUIDE.md  Development guide
  TASKS.md              Task queue and milestones
  QUALITY_CHECKLIST.md  Quality checklist
  RELEASE_NOTES_*.md    Per-version release notes
  NEXT_PHASE_PLAN_*.md  Next-phase plans
```

## Documentation

- [Product spec](docs/PROJECT_SPEC.md)
- [Development guide](docs/DEVELOPMENT_GUIDE.md)
- [Task queue](docs/TASKS.md)
- [Quality checklist](docs/QUALITY_CHECKLIST.md)
- [opencode task plan](docs/agents/opencode-task-plan.md)
- [Codex Review guidelines](docs/agents/codex-review-guidelines.md)
- Release notes: `docs/RELEASE_NOTES_v0.1.md` / `v0.3.0.md` / `v0.4.md` / `v0.5.md`

## Recommended Workflow

```text
Docs → opencode implements → PR → Codex Review → Human approval → Merge
```

Every PR must pass:

- `npm run lint`
- `npm run typecheck`
- `npm run test` (currently 258 tests)
- `npm run build`
- `docker compose up --build` when relevant

## Scope Discipline

- Keep PRs small and focused; do not mix infrastructure, UI, business logic, and docs in one PR.
- Keep child-facing copy short, warm, and concrete.
- Any feature outside v0.6 scope (AI, payments, teacher admin, 19×19, full-game platform, etc.) must be planned in `docs/NEXT_PHASE_PLAN_*.md` first and scheduled separately.
- Do not silently introduce large features without an agreed design doc.

## Current Definition of Done

- Children can complete daily practice in the browser; wrong answers land in the wrong book
- Board clicks work reliably; correct/wrong feedback is accurate
- Multi-step problems advance step by step with per-step hints
- Wrong-book states (active / reviewing / mastered) transition correctly
- Weekly report shows attempts, accuracy, hints, completions, wrong-book count, and due reviews
- localStorage progress survives page refresh; can be reset from Settings
- Email sign-in, child profiles, and server progress sync are opt-in; missing env vars do not break anything
- README and project docs are kept in sync with each release
- No blocking issues found by Codex Review
