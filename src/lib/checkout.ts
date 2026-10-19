import type { SupabaseClient } from "@supabase/supabase-js";
import { effectivePlan } from "@/lib/quota";
import type { OfferId } from "@/lib/offers";
import type { Profile } from "@/types/database";

/**
 * Retour de paiement : vrai quand le webhook Stripe a enregistré l'achat. Abonnement : le plan du profil correspond à
 * l'offre. Pack : un lot de crédits a été accordé dans l'heure (RLS : lecture de ses propres lots).
 */
export async function isCheckoutActivated(
  supabase: SupabaseClient,
  profile: Pick<Profile, "subscription_status" | "subscription_plan">,
  offer: OfferId,
): Promise<boolean> {
  if (offer !== "pack") return effectivePlan(profile) === offer;
  const { count } = await supabase
    .from("listing_credit_grants")
    .select("id", { count: "exact", head: true })
    .gte("granted_at", new Date(Date.now() - 3_600_000).toISOString());
  return (count ?? 0) > 0;
}
