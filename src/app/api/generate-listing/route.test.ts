import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  user: { id: "user-1" } as { id: string } | null,
  profile: { subscription_status: "free", subscription_plan: null } as Record<string, unknown>,
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
      if (table === "listing_credit_grants") return { select: () => ({ gt: () => ({ gt: () => ({ order: async () => ({ data: [] }) }) }) }) };
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

const call = (body: Record<string, unknown> = { service: "Petit bricolage", city: "Lyon" }) =>
  POST(
    new Request("http://localhost/api/generate-listing", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

const version = (title: string) => ({ title, intro: "i", advantages: ["a", "b", "c"], skills: ["a", "b", "c"], pricing: "p", callToAction: "c", hashtags: ["#a", "#b", "#c"] });
const generated = {
  object: { versions: { leboncoin: version("LBC"), allovoisins: version("AV"), gensdeconfiance: version("GDC"), yoojo: version("YOO"), geev: version("GEEV") }, priceSuggested: 20 },
};

beforeEach(() => {
  h.user = { id: "user-1" };
  h.profile = { subscription_status: "free", subscription_plan: null };
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
    h.profile = { subscription_status: "active", subscription_plan: "monthly" };
    h.dayCount = MONTHLY_PLAN_DAILY_LISTINGS;
    expect((await call()).status).toBe(403);
    h.dayCount = MONTHLY_PLAN_DAILY_LISTINGS - 1;
    expect((await call()).status).toBe(200);
  });

  it("plan annuel : jamais bloqué", async () => {
    h.profile = { subscription_status: "active", subscription_plan: "annual" };
    h.dayCount = 500;
    expect((await call()).status).toBe(200);
  });
});

describe("POST /api/generate-listing : annonce multi-sites et personnalisation", () => {
  it("sans choix de sites, génère les trois sites par défaut dans une seule ligne", async () => {
    expect((await call()).status).toBe(200);
    expect(h.inserted).toHaveLength(1);
    const row = h.inserted[0] as { title: string; platform: string; variants: { platform: string; title: string }[] };
    expect(row.variants.map((v) => v.platform)).toEqual(["leboncoin", "allovoisins", "gensdeconfiance"]);
    expect(row.variants.map((v) => v.title)).toEqual(["LBC", "AV", "GDC"]);
    expect(row.title).toBe("LBC");
    expect(row.platform).toBe("leboncoin");
  });

  it("consomme un seul crédit pour les trois versions", async () => {
    h.monthCount = FREE_MONTHLY_LISTINGS;
    h.rpc.mockResolvedValue({ data: 3, error: null });
    await call();
    expect(h.rpc).toHaveBeenCalledTimes(1);
  });

  it("transmet les informations de la personne au modèle", async () => {
    await call({ service: "Bricolage", city: "Lyon", skills: "Perceuse et niveau laser", experience: "10 ans en famille", rate: 28, tone: "professionnel" });
    const prompt = (h.generate.mock.calls[0]?.[0] as { prompt: string }).prompt;
    expect(prompt).toContain("Perceuse et niveau laser");
    expect(prompt).toContain("10 ans en famille");
    expect(prompt).toContain("28 €");
  });

  it("utilise le tarif saisi plutôt que la suggestion du modèle", async () => {
    await call({ service: "Bricolage", city: "Lyon", rate: 28 });
    expect((h.inserted[0] as { price_suggested: number }).price_suggested).toBe(28);
  });

  it("rejette un tarif hors limites et un ton inconnu", async () => {
    expect((await call({ service: "Bricolage", city: "Lyon", rate: 1 })).status).toBe(400);
    expect((await call({ service: "Bricolage", city: "Lyon", tone: "agressif" })).status).toBe(400);
  });

  it("génère uniquement les sites choisis et garde la première version comme version de la ligne", async () => {
    expect((await call({ service: "Ménage", city: "Lyon", platforms: ["yoojo", "geev"] })).status).toBe(200);
    const row = h.inserted[0] as { title: string; platform: string; variants: { platform: string }[] };
    expect(row.variants.map((v) => v.platform)).toEqual(["yoojo", "geev"]);
    expect(row.platform).toBe("yoojo");
    expect(row.title).toBe("YOO");
    expect(h.generate).toHaveBeenCalledTimes(1);
    const prompt = (h.generate.mock.calls[0]?.[0] as { prompt: string }).prompt;
    expect(prompt).toContain("[yoojo]");
    expect(prompt).not.toContain("[leboncoin]");
  });

  it("rejette plus de 5 sites, un site inconnu et une liste vide", async () => {
    const six = ["leboncoin", "allovoisins", "yoojo", "needhelp", "stootie", "geev"];
    expect((await call({ service: "Ménage", city: "Lyon", platforms: six })).status).toBe(400);
    expect((await call({ service: "Ménage", city: "Lyon", platforms: ["facebook"] })).status).toBe(400);
    expect((await call({ service: "Ménage", city: "Lyon", platforms: [] })).status).toBe(400);
  });

  it("ignore les doublons de sites", async () => {
    await call({ service: "Ménage", city: "Lyon", platforms: ["yoojo", "yoojo"] });
    expect((h.inserted[0] as { variants: unknown[] }).variants).toHaveLength(1);
  });
});
