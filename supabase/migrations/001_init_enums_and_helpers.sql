-- Notivault — M1 : fondations données
-- Migration 001 — enums métier + helper set_updated_at.
--
-- Idempotent : enums créés via DO/EXCEPTION (pas de CREATE TYPE IF NOT EXISTS
-- en Postgres), helper en CREATE OR REPLACE.

-- ============================================================================
-- 1. Enums
-- ============================================================================
do $$ begin
  create type public.destination_type as enum ('github', 'google_drive', 'sftp', 'r2');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.connection_status as enum ('active', 'revoked', 'error');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.destination_status as enum ('active', 'error', 'disabled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.backup_format as enum ('json', 'markdown', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.run_status as enum ('pending', 'running', 'success', 'partial', 'failed');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. Helper : touche updated_at à chaque UPDATE
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
