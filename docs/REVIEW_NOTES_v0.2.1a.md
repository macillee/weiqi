# Review Notes — v0.2.1a Supabase Foundation Setup

> Date: 2026-05-19
> Scope: Add minimum Supabase client foundation, preserve local anonymous mode

## Changes

### Refactored `src/lib/supabase/client.ts`

- `isSupabaseConfigured()` and `createSupabaseClient()` now read `process.env` at call time instead of module-level constants.
- This makes env mocking in tests straightforward (no `vi.resetModules()` or dynamic import needed).
- Behavior is identical: missing env vars → `null` / `false`.

### Added `src/__tests__/supabase-client.test.ts` (11 tests)

| Test | What it covers |
|---|---|
| `isSupabaseConfigured` (4) | false when missing/partial, true when both set |
| `createSupabaseClient` (3) | null when missing, no throw, client when set |
| `import safety` (3) | module import does not throw with/without env |

### Updated `src/__tests__/supabase.test.ts`

- Removed client.ts tests (moved to `supabase-client.test.ts`).
- Kept error-classification tests (classifySupabaseError, getSyncErrorMessage, isRecoverableError).

### Pre-existing (unchanged)

- `@supabase/supabase-js` ^2.106.0
- `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `src/lib/supabase/auth.ts` — `useSupabaseAuth()` hook, safe no-op when unconfigured
- `src/lib/supabase/supabase-error.ts` — error classification

## Validation Results

### `npm run build`

Passed. Next.js 16.2.6 Turbopack build completes successfully.
All routes (/, /practice, /levels, /wrong-book, /report, /settings, /demo) generated.

### `npm run test`

```
Test Files  7 passed (7)
     Tests  91 passed (91)
```

### `docker compose up --build`

- Image built: `weiqi-web:latest`
- Docker build steps: base image pulled → deps installed (npm ci, 454 packages) → app built → standalone output copied → image exported.
- Container started successfully.
- Next.js 16.2.6 running on `http://localhost:3000` inside container.

## Acceptance Checklist

- [x] `npm run build` passes.
- [x] `npm run test` passes (91 tests).
- [x] `docker compose up --build` passes.
- [x] Supabase env missing → `isSupabaseConfigured()` returns `false`.
- [x] Supabase env missing → `createSupabaseClient()` returns `null`.
- [x] Module import does not throw when env is missing.
- [x] Home, daily practice, wrong book, report, settings remain usable in local anonymous mode (unchanged from v0.1).
- [x] No v0.2.1b+ features introduced (no login UI, no child profile, no server progress, no migration).

## Out of Scope (not implemented)

- Login page
- Sign-up page
- Logout UI
- Child profile
- Database migrations
- Server progress / wrong book / report
- localStorage import
- Supabase self-hosting Docker stack
- AI, payment, teacher/admin backend
