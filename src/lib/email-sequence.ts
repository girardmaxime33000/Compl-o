import { TAX_PARAMS } from "@/lib/tax";
import type { CeilingKind } from "@/lib/email-templates";

export type SequenceKind = "onboarding_day1" | "onboarding_day3" | CeilingKind;

export interface UserEmailState {
  createdAt: Date;
  listingsCount: number;
  /** Total des factures (hors devis) marquées payées sur l'année civile en cours. */
  paidThisYear: number;
  /** Clés déjà envoyées, au format `${kind}:${ref}`. */
  sent: Set<string>;
}

const DAY = 86_400_000;
/** Au-delà, un compte n'entre plus dans la séquence d'accueil. */
const ONBOARDING_WINDOW_DAYS = 14;
const ALERT_RATIO = 0.8;

export interface PlannedEmail {
  kind: SequenceKind;
  /** Distingue les envois répétables (alertes annuelles). */
  ref: string;
}

/** Détermine les e-mails à envoyer à un utilisateur ayant consenti. Fonction pure. */
export function planEmails(state: UserEmailState, now: Date): PlannedEmail[] {
  const planned: PlannedEmail[] = [];
  const ageDays = (now.getTime() - state.createdAt.getTime()) / DAY;
  const year = String(now.getUTCFullYear());
  const has = (kind: string, ref = "") => state.sent.has(`${kind}:${ref}`);

  if (ageDays >= 1 && ageDays < ONBOARDING_WINDOW_DAYS && !has("onboarding_day1")) planned.push({ kind: "onboarding_day1", ref: "" });
  if (ageDays >= 3 && ageDays < ONBOARDING_WINDOW_DAYS && state.listingsCount === 0 && !has("onboarding_day3")) {
    planned.push({ kind: "onboarding_day3", ref: "" });
  }
  // Une seule alerte par année et par seuil, la plus haute en premier.
  if (state.paidThisYear >= TAX_PARAMS.microCeilingServices * ALERT_RATIO && !has("ceiling_80", year)) {
    planned.push({ kind: "ceiling_80", ref: year });
  } else if (state.paidThisYear >= TAX_PARAMS.vatThreshold * ALERT_RATIO && !has("vat_80", year)) {
    planned.push({ kind: "vat_80", ref: year });
  }
  return planned;
}
