import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));

import { GET } from "@/app/api/cron/billing/route";
import { PAST_DUE_GRACE_DAYS } from "@/lib/limits";

const call = (auth?: string) => GET(new Request("http://localhost/api/cron/billing", { headers: auth ? { authorization: auth } : {} }));

beforeEach(() => {
  process.env.CRON_SECRET = "s3cret";
  rpc.mockReset();
  rpc.mockResolvedValue({ data: 2, error: null });
});

describe("GET /api/cron/billing", () => {
  it("refuse sans secret valide, sans toucher à la base", async () => {
    expect((await call()).status).toBe(401);
    expect((await call("Bearer faux")).status).toBe(401);
    delete process.env.CRON_SECRET;
    expect((await call("Bearer undefined")).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("retire l'accès aux abonnements impayés au-delà du délai de grâce", async () => {
    const res = await call("Bearer s3cret");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ expired: 2 });
    expect(rpc).toHaveBeenCalledWith("expire_past_due_subscriptions", { p_days: PAST_DUE_GRACE_DAYS });
  });

  it("répond 500 si la base échoue", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "db" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await call("Bearer s3cret")).status).toBe(500);
  });
});
