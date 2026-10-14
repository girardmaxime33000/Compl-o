import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, siteUrl } from "@/lib/stripe/server";
import { LEGAL } from "@/lib/legal";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { acceptTerms?: unknown; waiveWithdrawal?: unknown } | null;
  if (body?.acceptTerms !== true || body?.waiveWithdrawal !== true) {
    return NextResponse.json(
      { error: "Acceptez les CGU/CGV et la demande d'accès immédiat pour continuer." },
      { status: 400 },
    );
  }

  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "Offre Premium non configurée." }, { status: 500 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, stripe_customer_id, subscription_status")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  if (profile.subscription_status === "active") {
    return NextResponse.json({ error: "Vous êtes déjà Premium." }, { status: 409 });
  }

  const stripe = getStripe();
  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email ?? user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    // La colonne est protégée en écriture pour les utilisateurs : on passe par le service role.
    await createAdminClient().from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${siteUrl()}/dashboard?checkout=success`,
    cancel_url: `${siteUrl()}/pricing?checkout=canceled`,
    metadata: { terms_version: LEGAL.termsVersion, terms_accepted_at: new Date().toISOString(), withdrawal_waiver: "true" },
    subscription_data: { metadata: { user_id: user.id, terms_version: LEGAL.termsVersion } },
  });

  return NextResponse.json({ url: session.url });
}
