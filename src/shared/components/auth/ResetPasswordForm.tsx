"use client";

import { useState, useTransition } from "react";
import { requestPasswordResetAction } from "@/shared/lib/auth/actions";
import { AuthError, AuthField, AuthNotice, AuthSubmit } from "./authUi";

export function ResetPasswordForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    start(async () => {
      const res = await requestPasswordResetAction({ email });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <AuthNotice message="Si un compte existe pour cet e-mail, tu recevras un lien de réinitialisation. Pense à vérifier tes spams." />
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {error && <AuthError message={error} />}
      <AuthField id="email" label="E-mail" type="email" autoComplete="email" />
      <AuthSubmit pending={pending}>Envoyer le lien</AuthSubmit>
    </form>
  );
}
