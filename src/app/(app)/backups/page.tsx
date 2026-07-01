import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import {
  listInstallationRepos,
  type InstallationRepo,
} from "@/shared/lib/github/app";
import {
  createBackupConfigAction,
  deleteDestinationAction,
  toggleBackupEnabledAction,
  updateDestinationConfigAction,
} from "@/shared/lib/backups/actions";
import {
  AppContainer,
  Banner,
  Card,
  LinkButton,
  PageHeading,
  StatusBadge,
} from "@/shared/components/app/appUi";

export const metadata: Metadata = {
  title: "Sauvegardes",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  github_state: "Lien d'installation GitHub invalide ou expiré. Réessaie.",
  github_save: "Impossible d'enregistrer la destination GitHub.",
  form: "Formulaire incomplet. Vérifie les champs requis.",
  save: "Enregistrement impossible. Réessaie.",
};

const FREQUENCY_LABEL: Record<string, string> = {
  "0 3 * * *": "Quotidien",
  "0 3 * * 1": "Hebdomadaire",
  "0 3 1 * *": "Mensuel",
};

type DestConfig = {
  installation_id?: number;
  repo?: string;
  branch?: string;
  path_prefix?: string;
};

export default async function BackupsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; destination?: string; github?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: destinations }, { data: connections }, { data: configs }, { data: runs }] =
    await Promise.all([
      supabase
        .from("destinations")
        .select("id, type, label, config, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("notion_connections")
        .select("id, workspace_name, status")
        .order("created_at", { ascending: false }),
      supabase
        .from("backup_configs")
        .select("id, notion_connection_id, destination_id, schedule, enabled, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("backup_runs")
        .select("backup_config_id, status, finished_at, created_at")
        .order("created_at", { ascending: false }),
    ]);

  const destList = destinations ?? [];
  const connList = connections ?? [];
  const configList = configs ?? [];

  // Dernier run par config.
  const lastRun = new Map<string, { status: string; at: string | null }>();
  for (const r of runs ?? []) {
    if (!lastRun.has(r.backup_config_id)) {
      lastRun.set(r.backup_config_id, {
        status: r.status,
        at: r.finished_at ?? r.created_at,
      });
    }
  }

  // Repos par destination GitHub (best-effort).
  const reposByDest = new Map<string, InstallationRepo[] | null>();
  await Promise.all(
    destList
      .filter((d) => d.type === "github")
      .map(async (d) => {
        const instId = (d.config as DestConfig | null)?.installation_id;
        if (!instId) return reposByDest.set(d.id, null);
        try {
          reposByDest.set(d.id, await listInstallationRepos(Number(instId)));
        } catch {
          reposByDest.set(d.id, null);
        }
      }),
  );

  const nameByConn = new Map(
    connList.map((c) => [c.id, c.workspace_name || "Workspace Notion"]),
  );
  const labelByDest = new Map(
    destList.map((d) => {
      const cfg = d.config as DestConfig | null;
      return [d.id, cfg?.repo ? `${d.label ?? "GitHub"} · ${cfg.repo}` : d.label ?? "GitHub"];
    }),
  );

  const configuredDestinations = destList.filter(
    (d) => (d.config as DestConfig | null)?.repo,
  );
  const activeConnections = connList.filter((c) => c.status === "active");
  const canCreate = configuredDestinations.length > 0 && activeConnections.length > 0;

  return (
    <AppContainer>
      <PageHeading
        eyebrow="Sauvegardes"
        title="Destinations & jobs"
        subtitle="Connecte une destination GitHub, puis relie un workspace à une destination."
      />

      {sp.github === "connected" && (
        <Banner variant="success">GitHub connecté.</Banner>
      )}
      {sp.destination && (
        <Banner variant="success">
          Destination GitHub prête. Choisis le repo cible ci-dessous.
        </Banner>
      )}
      {sp.error && (
        <Banner variant="error">
          {ERROR_MESSAGES[sp.error] ?? "Une erreur est survenue."}
        </Banner>
      )}

      {/* ── Destinations ─────────────────────────────────────────── */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Destinations
          </h2>
          <LinkButton href="/api/oauth/github/start" external variant="secondary" className="h-9 px-4">
            Connecter GitHub
          </LinkButton>
        </div>

        {destList.length === 0 ? (
          <Card>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Aucune destination. Clique sur « Connecter GitHub » pour installer
              l&apos;app sur un repo.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-3">
            {destList.map((d) => {
              const cfg = (d.config as DestConfig | null) ?? {};
              const repos = reposByDest.get(d.id);
              return (
                <li key={d.id}>
                  <Card>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          {d.label ?? "GitHub"}
                        </span>
                        <StatusBadge status={d.status} />
                      </div>
                      <form action={deleteDestinationAction}>
                        <input type="hidden" name="destinationId" value={d.id} />
                        <button
                          type="submit"
                          className="text-sm font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>

                    <form action={updateDestinationConfigAction} className="grid gap-3 sm:grid-cols-3">
                      <input type="hidden" name="destinationId" value={d.id} />
                      <div className="grid gap-1.5">
                        <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                          Repo cible
                        </label>
                        {repos && repos.length > 0 ? (
                          <select name="repo" defaultValue={cfg.repo ?? ""} className="nc-input" required>
                            <option value="" disabled>
                              Choisir un repo…
                            </option>
                            {repos.map((r) => (
                              <option key={r.full_name} value={r.full_name}>
                                {r.full_name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            name="repo"
                            defaultValue={cfg.repo ?? ""}
                            placeholder="owner/repo"
                            className="nc-input"
                            required
                          />
                        )}
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                          Branche
                        </label>
                        <input name="branch" defaultValue={cfg.branch ?? "main"} className="nc-input" />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                          Préfixe de chemin
                        </label>
                        <input name="pathPrefix" defaultValue={cfg.path_prefix ?? "backups/"} className="nc-input" />
                      </div>
                      <div className="sm:col-span-3">
                        <SubmitPill>Enregistrer la destination</SubmitPill>
                      </div>
                    </form>
                    {repos === null && (
                      <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Impossible de lister les repos (env GitHub App manquante ou
                        installation incomplète) — saisis « owner/repo » manuellement.
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Sauvegardes configurées ──────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Sauvegardes configurées
        </h2>

        {canCreate ? (
          <Card className="mb-6">
            <form action={createBackupConfigAction} className="grid gap-3 sm:grid-cols-4 sm:items-end">
              <SelectField name="notionConnectionId" label="Workspace">
                {activeConnections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.workspace_name || "Workspace Notion"}
                  </option>
                ))}
              </SelectField>
              <SelectField name="destinationId" label="Destination">
                {configuredDestinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {labelByDest.get(d.id)}
                  </option>
                ))}
              </SelectField>
              <SelectField name="frequency" label="Fréquence" defaultValue="daily">
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </SelectField>
              <SubmitPill>Créer la sauvegarde</SubmitPill>
            </form>
          </Card>
        ) : (
          <Card className="mb-6">
            <p style={{ color: "var(--color-text-secondary)" }}>
              Pour créer une sauvegarde, connecte au moins un workspace Notion
              (onglet Connexions) et configure au moins une destination avec un
              repo cible ci-dessus.
            </p>
          </Card>
        )}

        {configList.length === 0 ? (
          <Card>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Aucune sauvegarde configurée pour l&apos;instant.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-3">
            {configList.map((cfg) => {
              const run = lastRun.get(cfg.id);
              return (
                <li key={cfg.id}>
                  <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {nameByConn.get(cfg.notion_connection_id) ?? "Workspace"} →{" "}
                        {labelByDest.get(cfg.destination_id) ?? "Destination"}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {FREQUENCY_LABEL[cfg.schedule] ?? cfg.schedule} · JSON ·{" "}
                        {run
                          ? `dernière exécution : ${run.status}`
                          : "jamais exécutée"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs" style={{ color: cfg.enabled ? "var(--nc-status-accepted-text)" : "var(--color-text-muted)" }}>
                        {cfg.enabled ? "Actif" : "En pause"}
                      </span>
                      <form action={toggleBackupEnabledAction}>
                        <input type="hidden" name="configId" value={cfg.id} />
                        <input type="hidden" name="enable" value={cfg.enabled ? "false" : "true"} />
                        <button
                          type="submit"
                          className="rounded-full border px-3 py-1.5 text-sm font-medium hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)]"
                          style={{
                            color: "var(--color-text-primary)",
                            background: "var(--color-surface-card)",
                            borderColor: "var(--color-border-default)",
                          }}
                        >
                          {cfg.enabled ? "Mettre en pause" : "Activer"}
                        </button>
                      </form>
                      {/* Exécution réelle câblée en M2d (insertion d'un run 'pending'). */}
                      <button
                        type="button"
                        disabled
                        title="Disponible avec le runner (M2d)"
                        className="rounded-full px-3 py-1.5 text-sm font-medium text-white opacity-50"
                        style={{ backgroundColor: "var(--color-brand)" }}
                      >
                        Lancer maintenant
                      </button>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppContainer>
  );
}

function SubmitPill({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition-[filter] duration-200 outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-[color:var(--color-surface-card)] motion-reduce:transition-none"
      style={{ backgroundColor: "var(--color-brand)" }}
    >
      {children}
    </button>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </label>
      <select name={name} defaultValue={defaultValue} className="nc-input" required>
        {children}
      </select>
    </div>
  );
}
