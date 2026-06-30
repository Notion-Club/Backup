import type { Metadata } from "next";
import { LegalLayout } from "@/shared/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment Notivault traite et protège vos données.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      updated="Dernière mise à jour : {{DATE_MAJ}}"
    >
      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est {"{{RAISON_SOCIALE}}"} (
        {"{{STATUT_JURIDIQUE}}"}), {"{{ADRESSE}}"}. Contact :{" "}
        {"{{EMAIL_SUPPORT}}"}.
      </p>

      <h2>2. Données que nous traitons et pourquoi</h2>
      <ul>
        <li>
          <strong>Jetons d&apos;accès OAuth Notion</strong> : pour accéder à
          votre workspace et exécuter les sauvegardes. Stockés chiffrés au repos.
          Révocables à tout moment depuis Notion.
        </li>
        <li>
          <strong>Métadonnées de workspace</strong> : nom, identifiant et icône
          du workspace, pour identifier vos sauvegardes.
        </li>
        <li>
          <strong>Contenu Notion</strong> : traité de manière transitoire
          pendant l&apos;exécution d&apos;une sauvegarde, puis transféré vers la
          destination que VOUS avez choisie. Notivault ne conserve pas votre
          contenu Notion de façon durable.
        </li>
        <li>
          <strong>Identifiants de destination</strong> (Google Drive, GitHub,
          SFTP, Cloudflare R2) : chiffrés, utilisés uniquement pour déposer vos
          sauvegardes chez vous.
        </li>
        <li>
          <strong>Données de compte</strong> : adresse e-mail (lorsque la
          fonctionnalité de compte sera active), pour la gestion de votre accès
          et les notifications essentielles.
        </li>
        <li>
          <strong>Journaux techniques temporaires</strong> : conservés pour la
          sécurité et le diagnostic, supprimés automatiquement après une courte
          durée.
        </li>
      </ul>

      <h2>3. Bases légales (RGPD)</h2>
      <ul>
        <li>
          <strong>Exécution du contrat</strong> : fournir le service de
          sauvegarde que vous demandez.
        </li>
        <li>
          <strong>Intérêt légitime</strong> : sécurité, prévention des abus,
          amélioration du service.
        </li>
        <li>
          <strong>Consentement</strong> : le cas échéant (ex. communications non
          essentielles).
        </li>
      </ul>

      <h2>4. Destinataires et sous-traitants</h2>
      <ul>
        <li>
          <strong>Notion</strong> (source des données).
        </li>
        <li>
          <strong>Notre hébergeur d&apos;infrastructure</strong> (
          {"{{HEBERGEUR_INFRA}}"}) qui exécute le service.
        </li>
        <li>
          <strong>Le fournisseur de destination que vous choisissez</strong>{" "}
          (Google, GitHub, votre serveur SFTP, Cloudflare) — vous y déposez vos
          propres sauvegardes.
        </li>
        <li>
          <strong>Notre hébergeur de site</strong> ({"{{HEBERGEUR}}"}).
        </li>
      </ul>
      <p>Nous ne vendons jamais vos données.</p>

      <h2>5. Localisation et transferts</h2>
      <p>
        Nos traitements sont réalisés au sein de l&apos;Union européenne. Si une
        destination que vous choisissez implique un transfert hors UE, ce
        transfert relève de votre fournisseur de stockage et de vos propres
        choix.
      </p>

      <h2>6. Durées de conservation</h2>
      <ul>
        <li>
          <strong>Contenu Notion</strong> : non conservé après la sauvegarde
          (transité puis purgé).
        </li>
        <li>
          <strong>Jetons et identifiants</strong> : conservés tant que la
          connexion est active ; supprimés à la déconnexion ou à la suppression
          du compte.
        </li>
        <li>
          <strong>Journaux</strong> : courte durée (quelques semaines maximum).
        </li>
      </ul>

      <h2>7. Sécurité</h2>
      <p>
        Chiffrement des jetons et identifiants au repos, connexions chiffrées en
        transit, accès restreint au strict nécessaire.
      </p>

      <h2>8. Vos droits</h2>
      <p>
        Accès, rectification, effacement, portabilité, limitation, opposition.
        Pour les exercer : {"{{EMAIL_SUPPORT}}"}. Vous pouvez introduire une
        réclamation auprès de la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          www.cnil.fr
        </a>
        ).
      </p>

      <h2>9. Contact</h2>
      <p>
        Pour toute question relative à cette politique : {"{{EMAIL_SUPPORT}}"}.
      </p>
    </LegalLayout>
  );
}
