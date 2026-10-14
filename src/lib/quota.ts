import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_MONTHLY_LISTINGS, MONTHLY_PLAN_DAILY_LISTINGS } from "@/lib/platforms";
import type { Profile } from "@/types/database";

export type QuotaPeriod = "month" | "day";

export interface Quota {
  /** null = illimité (plan annuel). */
  limit: number | null;
  period: QuotaPeriod;
  used: number;
  /** Crédits non expirés du pack ponctuel, consommés une fois le quota épuisé. */
  credits: number;
  /** Date d'expiration (ISO) du lot de crédits qui expire en premier, ou null. */
  creditsExpireAt: string | null;
}

type PlanProfile = Pick<Profile, "subscription_status" | "subscription_plan">;

/** Plan effectif : un abonnement actif sans plan renseigné est traité comme mensuel. */
export function effectivePlan(profile: Pick<Profile, "subscription_status" | "subscription_plan">): "free" | "monthly" | "annual" {
  if (profile.subscription_status !== "active") return "free";
  return profile.subscription_plan === "annual" ? "annual" : "monthly";
}

/** Lots de crédits non expirés de l'utilisateur (RLS : lecture de ses propres lots). */
async function getCredits(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("listing_credit_grants")
    .select("remaining, expires_at")
    .gt("remaining", 0)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at");
  const grants = (data ?? []) as { remaining: number; expires_at: string }[];
  return { credits: grants.reduce((sum, g) => sum + g.remaining, 0), creditsExpireAt: grants[0]?.expires_at ?? null };
}

export async function getQuota(supabase: SupabaseClient, userId: string, profile: PlanProfile): Promise<Quota> {
  const plan = effectivePlan(profile);
  const { credits, creditsExpireAt } = await getCredits(supabase);
  if (plan === "annual") return { limit: null, period: "day", used: 0, credits, creditsExpireAt };

  if (plan === "monthly") {
    const { data } = await supabase.rpc("listings_count_today");
    return { limit: MONTHLY_PLAN_DAILY_LISTINGS, period: "day", used: Number(data ?? 0), credits, creditsExpireAt };
  }

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart.toISOString());
  return { limit: FREE_MONTHLY_LISTINGS, period: "month", used: count ?? 0, credits, creditsExpireAt };
}

export const quotaExhausted = (q: Quota) => q.limit !== null && q.used >= q.limit;
