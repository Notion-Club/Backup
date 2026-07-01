"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "@/shared/lib/auth/actions";
import { AuthError, AuthField, AuthNotice, AuthSubmit } from "./authUi";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    start(async () => {
      const res = await updatePasswordAction({ password });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setDone(true);
      router.refresh();
    });
  }

  if (done) {
    return (
      <AuthNotice message="Mot de passe mis à jour. Tu peux maintenant te connecter avec ton nouveau mot de passe." />
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {error && <AuthError message={error} />}
      <AuthField
        id="password"
        label="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        placeholder="8 caractères minimum"
      />
      <AuthSubmit pending={pending}>Mettre à jour</AuthSubmit>
    </form>
  );
}
