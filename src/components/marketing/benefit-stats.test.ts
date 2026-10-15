import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BenefitStats } from "@/components/marketing/benefit-stats";

describe("<BenefitStats>", () => {
  const html = renderToStaticMarkup(
    createElement(BenefitStats, {
      items: [
        { value: "≈ 79 %", label: "du chiffre d'affaires reste", note: "Taux 2026" },
        { value: "2", label: "annonces par mois" },
      ],
    }),
  );

  it("affiche valeur, libellé et précision de chaque repère", () => {
    expect(html).toContain("≈ 79 %");
    expect(html).toContain("Taux 2026");
    expect(html).toContain("annonces par mois");
  });

  it("une liste de définitions sémantique, sans précision quand elle est absente", () => {
    expect(html.match(/<dt/g)).toHaveLength(2);
    expect(html.match(/<dd/g)).toHaveLength(3); // 2 valeurs + 1 précision
  });
});
