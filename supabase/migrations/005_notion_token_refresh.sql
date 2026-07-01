-- Notivault — M2b : gestion du refresh token Notion.
-- Migration 005 — colonnes de rotation de token sur notion_connections.
--
-- Notion peut émettre des access tokens EXPIRANTS accompagnés d'un refresh
-- token qu'il FAIT TOURNER (nouveau refresh à chaque refresh). On stocke le
-- refresh token comme secret Vault (UUID) + l'expiration de l'access token.
-- Les deux colonnes sont NULLABLES : un token non-expirant les laisse à NULL.

alter table public.notion_connections
  add column if not exists refresh_token_secret_id uuid;

alter table public.notion_connections
  add column if not exists token_expires_at timestamptz;

comment on column public.notion_connections.refresh_token_secret_id is
  'UUID d''un secret Vault = refresh token OAuth Notion (NULL si token non-expirant).';
comment on column public.notion_connections.token_expires_at is
  'Expiration de l''access token Notion (NULL si non-expirant).';
