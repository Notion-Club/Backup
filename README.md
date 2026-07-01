# Notivault

**Notivault** est un SaaS de sauvegarde automatisée pour Notion : un utilisateur
connecte ses workspaces Notion (OAuth), choisit une destination qu'il **possède**
(GitHub d'abord ; Google Drive, SFTP, Cloudflare R2 ensuite) et Notivault y dépose
des sauvegardes régulières. Le contenu Notion transite pendant l'extraction puis
part chez l'utilisateur — **Notivault n'héberge jamais durablement ses données**.

Ce repo (`Notion-Club/Backup`) contient l'**app Next.js** (pages publiques + app
authentifiée) déployée sur Vercel, et les **migrations Supabase**. Le moteur
d'extraction vit dans un repo dédié (`notivault-engine`).

## Architecture en un coup d'œil

| Brique | Rôle | Où |
| --- | --- | --- |
| **App Next.js** | Pages publiques, auth, UI de config, **échanges OAuth one-shot** (login, connexion Notion, installation GitHub App), écritures en base | Vercel |
| **Supabase** | Postgres (données + RLS), Auth (email/Google), **Vault** (secrets par client) | Cloud (EU) |
| **Runner** | **Cycle de vie des tokens** (refresh/rotation), extraction, push vers la destination, journalisation des exécutions | VPS (EU) |
| **Moteur** | Extraction Notion → JSON + drivers de destination | repo `notivault-engine` |

Principe de séparation : **l'app fait les échanges OAuth ponctuels et la base ;
le runner fait le cycle de vie des tokens + l'extraction + le push.** Les deux
partagent l'état via Supabase (l'app écrit configs/secrets ; le runner les lit
avec la clé secret, qui bypasse la RLS).

```
Utilisateur ─▶ App Next.js (Vercel) ─▶ Supabase (Postgres + Auth + Vault)
                                            ▲
                        Runner (VPS) ───────┘  lit les jobs, refresh tokens,
                                               lance le moteur, écrit backup_runs
                                                   │
                                                   ▼
                                        Destination de l'utilisateur (GitHub…)
```

## Stack

- Next.js 16.2 (App Router + Turbopack, RSC ; `proxy.ts` = ex-middleware, runtime Node), React 19, TypeScript 5
- Tailwind CSS v4, design system Notion Club (`Notion-Club/Infrastructure`) : tokens + classes `nc-*`, SF Pro Display, shadcn « new-york »
- Supabase (`@supabase/ssr`, nouveau modèle de clés publishable/secret), Auth email + Google (à venir), Vault
- Auth via Server Actions + `zod`

## Structure des routes

| Groupe | Routes | Contenu |
| --- | --- | --- |
| `(marketing)` | `/`, `/confidentialite`, `/conditions`, `/mentions-legales` | Pages publiques + header/footer |
| `(auth)` | `/login`, `/signup`, `/reset-password`, `/update-password` | Auth email (cartes stylées) |
| `(app)` | `/dashboard`, `/connexions`, `/backups` | App authentifiée (garde `getUser()` → `/login`) |
| Route handlers | `/auth/confirm` | Confirmation e-mail (`verifyOtp`) |
| API OAuth | `/api/oauth/notion/{start,callback}`, `/api/oauth/github/{start,callback}` | Échanges OAuth one-shot |

`proxy.ts` rafraîchit la session Supabase à chaque requête. `robots.txt`,
`sitemap.xml` et l'image Open Graph sont générés automatiquement.

## Structure du code

```
src/
  app/                     Routes (route groups ci-dessus) + proxy.ts
  shared/
    components/
      marketing/  auth/  app/  theme/  ui/     Composants par domaine + shadcn
    lib/
      supabase/   client.ts server.ts admin.ts vault.ts env.ts
      auth/       actions.ts validation.ts
      notion/     oauth.ts token.ts connection.ts actions.ts
      github/     app.ts
      backups/    actions.ts
      oauth/      state.ts            State OAuth signé HMAC (anti-CSRF)
      database.types.ts               Types générés du schéma (régénérables)
supabase/
  migrations/    001…005              Schéma, RLS, Vault, refresh token Notion
```

Détails du système : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Journal des
jalons : [`docs/CHANGELOG.md`](docs/CHANGELOG.md).

## Setup

### 1. Variables d'environnement

Copier `.env.example` → `.env.local` (et renseigner côté Vercel en prod).

| Variable | Portée | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client | Clé `sb_publishable_…` (SSR, RLS user) |
| `SUPABASE_SECRET_KEY` | serveur | Clé `sb_secret_…` (bypass RLS, Vault) |
| `NEXT_PUBLIC_APP_URL` | client | URL publique (optionnel ; sinon dérivée des headers) |
| `OAUTH_STATE_SECRET` | serveur | Signature HMAC des états OAuth (`openssl rand -hex 32`) |
| `NOTION_OAUTH_CLIENT_ID` / `NOTION_OAUTH_CLIENT_SECRET` | serveur | Intégration publique Notion |
| `NOTION_OAUTH_REDIRECT_URI` | serveur | `<origin>/api/oauth/notion/callback` (au caractère près) |
| `GITHUB_APP_ID` / `GITHUB_APP_SLUG` | serveur | GitHub App |
| `GITHUB_APP_PRIVATE_KEY` | serveur | Clé privée PEM (`\n` échappés) — secret **global** |

### 2. Base de données

```bash
supabase link --project-ref <ref>
supabase db push                 # applique migrations 001 → 005
supabase gen types typescript --project-id <ref> > src/shared/lib/database.types.ts
```

Puis, dans le **dashboard Supabase** :

- **Authentication → Providers** : activer **Email** (Google plus tard).
- **Authentication → URL Configuration** : Site URL `https://notivault.fr`
  (+ `http://localhost:3000` en dev).
- **Email Templates** : pointer vers `/auth/confirm` avec le token hash, ex.
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
  (et `type=recovery&next=/update-password` pour la récupération).
- **Project Settings → API → Exposed schemas** : ajouter **`internal`**.
  Requis pour que le rôle serveur appelle les fonctions Vault en RPC ;
  `authenticated`/`anon` restent sans accès (ni USAGE ni EXECUTE).

### 3. Intégration Notion (M2b)

Intégration **publique** OAuth. Redirect URI = `<origin>/api/oauth/notion/callback`
(identique au caractère près à celle renseignée aux 3 endroits : authorize,
enregistrement Notion, échange).

### 4. GitHub App (M2c)

Créer une GitHub App (permission **Contents: Read and write**). **Setup URL** =
`<origin>/api/oauth/github/callback`. Renseigner `GITHUB_APP_ID`,
`GITHUB_APP_SLUG`, `GITHUB_APP_PRIVATE_KEY`.

### 5. Lancement local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
npm run lint
```

> Notivault n'est pas affilié à Notion. Notion est une marque de Notion Labs, Inc.
