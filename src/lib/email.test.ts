import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendEmail, unsubscribeToken, verifyUnsubscribeToken } from "@/lib/email";

describe("sendEmail", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "Compléo <contact@example.test>");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("refuse d'envoyer sans configuration", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await sendEmail({ to: "a@b.fr", subject: "s", html: "h", text: "t" })).ok).toBe(false);
  });

  it("appelle Resend avec pièce jointe en base64 et en-têtes de désinscription", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const res = await sendEmail({
      to: "client@example.test",
      subject: "Facture",
      html: "<p>x</p>",
      text: "x",
      unsubscribeUrl: "https://example.test/u",
      attachments: [{ filename: "F.pdf", content: Buffer.from("pdf") }],
    });
    expect(res.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(["client@example.test"]);
    expect(body.attachments[0]).toEqual({ filename: "F.pdf", content: Buffer.from("pdf").toString("base64") });
    expect(body.headers["List-Unsubscribe"]).toBe("<https://example.test/u>");
  });

  it("retourne ok: false si Resend refuse ou si le réseau échoue", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 422, text: async () => "bad" }));
    expect((await sendEmail({ to: "a@b.fr", subject: "s", html: "h", text: "t" })).ok).toBe(false);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect((await sendEmail({ to: "a@b.fr", subject: "s", html: "h", text: "t" })).ok).toBe(false);
  });
});

describe("jeton de désinscription", () => {
  beforeEach(() => vi.stubEnv("CRON_SECRET", "secret-test"));
  afterEach(() => vi.unstubAllEnvs());

  it("accepte le bon jeton, refuse un autre utilisateur ou un jeton altéré", () => {
    const t = unsubscribeToken("11111111-1111-4111-8111-111111111111");
    expect(verifyUnsubscribeToken("11111111-1111-4111-8111-111111111111", t)).toBe(true);
    expect(verifyUnsubscribeToken("22222222-2222-4222-8222-222222222222", t)).toBe(false);
    const altered = t.slice(0, -1) + (t.endsWith("0") ? "1" : "0");
    expect(verifyUnsubscribeToken("11111111-1111-4111-8111-111111111111", altered)).toBe(false);
    expect(verifyUnsubscribeToken("11111111-1111-4111-8111-111111111111", "")).toBe(false);
  });

  it("refuse tout sans secret configuré", () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "");
    expect(verifyUnsubscribeToken("11111111-1111-4111-8111-111111111111", unsubscribeToken("11111111-1111-4111-8111-111111111111"))).toBe(false);
  });
});
