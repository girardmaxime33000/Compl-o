import { createAdminClient } from "@/lib/supabase/admin";
import { parseMin, parseSince, usageProof, type UsageProof } from "@/lib/social-proof";
import type { Testimonial } from "@/types/database";

/** Annonces rédigées depuis la date d'ouverture. Toute erreur (base absente, clé manquante) donne null : on n'affiche rien. */
export async function getUsageProof(): Promise<UsageProof | null> {
  const since = parseSince(process.env.SOCIAL_PROOF_SINCE);
  if (!since) return null;
  try {
    const { count, error } = await createAdminClient()
      .from("listings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since.toISOString());
    if (error) return null;
    return usageProof(count, since, parseMin(process.env.SOCIAL_PROOF_MIN_LISTINGS));
  } catch {
    return null;
  }
}

export type PublicTestimonial = Pick<Testimonial, "id" | "first_name" | "city" | "body">;

/** Témoignages relus et approuvés, les plus récents d'abord. Aucun champ personnel au-delà du prénom et de la ville saisis. */
export async function getApprovedTestimonials(limit = 6): Promise<PublicTestimonial[]> {
  try {
    const { data, error } = await createAdminClient()
      .from("testimonials")
      .select("id, first_name, city, body")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);
    return error || !data ? [] : (data as PublicTestimonial[]);
  } catch {
    return [];
  }
}
