# v0.2.3b Review Notes — Server Progress Library

> Project: 小棋童围棋闯关  
> Date: 2026-05-19  
> Reviewer: opencode  
> Status: reviewed (fixes applied)

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
Test Files  9 passed (9)
Tests       111 passed (111)
```

Result: **PASS** (14 tests total for server-progress, +4 from review fixes)

---

## 2. server-progress.ts Function Scope

### loadServerProgress(childProfileId)

- Reads `progress_summary` and `wrong_problems` from Supabase.
- Maps snake_case columns to camelCase for frontend consumption.
- Handles PGRST116 (no row found) gracefully — returns zeroed defaults.
- Returns `{ data: null, error }` when Supabase is not configured.
- Never throws.

### syncAttemptToServer(childProfileId, attempt, progressUpdate, wrongProblemUpdate)

- Inserts into `problem_attempts` (append-only).
- Upserts `progress_summary` on `child_profile_id`.
- Optionally upserts `wrong_problems` on `(child_profile_id, problem_id)`.
- Returns `{ synced: true }` only if all writes succeed.
- Returns structured error with recoverability flag on failure.
- Never throws.

### loadReportData(childProfileId)

- Reads `progress_summary`, `problem_attempts` (latest 100), and `wrong_problems`.
- Maps snake_case columns to camelCase.
- Returns `{ data: null, error }` when Supabase is not configured.
- Never throws.

---

## 3. Error Handling

All three functions:

- Check for `null` client (Supabase not configured) and return `not_configured` error.
- Use `classifySupabaseError` from existing `supabase-error.ts`.
- Catch all exceptions and return structured `SupabaseError`.
- Never throw to the caller.

---

## 4. No Business Page Changes

Verified that no business pages were modified:

- `src/app/practice/page.tsx` — unchanged
- `src/app/wrong-book/page.tsx` — unchanged
- `src/app/report/page.tsx` — unchanged
- `src/app/page.tsx` — unchanged
- `src/app/settings/page.tsx` — unchanged

No changes to `src/lib/progress-source.ts` — remains local-only stub.

---

## 5. No localStorage Import

No localStorage import logic implemented. This is deferred to v0.2.4.

---

## 6. No v0.2.3c Page Integration

The server progress library functions are not connected to any UI.
They exist as standalone library functions ready for v0.2.3c page integration.

---

## 7. Test Coverage

### Original tests (10)

| Test | Status |
|------|--------|
| loadServerProgress returns error when client is null | ✅ |
| syncAttemptToServer returns error when client is null | ✅ |
| loadReportData returns error when client is null | ✅ |
| loadServerProgress returns classified error on failure | ✅ |
| syncAttemptToServer returns error on insert failure | ✅ |
| loadReportData returns classified error on failure | ✅ |
| loadServerProgress maps progress_summary snake_case to camelCase | ✅ |
| loadServerProgress maps wrong_problems snake_case | ✅ |
| loadReportData maps problem_attempts snake_case to camelCase | ✅ |
| loadServerProgress handles PGRST116 (no row) | ✅ |

### Review fix tests (+4)

| Test | Status |
|------|--------|
| syncAttemptToServer success path (no wrongProblemUpdate) | ✅ |
| syncAttemptToServer success path (with wrongProblemUpdate, 2 upserts) | ✅ |
| syncAttemptToServer returns synced false on summary upsert failure | ✅ |
| loadServerProgress maps wrong_problems with independent mock data | ✅ |

Note: Tests use mocked Supabase client. Real Supabase integration
tests require a live Supabase instance and are deferred to v0.2.3c
page integration phase.

---

## 8. TASKS.md Fixes Applied

- v0.2.3c Next Task Goal corrected from "Library only" to "Integrate server progress library into practice, wrong-book, and report through progress-source while preserving local fallback."
- v0.2.3c Scope updated to allow page modifications (practice, wrong-book, report) and progress-source server mode detection.
- v0.2.3c Out of Scope updated to prohibit localStorage import, AI, payment, teacher/admin backend, Supabase self-hosting, and v0.2.4 features.

---

## 9. Deliverables Checklist

| File | Status |
|------|--------|
| `src/lib/supabase/server-progress.ts` | ✅ Created |
| `src/__tests__/server-progress.test.ts` | ✅ Created (14 tests) |
| `docs/REVIEW_NOTES_v0.2.3b.md` | ✅ Updated |
| `docs/TASKS.md` — v0.2.3b completed | ✅ Updated |
| `docs/TASKS.md` — Next Task: v0.2.3c | ✅ Updated (corrected Goal/Scope) |

---

## 10. Verdict

**v0.2.3b Server Progress Library: PASS (after review fixes)**

All functions implemented, tested, and documented. TASKS.md v0.2.3c
Goal and Scope corrected. No business page changes. No localStorage
import. Ready for v0.2.3c page integration.
