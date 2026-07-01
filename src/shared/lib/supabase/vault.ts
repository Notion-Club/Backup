import { createClient } from "@supabase/supabase-js";
import { supabaseSecretKey, supabaseUrl } from "./env";

// Accès aux secrets Vault depuis le serveur (rôle service_role, clé secret).
// Les fonctions vivent dans le schéma privé `internal` (cf. migration 004),
// non exposé aux rôles client. On les appelle en RPC via un client dont le
// schéma par défaut est `internal`.
//
// ⚠️ PRÉREQUIS Supabase : exposer le schéma `internal` à la Data API
//    (Dashboard → Project Settings → API → Exposed schemas → ajouter `internal`).
//    L'EXECUTE reste réservé à service_role (les rôles anon/authenticated
//    n'ont ni USAGE sur le schéma ni EXECUTE sur les fonctions).
//
// ⚠️ Serveur uniquement — ne jamais importer côté client.

function vaultClient() {
  return createClient(supabaseUrl(), supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "internal" },
  });
}

/** Crée un secret Vault, renvoie son UUID. */
export async function storeSecret(
  plaintext: string,
  label?: string,
): Promise<string> {
  const { data, error } = await vaultClient().rpc("store_secret", {
    plaintext,
    label: label ?? null,
  });
  if (error) throw new Error(`store_secret a échoué : ${error.message}`);
  return data as string;
}

/** Renvoie le secret déchiffré. */
export async function readSecret(secretId: string): Promise<string> {
  const { data, error } = await vaultClient().rpc("read_secret", {
    secret_id: secretId,
  });
  if (error) throw new Error(`read_secret a échoué : ${error.message}`);
  if (data == null) throw new Error(`Secret introuvable : ${secretId}`);
  return data as string;
}

/** Remplace la valeur d'un secret existant. */
export async function rotateSecret(
  secretId: string,
  plaintext: string,
): Promise<void> {
  const { error } = await vaultClient().rpc("rotate_secret", {
    secret_id: secretId,
    plaintext,
  });
  if (error) throw new Error(`rotate_secret a échoué : ${error.message}`);
}

/** Supprime définitivement un secret. */
export async function deleteSecret(secretId: string): Promise<void> {
  const { error } = await vaultClient().rpc("delete_secret", {
    secret_id: secretId,
  });
  if (error) throw new Error(`delete_secret a échoué : ${error.message}`);
}
