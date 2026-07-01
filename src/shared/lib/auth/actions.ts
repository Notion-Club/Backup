"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import {
  resetRequestSchema,
  signinSchema,
  signupSchema,
  updatePasswordSchema,
  type ResetRequestInput,
  type SigninInput,
  type SignupInput,
  type UpdatePasswordInput,
} from "./validation";

// Résultat commun des actions appelées impérativement depuis le client.
export type AuthResult = { ok: true } | { ok: false; message: string };
export type SignUpResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; message: string };

// Message générique login : ne jamais révéler si l'e-mail existe.
const GENERIC_LOGIN_ERROR = "Identifiants incorrects.";

async function getOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function firstIssue(message: string | undefined): string {
  return message ?? "Données invalides.";
}

// ── Inscription ─────────────────────────────────────────────────────────────
// signUp crée auth.users → déclenche le trigger M1 handle_new_user (profiles).
export async function signUpAction(input: SignupInput): Promise<SignUpResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: firstIssue(parsed.error.issues[0]?.message) };
  }
  const { email, password, fullName } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return {
        ok: false,
        message: "Un compte existe déjà avec cet e-mail. Connecte-toi.",
      };
    }
    if (msg.includes("password")) {
      return {
        ok: false,
        message: "Mot de passe trop faible (8 caractères minimum).",
      };
    }
    return { ok: false, message: "Impossible de créer le compte pour le moment." };
  }

  // Session nulle ⇒ confirmation d'e-mail requise avant de pouvoir se connecter.
  return { ok: true, needsConfirmation: data.session === null };
}

// ── Connexion ───────────────────────────────────────────────────────────────
export async function signInAction(input: SigninInput): Promise<AuthResult> {
  const parsed = signinSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: firstIssue(parsed.error.issues[0]?.message) };
  }
  const { email, password } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { ok: false, message: GENERIC_LOGIN_ERROR };
  }
  return { ok: true };
}

// ── Déconnexion (form action → redirection serveur) ─────────────────────────
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ── Demande de réinitialisation (étape 1) ───────────────────────────────────
export async function requestPasswordResetAction(
  input: ResetRequestInput,
): Promise<AuthResult> {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: firstIssue(parsed.error.issues[0]?.message) };
  }
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  // On ne révèle jamais si l'e-mail existe : succès systématique côté UI.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/update-password`,
  });
  return { ok: true };
}

// ── Nouveau mot de passe (étape 2, session recovery déjà établie) ───────────
export async function updatePasswordAction(
  input: UpdatePasswordInput,
): Promise<AuthResult> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: firstIssue(parsed.error.issues[0]?.message) };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      message: "Lien expiré ou session invalide. Demande un nouveau lien.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { ok: false, message: "Impossible de mettre à jour le mot de passe." };
  }
  return { ok: true };
}
