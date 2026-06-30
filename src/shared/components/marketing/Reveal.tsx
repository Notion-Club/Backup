"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Reveal au scroll — s'appuie sur le pattern « Texts reveal » (#18) du skill
 * transitions-dev, déjà présent dans globals.css (`.t-stagger` / `.t-stagger-line`,
 * avec son guard `prefers-reduced-motion`). On n'invente aucun @keyframes.
 *
 * Par défaut : le bloc enfant entier monte en fondu flou quand il entre dans le
 * viewport. Avec `stagger`, les enfants fournis (déjà porteurs des classes
 * `t-stagger-line t-stagger-line--N`) s'enchaînent. Avec `immediate`, l'entrée
 * joue au montage (hero au-dessus de la ligne de flottaison).
 */
export function Reveal({
  children,
  className,
  immediate = false,
  stagger = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  immediate?: boolean;
  stagger?: boolean;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (immediate) {
      const id = requestAnimationFrame(() => el.classList.add("is-shown"));
      return () => cancelAnimationFrame(id);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-shown");
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  return (
    <Tag ref={ref} className={cn("t-stagger", className)}>
      {stagger ? children : <div className="t-stagger-line">{children}</div>}
    </Tag>
  );
}
