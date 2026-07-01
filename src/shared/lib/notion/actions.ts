"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { disconnectNotionConnection } from "./connection";

// Déconnecte un workspace Notion : supprime la connexion + ses secrets Vault.
export async function disconnectNotionAction(formData: FormData): Promise<void> {
  const connectionId = String(formData.get("connectionId") ?? "");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (connectionId) {
    await disconnectNotionConnection(user.id, connectionId);
  }
  revalidatePath("/connexions");
}
