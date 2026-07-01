-- Notivault — M1 : fondations données
-- Migration 003 — schéma métier backups : notion_connections, destinations,
-- backup_configs, backup_runs (+ index FK, RLS, privilèges).
--
-- Modèle RLS :
--   • Tables possédées par l'utilisateur (connections / destinations /
--     configs) : CRUD limité à ses lignes (user_id = auth.uid()).
--   • backup_runs : lecture seule côté client ; les écritures viennent du
--     rôle serveur (VPS) qui bypasse la RLS (service_role a BYPASSRLS). Aucune
--     policy d'écriture côté client n'est donc créée.
--   • Les secrets (tokens Notion, credentials destination) ne sont PAS stockés
--     dans ces tables : seul l'UUID d'un secret Vault y figure (cf. 004).

-- ============================================================================
-- 1. notion_connections  (1 user → N workspaces Notion)
-- ============================================================================
create table if not exists public.notion_connections (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  notion_workspace_id      text not null,
  workspace_name           text,
  workspace_icon           text,
  bot_id                   text,
  -- UUID d'un secret Vault = le token OAuth Notion (jamais le token en clair).
  access_token_secret_id   uuid,
  status                   public.connection_status not null default 'active',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (user_id, notion_workspace_id)
);

create index if not exists notion_connections_user_id_idx
  on public.notion_connections (user_id);

drop trigger if exists notion_connections_set_updated_at on public.notion_connections;
create trigger notion_connections_set_updated_at
  before update on public.notion_connections
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. destinations
-- ============================================================================
create table if not exists public.destinations (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  type                     public.destination_type not null,
  label                    text,
  -- UUID d'un secret Vault = credentials de destination (PAT, clé, mdp SFTP…).
  credentials_secret_id    uuid,
  -- Config NON secrète : repo, branch, path_prefix, bucket, host, port, etc.
  config                   jsonb not null default '{}'::jsonb,
  status                   public.destination_status not null default 'active',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists destinations_user_id_idx
  on public.destinations (user_id);

drop trigger if exists destinations_set_updated_at on public.destinations;
create trigger destinations_set_updated_at
  before update on public.destinations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. backup_configs  (connexion × destination = un job)
-- ============================================================================
create table if not exists public.backup_configs (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  notion_connection_id     uuid not null references public.notion_connections(id) on delete cascade,
  destination_id           uuid not null references public.destinations(id) on delete cascade,
  schedule                 text not null,                                   -- expression cron
  scope                    jsonb not null default '{"mode":"all"}'::jsonb,  -- toutes les pages ou ids ciblés
  format                   public.backup_format not null default 'json',
  rotation                 jsonb,                                           -- rétention (détaillée plus tard)
  enabled                  boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists backup_configs_user_id_idx
  on public.backup_configs (user_id);
create index if not exists backup_configs_notion_connection_id_idx
  on public.backup_configs (notion_connection_id);
create index if not exists backup_configs_destination_id_idx
  on public.backup_configs (destination_id);
-- Le VPS balaie les jobs actifs à exécuter.
create index if not exists backup_configs_enabled_idx
  on public.backup_configs (enabled) where enabled;

drop trigger if exists backup_configs_set_updated_at on public.backup_configs;
create trigger backup_configs_set_updated_at
  before update on public.backup_configs
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. backup_runs  (journal d'exécution, écrit par le VPS)
-- ============================================================================
create table if not exists public.backup_runs (
  id                       uuid primary key default gen_random_uuid(),
  backup_config_id         uuid not null references public.backup_configs(id) on delete cascade,
  user_id                  uuid not null,   -- dénormalisé pour simplifier la RLS de lecture
  status                   public.run_status not null default 'pending',
  started_at               timestamptz,
  finished_at              timestamptz,
  stats                    jsonb,           -- compteurs (pages, databases, blocs, médias, erreurs)
  error                    text,
  location                 text,            -- où le backup a atterri
  created_at               timestamptz not null default now()
);

create index if not exists backup_runs_backup_config_id_idx
  on public.backup_runs (backup_config_id);
create index if not exists backup_runs_user_id_idx
  on public.backup_runs (user_id);

-- ============================================================================
-- 5. RLS + privilèges
-- ============================================================================
alter table public.notion_connections enable row level security;
alter table public.destinations       enable row level security;
alter table public.backup_configs     enable row level security;
alter table public.backup_runs        enable row level security;

-- ── notion_connections : CRUD sur ses lignes ────────────────────────────────
drop policy if exists notion_connections_rw_self on public.notion_connections;
create policy notion_connections_rw_self
  on public.notion_connections for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── destinations : CRUD sur ses lignes ──────────────────────────────────────
drop policy if exists destinations_rw_self on public.destinations;
create policy destinations_rw_self
  on public.destinations for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── backup_configs : CRUD sur ses lignes ────────────────────────────────────
drop policy if exists backup_configs_rw_self on public.backup_configs;
create policy backup_configs_rw_self
  on public.backup_configs for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── backup_runs : lecture seule côté client ─────────────────────────────────
drop policy if exists backup_runs_select_self on public.backup_runs;
create policy backup_runs_select_self
  on public.backup_runs for select to authenticated
  using (user_id = (select auth.uid()));

-- Privilèges de table (PostgREST exige un GRANT en plus de la RLS).
grant select, insert, update, delete
  on public.notion_connections, public.destinations, public.backup_configs
  to authenticated;
grant select on public.backup_runs to authenticated;

grant all on
  public.notion_connections, public.destinations,
  public.backup_configs, public.backup_runs
  to service_role;
