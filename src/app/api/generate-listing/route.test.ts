import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  user: { id: "user-1" } as { id: string } | null,
  profile: { subscription_status: "free", subscription_plan: null, listing_credits: 0 } as Record<string, unknown>,
  monthCount: 0,
  dayCount: 0,
  rpc: vi.fn(),
  inserted: [] as unknown[],
  generate: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: { getUser: async () => ({ data: { user: h.user } }) },
    rpc: async () => ({ data: h.dayCount }),
    from: (table: string) => {
      if (table === "profiles") return { select: () => ({ eq: () => ({ single: async () => ({ data: h.profile }) }) }) };
      return {
        select: (_cols?: string, opts?: { head?: boolean }) =>
          opts?.head
            ? { eq: () => ({ gte: async () => ({ count: h.monthCount }) }) }
            : { single: async () => ({ data: { id: "l1", title: "t" }, error: null }) },
        insert: (row: unknown) => {
          h.inserted.push(row);
          return { select: () => ({ single: async () => ({ data: { id: "l1", title: "t", platform: "leboncoin", description: "d", price_suggested: 20, created_at: "now" }, error: null }) }) };
        },
      };
    },
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: h.rpc }) }));
vi.mock("@/lib/ai", () => ({ getModel: () => ({}) }));
vi.mock("@/lib/analytics-server", () => ({ recordEvent: vi.fn() }));
vi.mock("ai", () => ({ generateObject: h.generate }));

import { POST } from "@/app/api/generate-listing/route";
import { FREE_MONTHLY_LISTINGS, MONTHLY_PLAN_DAILY_LISTINGS } from "@/lib/platforms";

const call = () =>
  POST(
    new Request("http://localhost/api/generate-listing", {
      method: "POST",
      body: JSON.stringify({ service: "Petit bricolage", city: "Lyon", platform: "leboncoin" }),
    }),
  );

const generated = {
  object: { title: "T", intro: "i", advantages: ["a", "b", "c"], skills: ["a", "b", "c"], pricing: "p", callToAction: "c", hashtags: ["#a", "#b", "#c"], priceSuggested: 20 },
};

beforeEach(() => {
  h.user = { id: "user-1" };
  h.profile = { subscription_status: "free", subscription_plan: null, listing_credits: 0 };
  h.monthCount = 0;
  h.dayCount = 0;
  h.inserted = [];
  h.rpc.mockReset();
  h.rpc.mockResolvedValue({ data: -1, error: null });
  h.generate.mockReset();
  h.generate.mockResolvedValue(generated);
});

describe("POST /api/generate-listing : quotas", () => {
  it("exige une connexion", async () => {
    h.user = null;
    expect((await call()).status).toBe(401);
  });

  it("autorise une annonce gratuite sous le plafond mensuel", async () => {
    h.monthCount = FREE_MONTHLY_LISTINGS - 1;
    expect((await call()).status).toBe(200);
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it("bloque la 3e annonce du mois sans crédit (403 LIMIT_REACHED) et ne génère rien", async () => {
    h.monthCount = FREE_MONTHLY_LISTINGS;
    const res = await call();
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "LIMIT_REACHED" });
    expect(h.generate).not.toHaveBeenCalled();
  });

  it("consomme un crédit quand le quota est épuisé", async () => {
    h.monthCount = FREE_MONTHLY_LISTINGS;
    h.rpc.mockResolvedValue({ data: 3, error: null });
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ credits: 3 });
    expect(h.rpc).toHaveBeenCalledWith("consume_listing_credit", { p_user: "user-1" });
  });

  it("rembourse le crédit si la génération échoue", async () => {
    h.monthCount = FREE_MONTHLY_LISTINGS;
    h.rpc.mockResolvedValue({ data: 3, error: null });
    h.generate.mockRejectedValue(new Error("llm down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await call()).status).toBe(502);
    expect(h.rpc).toHaveBeenCalledWith("grant_listing_credits", { p_user: "user-1", p_amount: 1 });
  });

  it("plan mensuel : plafond quotidien", async () => {
    h.profile = { subscription_status: "active", subscription_plan: "monthly", listing_credits: 0 };
    h.dayCount = MONTHLY_PLAN_DAILY_LISTINGS;
    expect((await call()).status).toBe(403);
    h.dayCount = MONTHLY_PLAN_DAILY_LISTINGS - 1;
    expect((await call()).status).toBe(200);
  });

  it("plan annuel : jamais bloqué", async () => {
    h.profile = { subscription_status: "active", subscription_plan: "annual", listing_credits: 0 };
    h.dayCount = 500;
    expect((await call()).status).toBe(200);
  });
});
