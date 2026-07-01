import { signOutAction } from "@/shared/lib/auth/actions";

// Form action → la Server Action détruit la session et redirige vers /login.
export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-[filter] duration-200 outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface-raised)] motion-reduce:transition-none"
        style={{
          color: "var(--color-text-primary)",
          background: "var(--color-surface-card)",
          borderColor: "var(--color-border-default)",
        }}
      >
        Se déconnecter
      </button>
    </form>
  );
}
