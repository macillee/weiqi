# Supabase Design — v0.2

> Project: 小棋童围棋闯关  
> Version target: v0.2.0  
> Status: design only  
> Do not implement until this document, `docs/DATA_MIGRATION_v0.2.md`, and `docs/QA_CHECKLIST_v0.2.md` are reviewed.

---

# 1. Goal

v0.2 adds account-backed progress sync while preserving the v0.1 local learning loop.

Primary product goal:

```text
Parent account → child profile → synced learning progress
```

v0.2 should not become a general Go platform. It should only add the minimum infrastructure required for account, child profile, progress persistence, and localStorage import.

---

# 2. Non-Goals

Do not implement in v0.2 unless separately approved:

- AI review;
- AI opponent;
- online Go games;
- teacher/admin backend;
- payment;
- leaderboard;
- social features;
- real-time multiplayer;
- 13x13 / 19x19 problem sets;
- SGF editor;
- full Go rules engine;
- large content generation.

---

# 3. Recommended Architecture

```text
Next.js App Router
  ├── Local anonymous mode
  │     └── localStorage progress, current v0.1 behavior
  └── Signed-in mode
        ├── Supabase Auth
        ├── child_profiles
        ├── problem_attempts
        ├── wrong_problems
        └── progress_summary
```

v0.2 should support a transition period:

```text
Not signed in → continue local-first mode
Signed in → server-backed progress
Existing local progress → optional import
```

Do not force account creation at app launch in the first v0.2 implementation.

---

# 4. Environment Variables

Expected environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Rules:

- Only public Supabase anon key should be used in browser code.
- Never commit service role keys.
- Never expose database admin credentials in client code.
- Server-only secrets, if introduced later, must not be prefixed with `NEXT_PUBLIC_`.

---

# 5. Auth Model

Use Supabase Auth for parent accounts.

Minimum v0.2 auth behaviors:

- sign up;
- sign in;
- sign out;
- restore session after refresh;
- show signed-in parent state;
- allow continuing without account if not signed in.

Recommended login methods for first implementation:

```text
email + password
```

Magic link / OAuth can be deferred.

---

# 6. User and Child Profile Model

Recommended ownership model:

```text
auth.users.id
  └── profiles.id
        └── child_profiles.parent_user_id
              ├── problem_attempts.child_profile_id
              ├── wrong_problems.child_profile_id
              └── progress_summary.child_profile_id
```

A parent may eventually manage multiple child profiles. v0.2 UI may start with one child, but schema should support many.

---

# 7. Tables

## 7.1 profiles

Stores parent account profile.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Notes:

- `id` is the Supabase Auth user id.
- This table stores parent-level display information only.
- Do not store child learning data here.

---

## 7.2 child_profiles

Stores child learner profile.

```sql
create table public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  age_range text,
  go_experience text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index child_profiles_parent_user_id_idx
  on public.child_profiles(parent_user_id);
```

Privacy rules:

- Use nickname, not real name.
- Age range is optional.
- Go experience is optional.

Allowed `age_range` examples:

```text
6-8
9-10
11-12
```

Allowed `go_experience` examples:

```text
new
about_6_months
about_1_year
more_than_1_year
```

---

## 7.3 problem_attempts

Stores every attempt.

```sql
create table public.problem_attempts (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  problem_id text not null,
  selected_x int not null,
  selected_y int not null,
  is_correct boolean not null,
  used_hint boolean not null default false,
  time_spent_seconds int not null default 0,
  created_at timestamptz not null default now(),
  imported_from text,
  imported_source_key text,
  imported_source_hash text,
  constraint problem_attempts_selected_x_range check (selected_x >= 0 and selected_x <= 8),
  constraint problem_attempts_selected_y_range check (selected_y >= 0 and selected_y <= 8),
  constraint problem_attempts_time_nonnegative check (time_spent_seconds >= 0)
);

create index problem_attempts_child_profile_id_created_at_idx
  on public.problem_attempts(child_profile_id, created_at desc);

create index problem_attempts_child_profile_id_problem_id_idx
  on public.problem_attempts(child_profile_id, problem_id);

create unique index problem_attempts_import_hash_unique
  on public.problem_attempts(child_profile_id, imported_source_hash)
  where imported_source_hash is not null;
```

Notes:

- `problem_id` references local JSON problem IDs, not a database problem table in v0.2.
- This avoids migrating the content system too early.
- If later we move problems into database, a separate content migration can be designed.
- `imported_from`, `imported_source_key`, `imported_source_hash` support
  idempotent localStorage import (see `docs/DATA_MIGRATION_v0.2.md`).
- `problem_attempts_import_hash_unique` prevents duplicate import of the
  same attempt when the import is retried.

---

## 7.4 wrong_problems

