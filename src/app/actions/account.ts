"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { DELETE_CONFIRMATION } from "@/lib/account";


/**
 * Suppression du compte (RGPD, droit à l'effacement) : résilie et supprime le client Stripe, puis supprime
 * l'utilisateur Supabase ; profil, annonces, factures et compétences partent en cascade.
 */
export async function deleteAccount(confirmation: string): Promise<{ ok: boolean; error?: string }> {
  if (confirmation.trim() !== DELETE_CONFIRMATION) {
    return { ok: false, error: `Saisissez « ${DELETE_CONFIRMATION} » pour confirmer.` };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();

  // Stripe d'abord : supprimer un client résilie ses abonnements. En cas d'échec on s'arrête pour ne pas
  // laisser un abonnement actif sans compte.
  if (profile?.stripe_customer_id) {
    try {
      await getStripe().customers.del(profile.stripe_customer_id);
    } catch (error) {
      console.error("delete-account stripe", error);
      return { ok: false, error: "Suppression de l'abonnement impossible. Réessayez ou contactez le support." };
    }
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) {
    console.error("delete-account supabase", error);
    return { ok: false, error: "Suppression du compte impossible. Réessayez ou contactez le support." };
  }

  await supabase.auth.signOut();
  return { ok: true };
}
