import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { newsletterConfirmationEmail } from "@/lib/email-templates";
import {
  GLOBAL_CONFIRMATIONS_PER_HOUR, NEWSLETTER_CONSENT_VERSION, newConfirmationToken, newsletterEnabled, pendingCutoff,
  planSubscription, subscribeSchema, type ExistingSubscriber,
} from "@/lib/newsletter";
import { absoluteUrl } from "@/lib/seo";

export const runtime = "nodejs";

/** Réponse identique dans tous les cas où la demande est valide : on ne révèle pas si une adresse est déjà inscrite. */
const OK = { ok: true, message: "Presque terminé : si l'adresse est valide, un e-mail de confirmation vient d'être envoyé. Cliquez sur le lien qu'il contient pour valider l'inscription." };

export async function POST(request: Request) {
  if (!newsletterEnabled() || !isEmailConfigured()) {
    return NextResponse.json({ error: "L'inscription à la newsletter n'est pas disponible pour le moment." }, { status: 503 });
  }

  const parsed = subscribeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse e-mail invalide ou consentement manquant." }, { status: 400 });
  }
  const { email, source, website } = parsed.data;
  if (website) return NextResponse.json(OK); // robot : réponse normale, aucune action

  const admin = createAdminClient();
  const now = new Date();

  // Plafond global : borne le nombre d'e-mails de confirmation envoyés par heure, quelle que soit l'origine.
  const { count: lastHour, error: capError } = await admin
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .gte("confirmation_sent_at", new Date(now.getTime() - 3_600_000).toISOString());
  if (capError) {
    console.error("newsletter cap", capError.message);
    return NextResponse.json({ error: "Inscription impossible pour le moment." }, { status: 500 });
  }
  if ((lastHour ?? 0) >= GLOBAL_CONFIRMATIONS_PER_HOUR) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez dans une heure." }, { status: 429 });
  }

  // Les adresses jamais confirmées sont supprimées au bout de 7 jours.
  await admin.from("newsletter_subscribers").delete().eq("status", "pending").lt("created_at", pendingCutoff(now).toISOString());

  const { data: existing, error: readError } = await admin
    .from("newsletter_subscribers")
    .select("id, status, confirmation_sent_at, confirmation_window_start, confirmation_count")
    .eq("email", email)
    .maybeSingle();
  if (readError) {
    console.error("newsletter read", readError.message);
    return NextResponse.json({ error: "Inscription impossible pour le moment." }, { status: 500 });
  }

  const plan = planSubscription(existing as (ExistingSubscriber & { id: string }) | null, now);
  if (plan.action === "skip") return NextResponse.json(OK);

  const { token, hash } = newConfirmationToken();
  const fields = {
    status: "pending" as const,
    source,
    consent_version: NEWSLETTER_CONSENT_VERSION,
    consent_at: now.toISOString(),
    confirmation_token_hash: hash,
    confirmation_sent_at: now.toISOString(),
    confirmation_window_start: plan.windowStart.toISOString(),
    confirmation_count: plan.count,
    confirmed_at: null,
    unsubscribed_at: null,
  };

  const written =
    plan.action === "create"
      ? await admin.from("newsletter_subscribers").insert({ email, ...fields })
      : await admin.from("newsletter_subscribers").update(fields).eq("email", email);
  if (written.error) {
    // Course entre deux demandes simultanées pour la même adresse : l'autre demande envoie déjà le message.
    if (written.error.code === "23505") return NextResponse.json(OK);
    console.error("newsletter write", written.error.message);
    return NextResponse.json({ error: "Inscription impossible pour le moment." }, { status: 500 });
  }

  const mail = newsletterConfirmationEmail(`${absoluteUrl("/api/newsletter/confirm")}?t=${token}`);
  const sent = await sendEmail({ to: email, ...mail });
  if (!sent.ok) {
    if (plan.action === "create") await admin.from("newsletter_subscribers").delete().eq("email", email).eq("status", "pending");
    return NextResponse.json({ error: "L'e-mail de confirmation n'a pas pu être envoyé. Réessayez dans quelques minutes." }, { status: 502 });
  }
  return NextResponse.json(OK);
}
