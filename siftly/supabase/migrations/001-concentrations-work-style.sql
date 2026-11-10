-- Migration 001 — add concentrations, work style, no-location-preference
--
-- Run in your Supabase project: SQL Editor -> New query -> paste -> Run.
-- Safe to run multiple times (uses "add column if not exists").

alter table public.profiles
  add column if not exists concentrations text[] default '{}',
  add column if not exists work_style text[] default '{}',
  add column if not exists location_any boolean default false;
