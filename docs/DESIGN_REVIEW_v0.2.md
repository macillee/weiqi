# v0.2 Design Review Findings

> Project: 小棋童围棋闯关  
> Date: 2026-05-18  
> Reviewer: opencode  
> Status: reviewed with findings

---

# 1. Overall Verdict

The v0.2 design is **sound and well-scoped**. The schema, migration strategy, and QA checklist are comprehensive. However, **one critical gap** and **several medium-severity issues** must be resolved before implementation begins.

---

# 2. Schema Review

## 2.1 profiles ✅

- Clean design: `id` references `auth.users(id)` on delete cascade.
- Only stores parent-level display info. Correct boundary.

## 2.2 child_profiles ✅

- Supports multiple children (schema-ready, UI can start with one).
- Privacy-light: nickname, optional age_range, optional go_experience.
- Index on `parent_user_id` is correct.

**Suggestion (low):** Consider adding `is_active boolean default true` for soft deactivation instead of delete, in case a parent wants to "pause" a child profile without losing data.

## 2.3 problem_attempts ✅

- Good constraints: coordinate range (0–8), non-negative time.
- Indexes on `(child_profile_id, created_at desc)` and `(child_profile_id, problem_id)` cover common queries.
- `problem_id` as text referencing JSON IDs is the right choice for v0.2 — avoids premature content migration.

## 2.4 wrong_problems ✅

- Composite PK `(child_profile_id, problem_id)` is correct.
- Status check constraint matches v0.1 local behavior.
- Non-negative count constraints are good.

## 2.5 progress_summary ✅

- `child_profile_id` as PK (one summary per child) is correct.
- Denormalized for fast UI display, with attempts as audit trail. Good design.
- `text[]` arrays for completed/mastered IDs work for v0.2 scale.

**Schema verdict: PASS** with one low-severity suggestion.

---

# 3. RLS Policy Review

## 3.1 profiles ✅

- Select/insert/update all scoped to `auth.uid() = id`. Correct.

## 3.2 child_profiles ✅

- Select/insert/update/delete all scoped to `auth.uid() = parent_user_id`. Correct.

## 3.3 problem_attempts ⚠️ MEDIUM

Current design shows only SELECT and INSERT policies. This is correct for attempts (append-only audit trail). **No update needed.**

## 3.4 wrong_problems 🔴 CRITICAL GAP

Current design says "Repeat equivalent policies for wrong_problems" but only shows SELECT and INSERT examples.

**wrong_problems REQUIRES an UPDATE policy** because the status transitions (active → reviewing → mastered) and count increments all require UPDATE.

Missing policy:

```sql
create policy "wrong_problems_update_own_child"
  on public.wrong_problems for update
  using (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );
```

## 3.5 progress_summary 🔴 CRITICAL GAP

Same issue. progress_summary REQUIRES an UPDATE policy for stars, streak_days, completed_problem_ids, etc.

Missing policy:

```sql
create policy "progress_summary_update_own_child"
  on public.progress_summary for update
  using (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );
```

## 3.6 RLS verdict: FAIL until UPDATE policies are added

The design must explicitly include UPDATE policies for `wrong_problems` and `progress_summary` before implementation.

---

# 4. localStorage Import Review

## 4.1 Import trigger ✅

- Requires sign-in + child profile + local progress detection + explicit confirmation. Correct.
- Does not auto-upload. Correct.

## 4.2 Import marker ✅

- `children-go-app:v0.2:local-progress-imported` with childProfileId. Correct.
- Does not delete v0.1 progress. Correct.

## 4.3 Idempotency ✅

- Source hash for attempts: `problemId|selectedX|selectedY|isCorrect|usedHint|createdAt`.
- Partial unique index on `(child_profile_id, imported_source_hash)`. Correct.
- Upsert for wrong_problems by composite PK. Correct.

## 4.4 Conflict strategy ✅

- Conservative merge: active > reviewing > mastered. Correct.
- Stars: max(server, local). Correct.
- Completed/mastered IDs: union. Correct.

## 4.5 Import verdict: PASS

The migration design is thorough and safe.

---

# 5. Login Optional Review ✅

The design explicitly supports:

```text
Not signed in → continue local-first mode
Signed in → server-backed progress
```

- No forced account creation at launch.
- Local mode remains fully functional.
- Auth entry is subtle on home/settings.

**Verdict: PASS** — login is optional in v0.2.

---

# 6. JSON as Problem Source Review ✅

The design keeps `problems.json` as the source of truth:

- `problem_id` in `problem_attempts` references JSON IDs, not a database table.
- No database problem table in v0.2.
- Content migration deferred.

**Verdict: PASS** — JSON remains the problem source.

---

# 7. QA Checklist Review

## 7.1 Coverage ✅

18 sections covering: scope, environment, schema, RLS, auth, child profile, local mode regression, server practice, wrong book, report, import, import conflict, import failure, privacy, UI/mobile, regression, release decision, completion criteria.

## 7.2 Suggested additions (low)

- **Network failure during practice**: What happens if connection drops mid-session? Should the app queue attempts locally and retry?
- **Concurrent device test**: Two devices with same account/child profile making attempts simultaneously.
- **Session expiry**: What happens when Supabase session expires during practice?

## 7.3 QA verdict: PASS with minor suggestions

---

# 8. First Implementation Task Scope

The design proposes Phase 1 as:

```text
Phase 1 — Supabase Foundation
- Add Supabase dependencies
- Add env var docs
- Add client setup
- Add auth routes
- Add basic session state
```

This is appropriately narrow. However, it should be further split:

**Recommended first task (even narrower):**

```text
v0.2.1a — Supabase Setup + Environment
- Add @supabase/supabase-js dependency
- Add .env.example with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Create src/lib/supabase/client.ts with typed client
- No auth UI yet, no routes yet
- Verify: npm run build passes, no Supabase errors in local mode
```

Then Phase 1b would add auth routes and UI.

---

# 9. Summary of Required Changes Before Implementation

| # | Doc | Severity | Issue | Action |
|---|-----|----------|-------|--------|
| 1 | SUPABASE_DESIGN | 🔴 Critical | Missing UPDATE policy for wrong_problems | Add explicit UPDATE policy |
| 2 | SUPABASE_DESIGN | 🔴 Critical | Missing UPDATE policy for progress_summary | Add explicit UPDATE policy |
| 3 | SUPABASE_DESIGN | 🟡 Medium | No note about session expiry handling | Add note to client data layer |
| 4 | SUPABASE_DESIGN | 🟢 Low | child_profiles soft deactivation | Consider is_active column |
| 5 | QA_CHECKLIST | 🟢 Low | Network failure during practice | Add test case |
| 6 | QA_CHECKLIST | 🟢 Low | Concurrent device test | Add test case |
| 7 | TASKS.md | 🟡 Medium | First task too broad | Split Phase 1 into 1a + 1b |

---

# 10. Conclusion

The v0.2 design is **well-structured and appropriately scoped**. The critical RLS UPDATE policy gaps must be fixed before implementation. Once fixed, the first implementation task should be split into an even narrower setup-only phase.

[ ] Approved after critical fixes  
[ ] Not approved — see notes
