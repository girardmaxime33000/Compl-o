import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SocialProof } from "@/components/marketing/testimonials";

const render = (props: Parameters<typeof SocialProof>[0]) => renderToStaticMarkup(createElement(SocialProof, props));

describe("<SocialProof>", () => {
  it("ne rend rien sans compteur ni témoignage approuvé", () => {
    expect(render({ usage: null, testimonials: [] })).toBe("");
  });

  it("affiche le compteur réel avec sa date de départ", () => {
    const html = render({ usage: { count: 1234, sinceLabel: "16 octobre 2026" }, testimonials: [] });
    expect(html).toContain("annonces");
    expect(html).toContain("16 octobre 2026");
    expect(html).not.toContain("accord de leurs auteurs");
  });

  it("affiche prénom, ville et texte d'un témoignage, avec la mention d'accord et d'absence de contrepartie", () => {
    const html = render({ usage: null, testimonials: [{ id: "1", first_name: "Claire", city: "Lyon", body: "Très clair." }] });
    expect(html).toContain("Très clair.");
    expect(html).toContain("Claire, Lyon");
    expect(html).toContain("accord de leurs auteurs");
    expect(html).toContain("aucune contrepartie");
  });

  it("n'affiche jamais de note, d'étoile ni de logo", () => {
    const html = render({ usage: { count: 200, sinceLabel: "1 janvier 2027" }, testimonials: [{ id: "1", first_name: "Claire", city: null, body: "Très clair." }] });
    expect(html).not.toMatch(/★|⭐|\/5|<img|<svg/);
  });
});
