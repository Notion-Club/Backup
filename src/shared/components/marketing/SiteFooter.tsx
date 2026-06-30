import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { EMAIL_SUPPORT } from "@/shared/lib/site";

const NAV_LINKS: Array<{ label: string; href: string; external?: boolean }> = [
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions", href: "/conditions" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Support", href: `mailto:${EMAIL_SUPPORT}`, external: true },
];

/**
 * Pied de page public partagé. Trois zones : identité + tagline, liens légaux,
 * et la mention obligatoire d'indépendance vis-à-vis de Notion + copyright.
 */
export function SiteFooter() {
  return (
    <footer
      className="mt-24"
      style={{
        backgroundColor: "var(--color-surface-card)",
        borderTop: "1px solid var(--color-border-default)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Zone 1 — identité */}
          <div className="max-w-xs">
            <Wordmark />
            <p
              className="mt-3 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Sauvegardes automatiques et sécurisées pour Notion.
            </p>
          </div>

          {/* Zone 2 — liens */}
          <nav aria-label="Liens de pied de page">
            <ul className="flex flex-col gap-3 md:items-end">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-sm transition-colors hover:underline focus-visible:outline-none focus-visible:underline"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:underline focus-visible:outline-none focus-visible:underline"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Zone 3 — mentions légales obligatoires */}
        <div
          className="mt-10 flex flex-col gap-1 border-t pt-6 text-xs"
          style={{
            borderColor: "var(--color-border-default)",
            color: "var(--color-text-muted)",
          }}
        >
          <p>
            Notivault n&apos;est pas affilié à Notion. Notion est une marque de
            Notion Labs, Inc.
          </p>
          <p>© 2026 Notivault</p>
        </div>
      </div>
    </footer>
  );
}
