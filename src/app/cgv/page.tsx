import { pageMetadata } from "@/lib/seo";
import { LEGAL } from "@/lib/legal";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";

export const metadata = pageMetadata({ title: "Conditions générales de vente", description: "Conditions de vente de l'offre Premium Compléo : prix, paiement, rétractation, résiliation et médiation.", path: "/cgv" });

export default function TermsOfSalePage() {
  return (
    <LegalPage title="Conditions générales de vente" path="/cgv">
      <LegalSection title="1. Objet et vendeur">
        <p>
          Les présentes conditions régissent la souscription de l'offre Premium de {LEGAL.siteName} par un consommateur.
          Le vendeur est {LEGAL.publisherName} (identification complète dans les{" "}
          <a className="text-primary underline" href="/mentions-legales">mentions légales</a>).
        </p>
      </LegalSection>
      <LegalSection title="2. Offres et prix">
        <p>Trois offres payantes de contenu numérique (annonces rédigées par IA) sont proposées :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>le pack ponctuel : un nombre défini d'annonces, payé une seule fois ;</li>
          <li>le pack mensuel : un nombre maximal d'annonces par jour, par abonnement mensuel ;</li>
          <li>l'abonnement annuel : annonces illimitées, par abonnement annuel.</li>
        </ul>
        <p>
          Le contenu de chaque offre et son prix, toutes taxes comprises, sont ceux affichés sur la page{" "}
          <a className="text-primary underline" href="/pricing">Tarifs</a> au moment de la commande. Les prix s'entendent en
          euros ; la TVA n'est pas applicable le cas échéant, conformément aux mentions légales.
        </p>
      </LegalSection>
      <LegalSection title="3. Commande et paiement">
        <p>
          La commande est conclue après acceptation des présentes conditions et validation du paiement sur la page
          sécurisée de Stripe. Les abonnements sont renouvelés automatiquement à chaque échéance (mensuelle ou annuelle)
          jusqu'à résiliation. Le paiement est traité par Stripe ; {LEGAL.siteName} ne conserve aucun numéro de carte.
        </p>
        <p>
          Les annonces du pack ponctuel sont créditées sur le compte après confirmation du paiement et sont utilisées une
          fois le quota gratuit ou celui de l'abonnement épuisé. Elles sont valables 12 mois à compter de l'achat : les annonces
          non utilisées à cette échéance sont perdues, sans remboursement.
        </p>
      </LegalSection>
      <LegalSection title="4. Droit de rétractation">
        <p>
          Le consommateur dispose d'un délai de 14 jours à compter de la commande pour se rétracter, sans motif, en
          écrivant à <span>{LEGAL.email || "l'adresse e-mail indiquée dans les mentions légales"}</span>.
        </p>
        <p>
          Lorsque le consommateur demande l'accès immédiat au contenu numérique avant la fin de ce délai, il reconnaît
          expressément que l'exécution commence dès l'activation de l'offre et <strong>renonce à son droit de
          rétractation</strong> une fois le contenu numérique fourni, conformément à l'article L. 221-28, 13° du Code de
          la consommation. Cette demande et cette renonciation sont recueillies par une case à cocher distincte avant le
          paiement.
        </p>
      </LegalSection>
      <LegalSection title="5. Durée et résiliation">
        <p>
          Les abonnements sont sans engagement au-delà de la période en cours. L'utilisateur les résilie à tout moment
          depuis le portail de gestion de l'abonnement accessible dans son compte ; la résiliation prend effet à la fin de
          la période déjà payée, qui n'est pas remboursée, sauf obligation légale contraire. Le pack ponctuel n'est pas
          un abonnement et ne se renouvelle pas.
        </p>
      </LegalSection>
      <LegalSection title="6. Disponibilité du service">
        <p>
          Le service est accessible en ligne. En cas d'indisponibilité prolongée imputable à l'éditeur, l'utilisateur peut
          demander un geste commercial proportionné ; ses droits légaux de garantie sont préservés.
        </p>
      </LegalSection>
      <LegalSection title="7. Garantie légale">
        <p>
          Le consommateur bénéficie de la garantie légale de conformité des contenus et services numériques (articles
          L. 224-25-1 et suivants du Code de la consommation).
        </p>
      </LegalSection>
      <LegalSection title="8. Médiation et litiges">
        <p>
          Après une réclamation écrite restée sans réponse satisfaisante, le consommateur peut saisir gratuitement le
          médiateur de la consommation :{" "}
          {LEGAL.mediatorName ? (
            <>
              {LEGAL.mediatorName}
              {LEGAL.mediatorUrl ? <> ({LEGAL.mediatorUrl})</> : null}
            </>
          ) : (
            <mark className="rounded bg-amber-100 px-1 text-amber-900">[À compléter]</mark>
          )}
          . Plateforme européenne de règlement en ligne des litiges :{" "}
          <a className="text-primary underline" href="https://ec.europa.eu/consumers/odr" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
        </p>
      </LegalSection>
      <LegalSection title="9. Droit applicable">
        <p>Les présentes conditions sont soumises au droit français, sous réserve des dispositions protectrices applicables au consommateur.</p>
      </LegalSection>
    </LegalPage>
  );
}
