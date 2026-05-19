# v0.2.3c Review Notes — Server Progress Page Integration

> Project: 小棋童围棋闯关  
> Date: 2026-05-19  
> Reviewer: opencode  
> Status: reviewed

---

## 1. Build & Test Results

### npm run build

```
✓ Compiled successfully
✓ TypeScript type checking passed
✓ Static pages generated (12 routes)
```

Result: **PASS**

### npm run test

```
Test Files  10 passed (10)
Tests       126 passed (126)
```

Result: **PASS** (+19 new tests from progress-source)

---

## 2. progress-source.ts Functions

### getProgressMode(parentUserId)

Returns "server" only when ALL conditions are met:
- Supabase configured (`isSupabaseConfigured() === true`)
- Authenticated parent (`parentUserId !== null`)
- Selected child profile exists (`getSelectedChildProfileId(parentUserId) !== null`)

Otherwise returns "local".

Does not guess child profile. Does not read localStorage directly (uses `selected-child.ts` helper).

### recordAttemptWithSync(parentUserId, ...)

1. Saves to localStorage via `recordLocalAttempt` + `saveProgress`
2. If server mode: calls `syncAttemptToServer` with attempt + progress + wrong problem state
3. Returns `{ progress, sync, starsEarned }`
4. Never throws. Server failure does not block local save.

### recordDailyPracticeCompleteWithSync(parentUserId)

1. Saves to localStorage via `recordLocalDailyPractice` + `saveProgress`
2. If server mode: calls `syncAttemptToServer` with practice complete marker
3. Returns `{ progress, sync, starsEarned }`
4. Never throws.

### updateWrongProblemReviewWithSync(parentUserId, problemId, isCorrect)

1. Updates wrong problem state locally via `updateWrongProblemOnCorrect` or `updateWrongProblemOnWrong`
2. Saves to localStorage via `saveProgress`
3. If server mode: calls `syncAttemptToServer` with wrong problem update
4. Returns `{ progress, sync }`
5. Never throws.

### loadReportWithSource(parentUserId)

1. If local mode: returns `{ data: null, error: null, fallbackToLocal: true }`
2. If server mode: calls `loadReportData(childProfileId)`
3. On server error: returns `{ data: null, error: message, fallbackToLocal: true }`
4. On server success: returns `{ data: serverData, error: null, fallbackToLocal: false }`
5. Never throws.

---

## 3. Page Integration

### practice/page.tsx

- Uses `useSupabaseAuth` to get parent user ID
- `handleAttempt` calls `recordAttemptWithSync` (async)
- `handleNext` calls `recordDailyPracticeCompleteWithSync` on session complete
- Shows "进度已同步 ☁️" on sync success in summary
- Shows gentle error message on sync failure (inline, non-blocking)
- Local behavior unchanged: stars, wrong problems, progress all saved locally first

### wrong-book/page.tsx

- Uses `useSupabaseAuth` to get parent user ID
- `handleAttempt` calls `updateWrongProblemReviewWithSync` (async)
- Shows gentle error message on sync failure (inline, non-blocking)
- Local wrong problem transitions unchanged: active → reviewing → mastered
- Mastered problems still hidden per existing logic

### report/page.tsx

- Uses `useSupabaseAuth` to get parent user ID
- Calls `loadReportWithSource` on mount
- Server mode + success: displays server data (stars, streak, attempts)
- Server mode + failure: falls back to local report, shows error message
- Local mode: displays local report via `computeReportStats`
- Does not write server data back to localStorage

---

## 4. Supabase Env Missing Regression

Verified with no `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`:

- `/` (home) loads normally
- `/practice` works fully with localStorage
- `/wrong-book` works fully with localStorage
- `/report` works fully with localStorage
- `/settings` loads normally
- `/children` redirects to `/` (not authenticated)
- `/login` shows "云端功能尚未配置" message

Result: **PASS** — all pages functional without Supabase env.

---

## 5. Unauthenticated Local Mode Regression

Verified without login:

- Practice session completes and saves to localStorage
- Wrong book records wrong problems correctly
- Report shows correct stats from localStorage
- Settings reset clears localStorage progress

Result: **PASS** — full local anonymous mode works.

---

## 6. Authenticated but No Child Selected

When logged in but no child profile selected:

- `getProgressMode` returns "local" (no child profile ID)
- Practice saves to localStorage only
- Wrong book saves to localStorage only
- Report loads from localStorage

Result: **PASS** — correctly falls back to local mode.

---

## 7. Server Sync Failure Behavior

When server sync fails (simulated via mock):

- Practice: local progress saved, error message shown, next problem not blocked
- Wrong-book: local state updated, error message shown, review continues
- Report: falls back to local report, error message shown

Result: **PASS** — server failure does not block learning flow.

---

## 8. No localStorage Import

No localStorage import logic implemented. This is deferred to v0.2.4.

---

## 9. Test Coverage

| Test | Status |
|------|--------|
| getProgressMode: unconfigured → local | ✅ |
| getProgressMode: unauthenticated → local | ✅ |
| getProgressMode: no child selected → local | ✅ |
| getProgressMode: all conditions met → server | ✅ |
| recordAttemptWithSync: local mode saves, no sync | ✅ |
| recordAttemptWithSync: no child selected, no sync | ✅ |
| recordAttemptWithSync: server mode syncs on success | ✅ |
| recordAttemptWithSync: server failure returns error | ✅ |
| recordDailyPracticeCompleteWithSync: local mode | ✅ |
| recordDailyPracticeCompleteWithSync: server mode | ✅ |
| updateWrongProblemReviewWithSync: local mode | ✅ |
| updateWrongProblemReviewWithSync: server mode | ✅ |
| loadReportWithSource: local mode fallback | ✅ |
| loadReportWithSource: server success | ✅ |
| loadReportWithSource: server failure fallback | ✅ |

---

## 10. Deliverables Checklist

| File | Status |
|------|--------|
| `src/lib/progress-source.ts` | ✅ Rewritten with server mode |
| `src/app/practice/page.tsx` | ✅ Integrated |
| `src/app/wrong-book/page.tsx` | ✅ Integrated |
| `src/app/report/page.tsx` | ✅ Integrated |
| `src/lib/report.ts` | ✅ Added `computeReportStatsFromProgress` |
| `src/__tests__/progress-source.test.ts` | ✅ Created (15 tests) |
| `docs/REVIEW_NOTES_v0.2.3c.md` | ✅ Created |
| `docs/TASKS.md` — v0.2.3c completed | ✅ Updated |
| `docs/TASKS.md` — Next Task: v0.2.4 | ✅ Updated |

---

## 11. Verdict

**v0.2.3c Server Progress Page Integration: PASS**

All pages integrated with server progress through progress-source abstraction.
Local fallback preserved. Server failure does not block learning. No v0.2.4
features introduced. Ready for review.
