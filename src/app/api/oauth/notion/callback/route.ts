import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { verifyState } from "@/shared/lib/oauth/state";
import { exchangeCode } from "@/shared/lib/notion/oauth";
import { upsertNotionConnection } from "@/shared/lib/notion/connection";

// Callback OAuth Notion : vérifie le state, identifie l'utilisateur via la
// session Notivault, échange le code côté serveur, stocke les tokens dans Vault
// et upsert la connexion. Le token ne transite jamais vers le client.
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const back = (params: string) =>
    NextResponse.redirect(new URL(`/connexions?${params}`, request.url));

  // Annulation / refus côté Notion.
  const oauthError = searchParams.get("error");
  if (oauthError) return back("error=cancelled");

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const payload = verifyState(state, { provider: "notion" });
  if (!payload || payload.userId !== user.id || !code) {
    return back("error=state");
  }

  try {
    const tokens = await exchangeCode(code);
    await upsertNotionConnection(user.id, tokens);
  } catch {
    return back("error=exchange");
  }

  return back("connected=1");
}
