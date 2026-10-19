/** Limitation de débit de la génération d'annonces (fenêtres fixes, voir `rate_limit_hit` en base). */
export const GENERATE_PER_USER = { limit: 5, windowSeconds: 600 } as const;
export const GENERATE_PER_IP = { limit: 20, windowSeconds: 3600 } as const;

/** Plafond global de générations par jour (heure UTC) : borne la dépense du fournisseur d'IA, quels que soient les comptes. */
export const DEFAULT_GENERATE_DAILY_CAP = 300;
export function generateDailyCap(raw: string | undefined = process.env.GENERATE_DAILY_CAP): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_GENERATE_DAILY_CAP;
}

/** Abonnement impayé (`past_due`) : jours d'accès conservés avant retrait, le temps que Stripe relance le paiement. */
export const PAST_DUE_GRACE_DAYS = 7;
