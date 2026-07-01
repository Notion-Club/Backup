import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Proxy Next.js 16 (ex-middleware) — rafraîchit la session Supabase à chaque
// requête et écrit les cookies mis à jour. Tourne sur le runtime Node.js (le
// proxy ne supporte pas l'Edge), ce qui évite le bug __dirname du client SSR
// en Edge/Turbopack.
//
// Sécurité : le vrai garde d'accès est fait côté serveur dans le layout (app)
// via getUser(). Ici on rafraîchit la session et on redirige tôt les accès
// non authentifiés aux routes protégées (défense en profondeur).
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Environnement non configuré (ex. build, dev sans .env.local) : no-op.
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() valide le JWT auprès du serveur Auth et déclenche le refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirection précoce des routes protégées si pas de session.
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Exclut les assets statiques et les fichiers de métadonnées.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|robots.txt|sitemap.xml|.*\\.png$).*)",
  ],
};
