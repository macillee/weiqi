# Review Notes — v0.2.1b Auth UI

> Date: 2026-05-19
> Scope: Login, sign-up, logout, session display, graceful degradation

## Changes

### New files
- `src/lib/supabase/auth-actions.ts` — `signInWithEmail()`, `signUpWithEmail()`, `signOutUser()` helpers. Never throw. Return `AuthResult { success, error }`.
- `src/app/login/page.tsx` — login/sign-up page with email + password form, input validation, loading state, error display, and mode toggle.
- `src/__tests__/auth-actions.test.ts` — 6 tests for missing-env behavior.

### Modified files
- `src/app/page.tsx` — shows session email + sign-out button when authenticated, "登录 / 注册" link when not. Adds loading state and error display for sign-out.
- `src/app/settings/page.tsx` — adds account section with session status, sign-out/login buttons, loading state, and error display.
- `docs/TASKS.md` — v0.2.1b marked completed (pending review approval).

## Validation Results

### `npm run build`

Passed. Next.js 16.2.6 Turbopack build completes successfully.
All routes generated: `/`, `/login`, `/practice`, `/levels`, `/levels/[chapterId]`, `/wrong-book`, `/report`, `/settings`, `/demo`.

### `npm run test`

```
Test Files  8 passed (8)
     Tests  97 passed (97)
```

New tests: 6 auth-actions missing-env tests added.

### Supabase env missing behavior

| Page | Behavior |
|---|---|
| `/login` | Shows "云端功能尚未配置" message, explains local mode is available, "返回首页" button. No form rendered. |
| `/` (home) | No account UI shown at all. Full v0.1 local flow intact. |
| `/settings` | No account section shown. Reset progress section works normally. |
| All pages | No console errors, no crashes, no forced redirects. |

### Supabase env configured behavior (manual verification)

| Action | Result |
|---|---|
| Sign up (email + password) | Form submits, redirects to home on success. Error shown on failure. |
| Sign in (email + password) | Form submits, redirects to home on success. Error shown on failure. |
| Sign out (home page) | Clears session, UI updates to show "登录 / 注册" link. |
| Sign out (settings page) | Clears session, UI updates to show "登录 / 注册" button. |
| Refresh after login | Session restored via `useSupabaseAuth` hook. Email displayed. |
| Loading state | Sign-out button shows "退出中..." and is disabled during async call. |
| Error state | Sign-out error shown in red banner, does not block page. |

### Local anonymous mode regression

- ✅ Home page loads without Supabase env.
- ✅ Daily practice works locally.
- ✅ Wrong book works locally.
- ✅ Report works locally.
- ✅ Settings reset works locally.
- ✅ `/demo` does not pollute progress.
- ✅ localStorage progress preserved.
- ✅ No Supabase error blocks any v0.1 flow.

## Blocking Issues

None.

## Out of Scope (not implemented)

- Child profile UI
- Database migrations
- Server progress / wrong book / report
- localStorage import
- Supabase self-hosting Docker stack
- AI, payment, teacher/admin backend
- Leaderboard
- 13x13 / 19x19 expansion
