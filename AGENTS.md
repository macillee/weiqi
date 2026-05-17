<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Agent Instructions

This repository is the source of truth for the children Go learning web app project.

Agents must read these files before making changes:

1. `docs/PROJECT_SPEC.md` — product scope, MVP boundaries, learning system, data model, and acceptance criteria.
2. `docs/DEVELOPMENT_GUIDE.md` — local development, Docker workflow, branching, coding conventions, and implementation rules.
3. `docs/TASKS.md` — current milestone queue and allowed task scope.
4. `docs/QUALITY_CHECKLIST.md` — review and validation checklist before opening or updating a PR.
5. `docs/agents/opencode-task-plan.md` — opencode milestone breakdown.
6. `docs/agents/codex-review-guidelines.md` — Codex Review expectations.

## Non-negotiable v0.1 Scope

v0.1 is a local-first MVP for a children Go problem-solving web app.

Allowed in v0.1:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- SVG Go board
- Local JSON problem data
- localStorage progress state
- Docker-based local development and local production runtime

Do not implement in v0.1 unless explicitly approved in documentation:

- User login
- Database
- Supabase integration
- Payment
- AI opponent
- AI review
- Online multiplayer
- Teacher/admin backend
- Social features
- 19x19 full-game platform

## Development Rules

- Keep PRs small and milestone-focused.
- Do not mix infrastructure, UI, business logic, and documentation changes in one large PR unless the task explicitly requires it.
- Preserve existing docs and update them when implementation decisions change.
- Prefer simple, typed, testable code over premature abstraction.
- Keep child-facing copy short, warm, and concrete.
- Run local validation before handing off work:
  - `npm run build`
  - `docker compose up --build`
  - any available lint/typecheck/test scripts

## Product Rule

This is not a general Go platform. It is a focused training app for children who have learned Go for about one year. Every feature should support short, effective, child-friendly practice sessions.
