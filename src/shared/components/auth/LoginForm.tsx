"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInAction } from "@/shared/lib/auth/actions";
import { AuthError, AuthField, AuthSubmit } from "./authUi";

export function LoginForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    start(async () => {
      const res = await signInAction({ email, password });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {error && <AuthError message={error} />}
      <AuthField id="email" label="E-mail" type="email" autoComplete="email" />
      <AuthField
        id="password"
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
      />
      <div className="flex justify-end">
        <Link
          href="/reset-password"
          className="text-sm hover:underline"
          style={{ color: "var(--color-brand)" }}
        >
          Mot de passe oublié ?
        </Link>
      </div>
      <AuthSubmit pending={pending}>Se connecter</AuthSubmit>
    </form>
  );
}
