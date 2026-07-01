-- Notivault — M1 : fondations données
-- Migration 002 — table profiles + trigger handle_new_user + RLS.
--
-- Réplique le pattern d'Infrastructure (repo Notion-Club/Infrastructure,
-- migration 002_auth_profiles) : extension métier 1-1 de auth.users, remplie
-- par un trigger SECURITY DEFINER sur auth.users. Schéma simplifié pour
-- Notivault (compte autonome, pas de multi-tenant / organizations).
--
-- ⚠️  Points sensibles :
--   (a) handle_new_user est SECURITY DEFINER (droits owner) : indispensable
--       pour INSERT dans public.profiles depuis un trigger sur auth.users.
--   (b) set search_path = '' : protection contre le hijack de search_path.
--   (c) raw_user_meta_data est modifiable par l'utilisateur : on ne l'utilise
--       QUE pour peupler des champs d'affichage (full_name), jamais pour une
--       décision d'autorisation.

-- ============================================================================
-- 1. Table profiles
-- ============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Profil 1-1 de auth.users, créé par le trigger handle_new_user.';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. Trigger handle_new_user : auth.users INSERT → profiles INSERT
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_full_name text;
begin
  -- full_name par ordre de préférence : full_name (signup email) → name
  -- (claim Google OAuth) → partie locale de l'email (fallback).
  v_full_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, v_full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 3. RLS
-- ============================================================================
alter table public.profiles enable row level security;

-- SELECT : son propre profil uniquement.
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

-- UPDATE : son propre profil.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Pas de policy INSERT (création via trigger, SECURITY DEFINER, bypass RLS).
-- Pas de policy DELETE (cascade depuis auth.users).

-- Privilèges de table (PostgREST exige un GRANT en plus de la RLS).
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
