import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { CtaButton } from "./CtaButton";
import { ThemeToggle } from "@/shared/components/theme/ThemeToggle";
import { CTA_CONNECT_HREF } from "@/shared/lib/site";

/**
 * En-tête public partagé par toutes les pages. Sticky en haut, fond
 * `--color-surface-raised` avec hairline `--color-border-default` en bas.
 * Sur mobile : wordmark + CTA (le ThemeToggle est masqué < sm).
 */
export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "var(--color-surface-raised)",
        borderBottom: "1px solid var(--color-border-default)",
      }}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          aria-label="Notivault — accueil"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface-raised)]"
        >
          <Wordmark />
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden sm:inline-flex">
            <ThemeToggle />
          </div>
          <Link
            href="/login"
            className="text-sm font-medium transition-colors hover:underline focus-visible:underline focus-visible:outline-none"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Se connecter
          </Link>
          <CtaButton href={CTA_CONNECT_HREF} className="h-10 px-4">
            Connecter Notion
          </CtaButton>
        </div>
      </div>
    </header>
  );
}
