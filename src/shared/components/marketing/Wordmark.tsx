import { cn } from "@/shared/lib/utils";

/**
 * Wordmark Notivault — glyphe coffre/bouclier en couleur brand + libellé.
 * Glyphe purement décoratif (aria-hidden) ; le texte porte le sens.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 font-semibold", className)}
      style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
    >
      <svg
        aria-hidden
        width="22"
        height="22"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M16 4l11 4v7.6c0 6.6-4.5 11.4-11 13.8C9.5 27 5 22.2 5 15.6V8l11-4z"
          fill="var(--color-brand)"
          fillOpacity="0.14"
          stroke="var(--color-brand)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="14.6" r="2.8" fill="var(--color-brand)" />
        <rect x="14.8" y="16.4" width="2.4" height="4.6" rx="1.2" fill="var(--color-brand)" />
      </svg>
      <span style={{ fontSize: 18 }}>Notivault</span>
    </span>
  );
}
