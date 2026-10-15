import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("répond ok sans cache, sans donnée sensible", async () => {
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "1234567890abcdef");
    vi.stubEnv("VERCEL_ENV", "production");
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ status: "ok", commit: "1234567", env: "production" });
  });

  it("hors Vercel : commit nul et environnement local", async () => {
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "");
    vi.stubEnv("VERCEL_ENV", "");
    const body = await GET().json();
    expect(body.status).toBe("ok");
    expect(body.env).toBe("local");
  });
});
