"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// Actions de config des sauvegardes. Toutes via le client SSR → RLS M1
// (user_id = auth.uid()). Rien ne contourne la RLS ici.

// Fréquence UI → expression cron (exécution nocturne à 03:00).
const CRON_BY_FREQUENCY: Record<string, string> = {
  daily: "0 3 * * *",
  weekly: "0 3 * * 1",
  monthly: "0 3 1 * *",
};

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// Configure une destination GitHub : repo cible + branche + préfixe de chemin.
// Préserve installation_id (non modifié par l'utilisateur).
export async function updateDestinationConfigAction(
  formData: FormData,
): Promise<void> {
  const { supabase } = await requireUser();
  const destinationId = String(formData.get("destinationId") ?? "");
  const repo = String(formData.get("repo") ?? "").trim();
  const branch = String(formData.get("branch") ?? "").trim() || "main";
  const pathPrefix = String(formData.get("pathPrefix") ?? "").trim() || "backups/";

  if (!destinationId || !repo) redirect("/backups?error=form");

  const { data: dest } = await supabase
    .from("destinations")
    .select("config")
    .eq("id", destinationId)
    .maybeSingle();
  if (!dest) redirect("/backups?error=form");

  const currentConfig = (dest.config as Record<string, unknown>) ?? {};
  const { error } = await supabase
    .from("destinations")
    .update({
      config: { ...currentConfig, repo, branch, path_prefix: pathPrefix },
    })
    .eq("id", destinationId);
  if (error) redirect("/backups?error=save");

  revalidatePath("/backups");
}

// Supprime une destination (RLS). Pas de secret à supprimer (clé App globale).
export async function deleteDestinationAction(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const destinationId = String(formData.get("destinationId") ?? "");
  if (destinationId) {
    await supabase.from("destinations").delete().eq("id", destinationId);
  }
  revalidatePath("/backups");
}

// Crée un backup_config reliant un workspace à une destination.
export async function createBackupConfigAction(
  formData: FormData,
): Promise<void> {
  const { supabase, user } = await requireUser();
  const notionConnectionId = String(formData.get("notionConnectionId") ?? "");
  const destinationId = String(formData.get("destinationId") ?? "");
  const frequency = String(formData.get("frequency") ?? "daily");
  const schedule = CRON_BY_FREQUENCY[frequency] ?? CRON_BY_FREQUENCY.daily;

  if (!notionConnectionId || !destinationId) redirect("/backups?error=form");

  // Vérifie l'appartenance des deux références (la RLS ne renvoie que les
  // lignes de l'utilisateur : un id étranger ne matchera pas).
  const [{ data: conn }, { data: dest }] = await Promise.all([
    supabase
      .from("notion_connections")
      .select("id")
      .eq("id", notionConnectionId)
      .maybeSingle(),
    supabase
      .from("destinations")
      .select("id")
      .eq("id", destinationId)
      .maybeSingle(),
  ]);
  if (!conn || !dest) redirect("/backups?error=form");

  const { error } = await supabase.from("backup_configs").insert({
    user_id: user.id,
    notion_connection_id: notionConnectionId,
    destination_id: destinationId,
    schedule,
    scope: { mode: "all" },
    format: "json",
    enabled: true,
  });
  if (error) redirect("/backups?error=save");

  revalidatePath("/backups");
}

// Bascule enabled d'un backup_config.
export async function toggleBackupEnabledAction(
  formData: FormData,
): Promise<void> {
  const { supabase } = await requireUser();
  const configId = String(formData.get("configId") ?? "");
  const enable = String(formData.get("enable") ?? "") === "true";
  if (configId) {
    await supabase
      .from("backup_configs")
      .update({ enabled: enable })
      .eq("id", configId);
  }
  revalidatePath("/backups");
}
