import { describe, expect, it } from "vitest";
import { CONSENT_MAX_AGE_MS, parseConsent, serializeConsent } from "@/lib/consent";

const NOW = 1_800_000_000_000;

describe("consentement : lecture du choix stocké", () => {
  it("relit un choix valide", () => {
    expect(parseConsent(serializeConsent("accepted", NOW - 1000), NOW)).toEqual({ choice: "accepted", at: NOW - 1000 });
    expect(parseConsent(serializeConsent("refused", NOW - 1000), NOW)?.choice).toBe("refused");
  });

  it("redemande quand rien n'est stocké", () => {
    expect(parseConsent(null, NOW)).toBeNull();
    expect(parseConsent("", NOW)).toBeNull();
  });

  it("redemande après 6 mois", () => {
    expect(parseConsent(serializeConsent("accepted", NOW - CONSENT_MAX_AGE_MS + 1000), NOW)).not.toBeNull();
    expect(parseConsent(serializeConsent("accepted", NOW - CONSENT_MAX_AGE_MS - 1000), NOW)).toBeNull();
  });

  it("rejette les valeurs illisibles, inconnues ou datées du futur", () => {
    expect(parseConsent("pas du json", NOW)).toBeNull();
    expect(parseConsent('{"choice":"maybe","at":1}', NOW)).toBeNull();
    expect(parseConsent('{"choice":"accepted"}', NOW)).toBeNull();
    expect(parseConsent(serializeConsent("accepted", NOW + 10_000), NOW)).toBeNull();
  });
});
