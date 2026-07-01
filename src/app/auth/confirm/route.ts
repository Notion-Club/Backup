import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// Point d'atterrissage des liens e-mail Supabase (confirmation d'inscription,
// récupération de mot de passe). Établit la session côté serveur (cookies) puis
// redirige vers `next`.
//
// Gère deux formats :
//   • token_hash + type  → verifyOtp (templates personnalisés, cross-device sûr)
//   • code               → exchangeCodeForSession (flow PKCE par défaut)
//
// Template e-mail recommandé (Dashboard → Authentication → Email Templates) :
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(next);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }

  redirect("/login?error=auth_confirm");
}

// N'autorise que des chemins internes (évite les redirections ouvertes).
function sanitizeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}
