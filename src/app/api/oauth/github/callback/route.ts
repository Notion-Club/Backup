import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/shared/lib/supabase/admin";
import { verifyState } from "@/shared/lib/oauth/state";

// Callback d'installation GitHub App (configuré comme Setup URL de l'App).
// GitHub renvoie installation_id + setup_action + state. Crée une destination
// GitHub liée à l'utilisateur (config.installation_id ; pas de secret par
// destination : la clé privée de l'App est globale en env).
//
// ⚠️ Identité : au retour d'une installation GitHub (redirection cross-site),
// le cookie de session Supabase n'est PAS fiable (SameSite). On ne se repose
// donc pas sur getUser() : l'utilisateur est identifié par le `state` signé
// HMAC (OAUTH_STATE_SECRET), qui porte déjà le userId + un nonce anti-CSRF. La
// destination est créée pour ce userId via le client admin (service key).
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const back = (params: string) =>
    NextResponse.redirect(new URL(`/backups?${params}`, request.url));

  const installationId = searchParams.get("installation_id");
  const state = searchParams.get("state");

  // Vérifie signature + nonce + fraîcheur + provider, et extrait le userId.
  const payload = verifyState(state, { provider: "github" });
  if (!payload || !installationId) return back("error=github_state");

  const installNum = Number(installationId);
  if (!Number.isFinite(installNum)) return back("error=github_state");

  const userId = payload.userId;
  const admin = createSupabaseAdminClient();

  // Dé-doublonnage scopé à l'utilisateur (le client admin bypasse la RLS :
  // on filtre donc explicitement par user_id) : réutilise une destination
  // existante pour cette installation.
  const { data: existing } = await admin
    .from("destinations")
    .select("id, config")
    .eq("type", "github")
    .eq("user_id", userId);
  const match = existing?.find(
    (d) =>
      Number((d.config as { installation_id?: number } | null)?.installation_id) ===
      installNum,
  );
  if (match) return back(`destination=${match.id}`);

  const { data: inserted, error } = await admin
    .from("destinations")
    .insert({
      user_id: userId,
      type: "github",
      label: "GitHub",
      config: { installation_id: installNum },
      status: "active",
    })
    .select("id")
    .single();

  if (error || !inserted) return back("error=github_save");
  return back(`destination=${inserted.id}`);
}
