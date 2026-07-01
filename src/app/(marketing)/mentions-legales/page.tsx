import type { Metadata } from "next";
import { LegalLayout } from "@/shared/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales du site Notivault.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales">
      <h2>Éditeur</h2>
      <p>
        {"{{RAISON_SOCIALE}}"} — {"{{STATUT_JURIDIQUE}}"}
        <br />
        {"{{ADRESSE}}"}
        <br />
        SIREN/RCS : {"{{SIREN}}"}
        <br />
        Contact : {"{{EMAIL_SUPPORT}}"}
      </p>

      <h2>Directeur de la publication</h2>
      <p>{"{{DIRECTEUR_PUBLICATION}}"}</p>

      <h2>Hébergeur du site</h2>
      <p>
        {"{{HEBERGEUR}}"} — {"{{ADRESSE_HEBERGEUR}}"}
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus de ce site (textes, logo Notivault,
        éléments graphiques) est protégé. Toute reproduction sans autorisation
        est interdite. « Notion » est une marque de Notion Labs, Inc. ;
        Notivault n&apos;est pas affilié à Notion.
      </p>
    </LegalLayout>
  );
}
