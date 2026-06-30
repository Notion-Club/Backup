Tu construis NOTIVAULT : un SaaS de sauvegarde automatisée pour Notion. Les
backups d'un utilisateur partent vers SA propre destination (Google Drive,
GitHub, SFTP, Cloudflare R2 ; OneDrive prévu plus tard) — Notivault n'héberge
jamais le contenu Notion durablement.

Sur cette session, on produit UNIQUEMENT les pages publiques marketing/légales.
Pas d'auth membre, pas de logique de backup, pas de paiement : ces couches
viendront après.

## Stack (identique au repo Notion-Club/Infrastructure)
- Next.js 16.2.6 (App Router + Turbopack, React Server Components par défaut,
  View Transitions).
- React 19, TypeScript 5.
- Tailwind CSS v4 (config CSS-first via `@import "tailwindcss"`, design tokens
  en variables CSS dans `globals.css`).
- shadcn/ui style "new-york" dans `src/shared/components/ui/`, icônes lucide-react.
- Thème light / dark / system sans flash (ThemeProvider maison + script inline
  pré-paint), répliqué depuis le repo Infrastructure.
- Police SF Pro Display self-hostée via `next/font/local`.

## ⚠️ AVERTISSEMENT NEXT.JS — non négociable
Cette version de Next.js (16.2) a des breaking changes par rapport à ce que tu
connais : APIs, conventions et structure de fichiers peuvent différer. AVANT
d'écrire le moindre code de route, lis le guide concerné dans
`node_modules/next/dist/docs/`. Respecte les avis de dépréciation.

## Design system — SOURCE DE VÉRITÉ : repo Notion-Club/Infrastructure
Le design system a été répliqué verbatim depuis ce repo :
- `src/app/globals.css` → tous les tokens (couleurs, rayons, ombres, easings) et
  la couche de classes `nc-*`. Mêmes noms et valeurs de variables.
- Setup SF Pro Display (`next/font/local`, cf. `src/shared/lib/fonts.ts`).
- `components.json` (shadcn new-york, baseColor neutral, cssVariables true).

Tokens clés :
- `--color-brand` = #e0625a (rouge signature — accents, états actifs, CTA).
- `--color-surface-page` / `--color-surface-raised` / `--color-surface-card`.
- `--color-text-primary` / `--color-text-secondary` / `--color-text-muted`.
- `--color-border-default`.
- Couleurs sémantiques shadcn : `--background --primary --secondary --muted
  --accent --destructive` (utilitaires `bg-background`, `text-foreground`,
  `text-muted-foreground`, `border-border`, etc.).
- `--nc-radius-xs|sm|md|xl` = 12 / 16 / 24 / 100px.
- `--nc-shadow-2` / `--nc-shadow-3` (élévation carte / dropdown).
- `--nc-ease` = cubic-bezier(.22,1,.36,1).
- Classes `nc-*` : `nc-page-halo`, `nc-shine-card`, `nc-btn-shine`,
  `nc-blink-dot`, `nc-input`, `nc-topbar-pill`, `nc-dropdown-panel`,
  `t-stagger` (texts reveal).
- Dark mode : arbre wrappé dans `ThemeProvider` (toggle `.dark` sur `<html>`).

## Conventions de code
- Aliases : `@/*` → `src/*`, `@/shared/*` → `src/shared/*`.
- Nommage : composants `PascalCase.tsx`, hooks `camelCase.ts` (préfixe `use`),
  types/interfaces `PascalCase`, constantes `SCREAMING_SNAKE_CASE`.
- Composants partagés transverses dans `src/shared/components/`, utils dans
  `src/shared/lib/`. Ne modifie pas directement un composant shadcn après
  install : étends-le via `cva()` ou un wrapper maison.

## Animations / transitions
Référence canonique : le skill `transitions-dev` du repo Infrastructure. Avant
d'écrire une transition/animation, consulte `SKILL.md` + le fichier de référence.
N'invente pas de `@keyframes` ad hoc. Préserve TOUJOURS les guards
`@media (prefers-reduced-motion: reduce)`.

## Règles transverses pour CES pages
- Langue : français. `<html lang="fr">`.
- SEO : chaque page a un `metadata` Next.js (title + description + Open Graph +
  twitter card). Cible « backup Notion », « sauvegarde Notion », « sauvegarde
  automatique Notion ».
- Accessibilité : focus clavier visible, contraste suffisant, responsive mobile,
  `prefers-reduced-motion` respecté.
- Mention OBLIGATOIRE en pied de chaque page : « Notivault n'est pas affilié à
  Notion. » (Notion est une marque de Notion Labs, Inc.)
- Les `{{PLACEHOLDERS}}` dans les pages légales sont intentionnels — à remplir
  par Théo avant déploiement.
