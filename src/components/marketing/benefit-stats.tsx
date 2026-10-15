export interface BenefitStat {
  /** Chiffre mis en avant, déjà formaté. */
  value: string;
  /** Ce que le chiffre représente pour le visiteur. */
  label: string;
  /** Précision ou réserve (année, hypothèse, source). */
  note?: string;
}

/** Repères chiffrés orientés bénéfice. Les valeurs viennent de `tax.ts`, `activities.ts` et `platforms.ts`, jamais d'un texte saisi. */
export function BenefitStats({ items }: { items: BenefitStat[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="flex flex-col rounded-lg border bg-card p-4">
          <dd className="order-1 text-3xl font-bold text-primary">{s.value}</dd>
          <dt className="order-2 mt-1 text-sm font-medium">{s.label}</dt>
          {s.note && <dd className="order-3 mt-1 text-xs text-muted-foreground">{s.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
