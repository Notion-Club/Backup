import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { verifyState } from "@/shared/lib/oauth/state";

// Callback d'installation GitHub App (configuré comme Setup URL de l'App).
// GitHub renvoie installation_id + setup_action + state. Crée une destination
// GitHub liée à l'utilisateur (config.installation_id ; pas de secret par
// destination : la clé privée de l'App est globale en env).
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const back = (params: string) =>
    NextResponse.redirect(new URL(`/backups?${params}`, request.url));

  const installationId = searchParams.get("installation_id");
  const state = searchParams.get("state");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const payload = verifyState(state, { provider: "github" });
  if (!payload || payload.userId !== user.id || !installationId) {
    return back("error=github_state");
  }
  const installNum = Number(installationId);
  if (!Number.isFinite(installNum)) return back("error=github_state");

  // Dé-doublonnage : réutilise une destination existante pour cette installation.
  const { data: existing } = await supabase
    .from("destinations")
    .select("id, config")
    .eq("type", "github");
  const match = existing?.find(
    (d) =>
      Number((d.config as { installation_id?: number } | null)?.installation_id) ===
      installNum,
  );
  if (match) return back(`destination=${match.id}`);

  const { data: inserted, error } = await supabase
    .from("destinations")
    .insert({
      user_id: user.id,
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
