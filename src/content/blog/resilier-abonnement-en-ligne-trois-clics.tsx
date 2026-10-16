import { Callout, Checklist, Disclaimer, Section, Steps, Tldr } from "@/components/guides/blocks";
import { eur } from "@/lib/tax";

/** Exemple fictif : abonnements mensuels (euros). */
export const SUBSCRIPTIONS = [
  { label: "Salle de sport", monthly: 29.9 },
  { label: "Presse en ligne", monthly: 9.99 },
  { label: "Service de streaming", monthly: 13.49 },
] as const;

export const faq = [
  {
    question: "Un professionnel peut-il exiger un courrier pour résilier un contrat conclu en ligne ?",
    answer:
      "Pour les contrats de consommation pouvant être conclus par voie électronique, le professionnel doit proposer une fonctionnalité « résilier votre contrat » accessible en ligne, en trois clics, selon la loi du 16 août 2022 et le décret du 31 mai 2023 cités par service-public.gouv.fr. Vérifiez la fiche du contrat concerné pour les cas particuliers.",
  },
  {
    question: "Faut-il créer un espace personnel pour utiliser le bouton ?",
    answer:
      "Non. Selon la page officielle, l'accès à la fonctionnalité ne doit pas exiger la création d'un espace personnel.",
  },
  {
    question: "La résiliation en ligne supprime-t-elle le préavis ou les frais éventuels ?",
    answer:
      "Non. Le professionnel peut présenter les conditions de résiliation de son contrat : préavis, indemnité de rupture, conséquences. Relisez-les avant de valider.",
  },
];

export function ResilierTroisClics() {
  const monthly = SUBSCRIPTIONS.reduce((sum, s) => sum + s.monthly, 0);
  const yearly = monthly * 12;

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> pour les contrats de consommation pouvant être conclus en ligne
        (électricité, gaz, téléphone, internet, salle de sport, presse en ligne…), le professionnel doit proposer une
        fonctionnalité « résilier votre contrat » qui permet de résilier en trois clics, sans créer d'espace personnel.
        Faire l'inventaire de ses abonnements est la première économie à examiner. Exemple fictif : trois abonnements
        pour {eur(monthly)} par mois représentent {eur(yearly)} par an.
      </p>

      <Tldr
        rows={[
          ["Principe", "Résiliation en ligne en trois clics pour les contrats pouvant être conclus par voie électronique"],
          ["Fonctionnalité", "« Résilier votre contrat », puis page récapitulative, puis notification de la résiliation"],
          ["Textes cités", "Loi n° 2022-1158 du 16 août 2022 · décret n° 2023-417 du 31 mai 2023"],
          ["Source", "Service-public.gouv.fr, actualité mise à jour le 14 septembre 2023"],
        ]}
      />

      <Disclaimer variant="sources" />

      <Callout kind="attention">
        <p>
          La page officielle citée date de 2023 et service-public.gouv.fr la signale comme ancienne. Vérifiez la règle en
          vigueur et la fiche propre à votre contrat (assurance, téléphonie…) avant de résilier.
        </p>
      </Callout>

      <Section title="1. Les contrats concernés">
        <p>
          Sont visés les contrats de consommation et d'assurance qui peuvent être conclus par voie électronique, en cours
          comme à venir. La page officielle cite les fournisseurs d'électricité ou de gaz, les opérateurs téléphoniques ou
          internet, les compagnies de transport, les salles de sport, les sites de rencontres et les éditeurs de journaux
          et médias en ligne. Les contrats d'assurance ont des règles propres, détaillées dans un autre article.
        </p>
      </Section>

      <Section title="2. Les trois clics">
        <Steps
          items={[
            { title: "Premier clic : « résilier votre contrat »", body: "Vous indiquez ou confirmez votre identité, vos coordonnées, les références du contrat et la date de résiliation souhaitée (et, pour les communications électroniques, la ou les lignes concernées). Aucun espace personnel ne doit être exigé." },
            { title: "Deuxième clic : page récapitulative", body: "Vous vérifiez les informations et pouvez les modifier." },
            { title: "Troisième clic : « notification de la résiliation »", body: "Le bouton est accessible directement depuis la page récapitulative." },
          ]}
        />
        <p>
          Le professionnel doit ensuite accuser réception de la notification et vous informer, dans des délais raisonnables,
          de la date de fin du contrat et des effets de la résiliation.
        </p>
        <Callout kind="regle">
          <p>
            Les conditions du contrat restent présentées par le professionnel (préavis, indemnité de rupture,
            conséquences). Conservez l'accusé de réception de votre résiliation.
          </p>
        </Callout>
      </Section>

      <Section title="3. Faire l'inventaire de ses abonnements">
        <p>
          Cette méthode est un conseil pratique, sans économie garantie. Relevez chaque prélèvement récurrent sur vos
          relevés bancaires et multipliez par douze pour voir le coût annuel.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {SUBSCRIPTIONS.map((s) => (
            <li key={s.label}>
              {s.label} : {eur(s.monthly)} par mois, soit {eur(s.monthly * 12)} par an (exemple fictif)
            </li>
          ))}
          <li>Total de l'exemple : {eur(monthly)} par mois, soit {eur(yearly)} par an</li>
        </ul>
        <Checklist
          items={[
            "J'ai listé tous mes prélèvements récurrents",
            "J'ai noté le coût annuel de chacun",
            "Je sais lesquels je n'utilise plus",
            "J'ai relu le préavis et les frais éventuels avant de résilier",
            "J'ai conservé l'accusé de réception",
          ]}
        />
      </Section>
    </div>
  );
}
