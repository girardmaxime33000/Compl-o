"use server";

import { createClient } from "@/lib/supabase/server";
import { testimonialSchema, type TestimonialInput } from "@/lib/testimonial";

type Result = { ok: boolean; error?: string };

/** Enregistre le témoignage du compte connecté, en attente de relecture. Réservé à qui a rédigé au moins une annonce. */
export async function submitTestimonial(input: TestimonialInput): Promise<Result> {
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { count } = await supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if (!count) return { ok: false, error: "Rédigez d'abord une annonce pour donner votre avis." };

  const { firstName, city, body } = parsed.data;
  const { error } = await supabase
    .from("testimonials")
    .insert({ user_id: user.id, first_name: firstName, city: city || null, body, status: "pending" });
  if (error?.code === "23505") return { ok: false, error: "Vous avez déjà envoyé un témoignage. Retirez-le pour en écrire un autre." };
  return error ? { ok: false, error: "Enregistrement impossible." } : { ok: true };
}

/** Retire le témoignage du compte connecté (publié ou non). */
export async function withdrawTestimonial(): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };
  const { error } = await supabase.from("testimonials").delete().eq("user_id", user.id);
  return error ? { ok: false, error: "Suppression impossible." } : { ok: true };
}
