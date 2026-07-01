import Link from "next/link";
import { Wordmark } from "@/shared/components/marketing/Wordmark";
import { ThemeToggle } from "@/shared/components/theme/ThemeToggle";

// Layout des pages d'authentification : fond nc-page-halo, en-tête minimal
// (wordmark + thème), carte centrée.
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="nc-page-halo flex flex-col" style={{ minHeight: "100dvh" }}>
      <header className="flex items-center justify-between px-4 py-4 md:px-6">
        <Link
          href="/"
          aria-label="Notivault — accueil"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface-page)]"
        >
          <Wordmark />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
