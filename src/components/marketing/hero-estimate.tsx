import { ArrowRight } from "lucide-react";
import { BILLABLE_RATIO, formatRate, monthlyIncomeRange, regimeOf, type Activity } from "@/lib/activities";
import { simulate, TAX_PARAMS } from "@/lib/tax";
import { TrackedLink } from "@/components/marketing/tracked-link";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
/** Arrondi à la dizaine : une estimation ne doit pas afficher de fausse précision. */
const tens = (n: number) => nf.format(Math.round(n / 10) * 10);

/** Chiffres de la carte, tous calculés (catalogue + taux 2026) : testés séparément. */
export function heroEstimateFigures(activity: Activity, weeklyHours: number) {
  const regime = regimeOf(activity);
  const { monthlyMin, monthlyMax } = monthlyIncomeRange(activity, weeklyHours);
  const netMin = simulate({ monthlyRevenue: monthlyMin, regime }).netMonthly;
  const netMax = simulate({ monthlyRevenue: monthlyMax, regime }).netMonthly;
  return {
    revenue: `${tens(monthlyMin)} à ${tens(monthlyMax)} €`,
    net: `${tens(netMin)} à ${tens(netMax)} €`,
    ratePercent: new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(TAX_PARAMS.urssafRate[regime] * 100),
    billablePercent: Math.round(BILLABLE_RATIO * 100),
  };
}

/**
 * Carte d'estimation du hero : une activité, un temps hebdomadaire, le chiffre d'affaires puis le net estimés, et un
 * extrait d'annonce tiré du catalogue. Aucun chiffre écrit à la main : `monthlyIncomeRange` et `simulate`.
 */
export function HeroEstimate({ activity, weeklyHours, className }: { activity: Activity; weeklyHours: number; className?: string }) {
  const f = heroEstimateFigures(activity, weeklyHours);
  return (
    <figure className={className}>
      <div className="rounded-2xl border bg-card p-4 text-card-foreground shadow-xl sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Exemple d'estimation</p>
        <p className="mt-1 text-base font-semibold leading-snug">
          {activity.title} · {weeklyHours} h par semaine
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">Chiffre d'affaires estimé</dt>
            <dd className="whitespace-nowrap font-medium">{f.revenue} par mois</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 rounded-lg bg-success/10 px-3 py-2">
            <dt className="text-success">Net après cotisations</dt>
            <dd className="whitespace-nowrap text-lg font-bold text-success">environ {f.net}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-muted-foreground">
          Annonce prête à relire : <span className="font-medium text-foreground">{activity.title}</span>. Tarif indicatif : {formatRate(activity)}.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Estimation selon profil et temps disponible, sans garantie de revenu. Cotisations {f.ratePercent} % (2026), {f.billablePercent} % du temps facturé, avant impôt sur le revenu.
        </p>
        <TrackedLink
          href="/simulateur-micro-entrepreneur"
          trackProps={{ source: "hero-carte", target: "simulateur" }}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Calculer avec mes propres chiffres <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </TrackedLink>
      </div>
    </figure>
  );
}
