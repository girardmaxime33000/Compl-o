import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_MONTHLY_LISTINGS, MONTHLY_PLAN_DAILY_LISTINGS } from "@/lib/platforms";
import type { Profile } from "@/types/database";

export type QuotaPeriod = "month" | "day";

export interface Quota {
  /** null = illimité (plan annuel). */
  limit: number | null;
  period: QuotaPeriod;
  used: number;
  /** Crédits du pack ponctuel, consommés une fois le quota épuisé. */
  credits: number;
}

type PlanProfile = Pick<Profile, "subscription_status" | "subscription_plan" | "listing_credits">;

/** Plan effectif : un abonnement actif sans plan renseigné est traité comme mensuel. */
export function effectivePlan(profile: Pick<Profile, "subscription_status" | "subscription_plan">): "free" | "monthly" | "annual" {
  if (profile.subscription_status !== "active") return "free";
  return profile.subscription_plan === "annual" ? "annual" : "monthly";
}

export async function getQuota(supabase: SupabaseClient, userId: string, profile: PlanProfile): Promise<Quota> {
  const plan = effectivePlan(profile);
  const credits = profile.listing_credits ?? 0;
  if (plan === "annual") return { limit: null, period: "day", used: 0, credits };

  if (plan === "monthly") {
    const { data } = await supabase.rpc("listings_count_today");
    return { limit: MONTHLY_PLAN_DAILY_LISTINGS, period: "day", used: Number(data ?? 0), credits };
  }

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart.toISOString());
  return { limit: FREE_MONTHLY_LISTINGS, period: "month", used: count ?? 0, credits };
}

export const quotaExhausted = (q: Quota) => q.limit !== null && q.used >= q.limit;
