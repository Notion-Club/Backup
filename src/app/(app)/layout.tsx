import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { Wordmark } from "@/shared/components/marketing/Wordmark";
import { ThemeToggle } from "@/shared/components/theme/ThemeToggle";
import { LogoutButton } from "@/shared/components/auth/LogoutButton";

// Route dynamique : dépend de la session (cookies). Jamais prérendue.
export const dynamic = "force-dynamic";

// Layout de l'app authentifiée. Garde d'accès serveur : getUser() (validé
// auprès du serveur Auth ; la session a déjà été rafraîchie par le proxy).
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="nc-page-halo flex flex-col" style={{ minHeight: "100dvh" }}>
      <header
        className="sticky top-0 z-50"
        style={{
          backgroundColor: "var(--color-surface-raised)",
          borderBottom: "1px solid var(--color-border-default)",
        }}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            href="/dashboard"
            aria-label="Notivault — tableau de bord"
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface-raised)]"
          >
            <Wordmark />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
