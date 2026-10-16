import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyNewsletterUnsubscribeToken } from "@/lib/email";
import { emailLinkPage } from "@/lib/newsletter-pages";

export const runtime = "nodejs";

async function unsubscribe(id: string | null, token: string | null) {
  if (!id || !token || !z.uuid().safeParse(id).success || !verifyNewsletterUnsubscribeToken(id, token)) {
    return emailLinkPage("Désinscription", "<p>Lien de désinscription invalide.</p>", 400);
  }
  const { error } = await createAdminClient()
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString(), confirmation_token_hash: null })
    .eq("id", id);
  if (error) {
    console.error("newsletter unsubscribe", error.message);
    return emailLinkPage("Désinscription", "<p>Désinscription impossible. Réessayez ou écrivez-nous.</p>", 500);
  }
  return emailLinkPage("Désinscription", "<p>Vous êtes désinscrit de la newsletter de Compléo.</p>");
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  return unsubscribe(u.searchParams.get("s"), u.searchParams.get("t"));
}

/** Désinscription en un clic (en-tête List-Unsubscribe-Post). */
export async function POST(req: Request) {
  const u = new URL(req.url);
  return unsubscribe(u.searchParams.get("s"), u.searchParams.get("t"));
}
