import Link from "next/link";
import { Callout, DataTable, Disclaimer, Section, Steps, Tldr, pct } from "@/components/guides/blocks";
import { ACTIVITIES, activitySlug, BILLABLE_RATIO, formatRate, regimeOf } from "@/lib/activities";
import { TAX_PARAMS as T } from "@/lib/tax";

const fmt1 = (n: number) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
const netOf = (rate: number, regime: "bic" | "bnc") => rate * (1 - T.urssafRate[regime]);

export const faq = [
  {
    question: "Les tarifs du catalogue sont-ils les prix de ma ville ?",
    answer:
      "Non. Ce sont des repères indicatifs communs à la France. Compléo ne dispose pas de données de prix propres à chaque ville : comparez les annonces proches de chez vous avant de fixer votre tarif.",
  },
  {
    question: "Pourquoi tenir compte du temps non facturé ?",
    answer: `Les trajets, les échanges avant une mission, la recherche de clients et les annulations ne sont pas payés. Dans ses estimations, Compléo retient ${Math.round(BILLABLE_RATIO * 100)} % du temps disponible comme temps facturable. C'est une hypothèse de calcul, à ajuster selon votre expérience.`,
  },
  {
    question: "Vaut-il mieux facturer à l'heure ou au forfait ?",
    answer:
      "Les deux existent. Au forfait, le prix est fixé avant la mission dans le devis ; à l'heure, il dépend du temps passé. Dans tous les cas, le devis précise la prestation et le prix, voir le guide sur le premier devis.",
  },
];

export function QuelTarifFixer() {
  const hourly = ACTIVITIES.filter((a) => a.unit === "h");
  // Le dépôt-vente (catégorie « vente ») n'est pas chiffré : son taux dépend de la nature des opérations.
  const other = ACTIVITIES.filter((a) => a.unit !== "h" && a.category !== "vente");
  const sample = hourly.find((a) => a.id === "bricolage");
  if (!sample) throw new Error("Activité d'exemple introuvable : bricolage");
  const ratioPct = Math.round(BILLABLE_RATIO * 100);

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> le tarif que vous affichez n'est pas ce qu'il vous reste. Retirez les
        cotisations ({pct(T.urssafRate.bic)} ou {pct(T.urssafRate.bnc)} en 2026 selon l'activité) puis tenez compte du
        temps non facturé : trajets, échanges, recherche de clients. Avec un tarif de {sample.rateMin} €/h en BIC, il
        reste {fmt1(netOf(sample.rateMin, regimeOf(sample)))} € par heure facturée avant impôt, et environ{" "}
        {fmt1(netOf(sample.rateMin, regimeOf(sample)) * BILLABLE_RATIO)} € par heure de disponibilité si {ratioPct} % de votre
        temps est facturé. Estimation selon profil et temps disponible.
      </p>

      <Tldr
        rows={[
          ["Principe", "Tarif affiché → net après cotisations → net par heure de disponibilité"],
          ["Cotisations 2026", `${pct(T.urssafRate.bic)} (services BIC) · ${pct(T.urssafRate.bnc)} (BNC non réglementés)`],
          ["Temps facturable retenu par Compléo", `${ratioPct} % du temps disponible (hypothèse de calcul)`],
          ["Tarifs du catalogue", "Repères indicatifs communs à la France, pas des prix locaux"],
        ]}
      />

      <Disclaimer variant="article" />

      <Section title="1. Du tarif affiché au net par heure">
        <p>
          Deux effets réduisent le montant affiché. Les cotisations d'abord : un pourcentage du chiffre d'affaires, voir{" "}
          <Link href="/blog/calculer-net-micro-entrepreneur" className="text-primary underline">comment calculer son net</Link>.
          Le temps non facturé ensuite : une heure passée en trajet ou à répondre à un message ne se facture pas.
        </p>
        <DataTable
          caption="Repères de tarifs du catalogue Compléo et net avant impôt, taux 2026 (estimation indicative)"
          head={["Activité", "Repère de tarif", "Net par heure facturée", `Net par heure de disponibilité (${ratioPct} % facturé)`]}
          rows={hourly.map((a) => {
            const r = regimeOf(a);
            return [
              <Link key={a.id} href={`/activites/${activitySlug(a)}`} className="text-primary underline">{a.title}</Link>,
              formatRate(a),
              `${fmt1(netOf(a.rateMin, r))} € à ${fmt1(netOf(a.rateMax, r))} €`,
              `${fmt1(netOf(a.rateMin, r) * BILLABLE_RATIO)} € à ${fmt1(netOf(a.rateMax, r) * BILLABLE_RATIO)} €`,
            ];
          })}
        />
        {other.length > 0 && (
          <p>
            {other.length === 1 ? "Une activité se facture" : `${other.length} activités se facturent`} à l'unité :{" "}
            {other.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ", "}
                <Link href={`/activites/${activitySlug(a)}`} className="text-primary underline">{a.title}</Link> ({formatRate(a)}, soit{" "}
                {fmt1(netOf(a.rateMin, regimeOf(a)))} € à {fmt1(netOf(a.rateMax, regimeOf(a)))} € après cotisations)
              </span>
            ))}
            . Le temps passé par unité dépend de chaque mission : le calcul par heure n'est pas fait. Le dépôt-vente n'est pas
            chiffré : son taux dépend de la nature des opérations, à vérifier auprès de l'Urssaf.
          </p>
        )}
        <Callout kind="attention">
          <p>
            Ces fourchettes sont des repères indicatifs. Elles ne tiennent pas compte de l'impôt sur le revenu, de votre
            matériel ni de vos déplacements, et ne garantissent aucun revenu.
          </p>
        </Callout>
      </Section>

      <Section title="2. Fixer son tarif en quatre étapes">
        <Steps
          items={[
            { title: "Repérer les annonces proches", body: <>Regardez ce que demandent les prestataires de votre zone pour la même prestation. Voir le guide <Link href="/guides/annonces-efficaces" className="text-primary underline">annonce de services efficace</Link>.</> },
            { title: "Calculer votre net", body: <>Appliquez le taux de votre activité, ou utilisez le <Link href="/simulateur-micro-entrepreneur" className="text-primary underline">simulateur</Link>.</> },
            { title: "Ajouter vos coûts", body: "Trajets, matériel, consommables : ce qu'une mission vous coûte réellement, que le calcul ci-dessus n'inclut pas." },
            { title: "Écrire le prix dans le devis", body: <>Le prix et la prestation sont fixés avant la mission. Voir le guide <Link href="/guides/premier-devis-micro-entrepreneur" className="text-primary underline">premier devis</Link>.</> },
          ]}
        />
      </Section>
    </div>
  );
}
