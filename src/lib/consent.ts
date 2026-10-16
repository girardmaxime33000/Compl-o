/**
 * Consentement aux traceurs non essentiels (mesure d'audience Umami).
 * Les cookies strictement nécessaires (session de connexion) n'exigent pas de consentement et ne passent pas par ici.
 * Le choix est conservé dans le navigateur (localStorage) et redemandé après 6 mois, durée de renouvellement
 * recommandée par la CNIL (délibération 2020-091 et lignes directrices : refus aussi simple que l'acceptation,
 * choix conservé 6 mois). Vérifié le 2026-10-16 sur cnil.fr ; texte à faire relire par un juriste.
 */
export const CONSENT_KEY = "compleo_consent";
export const CONSENT_EVENT = "compleo:consent";
export const CONSENT_OPEN_EVENT = "compleo:consent-open";
export const CONSENT_MAX_AGE_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export type ConsentChoice = "accepted" | "refused";
export interface StoredConsent {
  choice: ConsentChoice;
  /** Horodatage du choix (ms depuis l'epoch). */
  at: number;
}

/** Lit une valeur stockée ; renvoie null si absente, illisible ou expirée (le visiteur est alors redemandé). */
export function parseConsent(raw: string | null, now: number = Date.now()): StoredConsent | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<StoredConsent>;
    if (v.choice !== "accepted" && v.choice !== "refused") return null;
    if (typeof v.at !== "number" || !Number.isFinite(v.at)) return null;
    if (v.at > now || now - v.at > CONSENT_MAX_AGE_MS) return null;
    return { choice: v.choice, at: v.at };
  } catch {
    return null;
  }
}

export function serializeConsent(choice: ConsentChoice, now: number = Date.now()): string {
  return JSON.stringify({ choice, at: now } satisfies StoredConsent);
}

export function readConsent(): StoredConsent | null {
  try {
    return parseConsent(window.localStorage.getItem(CONSENT_KEY));
  } catch {
    return null;
  }
}

/** Enregistre le choix, aligne le drapeau d'exclusion d'Umami et prévient les composants à l'écoute. */
export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, serializeConsent(choice));
    // Umami ignore tout envoi tant que cette clé vaut « 1 » (utile si le script est déjà chargé dans l'onglet).
    if (choice === "accepted") window.localStorage.removeItem("umami.disabled");
    else window.localStorage.setItem("umami.disabled", "1");
  } catch {
    // Stockage indisponible (navigation privée stricte) : le choix vaut pour la page seulement.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
