import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/shared/lib/database.types";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Client Supabase pour le browser (Client Components). Clé publishable.
// La session est lue/écrite via cookies (partagée avec le serveur SSR).
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabasePublishableKey());
}
