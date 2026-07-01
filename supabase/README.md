# Notivault — Supabase (M1 : fondations données)

Projet Supabase **dédié** à Notivault (séparé d'Infrastructure). M1 pose le
schéma, la RLS et la plomberie Vault. M2 les remplit (callback OAuth, UI, VPS).

## Migrations

| Fichier                              | Contenu                                                       |
| ------------------------------------ | ------------------------------------------------------------ |
| `001_init_enums_and_helpers.sql`     | 5 enums + helper `set_updated_at`                            |
| `002_profiles_and_auth_trigger.sql`  | `profiles` + trigger `handle_new_user` + RLS                 |
| `003_backups_schema.sql`             | `notion_connections`, `destinations`, `backup_configs`, `backup_runs` + index + RLS |
| `004_vault_plumbing.sql`             | schéma privé `internal` + fonctions secrets (serveur only)   |
| `005_notion_token_refresh.sql`       | `notion_connections` : `refresh_token_secret_id`, `token_expires_at` |

## Appliquer

Via Supabase CLI (après `supabase link --project-ref <ref>`) :

```bash
supabase db push
```

Ou appliquer chaque fichier dans l'ordre via le SQL editor / MCP `apply_migration`.

## Modèle de sécurité

- **RLS activée** sur les 5 tables. L'utilisateur authentifié n'accède qu'à ses
  lignes (`user_id = auth.uid()`, `id = auth.uid()` pour `profiles`).
- **`backup_runs`** : lecture seule côté client ; écrites par le rôle serveur
  (VPS / `service_role`, qui bypasse la RLS).
- **Secrets** : jamais en clair dans les tables métier. Seul l'UUID d'un secret
  Vault est stocké (`access_token_secret_id`, `credentials_secret_id`). Les
  fonctions d'accès vivent dans le schéma privé `internal` (non exposé à la Data
  API), en `SECURITY DEFINER`, `EXECUTE` réservé à `service_role`.

## Fonctions secrets (rôle serveur uniquement)

```sql
internal.store_secret(plaintext text, label text default null) returns uuid
internal.read_secret(secret_id uuid) returns text
internal.rotate_secret(secret_id uuid, plaintext text) returns void
internal.delete_secret(secret_id uuid) returns void
```

### Smoke test Vault

```sql
-- En rôle serveur (postgres / service_role) : doit fonctionner.
select internal.store_secret('test', 'smoke') as id;  -- → <uuid>
select internal.read_secret('<uuid>');                -- → 'test'
select internal.delete_secret('<uuid>');

-- En rôle authenticated : doit ÉCHOUER (permission denied).
set role authenticated;
select internal.read_secret('<uuid>');                -- → erreur
reset role;
```

## Accès depuis M2

- **VPS** (extraction / cron) : connexion Postgres directe → appelle
  `internal.read_secret(...)` pour déchiffrer le token Notion d'un job.
- **Callback OAuth Vercel** : `service_role` (clé `sb_secret_…`). Pour un appel
  RPC via supabase-js, exposer le schéma `internal` à l'API (Dashboard → API →
  Exposed schemas) ou utiliser une connexion Postgres directe.

## Prérequis dashboard (Théo)

1. Projet Supabase dédié, région EU. Noter le project ref.
2. Clés nouveau format : `sb_publishable_…` (client), `sb_secret_…` (serveur).
3. Auth providers Email + Google activés (config Google → prérequis M2).
4. Extension Vault active (par défaut sur Supabase Cloud).
5. **M2b/M2c — exposer le schéma `internal` à la Data API**
   (Project Settings → API → Exposed schemas → ajouter `internal`). Nécessaire
   pour que le rôle serveur (`service_role`) appelle les fonctions Vault en RPC
   (`internal.store_secret`, `read_secret`, `rotate_secret`, `delete_secret`).
   L'`EXECUTE` reste réservé à `service_role` — `authenticated`/`anon` n'ont ni
   USAGE sur le schéma ni EXECUTE sur les fonctions, donc exposer le schéma ne
   leur donne aucun accès.
6. **M2b** — appliquer la migration `005` (`supabase db push`), puis régénérer
   `database.types.ts`.

## Prérequis intégrations (M2b/M2c)

- **Notion (M2b)** : intégration publique OAuth. `NOTION_OAUTH_CLIENT_ID/SECRET`,
  et `NOTION_OAUTH_REDIRECT_URI` = `<origin>/api/oauth/notion/callback`
  (identique au caractère près à l'URI enregistrée chez Notion).
- **GitHub App (M2c)** : `GITHUB_APP_ID`, `GITHUB_APP_SLUG`,
  `GITHUB_APP_PRIVATE_KEY` (PEM, `\n` échappés). **Setup URL** de l'App =
  `<origin>/api/oauth/github/callback`. Permission repo « Contents: Read and write ».
- **OAuth state** : `OAUTH_STATE_SECRET` (aléatoire long, ex. `openssl rand -hex 32`).

Voir `.env.example` à la racine pour la liste complète.
