import Link from "next/link";
import { Callout, Checklist, DataTable, Disclaimer, Section, Steps, Tldr, num, pct } from "@/components/guides/blocks";
import { activitySlug, BILLABLE_RATIO, findActivityBySlug, WEEKS_PER_MONTH } from "@/lib/activities";
import { eur, simulate, TAX_PARAMS as T } from "@/lib/tax";

/** Exemple fictif : objectif de revenu net mensuel pour combler un écart de budget. */
export const TARGET_NET = 300;
const EXAMPLE_ACTIVITY = "bricolage";

export const faq = [
  {
    question: "Comment passer d'un objectif net au chiffre d'affaires à encaisser ?",
    answer: `Divisez l'objectif net par (1 − taux de cotisations). En BIC services en 2026, le taux est de ${pct(T.urssafRate.bic)} : pour ${TARGET_NET} € nets avant impôt par mois, il faut encaisser environ ${num(Math.ceil(TARGET_NET / (1 - T.urssafRate.bic)))} € (exemple fictif, hors impôt sur le revenu).`,
  },
  {
    question: "Un revenu complémentaire est-il garanti ?",
    answer:
      "Non. Les revenus affichés par Compléo sont des estimations selon votre profil et votre temps disponible. Ils dépendent de la demande près de chez vous et du nombre d'heures réellement facturées.",
  },
];

export function ObjectifRevenuBudget() {
  const activity = findActivityBySlug(EXAMPLE_ACTIVITY);
  if (!activity) throw new Error(`Activité du catalogue introuvable : ${EXAMPLE_ACTIVITY}`);
  const required = Math.ceil(TARGET_NET / (1 - T.urssafRate.bic));
  const check = simulate({ monthlyRevenue: required, regime: "bic" });
  const hoursMin = Math.ceil(required / activity.rateMax);
  const hoursMax = Math.ceil(required / activity.rateMin);
  const weeklyMin = Math.ceil(hoursMin / BILLABLE_RATIO / WEEKS_PER_MONTH);
  const weeklyMax = Math.ceil(hoursMax / BILLABLE_RATIO / WEEKS_PER_MONTH);

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> partez du manque réel dans votre budget mensuel, ajoutez les cotisations pour
        obtenir le chiffre d'affaires à encaisser, puis convertissez-le en heures. Exemple fictif : pour {num(TARGET_NET)} € nets
        avant impôt en BIC services en 2026, il faut encaisser environ {num(required)} € par mois. Estimation selon profil
        et temps disponible.
      </p>

      <Tldr
        rows={[
          ["Étape 1", "Mesurer l'écart mensuel entre revenus et dépenses"],
          ["Étape 2", "Convertir l'objectif net en chiffre d'affaires : net ÷ (1 − taux)"],
          ["Étape 3", "Convertir le chiffre d'affaires en heures, avec un tarif et un temps facturable réaliste"],
          ["Taux 2026", `${pct(T.urssafRate.bic)} (services BIC) · ${pct(T.urssafRate.bnc)} (BNC non réglementés)`],
        ]}
      />

      <Disclaimer variant="article" />

      <Section title="1. Mesurer l'écart de budget">
        <p>
          Avant de chercher un revenu, chiffrez le besoin. Listez vos revenus nets mensuels réguliers, vos dépenses fixes
          (logement, assurances, abonnements, remboursements), puis vos dépenses variables (courses, transports, loisirs)
          sur plusieurs mois. L'écart, ou l'objectif d'épargne que vous voulez atteindre, est votre objectif net.
        </p>
        <Checklist
          items={[
            "Revenus nets mensuels réguliers",
            "Dépenses fixes mensuelles",
            "Dépenses variables, moyenne sur plusieurs mois",
            "Objectif d'épargne éventuel",
            "Écart mensuel à combler = objectif net",
          ]}
        />
        <Callout kind="astuce">
          <p>
            Réduire une dépense et gagner un revenu complémentaire se complètent : un euro économisé ne supporte pas de
            cotisations, un euro encaissé en micro-entreprise en supporte.
          </p>
        </Callout>
      </Section>

      <Section title="2. Du net visé au chiffre d'affaires">
        <p>
          Comme les cotisations sont un pourcentage du chiffre d'affaires, il faut encaisser plus que l'objectif net.
          Exemple fictif avec un objectif de {num(TARGET_NET)} € par mois en services BIC :
        </p>
        <DataTable
          caption="Exemple fictif, taux 2026"
          head={["Calcul", "Montant"]}
          rows={[
            ["Objectif net avant impôt", `${num(TARGET_NET)} €`],
            ["Taux de cotisations", pct(T.urssafRate.bic)],
            ["Chiffre d'affaires à encaisser (net ÷ (1 − taux), arrondi à l'euro supérieur)", `${num(required)} €`],
            ["Vérification avec le simulateur : net avant impôt", eur(check.netMonthly)],
          ]}
        />
      </Section>

      <Section title="3. Du chiffre d'affaires aux heures">
        <p>
          Avec les repères du catalogue pour <Link href={`/activites/${activitySlug(activity)}`} className="text-primary underline">{activity.title}</Link>{" "}
          ({activity.rateMin} € à {activity.rateMax} € de l'heure), encaisser {num(required)} € demande entre{" "}
          {hoursMin} et {hoursMax} heures facturées par mois. En retenant {Math.round(BILLABLE_RATIO * 100)} % de temps
          facturable (hypothèse de Compléo), cela correspond à une disponibilité d'environ {weeklyMin} à {weeklyMax} heures
          par semaine. Le <Link href="/onboarding" className="text-primary underline">diagnostic gratuit</Link> fait ce
          calcul selon vos équipements et votre temps.
        </p>
      </Section>

      <Section title="4. Les trois questions avant de se lancer">
        <Steps
          items={[
            { title: "Ai-je le temps ?", body: "Comparez les heures nécessaires au temps réellement disponible après emploi, famille et trajets." },
            { title: "Y a-t-il de la demande près de chez moi ?", body: <>Regardez les annonces de votre zone et les <Link href="/activites" className="text-primary underline">repères par ville</Link> quand ils existent.</> },
            { title: "Quelle est ma situation ?", body: <>Chômage ou retraite : le cumul suit des règles propres, voir les guides <Link href="/guides/cumul-chomage-micro-entreprise" className="text-primary underline">chômage</Link> et <Link href="/guides/micro-entreprise-retraite" className="text-primary underline">retraite</Link>.</> },
          ]}
        />
      </Section>
    </div>
  );
}
