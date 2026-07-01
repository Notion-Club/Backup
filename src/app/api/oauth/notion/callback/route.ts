import { NextResponse, type NextRequest } from "next/server";
import { verifyState } from "@/shared/lib/oauth/state";
import { exchangeCode } from "@/shared/lib/notion/oauth";
import { upsertNotionConnection } from "@/shared/lib/notion/connection";

// Callback OAuth Notion : vérifie le state, échange le code côté serveur, stocke
// les tokens dans Vault et upsert la connexion. Le token ne transite jamais
// vers le client.
//
// ⚠️ Identité : comme pour le callback GitHub, on n'identifie PAS l'utilisateur
// via getUser() (cookie de session non fiable au retour d'une redirection
// cross-site). L'utilisateur vient du `state` signé HMAC (userId + nonce
// anti-CSRF), vérifié ci-dessous. L'upsert se fait via le client admin.
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const back = (params: string) =>
    NextResponse.redirect(new URL(`/connexions?${params}`, request.url));

  // Annulation / refus côté Notion.
  const oauthError = searchParams.get("error");
  if (oauthError) return back("error=cancelled");

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Vérifie signature + nonce + fraîcheur + provider, et extrait le userId.
  const payload = verifyState(state, { provider: "notion" });
  if (!payload || !code) return back("error=state");

  try {
    const tokens = await exchangeCode(code);
    await upsertNotionConnection(payload.userId, tokens);
  } catch {
    return back("error=exchange");
  }

  return back("connected=1");
}
