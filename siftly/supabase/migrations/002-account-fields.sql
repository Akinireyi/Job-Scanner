-- Migration 002 — add phone, country, and language to profiles.
--
-- Run in your Supabase project: SQL Editor -> New query -> paste -> Run.
-- Safe to run multiple times (uses "add column if not exists").

alter table public.profiles
  add column if not exists phone text,
  add column if not exists country text,
  add column if not exists language text default 'English';
