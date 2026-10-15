/**
 * Fourchette de revenu mensuel estimé sur une échelle commune à toutes les lignes du tableau (0 à `scaleMax`), pour que la
 * progression selon les heures se lise d'un coup d'œil. Décorative : les montants figurent déjà en texte dans la ligne.
 */
export function IncomeRangeBar({ min, max, scaleMax }: { min: number; max: number; scaleMax: number }) {
  const pct = (n: number) => (scaleMax > 0 ? Math.min(100, Math.max(0, (n / scaleMax) * 100)) : 0);
  const left = pct(min);
  const width = Math.max(pct(max) - left, 2); // reste visible même quand min et max sont proches
  return (
    <div aria-hidden="true" className="relative h-2.5 w-full min-w-[7rem] rounded-full bg-secondary">
      <div className="absolute inset-y-0 rounded-full bg-success" style={{ left: `${left}%`, width: `${width}%` }} />
    </div>
  );
}
