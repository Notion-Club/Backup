-- Notivault — M1 : fondations données
-- Migration 004 — accès sécurisé aux secrets via Supabase Vault.
--
-- ⚠️  RÉSERVÉ AU RÔLE SERVEUR (service_role : Vercel callback M2, VPS).
--     Jamais anon/authenticated. Ces fonctions encapsulent Vault : le code
--     applicatif ne fait JAMAIS d'INSERT/SELECT direct sur un secret (ça
--     fuiterait dans les logs). Il n'échange que des UUID de secrets, rangés
--     dans notion_connections.access_token_secret_id /
--     destinations.credentials_secret_id.
--
-- Choix de conception (source de vérité : skill supabase d'Infrastructure) :
--   • Fonctions SECURITY DEFINER placées dans un schéma PRIVÉ `internal`, NON
--     exposé à la Data API — on ne met jamais de SECURITY DEFINER dans un
--     schéma exposé (public).
--   • EXECUTE révoqué de public, accordé au seul service_role.
--   • search_path = '' + objets Vault pleinement qualifiés (vault.*).
--
-- API Vault (vérifiée dans la doc Supabase) :
--   vault.create_secret(secret [, name [, description]]) → uuid
--   vault.update_secret(id, secret [, name [, description]])
--   vault.decrypted_secrets (vue : déchiffre à la lecture, colonne decrypted_secret)
--   vault.secrets (table chiffrée : DELETE par id)
--
-- Accès depuis M2 : le service (service_role) appelle ces fonctions via une
-- connexion Postgres directe (VPS), ou en exposant le schéma `internal` à
-- l'API pour un RPC supabase-js côté callback. À câbler en M2.

create schema if not exists internal;
revoke all on schema internal from public;
grant usage on schema internal to service_role;

-- ── store_secret : crée un secret Vault, renvoie son UUID ────────────────────
create or replace function internal.store_secret(plaintext text, label text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  return vault.create_secret(plaintext, null, coalesce(label, ''));
end;
$$;

-- ── read_secret : renvoie le secret déchiffré ───────────────────────────────
create or replace function internal.read_secret(secret_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where id = secret_id;
  return v_secret;
end;
$$;

-- ── rotate_secret : remplace la valeur d'un secret existant ──────────────────
create or replace function internal.rotate_secret(secret_id uuid, plaintext text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform vault.update_secret(secret_id, plaintext);
end;
$$;

-- ── delete_secret : supprime définitivement un secret ───────────────────────
create or replace function internal.delete_secret(secret_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from vault.secrets where id = secret_id;
end;
$$;

-- ── Verrouillage des privilèges : serveur uniquement ────────────────────────
revoke all on function internal.store_secret(text, text)  from public;
revoke all on function internal.read_secret(uuid)         from public;
revoke all on function internal.rotate_secret(uuid, text) from public;
revoke all on function internal.delete_secret(uuid)       from public;

grant execute on function internal.store_secret(text, text)  to service_role;
grant execute on function internal.read_secret(uuid)         to service_role;
grant execute on function internal.rotate_secret(uuid, text) to service_role;
grant execute on function internal.delete_secret(uuid)       to service_role;
