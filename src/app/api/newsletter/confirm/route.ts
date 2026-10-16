import { createAdminClient } from "@/lib/supabase/admin";
import { emailLinkPage, escapeHtml } from "@/lib/newsletter-pages";
import { articleOfSource, hashToken, isConfirmationExpired, newsletterEnabled, TOKEN_PATTERN } from "@/lib/newsletter";
import { recordEvent } from "@/lib/analytics-server";

export const runtime = "nodejs";

const INVALID = () =>
  emailLinkPage("Confirmation", "<p>Ce lien est invalide, expiré ou déjà utilisé. Vous pouvez vous inscrire de nouveau depuis le blog de Compléo.</p>", 400);

/**
 * GET n'enregistre rien : les messageries et antivirus ouvrent souvent les liens d'un e-mail, ce qui confirmerait
 * l'inscription à l'insu de la personne. La confirmation se fait par un clic sur le bouton (POST).
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("t") ?? "";
  if (!TOKEN_PATTERN.test(token)) return INVALID();
  return emailLinkPage(
    "Confirmation",
    `<p>Confirmez votre inscription à la newsletter de Compléo.</p><form method="post" action="/api/newsletter/confirm"><input type="hidden" name="t" value="${escapeHtml(token)}"><button type="submit" style="background:#2563eb;color:#fff;border:0;padding:10px 18px;border-radius:6px;font-size:15px;cursor:pointer">Confirmer mon inscription</button></form>`,
  );
}

export async function POST(req: Request) {
  if (!newsletterEnabled()) return emailLinkPage("Confirmation", "<p>L'inscription à la newsletter n'est pas disponible pour le moment.</p>", 503);
  const form = await req.formData().catch(() => null);
  const token = String(form?.get("t") ?? new URL(req.url).searchParams.get("t") ?? "");
  if (!TOKEN_PATTERN.test(token)) return INVALID();

  const admin = createAdminClient();
  const now = new Date();
  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select("id, source, status, confirmation_sent_at")
    .eq("confirmation_token_hash", hashToken(token))
    .maybeSingle();
  if (error) {
    console.error("newsletter confirm", error.message);
    return emailLinkPage("Confirmation", "<p>Confirmation impossible pour le moment. Réessayez dans quelques minutes.</p>", 500);
  }
  if (!data || data.status !== "pending" || isConfirmationExpired(data.confirmation_sent_at, now)) return INVALID();

  const { error: updateError } = await admin
    .from("newsletter_subscribers")
    .update({ status: "confirmed", confirmed_at: now.toISOString(), confirmation_token_hash: null })
    .eq("id", data.id)
    .eq("status", "pending");
  if (updateError) {
    console.error("newsletter confirm update", updateError.message);
    return emailLinkPage("Confirmation", "<p>Confirmation impossible pour le moment. Réessayez dans quelques minutes.</p>", 500);
  }

  await recordEvent("newsletter_confirmed", { source: "blog", article: articleOfSource(data.source) });
  return emailLinkPage(
    "Inscription confirmée",
    `<p>Votre inscription à la newsletter de Compléo est confirmée.</p><p><a href="/simulateur-micro-entrepreneur">Essayer le simulateur</a> · <a href="/blog">Retour au blog</a></p>`,
  );
}