Stores wrong book state.

```sql
create table public.wrong_problems (
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  problem_id text not null,
  wrong_count int not null default 0,
  correct_review_count int not null default 0,
  status text not null default 'active',
  last_wrong_at timestamptz,
  last_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (child_profile_id, problem_id),
  constraint wrong_problems_status_check check (status in ('active', 'reviewing', 'mastered')),
  constraint wrong_count_nonnegative check (wrong_count >= 0),
  constraint correct_review_count_nonnegative check (correct_review_count >= 0)
);

create index wrong_problems_child_status_idx
  on public.wrong_problems(child_profile_id, status);
```

State rules must match v0.1 local behavior:

```text
wrong → active, correctReviewCount = 0
active correct review → reviewing, correctReviewCount = 1
reviewing correct review → mastered, correctReviewCount = 2
reviewing/mastered wrong again → active, correctReviewCount = 0
```

---

## 7.5 progress_summary

Stores aggregate display state.

```sql
create table public.progress_summary (
  child_profile_id uuid primary key references public.child_profiles(id) on delete cascade,
  stars int not null default 0,
  streak_days int not null default 0,
  last_practice_date date,
  completed_problem_ids text[] not null default '{}',
  mastered_problem_ids text[] not null default '{}',
  achievements text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stars_nonnegative check (stars >= 0),
  constraint streak_days_nonnegative check (streak_days >= 0)
);
```

Notes:

- This table is denormalized for fast UI display.
- Attempts remain the audit trail.
- `completed_problem_ids` keeps v0.1 semantics: problems first correctly completed.
- Daily reward dedupe uses `last_practice_date`.

---

# 7.6 updated_at Strategy

All tables with `updated_at` should keep it current automatically.

Recommended approach: database trigger.

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger child_profiles_updated_at
  before update on public.child_profiles
  for each row execute function public.set_updated_at();

create trigger wrong_problems_updated_at
  before update on public.wrong_problems
  for each row execute function public.set_updated_at();

create trigger progress_summary_updated_at
  before update on public.progress_summary
  for each row execute function public.set_updated_at();
```

This ensures `updated_at` is always current regardless of whether the
application layer writes it. The application layer may still include
`updated_at` in UPDATE statements for clarity, but the trigger is the
source of truth.

Alternative: if triggers are not desired, the application layer MUST
write `updated_at = now()` on every UPDATE. This is more error-prone
and not recommended.

---

# 8. RLS Policies

Enable RLS on all public tables:

```sql
alter table public.profiles enable row level security;
alter table public.child_profiles enable row level security;
alter table public.problem_attempts enable row level security;
alter table public.wrong_problems enable row level security;
alter table public.progress_summary enable row level security;
```

## 8.1 profiles policies

```sql
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

## 8.2 child_profiles policies

```sql
create policy "child_profiles_select_own"
  on public.child_profiles for select
  using (auth.uid() = parent_user_id);

create policy "child_profiles_insert_own"
  on public.child_profiles for insert
  with check (auth.uid() = parent_user_id);

create policy "child_profiles_update_own"
  on public.child_profiles for update
  using (auth.uid() = parent_user_id)
  with check (auth.uid() = parent_user_id);

create policy "child_profiles_delete_own"
  on public.child_profiles for delete
  using (auth.uid() = parent_user_id);
```

## 8.3 child-owned progress table policy pattern

For `problem_attempts`, `wrong_problems`, and `progress_summary`, use child ownership checks:

```sql
exists (
  select 1
  from public.child_profiles cp
  where cp.id = child_profile_id
    and cp.parent_user_id = auth.uid()
)
```

Example for attempts:

```sql
create policy "problem_attempts_select_own_child"
  on public.problem_attempts for select
  using (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );

create policy "problem_attempts_insert_own_child"
  on public.problem_attempts for insert
  with check (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );
```

Repeat equivalent SELECT and INSERT policies for `wrong_problems` and `progress_summary`.

## 8.4 wrong_problems UPDATE policy

`wrong_problems` REQUIRES an UPDATE policy for status transitions
(active → reviewing → mastered) and count increments:

```sql
create policy "wrong_problems_update_own_child"
  on public.wrong_problems for update
  using (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );
```

The `with check` clause ensures that the updated row's `child_profile_id`
still belongs to the current parent. This prevents a user from moving a
wrong problem to another parent's child profile during an update.

## 8.5 progress_summary UPDATE policy

`progress_summary` REQUIRES an UPDATE policy for stars, streak_days,
completed_problem_ids, etc.:

```sql
create policy "progress_summary_update_own_child"
  on public.progress_summary for update
  using (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );
```

The `with check` clause ensures that the updated row's `child_profile_id`
still belongs to the current parent. This prevents a user from reassigning
a progress summary to another parent's child profile during an update.

