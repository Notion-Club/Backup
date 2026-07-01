import type { ReactNode } from "react";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

// Primitives présentationnelles partagées par les formulaires d'auth. Stylées
// sur le design system (nc-input, tokens surface/brand), utilisables dans des
// Client Components.

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="w-full max-w-sm rounded-3xl border p-8"
      style={{
        backgroundColor: "var(--color-surface-card)",
        borderColor: "var(--color-border-default)",
        boxShadow: "var(--nc-shadow-2)",
      }}
    >
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {subtitle}
        </p>
      )}
      <div className="mt-6">{children}</div>
      {footer && (
        <div
          className="mt-6 border-t pt-5 text-sm"
          style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-muted)" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  autoComplete,
  required = true,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </Label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        className="nc-input"
      />
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-xl px-3 py-2 text-sm"
      style={{
        backgroundColor: "color-mix(in srgb, var(--destructive) 12%, transparent)",
        color: "var(--destructive)",
      }}
    >
      {message}
    </p>
  );
}

export function AuthNotice({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="rounded-xl px-3 py-2 text-sm"
      style={{
        backgroundColor: "rgba(224, 98, 90, 0.10)",
        color: "var(--color-text-secondary)",
      }}
    >
      {message}
    </p>
  );
}

export function AuthSubmit({
  children,
  pending,
  className,
}: {
  children: ReactNode;
  pending?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold text-white",
        "transition-[filter,transform] duration-200 outline-none motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-[color:var(--color-surface-card)]",
        "hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      style={{ backgroundColor: "var(--color-brand)" }}
    >
      {pending ? "Un instant…" : children}
    </button>
  );
}
