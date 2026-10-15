import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { planEmails, type PlannedEmail } from "@/lib/email-sequence";
import { ceilingAlert, onboardingDay1, onboardingDay3, unsubscribeUrl, type Rendered } from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BATCH = 500;

function render(p: PlannedEmail, userId: string, paid: number, year: number): Rendered {
  if (p.kind === "onboarding_day1") return onboardingDay1(userId);
  if (p.kind === "onboarding_day3") return onboardingDay3(userId);
  return ceilingAlert(userId, p.kind, paid, year);
}

/**
 * Tâche quotidienne (Vercel Cron). Envoie la séquence d'accueil et les alertes de plafond aux seuls comptes ayant
 * consenti (email_tips_optin). Idempotent : la ligne email_log est réservée avant l'envoi, supprimée si l'envoi échoue.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!isEmailConfigured()) return NextResponse.json({ skipped: "E-mail non configuré." });

  const admin = createAdminClient();
  const now = new Date();
  const year = now.getUTCFullYear();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, email, created_at")
    .eq("email_tips_optin", true)
    .not("email", "is", null)
    .order("created_at", { ascending: false })
    .limit(BATCH);
  if (error) {
    console.error("cron-emails profiles", error.message);
    return NextResponse.json({ error: "Lecture impossible." }, { status: 500 });
  }
  if (!profiles?.length) return NextResponse.json({ sent: 0 });

  const ids = profiles.map((p) => p.id as string);
  const [listings, invoices, logs] = await Promise.all([
    admin.from("listings").select("user_id").in("user_id", ids),
    admin
      .from("invoices")
      .select("user_id, amount")
      .in("user_id", ids)
      .eq("status", "paid")
      .eq("document_type", "facture")
      .gte("issue_date", `${year}-01-01`),
    admin.from("email_log").select("user_id, kind, ref").in("user_id", ids),
  ]);

  const listingCount = new Map<string, number>();
  for (const l of listings.data ?? []) listingCount.set(l.user_id, (listingCount.get(l.user_id) ?? 0) + 1);
  const paid = new Map<string, number>();
  for (const i of invoices.data ?? []) paid.set(i.user_id, (paid.get(i.user_id) ?? 0) + Number(i.amount));
  const sentBy = new Map<string, Set<string>>();
  for (const l of logs.data ?? []) {
    const set = sentBy.get(l.user_id) ?? new Set<string>();
    set.add(`${l.kind}:${l.ref}`);
    sentBy.set(l.user_id, set);
  }

  let sent = 0;
  let failed = 0;
  for (const p of profiles) {
    const userId = p.id as string;
    const total = paid.get(userId) ?? 0;
    const planned = planEmails(
      { createdAt: new Date(p.created_at as string), listingsCount: listingCount.get(userId) ?? 0, paidThisYear: total, sent: sentBy.get(userId) ?? new Set() },
      now,
    );
    // Au plus un e-mail par utilisateur et par exécution.
    const next = planned[0];
    if (!next) continue;

    const { error: claimError } = await admin.from("email_log").insert({ user_id: userId, kind: next.kind, ref: next.ref });
    if (claimError) continue; // déjà réservé par une autre exécution
    const mail = render(next, userId, total, year);
    const res = await sendEmail({ to: p.email as string, ...mail, unsubscribeUrl: unsubscribeUrl(userId) });
    if (res.ok) sent += 1;
    else {
      failed += 1;
      await admin.from("email_log").delete().eq("user_id", userId).eq("kind", next.kind).eq("ref", next.ref);
    }
  }
  return NextResponse.json({ sent, failed });
}
