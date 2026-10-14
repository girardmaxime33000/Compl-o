import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { effectivePlan, getQuota, quotaExhausted } from "@/lib/quota";
import { FREE_MONTHLY_LISTINGS, MONTHLY_PLAN_DAILY_LISTINGS } from "@/lib/platforms";

const fake = (opts: { rpcCount?: number; monthCount?: number }) =>
  ({
    rpc: async () => ({ data: opts.rpcCount ?? 0 }),
    from: () => ({ select: () => ({ eq: () => ({ gte: async () => ({ count: opts.monthCount ?? 0 }) }) }) }),
  }) as unknown as SupabaseClient;

const profile = (status: "free" | "active" | "canceled", plan: "monthly" | "annual" | null, credits = 0) => ({
  subscription_status: status,
  subscription_plan: plan,
  listing_credits: credits,
});

describe("effectivePlan", () => {
  it("traite un abonnement actif sans plan comme mensuel, un abonnement résilié comme gratuit", () => {
    expect(effectivePlan(profile("free", null))).toBe("free");
    expect(effectivePlan(profile("canceled", "annual"))).toBe("free");
    expect(effectivePlan(profile("active", null))).toBe("monthly");
    expect(effectivePlan(profile("active", "annual"))).toBe("annual");
  });
});

describe("getQuota", () => {
  it("gratuit : plafond mensuel", async () => {
    const q = await getQuota(fake({ monthCount: 2 }), "u", profile("free", null, 3));
    expect(q).toEqual({ limit: FREE_MONTHLY_LISTINGS, period: "month", used: 2, credits: 3 });
    expect(quotaExhausted(q)).toBe(true);
    expect(quotaExhausted({ ...q, used: 1 })).toBe(false);
  });

  it("mensuel : plafond quotidien", async () => {
    const q = await getQuota(fake({ rpcCount: 10 }), "u", profile("active", "monthly"));
    expect(q).toMatchObject({ limit: MONTHLY_PLAN_DAILY_LISTINGS, period: "day", used: 10 });
    expect(quotaExhausted(q)).toBe(true);
  });

  it("annuel : illimité", async () => {
    const q = await getQuota(fake({ rpcCount: 999 }), "u", profile("active", "annual"));
    expect(q.limit).toBeNull();
    expect(quotaExhausted(q)).toBe(false);
  });
});
