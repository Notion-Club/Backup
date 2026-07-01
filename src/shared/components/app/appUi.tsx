import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

// Primitives présentationnelles de l'app authentifiée, sur le design system.

export function AppContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      {children}
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--color-brand)" }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="mt-2 text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-base" style={{ color: "var(--color-text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const BANNER_STYLES = {
  success: { bg: "rgba(34, 197, 94, 0.12)", color: "var(--color-text-primary)" },
  error: {
    bg: "color-mix(in srgb, var(--destructive) 12%, transparent)",
    color: "var(--destructive)",
  },
  info: { bg: "rgba(224, 98, 90, 0.10)", color: "var(--color-text-secondary)" },
} as const;

export function Banner({
  variant,
  children,
}: {
  variant: keyof typeof BANNER_STYLES;
  children: ReactNode;
}) {
  const s = BANNER_STYLES[variant];
  return (
    <div
      role="status"
      className="mb-6 rounded-2xl px-4 py-3 text-sm"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {children}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-2xl border p-5", className)}
      style={{
        backgroundColor: "var(--color-surface-card)",
        borderColor: "var(--color-border-default)",
      }}
    >
      {children}
    </div>
  );
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active: {
    bg: "var(--nc-status-accepted-bg)",
    color: "var(--nc-status-accepted-text)",
    label: "Actif",
  },
  revoked: {
    bg: "var(--nc-status-noshown-bg)",
    color: "var(--nc-status-noshown-text)",
    label: "Révoqué",
  },
  error: {
    bg: "var(--nc-status-noshown-bg)",
    color: "var(--nc-status-noshown-text)",
    label: "Erreur",
  },
  disabled: {
    bg: "var(--color-surface-raised)",
    color: "var(--color-text-muted)",
    label: "Désactivé",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? {
    bg: "var(--color-surface-raised)",
    color: "var(--color-text-muted)",
    label: status,
  };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

const LINK_BUTTON_BASE =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold " +
  "transition-[filter,transform] duration-200 outline-none motion-reduce:transition-none " +
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--color-brand)] " +
  "focus-visible:ring-offset-[color:var(--color-surface-page)] motion-safe:hover:-translate-y-0.5";

// Bouton-lien primaire brand. `external` (ex. route API GET qui redirige) rend
// une balise <a> plutôt qu'un <Link> (pas de navigation client).
export function LinkButton({
  href,
  children,
  external = false,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const isPrimary = variant === "primary";
  const cls = cn(
    LINK_BUTTON_BASE,
    isPrimary ? "text-white hover:brightness-95" : "border hover:brightness-[0.98]",
    className,
  );
  const style = isPrimary
    ? { backgroundColor: "var(--color-brand)" }
    : {
        color: "var(--color-text-primary)",
        background: "var(--color-surface-card)",
        borderColor: "var(--color-border-default)",
      };
  if (external) {
    return (
      <a href={href} className={cls} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} style={style}>
      {children}
    </Link>
  );
}
