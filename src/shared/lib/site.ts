// Constantes transverses du site public Notivault.
// EMAIL_SUPPORT a une valeur par défaut connue (utilisée pour la soumission de
// l'intégration Notion). Les autres informations légales (raison sociale,
// adresse, SIREN…) restent en {{PLACEHOLDERS}} dans les pages légales, à
// renseigner avant déploiement.
export const EMAIL_SUPPORT = "support@notivault.fr";

// Ancre des CTA en attendant le vrai flow OAuth Notion.
export const CTA_CONNECT_HREF = "/#connexion";

// Destinations de sauvegarde supportées (l'utilisateur dépose chez lui).
export const DESTINATIONS = [
  { name: "Google Drive", soon: false },
  { name: "GitHub", soon: false },
  { name: "SFTP", soon: false },
  { name: "Cloudflare R2", soon: false },
  { name: "OneDrive", soon: true },
] as const;
