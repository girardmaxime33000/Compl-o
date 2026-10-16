import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

/**
 * Newsletter du blog : double opt-in. Logique pure (jetons, validation, limitation d'envoi) ; les routes
 * `/api/newsletter/*` font les accès base et l'envoi. Textes juridiques en brouillon, à faire relire.
 */

export { NEWSLETTER_CONSENT_TEXT, NEWSLETTER_CONSENT_VERSION } from "@/lib/newsletter-consent";

/** Le formulaire n'est affiché et l'API n'accepte les inscriptions que si NEWSLETTER_ENABLED=true (relecture juridique faite). */
export const newsletterEnabled = () => process.env.NEWSLETTER_ENABLED === "true";

export const CONFIRM_TTL_HOURS = 48;
export const RESEND_COOLDOWN_MINUTES = 10;
export const MAX_CONFIRMATION_EMAILS_PER_DAY = 3;
export const GLOBAL_CONFIRMATIONS_PER_HOUR = 100;
export const PENDING_RETENTION_DAYS = 7;

export const SOURCE_PATTERN = /^blog(:[a-z0-9-]{1,50})?$/;

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  consent: z.literal(true),
  source: z.string().regex(SOURCE_PATTERN).default("blog"),
  /** Champ piège (honeypot) : rempli par les robots, invisible pour les personnes. */
  website: z.string().max(200).optional(),
});

export const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function newConfirmationToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashToken(token) };
}

/** Slug de l'article d'origine, pour la mesure (`blog:<slug>`), ou undefined. */
export const articleOfSource = (source: string) => (source.startsWith("blog:") ? source.slice(5) : undefined);

export interface ExistingSubscriber {
  status: "pending" | "confirmed" | "unsubscribed";
  confirmation_sent_at: string | null;
  confirmation_window_start: string | null;
  confirmation_count: number;
}

export type SubscribePlan =
  | { action: "create"; windowStart: Date; count: 1 }
  | { action: "send"; windowStart: Date; count: number }
  | { action: "skip"; reason: "confirmed" | "cooldown" | "daily_cap" };

const MIN = 60_000;
const HOUR = 60 * MIN;

/**
 * Décide quoi faire pour une adresse. Une adresse déjà confirmée n'est jamais relancée, une adresse en attente n'est
 * relancée qu'après un délai et dans la limite de 3 e-mails par 24 h : on ne peut pas utiliser le formulaire pour
 * submerger une boîte mail. La réponse HTTP est la même dans tous les cas (pas d'énumération d'adresses).
 */
export function planSubscription(existing: ExistingSubscriber | null, now: Date): SubscribePlan {
  if (!existing) return { action: "create", windowStart: now, count: 1 };
  if (existing.status === "confirmed") return { action: "skip", reason: "confirmed" };

  const sentAt = existing.confirmation_sent_at ? new Date(existing.confirmation_sent_at).getTime() : null;
  // Le délai ne protège que les adresses en attente : une personne désinscrite qui se réinscrit explicitement n'est pas ignorée.
  if (existing.status === "pending" && sentAt !== null && now.getTime() - sentAt < RESEND_COOLDOWN_MINUTES * MIN) return { action: "skip", reason: "cooldown" };

  const windowStart = existing.confirmation_window_start ? new Date(existing.confirmation_window_start) : null;
  const inWindow = windowStart !== null && now.getTime() - windowStart.getTime() < 24 * HOUR;
  if (inWindow && existing.confirmation_count >= MAX_CONFIRMATION_EMAILS_PER_DAY) return { action: "skip", reason: "daily_cap" };
  return inWindow
    ? { action: "send", windowStart: windowStart, count: existing.confirmation_count + 1 }
    : { action: "send", windowStart: now, count: 1 };
}

export const isConfirmationExpired = (sentAt: string | null, now: Date) =>
  !sentAt || now.getTime() - new Date(sentAt).getTime() > CONFIRM_TTL_HOURS * HOUR;

export const pendingCutoff = (now: Date) => new Date(now.getTime() - PENDING_RETENTION_DAYS * 24 * HOUR);
