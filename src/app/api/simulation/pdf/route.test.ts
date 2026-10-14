import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ user: { id: "u" } as { id: string } | null }));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getUser: async () => ({ data: { user: h.user } }) } }) }));

import { POST } from "@/app/api/simulation/pdf/route";

const call = (body: unknown) =>
  POST(new Request("http://localhost/api/simulation/pdf", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

beforeEach(() => {
  h.user = { id: "u" };
});

describe("POST /api/simulation/pdf", () => {
  it("exige un compte", async () => {
    h.user = null;
    const res = await call({ monthlyRevenue: 500, regime: "bnc" });
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ code: "AUTH_REQUIRED" });
  });

  it("refuse des paramètres invalides", async () => {
    expect((await call("pas du json")).status).toBe(400);
    expect((await call({ monthlyRevenue: -1, regime: "bnc" })).status).toBe(400);
    expect((await call({ monthlyRevenue: 500, regime: "xxx" })).status).toBe(400);
  });

  it("génère un PDF valide, avec le bloc chômage si demandé", async () => {
    for (const unemployment of [undefined, { enabled: true, monthlyAre: 1200, referenceSalary: 900 }]) {
      const res = await call({ monthlyRevenue: 800, regime: "bic", unemployment });
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("application/pdf");
      const bytes = new Uint8Array(await res.arrayBuffer());
      expect(String.fromCharCode(...bytes.slice(0, 5))).toBe("%PDF-");
      expect(bytes.length).toBeGreaterThan(1000);
    }
  });
});
