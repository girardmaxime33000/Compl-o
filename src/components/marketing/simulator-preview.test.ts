import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SimulatorPreview } from "@/components/marketing/simulator-preview";
import { eur, simulate, TAX_PARAMS } from "@/lib/tax";

const r = simulate({ monthlyRevenue: 500, regime: "bic" });
const html = renderToStaticMarkup(
  createElement(SimulatorPreview, { monthlyRevenue: 500, urssaf: r.urssaf, netMonthly: r.netMonthly, ratePercent: "21,2", regimeLabel: "prestation de services (BIC)" }),
);

describe("<SimulatorPreview>", () => {
  it("affiche les montants issus de simulate()", () => {
    const enc = (s: string) => s.replace(/'/g, "&#x27;");
    expect(html).toContain(eur(500));
    expect(html).toContain(eur(r.urssaf));
    expect(html).toContain(eur(r.netMonthly));
    expect(enc(html)).toContain("Estimation indicative");
  });

  it("la barre représente la part de net et la part de cotisations (somme 100 %)", () => {
    const net = Math.round((r.netMonthly / 500) * 100);
    expect(html).toContain(`width:${net}%`);
    expect(html).toContain(`width:${100 - net}%`);
    expect(net).toBeCloseTo((1 - TAX_PARAMS.urssafRate.bic) * 100, 0);
  });

  it("la barre a un équivalent textuel et les puces de couleur sont décoratives", () => {
    expect(html).toContain('role="img"');
    expect(html).toContain("aria-label=");
    expect(html).toContain('aria-hidden="true"');
  });

  it("chiffre d'affaires nul : pas de division par zéro", () => {
    const zero = renderToStaticMarkup(
      createElement(SimulatorPreview, { monthlyRevenue: 0, urssaf: 0, netMonthly: 0, ratePercent: "21,2", regimeLabel: "x" }),
    );
    expect(zero).toContain("width:0%");
    expect(zero).not.toContain("NaN");
  });
});
