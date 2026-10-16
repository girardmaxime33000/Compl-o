/**
 * Preuve sociale : uniquement des données réelles. Le compteur d'annonces n'existe qu'à partir d'une date de départ
 * fixée par le propriétaire (`SOCIAL_PROOF_SINCE`, AAAA-MM-JJ, par exemple le jour de l'ouverture au public) et
 * s'affiche seulement au-delà d'un seuil (`SOCIAL_PROOF_MIN_LISTINGS`). Sans date, aucun compteur : les annonces
 * générées pendant les essais ne sont jamais présentées comme de l'usage réel.
 */
export const DEFAULT_MIN_LISTINGS = 100;

/** Date AAAA-MM-JJ stricte, pas dans le futur ; sinon null. */
export function parseSince(raw: string | undefined, now: Date = new Date()): Date | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) return null;
  return date.getTime() > now.getTime() ? null : date;
}

/** Seuil d'affichage : entier d'au moins 1, sinon la valeur par défaut. */
export function parseMin(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_MIN_LISTINGS;
}

export interface UsageProof {
  count: number;
  /** Date de départ en toutes lettres, par exemple « 16 octobre 2026 ». */
  sinceLabel: string;
}

/** Compteur à afficher, ou null (pas de date, pas de mesure, ou seuil non atteint). */
export function usageProof(count: number | null, since: Date | null, min: number): UsageProof | null {
  if (count === null || since === null || count < min) return null;
  return {
    count,
    sinceLabel: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(since),
  };
}
