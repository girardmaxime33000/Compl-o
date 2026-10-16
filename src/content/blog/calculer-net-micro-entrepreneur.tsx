import Link from "next/link";
import { Callout, DataTable, Disclaimer, Section, Tldr, num, pct } from "@/components/guides/blocks";
import { ACTIVITIES, activitySlug, regimeOf } from "@/lib/activities";
import { eur, simulate, TAX_PARAMS as T } from "@/lib/tax";

/** Chiffres d'affaires mensuels des exemples (fictifs). */
export const NET_EXAMPLES = [300, 600, 1000] as const;

export const faq = [
  {
    question: "Le chiffre d'affaires est-il mon revenu ?",
    answer:
      "Non. Le chiffre d'affaires est le montant encaissé. Les cotisations sociales du régime micro-social en sont retirées, puis, selon votre situation, l'impôt sur le revenu s'applique. Le simulateur de Compléo donne le net avant impôt.",
  },
  {
    question: "Quel taux de cotisations s'applique en 2026 ?",
    answer: `En 2026, le taux est de ${pct(T.urssafRate.bic)} du chiffre d'affaires pour les prestations de services relevant des BIC et de ${pct(T.urssafRate.bnc)} pour les professions libérales non réglementées hors Cipav, qui relèvent des BNC (source : fiche Entreprendre Service Public sur le régime micro-social, vérifiée le 21 février 2026).`,
  },
  {
    question: "Comment savoir si mon activité relève des BIC ou des BNC ?",
    answer:
      "Le taux dépend de la nature de l'activité. Les repères du simulateur Compléo sont indicatifs : vérifiez votre cas sur autoentrepreneur.urssaf.fr ou auprès de l'Urssaf avant de vous déclarer.",
  },
];

export function CalculerNetMicro() {
  const rows = NET_EXAMPLES.map((monthly) => {
    const bic = simulate({ monthlyRevenue: monthly, regime: "bic" });
    const bnc = simulate({ monthlyRevenue: monthly, regime: "bnc" });
    return [`${num(monthly)} €`, eur(bic.netMonthly), eur(bnc.netMonthly), `${num(bic.annualRevenue)} €`];
  });
  // Le dépôt-vente (catégorie « vente ») n'est pas chiffré : son taux dépend de la nature des opérations.
  const bicActivities = ACTIVITIES.filter((a) => a.category !== "vente" && regimeOf(a) === "bic");
  const bncActivities = ACTIVITIES.filter((a) => regimeOf(a) === "bnc");

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> en micro-entreprise, le net avant impôt est le chiffre d'affaires encaissé
        moins les cotisations sociales, soit un pourcentage fixe : {pct(T.urssafRate.bic)} pour les prestations de
        services relevant des BIC et {pct(T.urssafRate.bnc)} pour les BNC non réglementés en 2026. Pour 600 € encaissés
        par mois en BIC, il reste {eur(simulate({ monthlyRevenue: 600, regime: "bic" }).netMonthly)} avant impôt.
      </p>

      <Tldr
        rows={[
          ["Formule", "Net avant impôt = chiffre d'affaires × (1 − taux de cotisations)"],
          ["Taux 2026", `${pct(T.urssafRate.bic)} (services BIC) · ${pct(T.urssafRate.bnc)} (BNC non réglementés)`],
          ["Ce qui n'est pas dans le calcul", "Impôt sur le revenu, autres contributions éventuelles, frais réels de l'activité"],
          ["Nature des chiffres", "Exemples fictifs et estimations indicatives, ne constitue pas un conseil fiscal"],
        ]}
      />

      <Disclaimer variant="article" />

      <Section title="1. La formule">
        <p>
          Le régime micro-social applique un taux unique au chiffre d'affaires que vous encaissez. Pas de calcul sur les
          charges réelles : si vous encaissez 1 000 €, la cotisation est de 1 000 € × le taux de votre activité.
        </p>
        <Callout kind="regle">
          <p>Net avant impôt = chiffre d'affaires encaissé × (1 − taux). Avec {pct(T.urssafRate.bic)}, chaque euro encaissé laisse {(1 - T.urssafRate.bic).toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} € avant impôt.</p>
        </Callout>
      </Section>

      <Section title="2. Trois exemples chiffrés">
        <DataTable
          caption="Net mensuel avant impôt selon le chiffre d'affaires, taux 2026 (exemples fictifs)"
          head={["Encaissé par mois", "Net BIC services", "Net BNC non réglementé", "Chiffre d'affaires annuel"]}
          rows={rows}
        />
        <p>
          Ces montants sont calculés avec les mêmes paramètres que le{" "}
          <Link href="/simulateur-micro-entrepreneur" className="text-primary underline">simulateur</Link>. Ce sont des
          exemples, pas des revenus attendus : le chiffre d'affaires réel dépend de votre profil et du temps disponible.
        </p>
      </Section>

      <Section title="3. BIC ou BNC : lequel s'applique à votre activité ?">
        <p>
          Le taux dépend de la nature de l'activité. Dans le catalogue de Compléo, d'après les repères du simulateur
          (à vérifier sur autoentrepreneur.urssaf.fr pour votre cas précis) :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Services BIC ({pct(T.urssafRate.bic)})</strong> :{" "}
            {bicActivities.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ", "}
                <Link href={`/activites/${activitySlug(a)}`} className="text-primary underline">{a.title}</Link>
              </span>
            ))}
            .
          </li>
          <li>
            <strong>BNC non réglementés ({pct(T.urssafRate.bnc)})</strong> :{" "}
            {bncActivities.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ", "}
                <Link href={`/activites/${activitySlug(a)}`} className="text-primary underline">{a.title}</Link>
              </span>
            ))}
            .
          </li>
        </ul>
        <p>
          Le dépôt-vente du catalogue n'est pas chiffré ici : le taux applicable (prestation de service ou vente de
          marchandises, {pct(T.urssafRateSales)} en 2026 pour la vente) dépend de la nature des opérations, à vérifier
          auprès de l'Urssaf.
        </p>
      </Section>

      <Section title="4. Garder un œil sur les seuils">
        <p>
          Votre chiffre d'affaires annuel est comparé à deux limites distinctes : la franchise de TVA ({num(T.vatThreshold)} € en
          prestations de services) et le plafond du régime micro ({num(T.microCeilingServices)} €). À 1 000 € par mois, soit{" "}
          {num(1000 * 12)} € par an, vous êtes sous les deux. Les guides{" "}
          <Link href="/guides/franchise-tva-micro-entrepreneur" className="text-primary underline">franchise de TVA</Link> et{" "}
          <Link href="/guides/plafonds-micro-entreprise-2026" className="text-primary underline">plafonds 2026</Link> détaillent les règles.
        </p>
      </Section>
    </div>
  );
}
