import Link from "next/link";
import { Callout, Checklist, DataTable, Disclaimer, Section, Tldr } from "@/components/guides/blocks";

export const faq = [
  {
    question: "Peut-on consommer un produit après sa DDM ?",
    answer:
      "La DDM (« à consommer de préférence avant ») est une date indicative : passé ce délai, le produit peut perdre en qualités gustatives ou nutritionnelles, mais il n'est pas dangereux pour la santé, selon la fiche de service-public.gouv.fr. Seul le dépassement de la DLC présente un risque.",
  },
  {
    question: "Que se passe-t-il si la chaîne du froid est rompue ?",
    answer:
      "La DLC n'est valable que si les conditions de conservation sont respectées. Une rupture de la chaîne du froid peut rendre le produit dangereux avant la date indiquée.",
  },
  {
    question: "Un commerçant peut-il vendre un produit dont la DLC est dépassée ?",
    answer:
      "Non. Un professionnel ne peut pas vendre un produit au-delà de sa DLC. Pour un litige, la fiche renvoie vers la direction départementale de la protection des populations (DDPP) du département.",
  },
];

export function DlcDdm() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> la DLC (« à consommer jusqu'au ») est une limite de sécurité : au-delà, le
        produit peut être dangereux. La DDM (« à consommer de préférence avant ») est une date de qualité : après elle,
        le produit peut perdre en goût ou en valeurs nutritionnelles mais n'est pas dangereux pour la santé. Distinguer
        les deux évite de jeter des produits encore consommables.
      </p>

      <Tldr
        rows={[
          ["DLC", "Date limite de consommation : produits très périssables, au-delà le produit peut être dangereux"],
          ["DDM", "Date de durabilité minimale : date indicative de qualité, pas de danger pour la santé"],
          ["Mentions", "« À consommer jusqu'au… » (DLC) · « À consommer de préférence avant… » (DDM)"],
          ["Source", "Fiche service-public.gouv.fr vérifiée le 6 février 2026"],
        ]}
      />

      <Disclaimer variant="sources" />

      <Section title="1. La DLC : une limite de sécurité">
        <p>
          La date limite de consommation concerne les produits très périssables et emballés : viandes découpées,
          charcuteries, plats cuisinés réfrigérés, yaourts. Elle s'indique par la mention « À consommer jusqu'au… »,
          suivie du jour, du mois et éventuellement de l'année.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Elle n'est valable que si les conditions de conservation indiquées sont respectées : une rupture de la chaîne du froid peut rendre le produit dangereux avant la date.</li>
          <li>Un professionnel ne peut pas vendre un produit au-delà de la DLC.</li>
          <li>Elle est fixée par le fabricant, sauf lorsque la réglementation sanitaire impose une date.</li>
        </ul>
      </Section>

      <Section title="2. La DDM : une date de qualité">
        <p>
          La date de durabilité minimale concerne notamment les produits secs, stérilisés ou déshydratés : café, lait
          en poudre, jus de fruits, biscuits secs, conserves. Elle s'indique par « À consommer de préférence avant le… »
          ou « À consommer de préférence avant fin… ». Passé cette date, le produit peut perdre en qualités gustatives ou
          nutritionnelles, sans être dangereux pour la santé.
        </p>
        <DataTable
          caption="Précision de la DDM selon la durée de conservation du produit"
          head={["Durée de conservation", "Date indiquée"]}
          rows={[
            ["Moins de 3 mois", "Le jour et le mois"],
            ["Entre 3 et 18 mois", "Le mois et l'année"],
            ["Plus de 18 mois", "L'année seule"],
          ]}
        />
        <Callout kind="regle">
          <p>
            Vendre un produit après sa DDM n'est pas une infraction, mais le vendeur reste responsable de la sécurité du
            produit. Certains produits n'ont pas à porter de DDM : fruits et légumes frais, vins, vinaigres, sel, sucres
            en morceaux, chewing-gums.
          </p>
        </Callout>
      </Section>

      <Section title="3. La date de congélation">
        <p>
          Sur les viandes et préparations de viandes congelées, ainsi que sur les produits de la pêche congelés non
          transformés, la mention « Produit congelé le… » est obligatoire. Elle permet de connaître l'ancienneté de la
          congélation et sert la traçabilité.
        </p>
      </Section>

      <Section title="4. Pratique : organiser ses courses autour des dates">
        <p>Ces habitudes découlent des définitions ci-dessus ; elles ne chiffrent aucune économie.</p>
        <Checklist
          items={[
            "Repérer la mention : « jusqu'au » (DLC) ou « de préférence avant » (DDM)",
            "Consommer en priorité les produits à DLC proche",
            "Garder les produits à DDM, en les goûtant et en vérifiant leur aspect avant de les jeter",
            "Respecter les conditions de conservation indiquées, notamment le froid",
            "Ne pas jeter par réflexe un produit sec dont seule la DDM est passée",
          ]}
        />
        <p>
          Pour aller plus loin sur votre budget, voir{" "}
          <Link href="/blog/objectif-revenu-complementaire-budget" className="text-primary underline">
            combien de revenu complémentaire viser pour équilibrer son budget
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
