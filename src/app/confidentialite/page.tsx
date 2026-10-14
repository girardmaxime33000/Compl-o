import { pageMetadata } from "@/lib/seo";
import { LEGAL } from "@/lib/legal";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";

export const metadata = pageMetadata({ title: "Politique de confidentialité", description: "Données collectées par Compléo, finalités, sous-traitants, durées de conservation et exercice de vos droits.", path: "/confidentialite" });

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité" path="/confidentialite">
      <LegalSection title="1. Responsable du traitement">
        <p>
          {LEGAL.publisherName}, éditeur de {LEGAL.siteName}. Contact :{" "}
          {LEGAL.email ? <span>{LEGAL.email}</span> : <mark className="rounded bg-amber-100 px-1 text-amber-900">[À compléter]</mark>}.
        </p>
      </LegalSection>
      <LegalSection title="2. Données collectées et finalités">
        <ul className="list-disc space-y-1 pl-5">
          <li>Compte : adresse e-mail, nom, identifiant ; finalité : fournir le service (exécution du contrat).</li>
          <li>Profil et facturation saisis par l'utilisateur : SIRET, adresse, clients, devis et factures ; finalité : émettre les documents demandés.</li>
          <li>Annonces et diagnostic : service, ville, plateforme, réponses au diagnostic ; finalité : générer et conserver les contenus.</li>
          <li>Abonnement : identifiant client Stripe, statut ; finalité : gérer l'offre Premium. Aucun numéro de carte n'est conservé.</li>
          <li>Données techniques de sécurité (journaux, limitation d'usage) ; finalité : sécurité du service (intérêt légitime).</li>
        </ul>
      </LegalSection>
      <LegalSection title="3. Destinataires et sous-traitants">
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase : base de données et authentification (données hébergées dans l'Union européenne).</li>
          <li>Vercel : hébergement de l'application.</li>
          <li>Stripe : paiement et gestion des abonnements.</li>
          <li>Fournisseur du modèle d'IA : reçoit le service, la ville et la plateforme saisis pour générer une annonce.</li>
        </ul>
        <p>
          Certains prestataires sont établis hors de l'Union européenne ; les transferts sont encadrés par des clauses
          contractuelles types ou un mécanisme équivalent.
        </p>
      </LegalSection>
      <LegalSection title="4. Durées de conservation">
        <p>
          Les données sont conservées pendant la durée du compte, puis supprimées, sauf obligation légale (notamment les
          données de facturation, conservées selon les délais légaux applicables).
        </p>
      </LegalSection>
      <LegalSection title="5. Vos droits">
        <p>
          Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité.
          Depuis la page « Mon compte » de votre tableau de bord, vous pouvez exporter vos données (JSON) et supprimer votre compte. Pour tout autre exercice de vos droits, écrivez à l'adresse de contact ci-dessus. Vous pouvez introduire une réclamation auprès de la
          CNIL (<a className="text-primary underline" href="https://www.cnil.fr" rel="noopener noreferrer">cnil.fr</a>).
        </p>
      </LegalSection>
      <LegalSection title="6. Cookies">
        <p>
          Seuls des cookies strictement nécessaires (session de connexion) sont utilisés. Aucun cookie publicitaire n'est
          déposé. Une mesure d'audience interne enregistre des événements anonymes (nom de l'événement, page, offre ou
          plateforme concernée) sans cookie, sans identifiant utilisateur, sans adresse IP et sans transmission à un
          tiers. Elle est désactivée si votre navigateur envoie « Do Not Track » ou « Global Privacy Control ».
        </p>
      </LegalSection>
    </LegalPage>
  );
}
