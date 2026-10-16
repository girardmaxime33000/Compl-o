import { Callout, DataTable, Disclaimer, Section, Steps, Tldr } from "@/components/guides/blocks";
import { eur } from "@/lib/tax";

/** Exemples fictifs de comparaison de prix (grammes, euros). */
export const COMPARISON = [
  { label: "Paquet A", grams: 500, price: 2.4 },
  { label: "Paquet B", grams: 750, price: 3.3 },
] as const;
export const SHRINK = { fromGrams: 500, toGrams: 450, price: 2.4 } as const;

const perKg = (grams: number, price: number) => (price / grams) * 1000;

export const faq = [
  {
    question: "Le prix au kilo est-il obligatoire ?",
    answer:
      "Pour les produits préemballés alimentaires, d'hygiène et d'entretien figurant sur une liste publiée sur Légifrance, le client doit être informé du prix à l'unité de mesure (au kilogramme, au litre, etc.), en plus de la quantité nette. Le prix est exprimé toutes taxes comprises.",
  },
  {
    question: "Qu'est-ce que la shrinkflation ?",
    answer:
      "C'est la baisse de la quantité vendue d'un produit sans baisse équivalente du prix, ce qui fait monter le prix au kilo ou au litre. Depuis le 1er juillet 2024, les supermarchés de plus de 400 m² à prédominance alimentaire doivent l'indiquer sur les produits concernés, pendant deux mois à compter de la mise en vente de la quantité réduite (pages de service-public.gouv.fr, vérifiée le 2 juillet 2024 et mise à jour le 29 juillet 2024).",
  },
  {
    question: "Tous les produits sont-ils concernés par l'affichage de la shrinkflation ?",
    answer:
      "Non. Sont concernés les denrées alimentaires préemballées de grande consommation et les produits non alimentaires vendus en quantité constante, comme les produits ménagers ou pour bébés. Les denrées préemballées à quantité variable et la vente en vrac sont exclues.",
  },
];

export function ComparerPrix() {
  const [a, b] = COMPARISON;
  const kgA = perKg(a.grams, a.price);
  const kgB = perKg(b.grams, b.price);
  const shrinkBefore = perKg(SHRINK.fromGrams, SHRINK.price);
  const shrinkAfter = perKg(SHRINK.toGrams, SHRINK.price);
  const shrinkRise = Math.round((shrinkAfter / shrinkBefore - 1) * 1000) / 10;
  const cheaper = kgA < kgB ? a : b;

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> pour comparer deux produits, ne regardez pas le prix du paquet mais le prix au
        kilo ou au litre, que le magasin doit afficher pour les produits préemballés alimentaires, d'hygiène et d'entretien d'une liste officielle. Si la quantité baisse
        sans baisse de prix, le prix au kilo monte : c'est la shrinkflation, que les grandes surfaces doivent signaler
        depuis le 1er juillet 2024 sur les produits concernés. Exemple fictif : {a.label} à {eur(a.price)} les {a.grams} g
        revient à {eur(kgA)} le kilo, {b.label} à {eur(b.price)} les {b.grams} g à {eur(kgB)} le kilo.
      </p>

      <Tldr
        rows={[
          ["Prix à l'unité de mesure", "Obligatoire pour les produits préemballés alimentaires, d'hygiène et d'entretien d'une liste officielle"],
          ["Prix affiché", "En euros, toutes taxes comprises, avec la quantité nette"],
          ["Shrinkflation", "Mention obligatoire depuis le 1er juillet 2024 dans les supermarchés de plus de 400 m² à prédominance alimentaire, sur les produits concernés"],
          ["Sources", "Service-public.gouv.fr : fiche vérifiée le 2 juillet 2024, actualité mise à jour le 29 juillet 2024"],
        ]}
      />

      <Disclaimer variant="sources" />

      <Callout kind="attention">
        <p>
          Les deux pages officielles citées datent de 2024 et service-public.gouv.fr signale lui-même que l'actualité sur
          la shrinkflation est ancienne. Vérifiez les règles en vigueur avant de vous y référer.
        </p>
      </Callout>

      <Section title="1. Le prix au kilo, pour comparer ce qui est comparable">
        <p>
          Le prix d'un paquet dépend de sa taille. Le prix à l'unité de mesure ramène chaque produit à la même base. La
          formule est : prix du paquet ÷ quantité × 1 000 pour obtenir le prix au kilo.
        </p>
        <DataTable
          caption="Exemple fictif de comparaison"
          head={["Produit", "Quantité", "Prix du paquet", "Prix au kilo"]}
          rows={COMPARISON.map((c) => [c.label, `${c.grams} g`, eur(c.price), eur(perKg(c.grams, c.price))])}
        />
        <p>
          Dans cet exemple, {cheaper.label} est moins cher au kilo. Le plus gros paquet n'est pas toujours le plus
          avantageux et le moins cher en rayon non plus : seule la comparaison au kilo ou au litre tranche, à qualité
          équivalente.
        </p>
      </Section>

      <Section title="2. La shrinkflation : moins de produit au même prix">
        <p>
          Exemple fictif : un paquet passe de {SHRINK.fromGrams} g à {SHRINK.toGrams} g, au même prix de {eur(SHRINK.price)}. Le prix
          au kilo passe de {eur(shrinkBefore)} à {eur(shrinkAfter)}, soit {shrinkRise.toLocaleString("fr-FR")} % de plus, alors que le prix
          affiché sur le paquet n'a pas bougé.
        </p>
        <p>
          Depuis le 1er juillet 2024, les supermarchés dont la surface de vente dépasse 400 m² et dont l'activité est à
          prédominance alimentaire doivent signaler cette évolution pendant deux mois à compter de la mise en vente du
          produit dans sa quantité réduite. La mention indique que la quantité
          vendue est passée de X à Y et que le prix au kilo, au litre ou à l'unité a augmenté d'un pourcentage ou d'un
          montant. Elle figure sur l'emballage ou sur une étiquette proche, avec des caractères de la même taille que le
          prix.
        </p>
        <Callout kind="regle">
          <p>
            Sont concernés les denrées alimentaires préemballées de grande consommation et les produits non alimentaires
            vendus en quantité constante (produits ménagers, produits pour bébés). Sont exclus les denrées préemballées à
            quantité variable et la vente en vrac.
          </p>
        </Callout>
      </Section>

      <Section title="3. Comparer en quatre gestes">
        <Steps
          items={[
            { title: "Lire le prix au kilo ou au litre", body: "Sur l'étiquette en rayon, à côté du prix du produit." },
            { title: "Vérifier la quantité nette", body: "Elle doit figurer en plus du prix de vente : comparez-la à l'achat précédent." },
            { title: "Repérer la mention de baisse de quantité", body: "Elle apparaît sur l'emballage ou sur l'étiquette pour les produits concernés." },
            { title: "Calculer soi-même si besoin", body: "Prix du paquet ÷ quantité en grammes × 1 000 donne le prix au kilo." },
          ]}
        />
      </Section>
    </div>
  );
}
