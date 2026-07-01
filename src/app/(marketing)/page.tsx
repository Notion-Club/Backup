import type { Metadata } from "next";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  HardDrive,
  Plug,
  FolderTree,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  Cloud,
  GitBranch,
  Server,
  Database,
  FileJson,
  FileText,
  BellRing,
} from "lucide-react";
import { Reveal } from "@/shared/components/marketing/Reveal";
import { CtaButton } from "@/shared/components/marketing/CtaButton";
import { CTA_CONNECT_HREF, DESTINATIONS } from "@/shared/lib/site";

export const metadata: Metadata = {
  title: "Notivault — Sauvegarde automatique pour Notion",
  description:
    "Sauvegardez automatiquement vos workspaces Notion vers votre propre stockage (Google Drive, GitHub, SFTP, Cloudflare R2). Vos données restent chez vous.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Notivault — Sauvegarde automatique pour Notion",
    description:
      "Sauvegardez automatiquement vos workspaces Notion vers votre propre stockage. Vos données restent chez vous.",
    url: "/",
  },
};

const SECTION = "mx-auto w-full max-w-6xl px-4 md:px-6";

const cardStyle = {
  backgroundColor: "var(--color-surface-card)",
  borderColor: "var(--color-border-default)",
} as const;

const TRUST_POINTS = [
  {
    icon: HardDrive,
    title: "Vos backups, votre stockage",
    body: "Les sauvegardes partent chez vous, jamais sur nos serveurs.",
  },
  {
    icon: KeyRound,
    title: "Connexion OAuth officielle",
    body: "Via l'API officielle Notion. Accès révocable à tout moment.",
  },
  {
    icon: Lock,
    title: "Tokens chiffrés",
    body: "Vos accès sont chiffrés au repos.",
  },
  {
    icon: FileJson,
    title: "Formats durables",
    body: "JSON (fidèle, pour restaurer) + Markdown (lisible, portable).",
  },
];

const STEPS = [
  {
    icon: Plug,
    title: "Connectez Notion",
    body: "Autorisez Notivault via OAuth, choisissez les pages à sauvegarder.",
  },
  {
    icon: FolderTree,
    title: "Choisissez votre destination",
    body: "Google Drive, GitHub, SFTP ou Cloudflare R2.",
  },
  {
    icon: RefreshCw,
    title: "Notivault sauvegarde automatiquement",
    body: "Selon la fréquence choisie, sans y penser. Vous êtes notifié si une sauvegarde échoue.",
  },
];

const DESTINATION_ICONS: Record<string, typeof Cloud> = {
  "Google Drive": HardDrive,
  GitHub: GitBranch,
  SFTP: Server,
  "Cloudflare R2": Cloud,
  OneDrive: Cloud,
};

const BACKUP_ITEMS = [
  "Pages et sous-pages",
  "Bases de données",
  "Blocs",
  "Commentaires (selon le plan)",
  "Fichiers médias (selon le plan)",
];

