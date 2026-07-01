import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/shared/lib/database.types";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Client Supabase pour Server Components, Server Actions, Route Handlers.
// Clé publishable + cookies de session : la RLS s'applique avec les droits de
// l'utilisateur connecté (jamais la clé secret ici).
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl(),
    supabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component (lecture seule des cookies) :
            // l'écriture est ignorée. Le rafraîchissement de session est
            // assuré par le proxy (src/proxy.ts) et les Server Actions /
            // Route Handlers, qui peuvent écrire les cookies.
          }
        },
      },
    },
  );
}
