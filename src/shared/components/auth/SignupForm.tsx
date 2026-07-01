"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/shared/lib/auth/actions";
import { AuthError, AuthField, AuthNotice, AuthSubmit } from "./authUi";

export function SignupForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "");
    start(async () => {
      const res = await signUpAction({ email, password, fullName });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      if (res.needsConfirmation) {
        setSent(true);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  if (sent) {
    return (
      <AuthNotice message="Compte créé. Vérifie ta boîte mail : clique sur le lien de confirmation pour activer ton accès." />
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {error && <AuthError message={error} />}
      <AuthField
        id="fullName"
        label="Nom (facultatif)"
        autoComplete="name"
        required={false}
      />
      <AuthField id="email" label="E-mail" type="email" autoComplete="email" />
      <AuthField
        id="password"
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        placeholder="8 caractères minimum"
      />
      <AuthSubmit pending={pending}>Créer mon compte</AuthSubmit>
    </form>
  );
}
