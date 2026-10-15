import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActivityVisual } from "@/components/marketing/visuals";
import type { UnsplashPhoto } from "@/lib/city-images";

const photo: UnsplashPhoto = {
  id: "p", raw: "https://images.unsplash.com/photo-5", width: 4000, height: 3000,
  author: "Alex Roux", authorUrl: "https://unsplash.com/@alex", pageUrl: "https://unsplash.com/photos/p", alt: "x",
};
const render = (props: Parameters<typeof ActivityVisual>[0]) => renderToStaticMarkup(createElement(ActivityVisual, props));

describe("<ActivityVisual>", () => {
  it("sans photo : dégradé décoratif, aucune image", () => {
    const html = render({ activityId: "bricolage" });
    expect(html).toContain("linear-gradient");
    expect(html).not.toContain("<img");
  });

  it("carte avec photo : image 3:2, crédit sans lien (la carte est déjà un lien)", () => {
    const html = render({ activityId: "bricolage", photo });
    expect(html).toContain("<img");
    expect(html).toContain("aspect-ratio:1.5");
    expect(html).toContain('alt=""');
    expect(html).toContain("Photo : Alex Roux / Unsplash");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("linear-gradient");
  });

  it("bandeau avec photo : crédit lié en légende, chargement prioritaire", () => {
    const html = render({ activityId: "bricolage", photo, size: "hero" });
    expect(html).toContain("<figcaption");
    expect(html).toContain("utm_source=compleo");
    expect(html).toContain('fetchPriority="high"');
  });

  it("tuile avec photo : carrée, sans crédit en ligne", () => {
    const html = render({ activityId: "bricolage", photo, size: "tile" });
    expect(html).toContain("aspect-ratio:1");
    expect(html).not.toContain("Alex Roux");
  });
});
