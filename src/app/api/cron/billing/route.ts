import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PAST_DUE_GRACE_DAYS } from "@/lib/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tâche quotidienne (Vercel Cron). Retire l'accès Premium des abonnements restés impayés (`past_due`) au-delà du délai
 * de grâce. Si Stripe encaisse ensuite, l'événement `customer.subscription.updated` réactive l'abonnement.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { data, error } = await createAdminClient().rpc("expire_past_due_subscriptions", { p_days: PAST_DUE_GRACE_DAYS });
  if (error) {
    console.error("cron-billing", error.message);
    return NextResponse.json({ error: "Traitement impossible." }, { status: 500 });
  }
  return NextResponse.json({ expired: Number(data ?? 0) });
}
