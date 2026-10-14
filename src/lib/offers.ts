import { MONTHLY_PLAN_DAILY_LISTINGS, PACK_LISTING_CREDITS } from "@/lib/platforms";

export type OfferId = "pack" | "monthly" | "annual";

/**
 * Offres payantes. Les prix affichés (en centimes) DOIVENT correspondre aux prix Stripe référencés par les variables
 * d'environnement `priceEnv` ; la facturation réelle vient toujours de Stripe, jamais de ces valeurs.
 */
export const OFFERS = {
  pack: {
    name: "Pack ponctuel",
    cents: 499,
    mode: "payment",
    priceEnv: "STRIPE_PACK_PRICE_ID",
    summary: `${PACK_LISTING_CREDITS} annonces IA, paiement unique`,
  },
  monthly: {
    name: "Pack mensuel",
    cents: 699,
    mode: "subscription",
    priceEnv: "STRIPE_MONTHLY_PRICE_ID",
    summary: `${MONTHLY_PLAN_DAILY_LISTINGS} annonces IA par jour`,
  },
  annual: {
    name: "Abonnement annuel",
    cents: 6999,
    mode: "subscription",
    priceEnv: "STRIPE_ANNUAL_PRICE_ID",
    summary: "Annonces IA illimitées",
  },
} as const;

export const isOfferId = (v: unknown): v is OfferId => v === "pack" || v === "monthly" || v === "annual";

/** Montant en euros avec virgule française, ex. 499 -> « 4,99 ». */
export const formatCents = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
/** Montant en euros avec point (JSON-LD), ex. 499 -> « 4.99 ». */
export const centsToDecimal = (cents: number) => (cents / 100).toFixed(2);
