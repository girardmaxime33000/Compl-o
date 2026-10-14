import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { OFFERS } from "@/lib/offers";
import { recordEvent } from "@/lib/analytics-server";
import { PACK_LISTING_CREDITS } from "@/lib/platforms";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";

export const runtime = "nodejs";

function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus | null {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    default:
      return null; // past_due, incomplete, paused : on conserve l'état actuel
  }
}

/** Plan déduit du prix Stripe (source d'autorité), via les variables d'environnement. */
function planOfPrice(priceId: string | undefined): SubscriptionPlan | null {
  if (!priceId) return null;
  if (priceId === process.env[OFFERS.annual.priceEnv]) return "annual";
  if (priceId === process.env[OFFERS.monthly.priceEnv]) return "monthly";
  return null;
}

async function setStatus(customerId: string, status: SubscriptionStatus, userId?: string | null, plan?: SubscriptionPlan | null) {
  const admin = createAdminClient();
  const patch: { subscription_status: SubscriptionStatus; stripe_customer_id: string; subscription_plan?: SubscriptionPlan | null } = {
    subscription_status: status,
    stripe_customer_id: customerId,
  };
  if (status === "canceled") patch.subscription_plan = null;
  else if (plan) patch.subscription_plan = plan;
  const query = admin.from("profiles").update(patch);
  const { error } = await (userId ? query.eq("id", userId) : query.eq("stripe_customer_id", customerId));
  if (error) throw error;
}

const customerIdOf = (c: string | Stripe.Customer | Stripe.DeletedCustomer | null) => (typeof c === "string" ? c : c?.id ?? null);

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Signature manquante." }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  // Idempotence : on réserve l'identifiant de l'événement avant de le traiter.
  const admin = createAdminClient();
  const { error: claimError } = await admin.from("stripe_events").insert({ id: event.id, type: event.type });
  if (claimError) {
    if (claimError.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    console.error("stripe webhook claim", event.id, claimError);
    return NextResponse.json({ error: "Traitement échoué." }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const customerId = customerIdOf(session.customer);
        if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") break;
        if (session.mode === "subscription" && customerId) {
          const offer = session.metadata?.offer;
          const plan: SubscriptionPlan | null = offer === "annual" ? "annual" : offer === "monthly" ? "monthly" : null;
          await setStatus(customerId, "active", session.client_reference_id, plan);
          await recordEvent("payment_success", { offer: offer ?? "subscription" });
        } else if (session.mode === "payment" && session.metadata?.offer === "pack" && session.client_reference_id) {
          const { error } = await admin.rpc("grant_listing_credits", {
            p_user: session.client_reference_id,
            p_amount: PACK_LISTING_CREDITS,
          });
          if (error) throw error;
          await recordEvent("payment_success", { offer: "pack" });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = customerIdOf(sub.customer);
        const status = event.type === "customer.subscription.deleted" ? "canceled" : mapStatus(sub.status);
        const plan = planOfPrice(sub.items.data[0]?.price.id);
        if (customerId && status) await setStatus(customerId, status, null, plan);
        break;
      }
    }
  } catch (error) {
    console.error("stripe webhook", event.type, error);
    // Libère la réservation pour que Stripe puisse rejouer l'événement.
    await admin.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "Traitement échoué." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
