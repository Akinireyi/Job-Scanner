-- ============================================================================
-- Siftly schema v1
--
-- Run this once in your Supabase project:
--   Dashboard -> SQL Editor -> New query -> paste this file -> Run.
--
-- Supabase Auth owns auth.users. Everything in public.* below is ours.
-- RLS is enabled on every table so users can only touch their own rows.
-- ============================================================================

-- ---------------------------------------------------------------- profiles ---
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  school text,
  majors text[] default '{}',
  minors text[] default '{}',
  graduation_year int,
  enrollment_type text check (enrollment_type in ('undergrad','masters','newgrad','jobseeker')),
  skills text[] default '{}',
  interests text[] default '{}',
  preferred_locations text[] default '{}',
  background_notes text,
  resume_file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profile_select_own" on public.profiles;
create policy "profile_select_own" on public.profiles for select using (auth.uid() = user_id);
drop policy if exists "profile_insert_own" on public.profiles;
create policy "profile_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
drop policy if exists "profile_update_own" on public.profiles;
create policy "profile_update_own" on public.profiles for update using (auth.uid() = user_id);

-- --------------------------------------------------------- theme_settings ---
create table if not exists public.theme_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preset_name text default 'studio-x-index',
  custom_tokens jsonb,
  updated_at timestamptz not null default now()
);

alter table public.theme_settings enable row level security;
drop policy if exists "theme_all_own" on public.theme_settings;
create policy "theme_all_own" on public.theme_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --------------------------------------------------------- user_settings ----
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_notifications boolean default false,
  email_frequency text check (email_frequency in ('daily','weekly','never')) default 'weekly',
  email_min_score int default 8 check (email_min_score between 1 and 10),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;
drop policy if exists "settings_all_own" on public.user_settings;
create policy "settings_all_own" on public.user_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------- auto-create profile on signup ----
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  insert into public.user_settings (user_id) values (new.id);
  insert into public.theme_settings (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------- job_sources ----
create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  kind text not null,
  config jsonb,
  active boolean default true,
  created_at timestamptz not null default now()
);

alter table public.job_sources enable row level security;
drop policy if exists "sources_read_authed" on public.job_sources;
create policy "sources_read_authed" on public.job_sources for select
  using (auth.role() = 'authenticated');

-- ------------------------------------------------------------- listings ----
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.job_sources(id) on delete cascade,
  source_listing_id text,
  company text not null,
  title text not null,
  locations text[] default '{}',
  url text,
  posted_at timestamptz,
  category text,
  active boolean default true,
  raw_data jsonb,
  scraped_at timestamptz not null default now(),
  unique (source_id, source_listing_id)
);

alter table public.listings enable row level security;
drop policy if exists "listings_read_authed" on public.listings;
create policy "listings_read_authed" on public.listings for select
  using (auth.role() = 'authenticated');
create index if not exists listings_active_scraped_idx on public.listings (active, scraped_at desc);

-- -------------------------------------------------------------- matches ----
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  score int check (score between 1 and 10),
  reason text,
  scored_at timestamptz not null default now(),
  scored_model text,
  unique (user_id, listing_id)
);

alter table public.matches enable row level security;
drop policy if exists "matches_read_own" on public.matches;
create policy "matches_read_own" on public.matches for select using (auth.uid() = user_id);
create index if not exists matches_user_score_idx on public.matches (user_id, score desc, scored_at desc);

-- --------------------------------------------------------- applications ----
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  status text not null check (status in ('saved','applied','interviewing','offer','rejected','passed')),
  notes text,
  applied_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

alter table public.applications enable row level security;
drop policy if exists "apps_all_own" on public.applications;
create policy "apps_all_own" on public.applications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
