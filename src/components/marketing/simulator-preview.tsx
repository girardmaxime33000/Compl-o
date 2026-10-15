import { eur } from "@/lib/tax";

interface SimulatorPreviewProps {
  /** Valeurs issues de `simulate()` : aucune valeur saisie en dur. */
  monthlyRevenue: number;
  urssaf: number;
  netMonthly: number;
  /** Taux de cotisations en pourcentage (p. ex. 21,2). */
  ratePercent: string;
  regimeLabel: string;
}

/** Aperçu graphique du simulateur : chiffre d'affaires réparti entre cotisations et net, avec les montants en clair. */
export function SimulatorPreview({ monthlyRevenue, urssaf, netMonthly, ratePercent, regimeLabel }: SimulatorPreviewProps) {
  const netShare = monthlyRevenue > 0 ? Math.round((netMonthly / monthlyRevenue) * 100) : 0;
  const rows = [
    { label: "Chiffre d'affaires", value: eur(monthlyRevenue), dot: "bg-primary", strong: false },
    { label: `Cotisations URSSAF (${ratePercent} %)`, value: `− ${eur(urssaf)}`, dot: "bg-amber-400", strong: false },
    { label: "Net avant impôt sur le revenu", value: eur(netMonthly), dot: "bg-success", strong: true },
  ];
  return (
    <figure className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <figcaption className="text-sm font-medium">
        Exemple : {eur(monthlyRevenue)} par mois en {regimeLabel}
      </figcaption>
      <div
        role="img"
        aria-label={`Sur ${eur(monthlyRevenue)} de chiffre d'affaires, ${eur(urssaf)} de cotisations et ${eur(netMonthly)} de net avant impôt sur le revenu, soit ${netShare} % du chiffre d'affaires.`}
        className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div className="h-full bg-success" style={{ width: `${netShare}%` }} />
        <div className="h-full bg-amber-400" style={{ width: `${100 - netShare}%` }} />
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${r.dot}`} /> {r.label}
            </dt>
            <dd className={r.strong ? "font-semibold text-success" : "font-medium"}>{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">Estimation indicative, ne constitue pas un conseil fiscal.</p>
    </figure>
  );
}