## 8.6 problem_attempts is append-only

`problem_attempts` does NOT need an UPDATE policy. It is an append-only
audit trail. If a correction is needed, insert a new row rather than
modifying an existing one.

---

# 9. Client Data Layer

Recommended files:

```text
src/lib/supabase/client.ts
src/lib/supabase/types.ts
src/lib/server-progress.ts
src/lib/progress-source.ts
```

Responsibilities:

## `client.ts`

- Create browser Supabase client.
- Read env vars.
- Export a typed client if database types are available.
- Listen to auth state changes (`onAuthStateChange`).
- Handle session expiry: if session expires during practice, show a
  clear message. Do not lose the current page state. The user can
  sign in again and continue. Offline queue / retry is deferred to
  v0.2.x.

## `server-progress.ts`

- Load server progress for active child.
- Record attempt.
- Update wrong problem state.
- Update summary stars/completed IDs.
- Load report data.
- On network failure: show clear error, do not claim success, do not
  destroy local page state. Retry is manual (user clicks again).

## `progress-source.ts`

Provides an abstraction:

```ts
export type ProgressMode = "local" | "server";
```

The app should not directly scatter storage decisions across pages.

## progress_summary concurrency

v0.2 does NOT guarantee strong real-time multi-device merge.

- `problem_attempts` is the audit source of truth.
- `progress_summary` is a denormalized cache for fast UI display.
- Summary updates should prefer server-side RPC or transaction to
  avoid client-side blind overwrites of `text[]` arrays.
- If two devices update the same child profile simultaneously, the
  server's last write wins. Inconsistencies can be resolved later by
  recomputing summary from `problem_attempts`.
- This is acceptable for v0.2 because multi-device simultaneous use
  by the same child is unlikely. If it becomes common, a v0.2.x
  improvement can add optimistic locking or server-side recomputation.

---

# 10. Routing / UI Scope

Minimum new routes/components:

```text
/login
/profile or /children
/import-progress
```

Recommended behavior:

- If not signed in, home still works in local mode.
- A subtle account entry appears on home/settings.
- After sign-in, ask the parent to create/select a child profile.
- If local progress exists, offer import.

Do not block current local experience during first v0.2 implementation.

---

# 11. Server Progress Rules

Server behavior should match v0.1 local behavior.

## First correct star

If `problem_id` is not in `completed_problem_ids` and attempt is correct:

```text
stars += 1
append problem_id to completed_problem_ids
```

## Daily practice reward

If practice completed and `last_practice_date` is not today:

```text
stars += 5
last_practice_date = today
```

## Wrong book

Wrong attempt:

```text
status = active
wrong_count += 1
correct_review_count = 0
last_wrong_at = now
```

Correct review:

```text
active → reviewing, correct_review_count = 1
reviewing → mastered, correct_review_count = 2
```

---

# 12. Privacy and Child Safety

Rules:

- Do not require child email.
- Do not require real child name.
- Do not collect school, location, or exact birthdate.
- Do not add analytics in v0.2.
- Do not send attempt data to third-party AI services.
- Keep parent account as the owner of all child data.

---

# 13. Implementation Phases

## Phase 0 — Design Review

- Review this document.
- Review migration document.
- Review v0.2 QA checklist.
- Resolve open decisions.

## Phase 1 — Supabase Foundation

- Add Supabase dependencies.
- Add env var docs.
- Add client setup.
- Add auth routes.
- Add basic session state.

## Phase 2 — Child Profile

- Add child profile table migration.
- Create/select child profile UI.
- Keep one-child UI first, schema supports multiple.

## Phase 3 — Server Progress

- Add attempts save path.
- Add wrong problem save path.
- Add progress summary save path.
- Make practice/wrong-book/report work from server mode.

## Phase 4 — Local Import

- Detect v0.1 localStorage progress.
- Offer manual import.
- Upload attempts, wrong book, summary.
- Mark imported.

## Phase 5 — QA and Hardening

- RLS tests/manual checklist.
- Import tests.
- Regression tests for local mode.

---

# 14. Open Decisions

| Decision | Options | Recommendation |
|---|---|---|
| Login required? | required / optional | optional in v0.2 |
| Child profile count | one / many | schema many, UI may start one |
| Problem source | JSON / database | keep JSON in v0.2 |
| Local import | automatic / manual | manual confirmation |
| Report source | summary table / derived attempts | summary + attempts |
| Analytics | none / basic | none in v0.2 |

---

# 15. Completion Criteria

This design is ready for implementation only when:

- schema is reviewed;
- RLS policy approach is reviewed;
- local import strategy is reviewed;
- v0.2 QA checklist exists;
- no unresolved privacy blocker remains;
- opencode has a narrow first implementation task.
