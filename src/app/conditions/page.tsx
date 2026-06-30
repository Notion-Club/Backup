import type { Metadata } from "next";
import { LegalLayout } from "@/shared/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Les conditions d'utilisation du service Notivault.",
  alternates: { canonical: "/conditions" },
  robots: { index: true, follow: true },
};

export default function ConditionsPage() {
  return (
    <LegalLayout
      title="Conditions d'utilisation"
      updated="Dernière mise à jour : {{DATE_MAJ}}"
    >
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent l&apos;utilisation de Notivault, un
        service de sauvegarde automatisée de workspaces Notion vers un stockage
        tiers que vous contrôlez. En utilisant le service, vous les acceptez.
      </p>

      <h2>2. Description du service</h2>
      <p>
        Notivault se connecte à votre workspace Notion via l&apos;API officielle
        et copie vos données vers la destination que vous configurez (Google
        Drive, GitHub, SFTP, Cloudflare R2). Notivault n&apos;héberge pas
        durablement votre contenu Notion.
      </p>

      <h2>3. Compte et accès</h2>
      <p>
        Vous êtes responsable de l&apos;exactitude des informations fournies et
        de la sécurité de votre accès. Vous devez disposer des droits
        nécessaires sur le workspace Notion que vous connectez.
      </p>

      <h2>4. Vos obligations</h2>
      <ul>
        <li>
          N&apos;utiliser le service que sur des workspaces que vous êtes
          autorisé à sauvegarder.
        </li>
        <li>Gérer et sécuriser vos propres identifiants de destination.</li>
        <li>
          Ne pas détourner le service à des fins illégales ou abusives.
        </li>
      </ul>

      <h2>5. Service « en l&apos;état » et limites</h2>
      <ul>
        <li>
          Le service est fourni « en l&apos;état », sans garantie
          d&apos;absence d&apos;interruption ni d&apos;absence d&apos;erreur.
        </li>
        <li>
          <strong>
            La restauration complète d&apos;un workspace n&apos;est pas garantie
          </strong>{" "}
          : elle dépend des limites de l&apos;API Notion (certains types de
          blocs, commentaires résolus, blocs synchronisés, permissions peuvent
          ne pas être restaurés à l&apos;identique).
        </li>
        <li>
          Vous restez responsable de vérifier l&apos;intégrité de vos
          sauvegardes.
        </li>
      </ul>

      <h2>6. Responsabilité</h2>
      <p>
        Dans les limites permises par la loi, la responsabilité de{" "}
        {"{{RAISON_SOCIALE}}"} ne saurait être engagée pour une perte de
        données, une perte de profit ou un dommage indirect résultant de
        l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le service.
      </p>

      <h2>7. Indépendance vis-à-vis de Notion</h2>
      <p>
        Notivault n&apos;est pas affilié à Notion, ni approuvé ou sponsorisé par
        Notion Labs, Inc.
      </p>

      <h2>8. Tarifs</h2>
      <p>
        {"{{MODELE_TARIFAIRE}}"} (à ce stade, le service est en phase de
        lancement ; les conditions tarifaires seront communiquées avant toute
        facturation).
      </p>

      <h2>9. Résiliation</h2>
      <p>
        Vous pouvez vous déconnecter et supprimer votre accès à tout moment. Nous
        pouvons suspendre un accès en cas de violation des présentes conditions.
      </p>

      <h2>10. Modification des conditions</h2>
      <p>
        Nous pouvons réviser ces conditions ; les changements significatifs
        seront notifiés. La poursuite de l&apos;utilisation vaut acceptation.
      </p>

      <h2>11. Droit applicable</h2>
      <p>
        Droit français. Tout litige relève des juridictions compétentes
        françaises.
      </p>

      <h2>12. Contact</h2>
      <p>{"{{EMAIL_SUPPORT}}"}.</p>
    </LegalLayout>
  );
}
