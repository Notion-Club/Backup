# Architecture Notivault

Documentation de référence du système. Pour la configuration, voir le
[README](../README.md) ; pour l'historique, le [CHANGELOG](CHANGELOG.md).

## Modèle de données

Cinq tables dans le schéma `public` (migrations `001`–`005`), toutes en RLS.

| Table | Rôle (une phrase) | Colonnes clés |
| --- | --- | --- |
| `profiles` | Extension 1-1 de `auth.users`, créée par le trigger `handle_new_user` au signup. | `id` (= `auth.users.id`), `email`, `full_name` |
| `notion_connections` | Un workspace Notion connecté par un utilisateur (1 user → N workspaces). | `user_id`, `notion_workspace_id`, `access_token_secret_id`, `refresh_token_secret_id`, `token_expires_at`, `status` ; `UNIQUE(user_id, notion_workspace_id)` |
| `destinations` | Un stockage de destination possédé par l'utilisateur. | `user_id`, `type` (`github`…), `config` (jsonb non secret : `installation_id`, `repo`, `branch`, `path_prefix`), `credentials_secret_id`, `status` |
| `backup_configs` | Un job reliant une connexion à une destination. | `user_id`, `notion_connection_id`, `destination_id`, `schedule` (cron), `scope`, `format`, `enabled` |
| `backup_runs` | Journal d'exécution, écrit par le runner. | `backup_config_id`, `user_id` (dénormalisé), `status`, `started_at`/`finished_at`, `stats`, `location`, `error` |

Enums : `destination_type`, `connection_status`, `destination_status`,
`backup_format`, `run_status`.

## Modèle des secrets

Deux natures de secrets, deux emplacements :

- **Secrets PAR CLIENT** (tokens OAuth Notion : access + refresh) → **Supabase
  Vault**. Les tables ne stockent **jamais** le secret en clair : seulement l'UUID
  du secret Vault (`access_token_secret_id`, `refresh_token_secret_id`).
- **Secrets GLOBAUX** (clé privée de la GitHub App) → **variable d'env**
  (`GITHUB_APP_PRIVATE_KEY`). Elle n'est pas par-destination : une destination
  GitHub ne stocke que son `installation_id` dans `config`, et le serveur mint un
  token d'installation à la volée.

**Accès aux secrets Vault** : encapsulé dans des fonctions SQL du schéma privé
`internal` (migration `004`), `SECURITY DEFINER`, `EXECUTE` réservé à
`service_role` :

| Fonction | Effet |
| --- | --- |
| `internal.store_secret(plaintext, label)` | Crée un secret, renvoie son UUID |
| `internal.read_secret(secret_id)` | Renvoie le secret déchiffré |
| `internal.rotate_secret(secret_id, plaintext)` | Remplace la valeur |
| `internal.delete_secret(secret_id)` | Supprime le secret |

Le code applicatif ne fait **jamais** de lecture/écriture directe d'un secret
(cela fuiterait dans les logs) : il n'échange que des UUID. L'accès passe par le
client serveur (clé secret → `service_role`) via RPC (`src/shared/lib/supabase/vault.ts`),
le schéma `internal` étant exposé à la Data API pour ce seul rôle.

## Les trois flows OAuth

Trois échanges OAuth **distincts**, tous protégés par un `state` signé HMAC
(`src/shared/lib/oauth/state.ts`) sauf le login (géré par Supabase) :

1. **Login plateforme (Supabase Auth).** Email + mot de passe (Google à venir)
   via Server Actions. Le trigger `handle_new_user` crée la ligne `profiles`. La
   session vit dans des cookies, rafraîchie à chaque requête par `proxy.ts`.
2. **Source — Notion (M2b).** `/api/oauth/notion/start` construit l'authorize URL
   (state lié à l'utilisateur) ; le callback échange le code **côté serveur**,
   range les tokens dans Vault et upsert `notion_connections`. Les tokens Notion
   sont **rotatifs** : `getValidNotionToken()` rafraîchit et fait tourner access
   **et** refresh, persiste la nouvelle expiration, avec single-flight par
   connexion et passage en `revoked` sur `invalid_grant`.
3. **Destination — GitHub App (M2c).** `/api/oauth/github/start` redirige vers
   l'installation de l'App (state lié à l'utilisateur) ; le callback enregistre
   une `destinations` (`config.installation_id`). `getInstallationOctokit()` mint
   un token d'installation (~1h, mis en cache) pour lister les repos et pousser.

Le token d'une source/destination ne transite **jamais** vers le client.

## RLS (Row Level Security)

- RLS activée sur les 5 tables. Un utilisateur authentifié ne voit et ne modifie
  que ses lignes : `user_id = (select auth.uid())` (et `id = auth.uid()` pour
  `profiles`).
- `backup_runs` est en **lecture seule** côté client ; ses écritures viennent du
  runner.
- **Le runner** (VPS) et les échanges serveur utilisent la **clé secret**
  (`service_role`), qui **bypasse la RLS** pour lire les jobs à exécuter et
  déchiffrer les secrets. La vérification d'appartenance est alors faite
  explicitement dans le code quand nécessaire (le client admin ne filtre pas par
  utilisateur).

## Réutilisation par le runner (M2d)

Deux helpers sont écrits pour être repris **tels quels** par le runner :
`getValidNotionToken(connectionId)` (`shared/lib/notion/token.ts`) et
`getInstallationOctokit(installationId)` (`shared/lib/github/app.ts`). Le runner
lira les `backup_configs` actifs, obtiendra un token Notion valide, lancera le
moteur d'extraction (`notivault-engine`), poussera via l'Octokit d'installation,
et écrira un `backup_runs`.
