import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { signState } from "@/shared/lib/oauth/state";
import { buildInstallUrl } from "@/shared/lib/github/app";

// Démarre l'installation de la GitHub App : state signé lié à l'utilisateur →
// page d'installation GitHub.
export async function GET(request: NextRequest): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const state = signState({ userId: user.id, provider: "github" });
  return NextResponse.redirect(buildInstallUrl(state));
}
