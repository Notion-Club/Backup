import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/shared/components/auth/authUi";
import { SignupForm } from "@/shared/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Créer un compte",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Sauvegarde tes workspaces Notion en quelques minutes."
      footer={
        <span>
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--color-brand)" }}>
            Se connecter
          </Link>
        </span>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
