import { describe, expect, it } from "vitest";
import { planEmails } from "@/lib/email-sequence";
import { TAX_PARAMS } from "@/lib/tax";

const now = new Date("2026-10-15T08:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const base = { listingsCount: 0, paidThisYear: 0, sent: new Set<string>() };

describe("planEmails", () => {
  it("n'envoie rien le jour de l'inscription", () => {
    expect(planEmails({ ...base, createdAt: daysAgo(0.5) }, now)).toEqual([]);
  });

  it("envoie J+1 puis J+3 (sans annonce), jamais deux fois", () => {
    expect(planEmails({ ...base, createdAt: daysAgo(1.2) }, now).map((p) => p.kind)).toEqual(["onboarding_day1"]);
    const sent1 = new Set(["onboarding_day1:"]);
    expect(planEmails({ ...base, createdAt: daysAgo(3.2), sent: sent1 }, now).map((p) => p.kind)).toEqual(["onboarding_day3"]);
    expect(planEmails({ ...base, createdAt: daysAgo(3.2), listingsCount: 2, sent: sent1 }, now)).toEqual([]);
    expect(planEmails({ ...base, createdAt: daysAgo(3.2), sent: new Set(["onboarding_day1:", "onboarding_day3:"]) }, now)).toEqual([]);
  });

  it("exclut les comptes de plus de 14 jours de la séquence d'accueil", () => {
    expect(planEmails({ ...base, createdAt: daysAgo(40) }, now)).toEqual([]);
  });

  it("alerte une fois par an à 80 % du seuil de TVA", () => {
    const paid = TAX_PARAMS.vatThreshold * 0.8;
    const old = daysAgo(100);
    expect(planEmails({ ...base, createdAt: old, paidThisYear: paid - 1 }, now)).toEqual([]);
    expect(planEmails({ ...base, createdAt: old, paidThisYear: paid }, now)).toEqual([{ kind: "vat_80", ref: "2026" }]);
    expect(planEmails({ ...base, createdAt: old, paidThisYear: paid, sent: new Set(["vat_80:2026"]) }, now)).toEqual([]);
    expect(planEmails({ ...base, createdAt: old, paidThisYear: paid, sent: new Set(["vat_80:2025"]) }, now)).toHaveLength(1);
  });

  it("préfère l'alerte de plafond micro quand elle s'applique", () => {
    const planned = planEmails({ ...base, createdAt: daysAgo(100), paidThisYear: TAX_PARAMS.microCeilingServices * 0.9 }, now);
    expect(planned).toEqual([{ kind: "ceiling_80", ref: "2026" }]);
  });
});
