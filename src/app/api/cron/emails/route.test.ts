import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => { throw new Error("ne doit pas être appelé"); } }));

import { GET } from "@/app/api/cron/emails/route";

const req = (auth?: string) => new Request("http://localhost/api/cron/emails", { headers: auth ? { authorization: auth } : {} });

describe("cron e-mails", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("refuse sans secret configuré, sans en-tête ou avec un mauvais secret", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await GET(req("Bearer "))).status).toBe(401);
    vi.stubEnv("CRON_SECRET", "s3cret");
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req("Bearer autre"))).status).toBe(401);
  });

  it("ne fait rien si l'e-mail n'est pas configuré", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await GET(req("Bearer s3cret"));
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveProperty("skipped");
  });
});
