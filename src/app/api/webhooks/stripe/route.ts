import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import type { SubscriptionStatus } from "@/types/database";

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

async function setStatus(customerId: string, status: SubscriptionStatus, userId?: string | null) {
  const admin = createAdminClient();
  const query = admin.from("profiles").update({ subscription_status: status, stripe_customer_id: customerId });
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = customerIdOf(session.customer);
        if (session.mode === "subscription" && customerId && session.payment_status !== "unpaid") {
          await setStatus(customerId, "active", session.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = customerIdOf(sub.customer);
        const status = event.type === "customer.subscription.deleted" ? "canceled" : mapStatus(sub.status);
        if (customerId && status) await setStatus(customerId, status);
        break;
      }
    }
  } catch (error) {
    console.error("stripe webhook", event.type, error);
    return NextResponse.json({ error: "Traitement échoué." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
