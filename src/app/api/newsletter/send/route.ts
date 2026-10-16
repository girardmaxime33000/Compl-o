import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailConfigured, sendEmailBatch } from "@/lib/email";
import { newsletterEmail } from "@/lib/email-templates";
import { contentHash, isAuthorized, pickRecipients, resolvePosts, sendSchema, SEND_BATCH_SIZE } from "@/lib/newsletter-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Admin = ReturnType<typeof createAdminClient>;
const PAGE = 1000; // PostgREST plafonne les réponses (1000 lignes par défaut) : lecture par pages.

async function fetchAll<T>(read: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await read(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE) return rows;
  }
}

const loadConfirmed = (admin: Admin) =>
  fetchAll<{ id: string; email: string }>((a, b) =>
    admin.from("newsletter_subscribers").select("id, email").eq("status", "confirmed").order("created_at").order("id").range(a, b),
  );
const loadDelivered = (admin: Admin, campaignId: string) =>
  fetchAll<{ subscriber_id: string }>((a, b) =>
    admin.from("newsletter_deliveries").select("subscriber_id").eq("campaign_id", campaignId).order("subscriber_id").range(a, b),
  );

/**
 * Envoi d'une newsletter, réservé au porteur de NEWSLETTER_SEND_SECRET (Bearer). Trois modes :
 * - `preview` : rendu du message et compteurs, rien n'est envoyé ;
 * - `test` : un seul message à `to`, aucune écriture en base ;
 * - `send` : un lot de destinataires confirmés (SEND_BATCH_SIZE) ; à rappeler jusqu'à `remaining = 0`.
 * Idempotent : une livraison est réservée avant l'envoi, un destinataire ne reçoit jamais deux fois la même campagne.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const parsed = sendSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide.", details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, { status: 400 });
  const req = parsed.data;

  const resolved = resolvePosts(req.posts);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: 400 });
  const message = (subscriberId?: string) => newsletterEmail({ subject: req.subject, intro: req.intro, posts: resolved.posts, subscriberId });

  if (req.mode !== "preview" && !isEmailConfigured()) return NextResponse.json({ error: "E-mail non configuré." }, { status: 503 });
  const admin = createAdminClient();

  try {
    if (req.mode === "test") {
      if (!req.to) return NextResponse.json({ error: "Adresse de test manquante (to)." }, { status: 400 });
      const m = message();
      const sent = await sendEmailBatch([{ to: req.to, subject: `[TEST] ${m.subject}`, html: m.html, text: m.text }]);
      return sent.ok ? NextResponse.json({ sent: 1, mode: "test" }) : NextResponse.json({ error: "Envoi du test impossible." }, { status: 502 });
    }

    const hash = contentHash(req);
    const { data: campaign, error: campaignError } = await admin.from("newsletter_campaigns").select("id, content_hash").eq("id", req.campaignId).maybeSingle();
    if (campaignError) throw new Error(campaignError.message);
    if (campaign && campaign.content_hash !== hash) {
      return NextResponse.json({ error: "Cette campagne existe déjà avec un contenu différent. Utilisez un autre identifiant." }, { status: 409 });
    }

    const [confirmed, delivered] = await Promise.all([loadConfirmed(admin), campaign ? loadDelivered(admin, req.campaignId) : Promise.resolve([])]);
    const { batch, remaining } = pickRecipients(confirmed, new Set(delivered.map((d) => d.subscriber_id)));

    if (req.mode === "preview") {
      const m = message();
      return NextResponse.json({
        mode: "preview", subject: m.subject, text: m.text, html: m.html,
        confirmedSubscribers: confirmed.length, alreadyDelivered: delivered.length, remaining,
        campaignExists: Boolean(campaign), batchSize: SEND_BATCH_SIZE,
      });
    }

    if (!campaign) {
      const { error } = await admin.from("newsletter_campaigns").insert({ id: req.campaignId, subject: req.subject, content_hash: hash });
      if (error && error.code !== "23505") throw new Error(error.message);
    }
    if (batch.length === 0) return NextResponse.json({ sent: 0, remaining: 0, done: true });

    // Réservation : seules les lignes réellement insérées sont à nous (un appel concurrent n'obtient pas les mêmes).
    const { data: reserved, error: reserveError } = await admin
      .from("newsletter_deliveries")
      .upsert(batch.map((s) => ({ campaign_id: req.campaignId, subscriber_id: s.id })), { onConflict: "campaign_id,subscriber_id", ignoreDuplicates: true })
      .select("subscriber_id");
    if (reserveError) throw new Error(reserveError.message);
    const mine = batch.filter((s) => (reserved ?? []).some((r) => r.subscriber_id === s.id));
    if (mine.length === 0) return NextResponse.json({ sent: 0, remaining, done: false, note: "Un autre envoi est en cours pour ces destinataires." });

    const sent = await sendEmailBatch(
      mine.map((s) => {
        const m = message(s.id);
        return { to: s.email, subject: m.subject, html: m.html, text: m.text, unsubscribeUrl: m.unsubscribeUrl };
      }),
    );
    if (!sent.ok) {
      await admin.from("newsletter_deliveries").delete().eq("campaign_id", req.campaignId).in("subscriber_id", mine.map((s) => s.id));
      return NextResponse.json({ error: "Envoi du lot impossible. Rien n'est marqué comme envoyé : relancez la même commande.", sent: 0, remaining }, { status: 502 });
    }
    const left = remaining - mine.length;
    return NextResponse.json({ sent: mine.length, remaining: left, done: left === 0 });
  } catch (e) {
    console.error("newsletter send", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Envoi impossible pour le moment." }, { status: 500 });
  }
}
