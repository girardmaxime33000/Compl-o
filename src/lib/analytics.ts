/**
 * Mesure d'audience interne : événements anonymes (nom, chemin, propriétés non personnelles), sans cookie,
 * sans identifiant utilisateur, sans adresse IP. Aucun outil tiers.
 */
export const CLIENT_EVENTS = ["simulator_view", "simulation_completed", "diagnostic_started", "diagnostic_completed", "paywall_click", "home_view", "cta_click"] as const;
export const SERVER_EVENTS = ["signup", "listing_generated", "checkout_started", "payment_success"] as const;

export type ClientEvent = (typeof CLIENT_EVENTS)[number];
export type ServerEvent = (typeof SERVER_EVENTS)[number];

/**
 * Propriétés autorisées : valeurs courtes et non personnelles (offre, source, plateforme, activité, cible du clic, version
 * du visuel `photo` ou `none` pour comparer avant/après l'ajout de photos).
 */
export const ALLOWED_PROPS = ["source", "offer", "platform", "activity", "target", "visual"] as const;

export function sanitizeProps(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input || typeof input !== "object") return out;
  for (const key of ALLOWED_PROPS) {
    const v = (input as Record<string, unknown>)[key];
    if (typeof v === "string" && /^[\w.\- ]{1,50}$/.test(v)) out[key] = v;
  }
  return out;
}

/** Envoi côté navigateur. Respecte « Do Not Track » et Global Privacy Control, n'échoue jamais bruyamment. */
export function track(name: ClientEvent, props?: Partial<Record<(typeof ALLOWED_PROPS)[number], string>>) {
  try {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    const body = JSON.stringify({ name, path: window.location.pathname, props });
    if (!nav.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch {
    /* la mesure ne doit jamais perturber l'usage */
  }
}
