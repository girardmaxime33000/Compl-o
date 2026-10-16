import { createHash } from "node:crypto";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { findPost, isIndexable, type BlogPost } from "@/lib/blog";

/**
 * Envoi des newsletters : logique pure (validation, empreinte du contenu, choix des destinataires, secret). Les accès base
 * et l'envoi sont dans `/api/newsletter/send`.
 */

/** Destinataires par appel : un lot Resend (100 maximum) ; l'appelant répète jusqu'à `remaining = 0`. */
export const SEND_BATCH_SIZE = 50;
export const MAX_POSTS_PER_CAMPAIGN = 5;

export const sendSchema = z.object({
  campaignId: z.string().regex(/^[a-z0-9][a-z0-9-]{2,59}$/),
  subject: z.string().trim().min(3).max(150),
  intro: z.string().trim().max(1200).optional(),
  posts: z.array(z.string().regex(/^[a-z0-9-]{1,50}$/)).min(1).max(MAX_POSTS_PER_CAMPAIGN),
  mode: z.enum(["preview", "test", "send"]),
  /** Adresse du test d'envoi (mode `test`). */
  to: z.email().max(254).optional(),
});
export type SendRequest = z.infer<typeof sendSchema>;

/** Seuls les articles relus (`reviewedOn`) peuvent être envoyés : même règle que pour la publication. */
export function resolvePosts(slugs: string[]): { posts: BlogPost[] } | { error: string } {
  if (new Set(slugs).size !== slugs.length) return { error: "Article en double." };
  const posts: BlogPost[] = [];
  for (const slug of slugs) {
    const post = findPost(slug);
    if (!post) return { error: `Article inconnu : ${slug}` };
    if (!isIndexable(post)) return { error: `Article non relu (reviewedOn manquant) : ${slug}` };
    posts.push(post);
  }
  return { posts };
}

/** Empreinte du contenu de la campagne : l'objet, l'introduction et la liste ordonnée des articles. */
export const contentHash = (r: Pick<SendRequest, "subject" | "intro" | "posts">) =>
  createHash("sha256").update(JSON.stringify([r.subject, r.intro ?? "", r.posts])).digest("hex");

/** Destinataires restant à servir : abonnés confirmés sans livraison pour cette campagne, au plus `size`. */
export function pickRecipients<T extends { id: string }>(confirmed: T[], delivered: Set<string>, size = SEND_BATCH_SIZE) {
  const remaining = confirmed.filter((s) => !delivered.has(s.id));
  return { batch: remaining.slice(0, size), remaining: remaining.length };
}

/** Comparaison à temps constant ; refuse si le secret n'est pas configuré. */
export function isAuthorized(header: string | null): boolean {
  const secret = process.env.NEWSLETTER_SEND_SECRET;
  if (!secret || secret.length < 16 || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}
