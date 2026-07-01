import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/shared/components/auth/authUi";
import { LoginForm } from "@/shared/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Connexion"
      subtitle="Accède à ton espace Notivault."
      footer={
        <span>
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-medium hover:underline" style={{ color: "var(--color-brand)" }}>
            Créer un compte
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
