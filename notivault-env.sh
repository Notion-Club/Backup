#!/usr/bin/env bash
set -uo pipefail
ENV_FILE=".env.local"
DOMAIN="https://notivault.fr"
VERCEL_ENVS=(production preview development)
bold() { printf '\033[1m%s\033[0m\n' "$1"; }
info() { printf '  \033[2m%s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✓ %s\033[0m\n' "$1"; }
warn() { printf '  \033[33m⚠ %s\033[0m\n' "$1"; }
PUSH_VERCEL=true
if ! command -v vercel >/dev/null 2>&1; then
  warn "Vercel CLI absente — je ne poserai QUE .env.local."
  info "Pour Vercel : npm i -g vercel && vercel login && vercel link, puis relance."
  PUSH_VERCEL=false
elif ! vercel whoami >/dev/null 2>&1; then
  warn "Pas connecté à Vercel — je ne poserai QUE .env.local."
  info "Fais 'vercel login' puis 'vercel link' dans ce repo, et relance."
  PUSH_VERCEL=false
fi
if [ -f .gitignore ] && ! grep -qE '\.env\.local' .gitignore; then
  warn ".env.local n'apparait pas dans .gitignore — ajoute-le AVANT de committer."
fi
touch "$ENV_FILE"
upsert_local() {
  local tmp; tmp="$(mktemp)"
  grep -vE "^$1=" "$ENV_FILE" > "$tmp" 2>/dev/null || true
  printf '%s=%s\n' "$1" "$2" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
}
push_vercel() {
  [ "$PUSH_VERCEL" = true ] || return 0
  local env
  for env in "${VERCEL_ENVS[@]}"; do
    vercel env rm "$1" "$env" -y >/dev/null 2>&1 || true
    if printf '%s' "$2" | vercel env add "$1" "$env" >/dev/null 2>&1; then :; else warn "echec Vercel $1 ($env)"; fi
  done
}
ask() {
  local key="$1" hint="$2" secret="$3" value=""
  bold "$key"; info "$hint"
  if [ "$secret" = "1" ]; then printf '  valeur (masquee) : '; read -rs value; echo
  else printf '  valeur : '; read -r value; fi
  if [ -z "$value" ]; then warn "vide, ignore"; return; fi
  upsert_local "$key" "$value"; push_vercel "$key" "$value"
  ok "pose dans .env.local$([ "$PUSH_VERCEL" = true ] && echo ' + Vercel')"; echo
}
bold "== Notivault - variables d'environnement =="; echo
ask NEXT_PUBLIC_SUPABASE_URL "Supabase - Settings - API - Project URL" 0
ask NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY "Supabase - Settings - API - cle publishable (sb_publishable_...)" 0
ask SUPABASE_SECRET_KEY "Supabase - Settings - API - cle secret (sb_secret_...)" 1
ask NOTION_OAUTH_CLIENT_ID "Notion - my-integrations - ton integration - OAuth - Client ID" 0
ask NOTION_OAUTH_CLIENT_SECRET "Notion - ton integration - OAuth - Client secret" 1
ask GITHUB_APP_ID "GitHub App - General - App ID" 0
ask GITHUB_APP_CLIENT_ID "GitHub App - General - Client ID" 0
ask GITHUB_APP_CLIENT_SECRET "GitHub App - General - genere un Client secret" 1
ask GITHUB_APP_SLUG "Le slug dans l'URL github.com/apps/<slug>" 0
bold "OAUTH_STATE_SECRET"; info "Secret anti-CSRF - je peux le generer."
printf '  generer automatiquement ? [O/n] : '; read -r gen
if [[ "$gen" =~ ^[Nn]$ ]]; then printf '  colle ta valeur (masquee) : '; read -rs STATE; echo
else STATE="$(openssl rand -hex 32)"; ok "genere"; fi
if [ -n "${STATE:-}" ]; then upsert_local OAUTH_STATE_SECRET "$STATE"; push_vercel OAUTH_STATE_SECRET "$STATE"; ok "OAUTH_STATE_SECRET pose"; fi
echo
bold "NOTION_OAUTH_REDIRECT_URI"; info "localhost en local, prod sur Vercel."
upsert_local NOTION_OAUTH_REDIRECT_URI "http://localhost:3000/api/oauth/notion/callback"
if [ "$PUSH_VERCEL" = true ]; then
  for env in production preview; do
    vercel env rm NOTION_OAUTH_REDIRECT_URI "$env" >/dev/null 2>&1 || true
    printf '%s' "$DOMAIN/api/oauth/notion/callback" | vercel env add NOTION_OAUTH_REDIRECT_URI "$env" >/dev/null 2>&1 || warn "echec Vercel redirect ($env)"
  done
fi
ok "pose (localhost en local, $DOMAIN en prod)"; echo
bold "Reste GITHUB_APP_PRIVATE_KEY a poser A LA MAIN :"
warn "le .pem multi-ligne -> Vercel dashboard - Settings - Environment Variables - colle le contenu du .pem."
echo
bold "Ensuite : redeploy Vercel + relance 'npm run dev' en local."
