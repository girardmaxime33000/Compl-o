import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/** Retourne l'utilisateur connecté et son profil, ou redirige vers /login. */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) redirect("/login");

  return { supabase, user, profile };
}

export const isPremium = (profile: Pick<Profile, "subscription_status">) => profile.subscription_status === "active";

/** N'accepte que des chemins internes pour éviter les redirections ouvertes. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
