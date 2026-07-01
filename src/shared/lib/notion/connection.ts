import { createSupabaseAdminClient } from "@/shared/lib/supabase/admin";
import { deleteSecret, rotateSecret, storeSecret } from "@/shared/lib/supabase/vault";
import type { NotionTokenResponse } from "@/shared/lib/notion/oauth";

// Persistance des connexions Notion (serveur, client admin + Vault).

const DEFAULT_EXPIRES_IN_S = 3600;

// Upsert d'une connexion à partir d'une réponse token OAuth. À la reconnexion
// du même workspace (UNIQUE user_id + notion_workspace_id), les secrets Vault
// existants sont ROTÉS au lieu de créer des doublons.
export async function upsertNotionConnection(
  userId: string,
  tok: NotionTokenResponse,
): Promise<void> {
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("notion_connections")
    .select("id, access_token_secret_id, refresh_token_secret_id")
    .eq("user_id", userId)
    .eq("notion_workspace_id", tok.workspace_id)
    .maybeSingle();

  const label = `notion:${tok.workspace_id}`;

  // Access token : rotate si un secret existe déjà, sinon crée.
  let accessSecretId: string;
  if (existing?.access_token_secret_id) {
    await rotateSecret(existing.access_token_secret_id, tok.access_token);
    accessSecretId = existing.access_token_secret_id;
  } else {
    accessSecretId = await storeSecret(tok.access_token, `${label}:access`);
  }

  // Refresh token (optionnel) : rotate/crée, et calcule l'expiration.
  let refreshSecretId: string | null = existing?.refresh_token_secret_id ?? null;
  let tokenExpiresAt: string | null = null;
  if (tok.refresh_token) {
    if (refreshSecretId) {
      await rotateSecret(refreshSecretId, tok.refresh_token);
    } else {
      refreshSecretId = await storeSecret(tok.refresh_token, `${label}:refresh`);
    }
    const expiresInS = tok.expires_in ?? DEFAULT_EXPIRES_IN_S;
    tokenExpiresAt = new Date(Date.now() + expiresInS * 1000).toISOString();
  }

  const { error } = await admin.from("notion_connections").upsert(
    {
      user_id: userId,
      notion_workspace_id: tok.workspace_id,
      workspace_name: tok.workspace_name,
      workspace_icon: tok.workspace_icon,
      bot_id: tok.bot_id,
      access_token_secret_id: accessSecretId,
      refresh_token_secret_id: refreshSecretId,
      token_expires_at: tokenExpiresAt,
      status: "active",
    },
    { onConflict: "user_id,notion_workspace_id" },
  );

  if (error) throw new Error(`Upsert connexion échoué : ${error.message}`);
}

// Déconnexion : supprime la connexion de l'utilisateur + ses secrets Vault.
export async function disconnectNotionConnection(
  userId: string,
  connectionId: string,
): Promise<void> {
  const admin = createSupabaseAdminClient();

  // Vérification d'appartenance explicite (le client admin bypasse la RLS).
  const { data: conn } = await admin
    .from("notion_connections")
    .select("id, access_token_secret_id, refresh_token_secret_id")
    .eq("id", connectionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!conn) return; // rien à faire (déjà supprimée ou pas la sienne)

  if (conn.access_token_secret_id) {
    await deleteSecret(conn.access_token_secret_id).catch(() => {});
  }
  if (conn.refresh_token_secret_id) {
    await deleteSecret(conn.refresh_token_secret_id).catch(() => {});
  }

  await admin.from("notion_connections").delete().eq("id", conn.id);
}
