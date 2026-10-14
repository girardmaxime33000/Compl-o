import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { effectivePlan, getQuota, quotaExhausted } from "@/lib/quota";
import { FREE_MONTHLY_LISTINGS, MONTHLY_PLAN_DAILY_LISTINGS } from "@/lib/platforms";

type Grant = { remaining: number; expires_at: string };

const fake = (opts: { rpcCount?: number; monthCount?: number; grants?: Grant[] }) =>
  ({
    rpc: async () => ({ data: opts.rpcCount ?? 0 }),
    from: (table: string) =>
      table === "listing_credit_grants"
        ? { select: () => ({ gt: () => ({ gt: () => ({ order: async () => ({ data: opts.grants ?? [] }) }) }) }) }
        : { select: () => ({ eq: () => ({ gte: async () => ({ count: opts.monthCount ?? 0 }) }) }) },
  }) as unknown as SupabaseClient;

const profile = (status: "free" | "active" | "canceled", plan: "monthly" | "annual" | null) => ({
  subscription_status: status,
  subscription_plan: plan,
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
  it("sans lot de crédits non expiré : 0 crédit et pas de date", async () => {
    const q = await getQuota(fake({ monthCount: 0 }), "u", profile("free", null));
    expect(q).toMatchObject({ credits: 0, creditsExpireAt: null });
  });

  it("gratuit : plafond mensuel", async () => {
    const grants = [
      { remaining: 1, expires_at: "2027-03-01T00:00:00Z" },
      { remaining: 2, expires_at: "2027-09-01T00:00:00Z" },
    ];
    const q = await getQuota(fake({ monthCount: 2, grants }), "u", profile("free", null));
    expect(q).toEqual({ limit: FREE_MONTHLY_LISTINGS, period: "month", used: 2, credits: 3, creditsExpireAt: "2027-03-01T00:00:00Z" });
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
