import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { disconnectNotionAction } from "@/shared/lib/notion/actions";
import {
  AppContainer,
  Banner,
  Card,
  LinkButton,
  PageHeading,
  StatusBadge,
} from "@/shared/components/app/appUi";

export const metadata: Metadata = {
  title: "Connexions Notion",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "Connexion annulée. Aucun workspace n'a été ajouté.",
  state: "Lien de connexion invalide ou expiré. Réessaie.",
  exchange: "La connexion à Notion a échoué. Réessaie dans un instant.",
};

export default async function ConnexionsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: connections } = await supabase
    .from("notion_connections")
    .select("id, workspace_name, workspace_icon, notion_workspace_id, status, created_at")
    .order("created_at", { ascending: false });

  const list = connections ?? [];

  return (
    <AppContainer>
      <PageHeading
        eyebrow="Notion"
        title="Workspaces connectés"
        subtitle="Connecte les workspaces Notion que tu veux sauvegarder."
        action={
          <LinkButton href="/api/oauth/notion/start" external>
            Connecter un workspace Notion
          </LinkButton>
        }
      />

      {sp.connected && (
        <Banner variant="success">Workspace Notion connecté avec succès.</Banner>
      )}
      {sp.error && (
        <Banner variant="error">
          {ERROR_MESSAGES[sp.error] ?? "Une erreur est survenue."}
        </Banner>
      )}

      {list.length === 0 ? (
        <Card>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Aucun workspace connecté pour l&apos;instant. Clique sur « Connecter un
            workspace Notion » pour commencer.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {list.map((c) => (
            <li key={c.id}>
              <Card className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <WorkspaceIcon icon={c.workspace_icon} />
                  <div className="min-w-0">
                    <p
                      className="truncate font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {c.workspace_name || "Workspace Notion"}
                    </p>
                    <p className="truncate text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {c.notion_workspace_id}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={c.status} />
                  <form action={disconnectNotionAction}>
                    <input type="hidden" name="connectionId" value={c.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium transition-colors hover:underline focus-visible:underline focus-visible:outline-none"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Déconnecter
                    </button>
                  </form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </AppContainer>
  );
}

function WorkspaceIcon({ icon }: { icon: string | null }) {
  const isUrl = typeof icon === "string" && /^https?:\/\//.test(icon);
  return (
    <span
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg"
      style={{
        backgroundColor: "var(--color-surface-raised)",
        border: "1px solid var(--color-border-default)",
      }}
      aria-hidden
    >
      {isUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon as string} alt="" className="h-full w-full object-cover" />
      ) : (
        icon || "📄"
      )}
    </span>
  );
}
