import { describe, expect, it } from "vitest";
import { simulate, TAX_PARAMS } from "@/lib/tax";

describe("simulate", () => {
  it("calcule cotisations et net en BNC et en BIC", () => {
    const bnc = simulate({ monthlyRevenue: 1000, regime: "bnc" });
    expect(bnc.urssaf).toBe(1000 * TAX_PARAMS.urssafRate.bnc);
    expect(bnc.netMonthly).toBe(1000 - bnc.urssaf);
    expect(bnc.netAnnual).toBeCloseTo(bnc.netMonthly * 12, 2);
    const bic = simulate({ monthlyRevenue: 1000, regime: "bic" });
    expect(bic.urssafRate).toBe(TAX_PARAMS.urssafRate.bic);
  });

  it("traite un chiffre d'affaires négatif, vide ou invalide comme nul", () => {
    expect(simulate({ monthlyRevenue: -50, regime: "bnc" }).netMonthly).toBe(0);
    expect(simulate({ monthlyRevenue: Number.NaN, regime: "bnc" }).monthlyRevenue).toBe(0);
  });

  it("change de niveau d'alerte à 80 % puis 100 % du seuil de TVA", () => {
    const monthlyAt = (ratio: number) => (TAX_PARAMS.vatThreshold * ratio) / 12;
    const level = (ratio: number) => simulate({ monthlyRevenue: monthlyAt(ratio), regime: "bnc" }).alerts.find((a) => a.id === "vat")!.level;
    expect(level(0.5)).toBe("ok");
    expect(level(0.85)).toBe("warning");
    expect(level(1.1)).toBe("danger");
  });

  it("applique le plafond micro-entrepreneur des prestations de services", () => {
    const micro = simulate({ monthlyRevenue: (TAX_PARAMS.microCeilingServices * 1.2) / 12, regime: "bnc" }).alerts.find((a) => a.id === "micro")!;
    expect(micro.level).toBe("danger");
    expect(micro.threshold).toBe(TAX_PARAMS.microCeilingServices);
  });

  it("estime le cumul avec l'ARE", () => {
    const r = simulate({ monthlyRevenue: 500, regime: "bnc", unemployment: { enabled: true, monthlyAre: 1200, referenceSalary: 0 } });
    const retained = 500 * (1 - TAX_PARAMS.areAbatement.bnc);
    expect(r.unemployment!.retainedIncome).toBeCloseTo(retained, 2);
    expect(r.unemployment!.areReduction).toBeCloseTo(retained * TAX_PARAMS.areReductionRate, 2);
    expect(r.unemployment!.areAfterCumul).toBeCloseTo(1200 - retained * TAX_PARAMS.areReductionRate, 2);
    expect(r.unemployment!.totalMonthly).toBeCloseTo(r.unemployment!.areAfterCumul + r.netMonthly, 2);
    expect(r.unemployment!.capped).toBe(false);
  });

  it("plafonne le cumul à l'ancien salaire de référence", () => {
    const r = simulate({ monthlyRevenue: 500, regime: "bnc", unemployment: { enabled: true, monthlyAre: 1200, referenceSalary: 900 } });
    expect(r.unemployment!.capped).toBe(true);
    expect(r.unemployment!.areAfterCumul + r.unemployment!.retainedIncome).toBeCloseTo(900, 2);
  });

  it("ne dépasse jamais l'ARE dans la réduction", () => {
    const r = simulate({ monthlyRevenue: 6000, regime: "bnc", unemployment: { enabled: true, monthlyAre: 300, referenceSalary: 0 } });
    expect(r.unemployment!.areReduction).toBe(300);
    expect(r.unemployment!.areAfterCumul).toBe(0);
  });

  it("n'ajoute pas de bloc chômage s'il est désactivé", () => {
    expect(simulate({ monthlyRevenue: 500, regime: "bnc", unemployment: { enabled: false, monthlyAre: 1200, referenceSalary: 0 } }).unemployment).toBeNull();
  });
});
