import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/shared/components/auth/authUi";
import { ResetPasswordForm } from "@/shared/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Reçois un lien pour définir un nouveau mot de passe."
      footer={
        <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--color-brand)" }}>
          Retour à la connexion
        </Link>
      }
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
