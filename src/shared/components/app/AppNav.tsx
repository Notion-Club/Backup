"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/connexions", label: "Connexions" },
  { href: "/backups", label: "Sauvegardes" },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex" aria-label="Navigation">
      {LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)]"
            style={{
              color: active
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
              backgroundColor: active ? "var(--nc-nav-active-bg)" : "transparent",
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
