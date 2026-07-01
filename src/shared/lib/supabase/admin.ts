import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/database.types";
import { supabaseSecretKey, supabaseUrl } from "./env";

// Client Supabase serveur PRIVILÉGIÉ (clé secret) : bypasse la RLS.
// ⚠️ Serveur uniquement — ne JAMAIS importer dans du code client. Réservé aux
// opérations privilégiées (ex. appels aux fonctions Vault `internal.*` en M2b).
// Session non persistée : usage ponctuel par requête.
export function createSupabaseAdminClient() {
  return createClient<Database>(supabaseUrl(), supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
