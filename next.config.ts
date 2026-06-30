import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ancre la root du workspace ici : Notivault est cloné dans le home dir, à
  // côté d'autres package-lock.json (iCloud, projets voisins). Sans cette
  // ancre, Turbopack remonte l'arbo et émet un warning de root ambiguë.
  // process.cwd() est universel (CJS + ESM, local + Vercel).
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // View Transitions — le design system Notion Club s'en sert pour les
    // transitions de page (cf. globals.css ::view-transition-*). Activé pour
    // rester aligné, même si ces pages publiques restent sobres.
    viewTransition: true,
  },
};

export default nextConfig;
