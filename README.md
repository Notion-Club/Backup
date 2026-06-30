# Notivault

Site public de **Notivault** — SaaS de sauvegarde automatisée pour Notion. Les
sauvegardes d'un utilisateur partent vers **sa propre destination** (Google
Drive, GitHub, SFTP, Cloudflare R2 ; OneDrive à venir) : Notivault n'héberge
jamais le contenu Notion durablement.

Ce repo couvre le jalon **pages publiques** nécessaires pour soumettre
l'intégration publique OAuth2 à Notion : accueil + confidentialité + conditions
+ mentions légales.

## Stack

- Next.js 16.2 (App Router + Turbopack, RSC), React 19, TypeScript 5
- Tailwind CSS v4 (config CSS-first), design system Notion Club répliqué depuis
  le repo `Notion-Club/Infrastructure` (tokens + classes `nc-*`, SF Pro Display)
- shadcn/ui « new-york », icônes lucide-react
- Thème light / dark / system sans flash (ThemeProvider maison + script inline)

## Développement

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
npm run lint
```

## Routes

| Route               | Page                        |
| ------------------- | --------------------------- |
| `/`                 | Accueil                     |
| `/confidentialite`  | Politique de confidentialité |
| `/conditions`       | Conditions d'utilisation    |
| `/mentions-legales` | Mentions légales            |

SEO : `robots.txt`, `sitemap.xml` et image Open Graph générés automatiquement.

## À faire avant déploiement

Les pages légales contiennent des `{{PLACEHOLDERS}}` (raison sociale, adresse,
SIREN, hébergeur, date de mise à jour…) à renseigner avant mise en ligne. Voir
`CLAUDE.md` pour le contexte design system et les conventions.

> Notivault n'est pas affilié à Notion. Notion est une marque de Notion Labs, Inc.
