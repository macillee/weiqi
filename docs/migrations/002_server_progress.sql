-- Migration 002: server progress tables
-- v0.2.3a Server Progress Schema
--
-- This migration creates the remaining tables for v0.2 server progress sync.
-- Run this in Supabase SQL Editor after Migration 001 (child_profiles).
--
-- Prerequisites:
-- - Migration 001 (child_profiles) has been applied
-- - Supabase Auth is enabled
-- - RLS is enabled on all tables

-- ============================================================
-- 1. profiles table
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

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

-- ============================================================
-- 2. problem_attempts table
-- ============================================================

create table if not exists public.problem_attempts (
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

alter table public.problem_attempts enable row level security;

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

-- problem_attempts is append-only; no UPDATE policy.

-- ============================================================
-- 3. wrong_problems table
-- ============================================================

create table if not exists public.wrong_problems (
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

alter table public.wrong_problems enable row level security;

create policy "wrong_problems_select_own_child"
  on public.wrong_problems for select
  using (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );

create policy "wrong_problems_insert_own_child"
  on public.wrong_problems for insert
  with check (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );

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

-- ============================================================
-- 4. progress_summary table
-- ============================================================

create table if not exists public.progress_summary (
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

alter table public.progress_summary enable row level security;

create policy "progress_summary_select_own_child"
  on public.progress_summary for select
  using (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );

create policy "progress_summary_insert_own_child"
  on public.progress_summary for insert
  with check (
    exists (
      select 1 from public.child_profiles cp
      where cp.id = child_profile_id
        and cp.parent_user_id = auth.uid()
    )
  );

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

-- ============================================================
-- 5. updated_at triggers
-- ============================================================

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

create trigger wrong_problems_updated_at
  before update on public.wrong_problems
  for each row execute function public.set_updated_at();

create trigger progress_summary_updated_at
  before update on public.progress_summary
  for each row execute function public.set_updated_at();
