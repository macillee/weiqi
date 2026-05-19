-- Migration 001: child_profiles table
-- v0.2.2 Child Profile
--
-- This migration creates the child_profiles table for v0.2.
-- Run this in Supabase SQL Editor before deploying v0.2.2.
--
-- Prerequisites:
-- - Supabase Auth is enabled
-- - RLS is enabled on all tables (see SUPABASE_DESIGN_v0.2.md §8)

-- Create child_profiles table
create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  age_range text,
  go_experience text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast lookup by parent
create index if not exists child_profiles_parent_user_id_idx
  on public.child_profiles(parent_user_id);

-- Enable RLS
alter table public.child_profiles enable row level security;

-- RLS policies: parent can only access their own child profiles
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

-- Auto-update updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger child_profiles_updated_at
  before update on public.child_profiles
  for each row execute function public.set_updated_at();