export default function HomePage() {
  return (
    <>
      {/* ── 1. Hero ──────────────────────────────────────────────── */}
      <section className={`${SECTION} pt-16 pb-20 md:pt-24 md:pb-28`}>
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-10">
          <Reveal immediate stagger>
            <p
              className="t-stagger-line t-stagger-line--1 mb-4 inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--color-brand)" }}
            >
              <span className="nc-blink-dot" aria-hidden />
              Sauvegarde automatisée pour Notion
            </p>
            <h1
              className="t-stagger-line t-stagger-line--2 text-4xl font-bold tracking-tight md:text-5xl"
              style={{ color: "var(--color-text-primary)", lineHeight: 1.1 }}
            >
              Vos données Notion, sauvegardées automatiquement.
            </h1>
            <p
              className="t-stagger-line t-stagger-line--3 mt-5 text-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Notivault sauvegarde vos workspaces Notion en continu vers VOTRE
              propre stockage. Vous gardez le contrôle, on ne conserve jamais vos
              données.
            </p>
            <div className="t-stagger-line t-stagger-line--3 mt-8 flex flex-wrap items-center gap-3">
              <CtaButton href={CTA_CONNECT_HREF}>Connecter Notion</CtaButton>
              <CtaButton href="#comment" variant="secondary">
                Voir comment ça marche
              </CtaButton>
            </div>
          </Reveal>

          {/* Schéma de flux Notion → Notivault → destination */}
          <Reveal immediate>
            <FlowDiagram />
          </Reveal>
        </div>
      </section>

      {/* ── 2. Bandeau confiance ─────────────────────────────────── */}
      <section className={`${SECTION} pb-20 md:pb-28`}>
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_POINTS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border p-6"
                style={cardStyle}
              >
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "rgba(224, 98, 90, 0.10)",
                    color: "var(--color-brand)",
                  }}
                >
                  <Icon size={20} aria-hidden />
                </span>
                <h3
                  className="mt-4 text-base font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {title}
                </h3>
                <p
                  className="mt-1.5 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── 3. Comment ça marche ─────────────────────────────────── */}
      <section id="comment" className={`${SECTION} scroll-mt-24 pb-20 md:pb-28`}>
        <Reveal>
          <SectionHeading
            eyebrow="Comment ça marche"
            title="Trois étapes, puis plus rien à faire"
          />
        </Reveal>
        <Reveal className="mt-10">
          <ol className="grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className="relative rounded-2xl border p-6"
                style={cardStyle}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--color-brand)" }}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <Icon
                    size={20}
                    aria-hidden
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </div>
                <h3
                  className="mt-4 text-base font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {title}
                </h3>
                <p
                  className="mt-1.5 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* ── 4. Destinations supportées ───────────────────────────── */}
      <section className={`${SECTION} pb-20 md:pb-28`}>
        <Reveal>
          <SectionHeading
            eyebrow="Destinations"
            title="Vos sauvegardes, là où vous les voulez"
          />
        </Reveal>
        <Reveal className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map(({ name, soon }) => {
              const Icon = DESTINATION_ICONS[name] ?? Cloud;
              return (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-2xl border p-5"
                  style={cardStyle}
                >
                  <Icon
                    size={22}
                    aria-hidden
                    style={{ color: "var(--color-text-secondary)" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {name}
                  </span>
                  {soon && (
                    <span
                      className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--color-surface-raised)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Bientôt
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p
            className="mt-5 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            C&apos;est votre stockage, vos identifiants. Notivault ne fait qu&apos;y
            déposer vos sauvegardes.
          </p>
        </Reveal>
      </section>

      {/* ── 5. Ce qu'on sauvegarde ───────────────────────────────── */}
      <section className={`${SECTION} pb-20 md:pb-28`}>
        <Reveal>
          <div
            className="grid gap-8 rounded-3xl border p-8 md:grid-cols-2 md:p-12"
            style={cardStyle}
          >
            <div>
              <SectionHeading
                eyebrow="Ce qu'on sauvegarde"
                title="Votre second cerveau, dans son intégralité"
                align="left"
              />
              <p
                className="mt-4 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Note honnête : la restauration complète dépend des limites de
                l&apos;API Notion.
              </p>
            </div>
            <ul className="grid gap-3 self-center">
              {BACKUP_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <span
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "rgba(224, 98, 90, 0.10)",
                      color: "var(--color-brand)",
                    }}
                  >
                    <Database size={13} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
              <li
                className="mt-1 flex items-center gap-3 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "rgba(224, 98, 90, 0.10)",
                    color: "var(--color-brand)",
                  }}
                >
                  <BellRing size={13} aria-hidden />
                </span>
                Alerte en cas d&apos;échec de sauvegarde
              </li>
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ── 6. CTA final ─────────────────────────────────────────── */}
      <section id="connexion" className={`${SECTION} scroll-mt-24 pb-24 md:pb-32`}>
        <Reveal>
          <div
            className="overflow-hidden rounded-3xl border px-6 py-14 text-center md:px-12 md:py-20"
            style={cardStyle}
          >
            <ShieldCheck
              size={36}
              aria-hidden
              className="mx-auto"
              style={{ color: "var(--color-brand)" }}
            />
            <h2
              className="mx-auto mt-5 max-w-2xl text-2xl font-bold tracking-tight md:text-3xl"
              style={{ color: "var(--color-text-primary)" }}
            >
              Arrêtez de risquer de perdre votre second cerveau.
            </h2>
            <p
              className="mx-auto mt-3 max-w-xl text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Connectez votre workspace en quelques secondes et laissez Notivault
              s&apos;occuper du reste.
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButton href={CTA_CONNECT_HREF}>Connecter Notion</CtaButton>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/* ── Sous-composants locaux (server components) ──────────────────── */

function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      <p
        className="text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-brand)" }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-2 text-2xl font-bold tracking-tight md:text-3xl"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h2>
    </div>
  );
}

function FlowDiagram() {
  const nodes = [
    { icon: FileText, label: "Notion", sub: "Vos workspaces" },
    { icon: ShieldCheck, label: "Notivault", sub: "Transit chiffré", brand: true },
    { icon: HardDrive, label: "Votre stockage", sub: "Drive · GitHub · R2…" },
  ];
  return (
    <div
      className="rounded-3xl border p-6 md:p-8"
      style={cardStyle}
      aria-label="Flux : Notion vers Notivault vers votre stockage"
    >
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
        {nodes.map(({ icon: Icon, label, sub, brand }, i) => (
          <div key={label} className="flex flex-col items-stretch gap-3 md:flex-1 md:flex-row md:items-center">
            <div
              className="flex flex-1 items-center gap-3 rounded-2xl border p-4"
              style={{
                backgroundColor: brand
                  ? "rgba(224, 98, 90, 0.08)"
                  : "var(--color-surface-page)",
                borderColor: brand
                  ? "rgba(224, 98, 90, 0.25)"
                  : "var(--color-border-default)",
              }}
            >
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: brand
                    ? "var(--color-brand)"
                    : "var(--color-surface-card)",
                  color: brand ? "#fff" : "var(--color-text-secondary)",
                  border: brand ? "none" : "1px solid var(--color-border-default)",
                }}
              >
                <Icon size={18} aria-hidden />
              </span>
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {label}
                </p>
                <p
                  className="truncate text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {sub}
                </p>
              </div>
            </div>
            {i < nodes.length - 1 && (
              <span
                className="mx-auto shrink-0"
                style={{ color: "var(--color-text-muted)" }}
                aria-hidden
              >
                <ArrowRight size={18} className="hidden md:block" />
                <ArrowDown size={18} className="md:hidden" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
