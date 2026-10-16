import { describe, expect, it } from "vitest";
import { DEFAULT_MIN_LISTINGS, parseMin, parseSince, usageProof } from "@/lib/social-proof";

const now = new Date("2026-11-01T12:00:00Z");

describe("parseSince", () => {
  it("accepte une date passée AAAA-MM-JJ", () => {
    expect(parseSince("2026-10-16", now)?.toISOString()).toBe("2026-10-16T00:00:00.000Z");
  });
  it("refuse l'absence de date, un format libre, une date impossible et une date future", () => {
    for (const raw of [undefined, "", "16/10/2026", "2026-10-16T10:00", "2026-02-30", "2027-01-01"]) expect(parseSince(raw, now)).toBeNull();
  });
});

describe("parseMin", () => {
  it("lit un entier positif, sinon le seuil par défaut", () => {
    expect(parseMin("25")).toBe(25);
    for (const raw of [undefined, "", "0", "-3", "2,5", "abc"]) expect(parseMin(raw)).toBe(DEFAULT_MIN_LISTINGS);
  });
});

describe("usageProof", () => {
  const since = parseSince("2026-10-16", now);
  it("n'affiche rien sans date de départ, sans mesure ou sous le seuil", () => {
    expect(usageProof(500, null, 100)).toBeNull();
    expect(usageProof(null, since, 100)).toBeNull();
    expect(usageProof(99, since, 100)).toBeNull();
  });
  it("affiche le nombre réel et la date en toutes lettres au seuil", () => {
    expect(usageProof(100, since, 100)).toEqual({ count: 100, sinceLabel: "16 octobre 2026" });
  });
});
