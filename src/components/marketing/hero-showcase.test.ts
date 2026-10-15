import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroShowcase } from "@/components/marketing/hero-showcase";
import { ACTIVITIES } from "@/lib/activities";
import type { UnsplashPhoto } from "@/lib/city-images";
import { simulate } from "@/lib/tax";

const photo: UnsplashPhoto = {
  id: "h", raw: "https://images.unsplash.com/photo-9", width: 4000, height: 3000,
  author: "Camille Martin", authorUrl: "https://unsplash.com/@camille", pageUrl: "https://unsplash.com/photos/h", alt: "x",
};
const activity = ACTIVITIES[0];
if (!activity) throw new Error("catalogue vide");
const example = simulate({ monthlyRevenue: 500, regime: "bic" });
const render = (p?: UnsplashPhoto) => renderToStaticMarkup(createElement(HeroShowcase, { photo: p, activity, example }));

describe("<HeroShowcase>", () => {
  it("sans photo : panneau coloré, deux cartes, aucune image", () => {
    const html = render();
    expect(html).not.toContain("<img");
    expect(html).toContain("Exemple d&#x27;annonce");
    expect(html).toContain("Exemple de calcul");
    expect(html).toContain("Générée par IA, à relire avant publication");
    expect(html).toContain("Estimation indicative");
  });

  it("le chiffre affiché vient de simulate(), pas d'une valeur saisie", () => {
    const net = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(example.netMonthly);
    expect(render()).toContain(net);
  });

  it("avec photo : image prioritaire décorative (alt vide) et crédit", () => {
    const html = render(photo);
    expect(html).toContain('alt=""');
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain("Camille Martin");
  });
});
