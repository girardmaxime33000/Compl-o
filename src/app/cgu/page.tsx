import { LEGAL } from "@/lib/legal";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";

export const metadata = { title: "Conditions générales d'utilisation · Compléo" };

export default function TermsOfUsePage() {
  return (
    <LegalPage title="Conditions générales d'utilisation">
      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions régissent l'accès et l'utilisation du site {LEGAL.siteName} ({LEGAL.siteUrl}), édité par
          {" "}{LEGAL.publisherName} (voir les <a className="text-primary underline" href="/mentions-legales">mentions légales</a>).
          Toute utilisation du service suppose leur acceptation.
        </p>
      </LegalSection>
      <LegalSection title="2. Description du service">
        <p>
          {LEGAL.siteName} propose un diagnostic d'activités, un générateur d'annonces par intelligence artificielle, un
          simulateur de cotisations et un outil de devis et de factures. Une offre gratuite limitée et une offre Premium
          payante sont disponibles ; les conditions de vente figurent dans les{" "}
          <a className="text-primary underline" href="/cgv">conditions générales de vente</a>.
        </p>
      </LegalSection>
      <LegalSection title="3. Compte utilisateur">
        <p>
          La création d'un compte exige une adresse e-mail valide. L'utilisateur garantit l'exactitude des informations
          fournies, en préserve la confidentialité de ses accès et répond de toute activité réalisée depuis son compte. Il
          doit être majeur ou disposer de l'autorisation de son représentant légal.
        </p>
      </LegalSection>
      <LegalSection title="4. Utilisation autorisée">
        <p>L'utilisateur s'interdit notamment :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>d'utiliser le service pour produire des contenus illicites, trompeurs, discriminatoires ou contraires aux règles des plateformes de diffusion ;</li>
          <li>de contourner les quotas, d'extraire le contenu du service de manière automatisée ou de perturber son fonctionnement ;</li>
          <li>de revendre ou de sous-licencier l'accès au service sans accord écrit de l'éditeur.</li>
        </ul>
        <p>L'éditeur peut suspendre un compte en cas de manquement, après information lorsque cela est possible.</p>
      </LegalSection>
      <LegalSection title="5. Contenus générés et responsabilité de l'utilisateur">
        <p>
          Les annonces sont générées par une IA et doivent être relues avant toute publication. Les estimations de revenus
          et de cotisations sont indicatives et ne constituent pas un conseil fiscal, juridique ou comptable. L'utilisateur
          vérifie sa situation auprès des organismes officiels (urssaf.fr, service-public.fr, France Travail) et reste
          responsable de ses déclarations, de ses devis et de ses factures.
        </p>
      </LegalSection>
      <LegalSection title="6. Propriété intellectuelle">
        <p>
          Le service, sa marque, ses textes et son code restent la propriété de l'éditeur. L'utilisateur conserve les
          droits sur les contenus qu'il crée et concède à l'éditeur le droit de les stocker et de les afficher pour fournir
          le service.
        </p>
      </LegalSection>
      <LegalSection title="7. Disponibilité et responsabilité">
        <p>
          Le service est fourni sans garantie de disponibilité continue. Dans la limite permise par la loi, la
          responsabilité de l'éditeur ne couvre pas les dommages indirects ni la perte de revenus. Les droits impératifs
          des consommateurs demeurent inchangés.
        </p>
      </LegalSection>
      <LegalSection title="8. Données personnelles">
        <p>
          Le traitement des données est décrit dans la{" "}
          <a className="text-primary underline" href="/confidentialite">politique de confidentialité</a>.
        </p>
      </LegalSection>
      <LegalSection title="9. Modification des conditions">
        <p>
          L'éditeur peut modifier les présentes conditions. Les utilisateurs inscrits sont informés des changements
          substantiels ; la poursuite de l'usage après notification vaut acceptation de la nouvelle version.
        </p>
      </LegalSection>
      <LegalSection title="10. Droit applicable et litiges">
        <p>
          Les présentes conditions sont soumises au droit français. Le consommateur peut recourir gratuitement à un
          médiateur de la consommation (voir les mentions légales) et conserve le bénéfice des règles de compétence qui
          lui sont applicables.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
