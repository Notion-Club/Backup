import type { ReactNode } from "react";
import styles from "./legal.module.css";

/**
 * Gabarit des pages légales : H1 + sous-titre optionnel, corps en mesure de
 * lecture confortable (~70ch), et la mention obligatoire d'indépendance vis-à-vis
 * de Notion en pied de document.
 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 pt-16 pb-20 md:px-6 md:pt-20">
      <header className="mb-10">
        <h1
          className="text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h1>
        {updated && (
          <p
            className="mt-3 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            {updated}
          </p>
        )}
      </header>

      <div className={styles.prose}>{children}</div>

      <p
        className="mt-12 border-t pt-6 text-xs"
        style={{
          borderColor: "var(--color-border-default)",
          color: "var(--color-text-muted)",
        }}
      >
        Notivault n&apos;est pas affilié à Notion.
      </p>
    </article>
  );
}
