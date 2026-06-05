# Deployment

> Project: 小棋童围棋闯关

---

# 1. Deployment Models

## Local Anonymous Mode (default)

No Supabase configuration required. All features work via localStorage.

```bash
npm run dev
# or
docker compose up --build
```

## Supabase Cloud-Sync Mode (optional)

When both Supabase public env vars are present, the app enables email login, child profiles, and server-side progress sync.

```bash
# Create .env.local with Supabase vars (see .env.example)
docker compose up --build
```

Docker Compose reads `.env.local` automatically via `env_file` (if present). Missing `.env.local` preserves local anonymous mode.

---

# 2. Docker Compose

## Production

```bash
docker compose up --build
```

- `docker-compose.yml` — production build from Dockerfile, port 3000.
- `env_file: .env.local (required: false)` — reads Supabase vars when present.
- `environment`: `NODE_ENV=production`, `NEXT_TELEMETRY_DISABLED=1`.
- No Supabase public vars in `environment` section (avoids empty-string override of `env_file` values).

## Development

```bash
docker compose -f docker-compose.dev.yml up
```

- `docker-compose.dev.yml` — dev server with hot reload via volume mount.
- Same `env_file` and `environment` pattern as production.

## Env Behavior

| Scenario | Behavior |
|---|---|
| No `.env.local` | App starts in local anonymous mode |
| `.env.local` with both Supabase vars | Docker Compose reads vars via `env_file`; app enters cloud-sync mode |
| Missing one of two vars | App treats Supabase as unconfigured; local anonymous mode |

---

# 3. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- Both are optional. Missing vars do not crash the app.
- Both are public browser-exposed keys (`NEXT_PUBLIC_` prefix).
- Service-role key must never be used in client-side code or Docker public environment.
- Do not commit real Supabase keys or `.env.local`.

---

# 4. Cloud-Failure Tolerance

The app remains usable when Supabase Cloud is unavailable:

- Docker container starts without Supabase env.
- Home page, daily practice, wrong book, report, and settings work in local mode.
- Server call failure shows a clear error; local page state is preserved.
- Progress is never claimed synced unless the server write succeeded.

---

# 5. Validation Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
docker compose build          # CI Docker build verification
docker compose up --build     # optional local runtime smoke
```

---

# 6. Current Baseline

- **Problems**: 77 (68 single-step + 9 multi-step), all wired into chapters.
- **Categories**: capture, escape, connect_cut, life_death, opening, endgame.
- **Optional Supabase**: auth, child profiles, server progress, local import.
- **Daily practice**: v0.10 skill filtering (category balance, level clamp, spaced review priority, multi-step eligibility).
- **CI gates**: lint → typecheck → unit tests → build → E2E → Docker build.

---

# 7. Out of Scope

- Supabase self-hosting.
- Docker service start or E2E-against-Docker in CI.
- Visual regression or performance benchmarks.
- AI, payment, teacher/admin, leaderboard, board-size expansion, SGF, multiplayer.
