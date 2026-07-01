import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le layout (app) garde déjà l'accès ; double garde pour le typage.
  if (!user) redirect("/login");

  // Lit la ligne profiles créée par le trigger M1 handle_new_user — preuve que
  // le compte est bien provisionné côté base.
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.full_name?.trim() || user.email;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <p
        className="text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-brand)" }}
      >
        Tableau de bord
      </p>
      <h1
        className="mt-2 text-3xl font-bold tracking-tight md:text-4xl"
        style={{ color: "var(--color-text-primary)" }}
      >
        Bienvenue{displayName ? `, ${displayName}` : ""}.
      </h1>
      <p className="mt-3 text-base" style={{ color: "var(--color-text-secondary)" }}>
        Connecté en tant que{" "}
        <span style={{ color: "var(--color-text-primary)" }}>{user.email}</span>.
      </p>

      <div
        className="mt-10 rounded-3xl border p-8"
        style={{
          backgroundColor: "var(--color-surface-card)",
          borderColor: "var(--color-border-default)",
        }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>
          Ton espace est prêt. La connexion de tes workspaces Notion et la
          configuration des sauvegardes arrivent bientôt.
        </p>
      </div>
    </div>
  );
}
