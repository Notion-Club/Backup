import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { signState } from "@/shared/lib/oauth/state";
import { buildAuthorizeUrl } from "@/shared/lib/notion/oauth";

// Démarre le flow OAuth Notion : state signé lié à l'utilisateur → authorize URL.
export async function GET(request: NextRequest): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const state = signState({ userId: user.id, provider: "notion" });
  return NextResponse.redirect(buildAuthorizeUrl(state));
}
