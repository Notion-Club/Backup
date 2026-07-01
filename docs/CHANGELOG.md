# Changelog

Journal des jalons livrés. Une section par jalon : ce qui a été livré, pas le
détail d'implémentation (voir [ARCHITECTURE.md](ARCHITECTURE.md) et le code).

## M1 — Fondations données (Supabase + Vault)

- Schéma initial : 5 tables (`profiles`, `notion_connections`, `destinations`,
  `backup_configs`, `backup_runs`) + enums, migrations `001`–`004`.
- RLS activée partout (chaque user ne voit que ses lignes ; `backup_runs` en
  lecture seule côté client).
- Trigger `handle_new_user` → création automatique de `profiles` au signup.
- Plomberie Vault : fonctions `internal.*` (store/read/rotate/delete secret),
  `SECURITY DEFINER`, réservées au rôle serveur.

## M2a — Auth plateforme + coquille d'app

- Login email + mot de passe (signup, login, logout, reset, update) via Server
  Actions + `zod` ; confirmation e-mail via `/auth/confirm` (`verifyOtp`).
- Clients Supabase `@supabase/ssr` (browser / server SSR / admin) + `proxy.ts`
  (Next 16, runtime Node) qui rafraîchit la session.
- Route groups `(marketing)` / `(auth)` / `(app)` ; `(app)` gardé par
  `getUser()` → `/login`. Dashboard placeholder.

## M2b — Connexion Notion OAuth (+ refresh)

- Flow OAuth Notion : `/api/oauth/notion/{start,callback}`, échange côté serveur,
  tokens rangés dans Vault, upsert `notion_connections` (rotation à la reconnexion).
- Gestion des **tokens rotatifs** : `getValidNotionToken()` (refresh + rotation
  access & refresh, single-flight, `revoked` sur `invalid_grant`).
- UI `/connexions` : liste, connecter, déconnecter. Migration `005`
  (`refresh_token_secret_id`, `token_expires_at`).

## M2c — Destination GitHub App + config des backups

- GitHub App : `/api/oauth/github/{start,callback}`, destination enregistrée avec
  `installation_id` ; `getInstallationOctokit()` (token d'installation ~1h, cache).
- UI `/backups` : config de destination (repo / branche / préfixe), création de
  `backup_configs` (fréquence → cron), liste + toggle `enabled` + dernier run.
- « Lancer maintenant » présent mais désactivé (exécution câblée en M2d).

## À venir — M2d (runner)

Runner sur VPS : consomme les `backup_configs` actifs, réutilise
`getValidNotionToken` + `getInstallationOctokit`, lance le moteur d'extraction
(`notivault-engine`), écrit les `backup_runs` ; câble « Lancer maintenant ».
