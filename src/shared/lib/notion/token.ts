import { createSupabaseAdminClient } from "@/shared/lib/supabase/admin";
import { readSecret, rotateSecret } from "@/shared/lib/supabase/vault";
import {
  NotionOAuthError,
  refreshAccessToken,
} from "@/shared/lib/notion/oauth";

// Renvoie un access token Notion VALIDE pour une connexion, en rafraîchissant
// et en faisant tourner les secrets si nécessaire. Réutilisé tel quel par le
// runner M2d. Serveur uniquement (client admin + Vault).

// Marge avant expiration : on rafraîchit un peu en avance.
const EXPIRY_BUFFER_MS = 60 * 1000;
// Expiration par défaut si Notion renvoie un refresh_token sans expires_in.
const DEFAULT_EXPIRES_IN_S = 3600;

export class NotionReconnectRequired extends Error {
  connectionId: string;
  constructor(connectionId: string, message: string) {
    super(message);
    this.connectionId = connectionId;
    this.name = "NotionReconnectRequired";
  }
}

// Single-flight : un seul refresh concurrent par connexion dans ce process
// (évite les races de rotation ; le runner VPS est un process long-vivant).
const inflight = new Map<string, Promise<string>>();

export function getValidNotionToken(connectionId: string): Promise<string> {
  const existing = inflight.get(connectionId);
  if (existing) return existing;

  const promise = resolveToken(connectionId).finally(() => {
    inflight.delete(connectionId);
  });
  inflight.set(connectionId, promise);
  return promise;
}

async function resolveToken(connectionId: string): Promise<string> {
  const admin = createSupabaseAdminClient();

  const { data: conn, error } = await admin
    .from("notion_connections")
    .select(
      "id, status, access_token_secret_id, refresh_token_secret_id, token_expires_at",
    )
    .eq("id", connectionId)
    .maybeSingle();

  if (error) throw new Error(`Lecture connexion échouée : ${error.message}`);
  if (!conn) throw new Error(`Connexion introuvable : ${connectionId}`);
  if (conn.status === "revoked") {
    throw new NotionReconnectRequired(
      connectionId,
      "Cette connexion Notion a été révoquée. Reconnecte ce workspace.",
    );
  }
  if (!conn.access_token_secret_id) {
    throw new Error(`Connexion ${connectionId} sans access token.`);
  }

  // Token non-expirant : lecture directe.
  if (!conn.token_expires_at) {
    return readSecret(conn.access_token_secret_id);
  }

  const expiresAt = new Date(conn.token_expires_at).getTime();
  const isFresh = Date.now() + EXPIRY_BUFFER_MS < expiresAt;
  if (isFresh) {
    return readSecret(conn.access_token_secret_id);
  }

  // Expiration proche/dépassée → refresh + rotation.
  if (!conn.refresh_token_secret_id) {
    throw new NotionReconnectRequired(
      connectionId,
      "Token expiré et aucun refresh token. Reconnecte ce workspace.",
    );
  }

  const currentRefresh = await readSecret(conn.refresh_token_secret_id);

  let refreshed;
  try {
    refreshed = await refreshAccessToken(currentRefresh);
  } catch (err) {
    if (err instanceof NotionOAuthError && err.code === "invalid_grant") {
      await admin
        .from("notion_connections")
        .update({ status: "revoked" })
        .eq("id", connectionId);
      throw new NotionReconnectRequired(
        connectionId,
        "Le refresh token Notion a été révoqué ou a expiré. Reconnecte ce workspace.",
      );
    }
    throw err;
  }

  // Persiste le NOUVEL access token et le NOUVEAU refresh token (rotation).
  await rotateSecret(conn.access_token_secret_id, refreshed.access_token);
  if (refreshed.refresh_token) {
    await rotateSecret(conn.refresh_token_secret_id, refreshed.refresh_token);
  }

  const expiresInS = refreshed.expires_in ?? DEFAULT_EXPIRES_IN_S;
  const newExpiry = new Date(Date.now() + expiresInS * 1000).toISOString();
  await admin
    .from("notion_connections")
    .update({ token_expires_at: newExpiry, status: "active" })
    .eq("id", connectionId);

  return refreshed.access_token;
}
