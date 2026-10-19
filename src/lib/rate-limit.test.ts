import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clientFingerprint, withinRateLimit } from "@/lib/rate-limit";
import { DEFAULT_GENERATE_DAILY_CAP, generateDailyCap } from "@/lib/limits";

const admin = (result: { data: unknown; error: unknown }) => ({ rpc: vi.fn().mockResolvedValue(result) }) as unknown as SupabaseClient & { rpc: ReturnType<typeof vi.fn> };

describe("withinRateLimit", () => {
  it("transmet la clé, la limite et la fenêtre, et suit la réponse de la base", async () => {
    const ok = admin({ data: true, error: null });
    expect(await withinRateLimit(ok, "k", 3, 60)).toBe(true);
    expect(ok.rpc).toHaveBeenCalledWith("rate_limit_hit", { p_key: "k", p_limit: 3, p_window_seconds: 60 });
    expect(await withinRateLimit(admin({ data: false, error: null }), "k", 3, 60)).toBe(false);
  });

  it("autorise l'appel si la base est en erreur", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await withinRateLimit(admin({ data: null, error: { message: "db" } }), "k", 3, 60)).toBe(true);
  });
});

describe("clientFingerprint", () => {
  it("prend la première adresse de x-forwarded-for et ne la renvoie jamais en clair", () => {
    const fp = clientFingerprint(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }));
    expect(fp).toMatch(/^[0-9a-f]{24}$/);
    expect(fp).toBe(clientFingerprint(new Headers({ "x-forwarded-for": "203.0.113.7" })));
    expect(fp).not.toBe(clientFingerprint(new Headers({ "x-forwarded-for": "203.0.113.8" })));
  });

  it("renvoie null sans adresse", () => {
    expect(clientFingerprint(new Headers())).toBeNull();
  });
});

describe("generateDailyCap", () => {
  it("lit GENERATE_DAILY_CAP, sinon la valeur par défaut", () => {
    expect(generateDailyCap("50")).toBe(50);
    expect(generateDailyCap(undefined)).toBe(DEFAULT_GENERATE_DAILY_CAP);
    expect(generateDailyCap("0")).toBe(DEFAULT_GENERATE_DAILY_CAP);
    expect(generateDailyCap("abc")).toBe(DEFAULT_GENERATE_DAILY_CAP);
  });
});
