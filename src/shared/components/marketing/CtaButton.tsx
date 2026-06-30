import Link from "next/link";
import { cn } from "@/shared/lib/utils";

type Variant = "primary" | "secondary";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 h-11 text-sm font-semibold " +
  "transition-[transform,box-shadow,filter] duration-200 outline-none motion-reduce:transition-none " +
  "focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-[color:var(--color-surface-page)]";

/**
 * CTA du site public. `primary` = pill brand (#e0625a). `secondary` = pill
 * surface bordée. Le lift au hover est gardé par `motion-safe:`. S'appuie sur
 * next/link pour les routes internes et les ancres.
 */
export function CtaButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      className={cn(
        BASE,
        "motion-safe:hover:-translate-y-0.5",
        isPrimary
          ? "text-white hover:brightness-95 hover:shadow-[0_10px_24px_-8px_rgba(224,98,90,0.6)]"
          : "border hover:brightness-[0.98]",
        className,
      )}
      style={
        isPrimary
          ? { backgroundColor: "var(--color-brand)" }
          : {
              color: "var(--color-text-primary)",
              background: "var(--color-surface-card)",
              borderColor: "var(--color-border-default)",
            }
      }
    >
      {children}
    </Link>
  );
}
