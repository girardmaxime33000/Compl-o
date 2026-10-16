import { describe, expect, it } from "vitest";
import { MAX_CONFIRMATION_EMAILS_PER_DAY, hashToken, isConfirmationExpired, newConfirmationToken, planSubscription, subscribeSchema, TOKEN_PATTERN } from "@/lib/newsletter";

const now = new Date("2026-10-16T12:00:00Z");
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();
const pending = (over: Partial<Parameters<typeof planSubscription>[0] & object> = {}) => ({
  status: "pending" as const, confirmation_sent_at: ago(60), confirmation_window_start: ago(60), confirmation_count: 1, ...over,
});

describe("planSubscription", () => {
  it("nouvelle adresse : création", () => {
    expect(planSubscription(null, now)).toMatchObject({ action: "create", count: 1 });
  });
  it("adresse confirmée : jamais relancée", () => {
    expect(planSubscription(pending({ status: "confirmed" }), now)).toEqual({ action: "skip", reason: "confirmed" });
  });
  it("délai de 10 minutes entre deux e-mails", () => {
    expect(planSubscription(pending({ confirmation_sent_at: ago(9) }), now)).toEqual({ action: "skip", reason: "cooldown" });
    expect(planSubscription(pending({ confirmation_sent_at: ago(11) }), now)).toMatchObject({ action: "send", count: 2 });
  });
  it(`au plus ${MAX_CONFIRMATION_EMAILS_PER_DAY} e-mails par 24 h, compteur remis à zéro ensuite`, () => {
    expect(planSubscription(pending({ confirmation_count: MAX_CONFIRMATION_EMAILS_PER_DAY }), now)).toEqual({ action: "skip", reason: "daily_cap" });
    const old = planSubscription(pending({ confirmation_count: 3, confirmation_window_start: ago(25 * 60), confirmation_sent_at: ago(25 * 60) }), now);
    expect(old).toMatchObject({ action: "send", count: 1 });
  });
  it("adresse désinscrite : peut se réinscrire même juste après, dans la limite de 3 e-mails par 24 h", () => {
    expect(planSubscription(pending({ status: "unsubscribed" as never, confirmation_sent_at: ago(2) }), now).action).toBe("send");
    expect(planSubscription(pending({ status: "unsubscribed" as never, confirmation_sent_at: ago(2), confirmation_count: 3 }), now)).toEqual({ action: "skip", reason: "daily_cap" });
  });
});

describe("jetons et validation", () => {
  it("jeton aléatoire de 64 caractères hexadécimaux, empreinte différente du jeton", () => {
    const a = newConfirmationToken();
    const b = newConfirmationToken();
    expect(a.token).toMatch(TOKEN_PATTERN);
    expect(a.token).not.toBe(b.token);
    expect(a.hash).toBe(hashToken(a.token));
    expect(a.hash).not.toBe(a.token);
  });
  it("expiration à 48 h", () => {
    expect(isConfirmationExpired(ago(47 * 60), now)).toBe(false);
    expect(isConfirmationExpired(ago(49 * 60), now)).toBe(true);
    expect(isConfirmationExpired(null, now)).toBe(true);
  });
  it("schéma : consentement strictement true, adresse normalisée, origine contrôlée", () => {
    expect(subscribeSchema.safeParse({ email: " A@B.fr ", consent: true }).data).toMatchObject({ email: "a@b.fr", source: "blog" });
    expect(subscribeSchema.safeParse({ email: "a@b.fr", consent: "true" }).success).toBe(false);
    expect(subscribeSchema.safeParse({ email: "a@b.fr", consent: true, source: "blog:" + "x".repeat(60) }).success).toBe(false);
    expect(subscribeSchema.safeParse({ email: "x".repeat(250) + "@b.fr", consent: true }).success).toBe(false);
  });
});
