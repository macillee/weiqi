# v0.2.3a Review Notes — Server Progress Schema

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
Test Files  8 passed (8)
Tests       97 passed (97)
```

Result: **PASS**

---

## 2. Schema Review

### 2.1 profiles

| Check | Status |
|-------|--------|
| `id uuid primary key references auth.users(id) on delete cascade` | ✅ Matches design §7.1 |
| `display_name text` | ✅ Matches design |
| `created_at`, `updated_at` | ✅ Matches design |
| RLS SELECT/INSERT/UPDATE scoped to `auth.uid() = id` | ✅ Matches design §8.1 |

### 2.2 problem_attempts

| Check | Status |
|-------|--------|
| `child_profile_id uuid not null references child_profiles(id) on delete cascade` | ✅ Matches design §7.3 |
| `problem_id text not null` | ✅ Matches design |
| `selected_x`, `selected_y` range checks (0–8) | ✅ Matches design |
| `time_spent_seconds >= 0` check | ✅ Matches design |
| `imported_from`, `imported_source_key`, `imported_source_hash` | ✅ Matches design §7.3 |
| `problem_attempts_import_hash_unique` partial unique index | ✅ Matches design |
| Index on `(child_profile_id, created_at desc)` | ✅ Matches design |
| Index on `(child_profile_id, problem_id)` | ✅ Matches design |
| RLS SELECT/INSERT via child ownership check | ✅ Matches design §8.3 |
| No UPDATE policy (append-only) | ✅ Matches design §8.6 |

### 2.3 wrong_problems

| Check | Status |
|-------|--------|
| Composite PK `(child_profile_id, problem_id)` | ✅ Matches design §7.4 |
| `status` check constraint (`active`, `reviewing`, `mastered`) | ✅ Matches design |
| `wrong_count >= 0`, `correct_review_count >= 0` | ✅ Matches design |
| Index on `(child_profile_id, status)` | ✅ Matches design |
| RLS SELECT/INSERT via child ownership check | ✅ Matches design §8.3 |
| RLS UPDATE with `using` + `with check` | ✅ Matches design §8.4 |

### 2.4 progress_summary

| Check | Status |
|-------|--------|
| `child_profile_id uuid primary key references child_profiles(id) on delete cascade` | ✅ Matches design §7.5 |
| `stars >= 0`, `streak_days >= 0` | ✅ Matches design |
| `text[]` arrays for completed/mastered/achievements | ✅ Matches design |
| RLS SELECT/INSERT via child ownership check | ✅ Matches design §8.3 |
| RLS UPDATE with `using` + `with check` | ✅ Matches design §8.5 |

### 2.5 updated_at triggers

| Check | Status |
|-------|--------|
| `set_updated_at()` function | ✅ Matches design §7.6 |
| Trigger on `profiles` | ✅ Matches design |
| Trigger on `wrong_problems` | ✅ Matches design |
| Trigger on `progress_summary` | ✅ Matches design |
| No trigger on `problem_attempts` (append-only, no update) | ✅ Correct |
| No trigger on `child_profiles` (already in Migration 001) | ✅ Correct |

---

## 3. RLS Policy Review

### 3.1 Ownership pattern

All child-owned tables use the same pattern:

```sql
exists (
  select 1 from public.child_profiles cp
  where cp.id = child_profile_id
    and cp.parent_user_id = auth.uid()
)
```

This ensures that only the parent who owns the child profile can access
the child's progress data. ✅

### 3.2 UPDATE policies with `with check`

Both `wrong_problems` and `progress_summary` UPDATE policies include
`with check` in addition to `using`. This prevents a user from
reassigning a row to another parent's child profile during an update. ✅

### 3.3 problem_attempts append-only

No UPDATE policy exists for `problem_attempts`. Corrections are made
by inserting new rows. This is the correct audit-trail design. ✅

### 3.4 No DELETE policies for progress tables

`problem_attempts`, `wrong_problems`, and `progress_summary` do not
have DELETE policies. Data is managed through cascade deletes from
`child_profiles` (on delete cascade). This is correct for v0.2. ✅

---

## 4. Consistency with SUPABASE_DESIGN_v0.2.md

| Design Section | Schema Matches |
|----------------|----------------|
| §7.1 profiles | ✅ |
| §7.2 child_profiles | ✅ (in Migration 001) |
| §7.3 problem_attempts | ✅ |
| §7.4 wrong_problems | ✅ |
| §7.5 progress_summary | ✅ |
| §7.6 updated_at triggers | ✅ |
| §8.1 profiles policies | ✅ |
| §8.2 child_profiles policies | ✅ (in Migration 001) |
| §8.3 child-owned progress policies | ✅ |
| §8.4 wrong_problems UPDATE | ✅ |
| §8.5 progress_summary UPDATE | ✅ |
| §8.6 problem_attempts append-only | ✅ |

---

## 5. No Business Page Changes

Verified that no business pages were modified:

- `src/app/practice/page.tsx` — unchanged
- `src/app/wrong-book/page.tsx` — unchanged
- `src/app/report/page.tsx` — unchanged

No new TypeScript files created:

- No `src/lib/supabase/server-progress.ts`
- No server mode in `src/lib/progress-source.ts`

---

## 6. Deliverables Checklist

| File | Status |
|------|--------|
| `docs/migrations/002_server_progress.sql` | ✅ Created |
| `docs/TASKS.md` — v0.2.2 completed | ✅ Updated |
| `docs/TASKS.md` — Next Task: v0.2.3a | ✅ Updated |
| `docs/TASKS.md` — v0.2.3 in Future Roadmap | ✅ Present |
| `docs/REVIEW_NOTES_v0.2.3a.md` | ✅ Created |

---

## 7. Verdict

**v0.2.3a Server Progress Schema: PASS**

SQL schema matches `SUPABASE_DESIGN_v0.2.md` exactly. RLS policies are
complete and correct. Build and tests pass. No business page changes.
Ready for review.
