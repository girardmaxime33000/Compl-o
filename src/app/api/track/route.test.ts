import { beforeEach, describe, expect, it, vi } from "vitest";

const recordEvent = vi.fn();
vi.mock("@/lib/analytics-server", () => ({ recordEvent: (...args: unknown[]) => recordEvent(...args) }));

import { POST } from "@/app/api/track/route";

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/track", { method: "POST", body: JSON.stringify(body) }));

describe("POST /api/track", () => {
  beforeEach(() => recordEvent.mockReset());

  it("enregistre cta_click avec ses propriétés autorisées", async () => {
    const res = await post({ name: "cta_click", path: "/", props: { source: "hero", target: "diagnostic", visual: "none" } });
    expect(res.status).toBe(204);
    expect(recordEvent).toHaveBeenCalledWith("cta_click", { source: "hero", target: "diagnostic", visual: "none" }, "/");
  });

  it("enregistre home_view", async () => {
    expect((await post({ name: "home_view", path: "/", props: { visual: "photo" } })).status).toBe(204);
  });

  it("refuse les événements serveur envoyés par le navigateur", async () => {
    expect((await post({ name: "payment_success", path: "/" })).status).toBe(400);
    expect((await post({ name: "signup", path: "/" })).status).toBe(400);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("ignore un chemin invalide au lieu de l'enregistrer", async () => {
    await post({ name: "home_view", path: "https://evil.example/x" });
    expect(recordEvent).toHaveBeenCalledWith("home_view", undefined, null);
  });
});
