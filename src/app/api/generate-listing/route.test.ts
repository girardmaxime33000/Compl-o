import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  user: { id: "user-1" } as { id: string } | null,
  profile: { subscription_status: "free", subscription_plan: null } as Record<string, unknown>,
  monthCount: 0,
  dayCount: 0,
  rpc: vi.fn(),
  /** Réponses des fonctions de la base : réservation du quota, crédit du pack, limites de débit. */
  slot: "slot-1" as string | null,
  credit: -1,
  rateAllowed: (() => true) as (key: string) => boolean,
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
  h.slot = "slot-1";
  h.credit = -1;
  h.rateAllowed = () => true;
  h.rpc.mockReset();
  h.rpc.mockImplementation(async (name: string, args: Record<string, unknown>) => {
    if (name === "rate_limit_hit") return { data: h.rateAllowed(String(args.p_key)), error: null };
    if (name === "claim_listing_slot") return { data: h.slot, error: null };
    if (name === "consume_listing_credit_grant") {
      return { data: [h.credit >= 0 ? { grant_id: "grant-1", balance: h.credit } : { grant_id: null, balance: -1 }], error: null };
    }
    return { data: null, error: null };
  });
  h.generate.mockReset();
  h.generate.mockResolvedValue(generated);
});

describe("POST /api/generate-listing : quotas", () => {
  it("exige une connexion", async () => {
    h.user = null;
    expect((await call()).status).toBe(401);
  });

  it("gratuit : réserve une place du quota mensuel avant de générer, puis la rend une fois l'annonce enregistrée", async () => {
    expect((await call()).status).toBe(200);
    expect(h.rpc).toHaveBeenCalledWith("claim_listing_slot", { p_user: "user-1", p_limit: FREE_MONTHLY_LISTINGS, p_period: "month" });
    expect(h.rpc).toHaveBeenCalledWith("release_listing_slot", { p_id: "slot-1" });
    expect(h.rpc).not.toHaveBeenCalledWith("consume_listing_credit_grant", expect.anything());
  });

  it("la base décide : sans place réservée ni crédit, 403 LIMIT_REACHED et rien n'est généré", async () => {
    h.slot = null;
    h.monthCount = 0; // la lecture non verrouillée ne fait plus foi : seule la réservation compte
    const res = await call();
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "LIMIT_REACHED" });
    expect(h.generate).not.toHaveBeenCalled();
  });

  it("consomme un crédit quand le quota est épuisé", async () => {
    h.slot = null;
    h.credit = 3;
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ credits: 3 });
    expect(h.rpc).toHaveBeenCalledWith("consume_listing_credit_grant", { p_user: "user-1" });
  });

  it("rend le crédit au lot d'origine si la génération échoue (un remboursement du pack le retire aussi)", async () => {
    h.slot = null;
    h.credit = 3;
    h.generate.mockRejectedValue(new Error("llm down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await call()).status).toBe(502);
    expect(h.rpc).toHaveBeenCalledWith("restore_listing_credit", { p_grant: "grant-1" });
    expect(h.rpc).not.toHaveBeenCalledWith("grant_listing_credits", expect.anything());
  });

  it("rend la place réservée si la génération échoue", async () => {
    h.generate.mockRejectedValue(new Error("llm down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await call()).status).toBe(502);
    expect(h.rpc).toHaveBeenCalledWith("release_listing_slot", { p_id: "slot-1" });
  });

  it("plan mensuel : réservation sur le plafond quotidien", async () => {
    h.profile = { subscription_status: "active", subscription_plan: "monthly" };
    expect((await call()).status).toBe(200);
    expect(h.rpc).toHaveBeenCalledWith("claim_listing_slot", { p_user: "user-1", p_limit: MONTHLY_PLAN_DAILY_LISTINGS, p_period: "day" });
    h.slot = null;
    expect((await call()).status).toBe(403);
  });

  it("plan annuel : aucune réservation, jamais bloqué", async () => {
    h.profile = { subscription_status: "active", subscription_plan: "annual" };
    h.dayCount = 500;
    expect((await call()).status).toBe(200);
    expect(h.rpc).not.toHaveBeenCalledWith("claim_listing_slot", expect.anything());
  });

  it("répond 503 si la réservation échoue côté base, sans générer", async () => {
    h.rpc.mockImplementation(async (name: string) =>
      name === "claim_listing_slot" ? { data: null, error: { message: "db" } } : { data: true, error: null },
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await call()).status).toBe(503);
    expect(h.generate).not.toHaveBeenCalled();
  });
});

describe("POST /api/generate-listing : limitation de débit", () => {
  it("429 quand le compte dépasse sa limite, avant toute réservation ou génération", async () => {
    h.rateAllowed = (key) => !key.startsWith("gen:user:");
    const res = await call();
    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ code: "RATE_LIMITED" });
    expect(h.rpc).not.toHaveBeenCalledWith("claim_listing_slot", expect.anything());
    expect(h.generate).not.toHaveBeenCalled();
  });

  it("429 quand l'adresse dépasse sa limite ; seule l'empreinte de l'IP est transmise", async () => {
    h.rateAllowed = (key) => !key.startsWith("gen:ip:");
    const res = await POST(
      new Request("http://localhost/api/generate-listing", {
        method: "POST",
        headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
        body: JSON.stringify({ service: "Petit bricolage", city: "Lyon" }),
      }),
    );
    expect(res.status).toBe(429);
    const keys = h.rpc.mock.calls.filter((c) => c[0] === "rate_limit_hit").map((c) => String((c[1] as { p_key: string }).p_key));
    expect(keys.some((k) => k.startsWith("gen:ip:") && !k.includes("203.0.113.7"))).toBe(true);
  });

  it("plafond global journalier : 503, la place réservée est rendue et rien n'est généré", async () => {
    h.rateAllowed = (key) => key !== "gen:global:day";
    const res = await call();
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ code: "DAILY_CAP" });
    expect(h.rpc).toHaveBeenCalledWith("release_listing_slot", { p_id: "slot-1" });
    expect(h.generate).not.toHaveBeenCalled();
  });

  it("plafond global : le crédit consommé est rendu au lot d'origine", async () => {
    h.slot = null;
    h.credit = 3;
    h.rateAllowed = (key) => key !== "gen:global:day";
    expect((await call()).status).toBe(503);
    expect(h.rpc).toHaveBeenCalledWith("restore_listing_credit", { p_grant: "grant-1" });
  });

  it("une panne de la mesure de débit n'empêche pas de générer", async () => {
    h.rpc.mockImplementation(async (name: string) =>
      name === "rate_limit_hit" ? { data: null, error: { message: "db" } } : name === "claim_listing_slot" ? { data: "slot-1", error: null } : { data: null, error: null },
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
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
    h.slot = null;
    h.credit = 3;
    await call();
    expect(h.rpc.mock.calls.filter((c) => c[0] === "consume_listing_credit_grant")).toHaveLength(1);
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
