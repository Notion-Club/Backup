import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/shared/components/auth/authUi";
import { UpdatePasswordForm } from "@/shared/components/auth/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
  robots: { index: false, follow: false },
};

export default function UpdatePasswordPage() {
  return (
    <AuthCard
      title="Nouveau mot de passe"
      subtitle="Choisis un nouveau mot de passe pour ton compte."
      footer={
        <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--color-brand)" }}>
          Retour à la connexion
        </Link>
      }
    >
      <UpdatePasswordForm />
    </AuthCard>
  );
}
