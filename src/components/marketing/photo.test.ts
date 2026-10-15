import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Photo } from "@/components/marketing/photo";
import type { UnsplashPhoto } from "@/lib/city-images";

const photo: UnsplashPhoto = {
  id: "abc",
  raw: "https://images.unsplash.com/photo-1?ixid=x",
  width: 4000,
  height: 3000,
  author: "Jeanne Dupont",
  authorUrl: "https://unsplash.com/@jeanne",
  pageUrl: "https://unsplash.com/photos/abc",
  alt: "x",
};

const render = (props: Partial<Parameters<typeof Photo>[0]> = {}) =>
  renderToStaticMarkup(createElement(Photo, { photo, alt: "Un atelier", ratio: "card", sizes: "100vw", ...props }));

describe("<Photo>", () => {
  it("rend l'image hotlinkée avec srcset, sizes, dimensions et ratio réservé", () => {
    const html = render();
    expect(html).toContain('src="https://images.unsplash.com/photo-1?ixid=x&amp;w=1280&amp;h=853');
    expect(html).toMatch(/srcSet="[^"]*w=320&amp;h=213[^"]*320w/i);
    expect(html).toContain('sizes="100vw"');
    expect(html).toContain('alt="Un atelier"');
    expect(html).toContain("aspect-ratio:1.5");
    expect(html).toContain('loading="lazy"');
  });

  it("priorité : chargement immédiat, priorité haute et preconnect", () => {
    const html = render({ priority: true });
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('rel="preconnect"');
  });

  it("crédit en légende : photographe et Unsplash avec UTM", () => {
    const html = render();
    expect(html).toContain("<figcaption");
    expect(html).toContain("Jeanne Dupont");
    expect(html).toContain("https://unsplash.com/@jeanne?utm_source=compleo&amp;utm_medium=referral");
    expect(html).toContain("https://unsplash.com?utm_source=compleo&amp;utm_medium=referral");
  });

  it("crédit en pastille ou reporté sur la page de crédits", () => {
    const overlay = render({ credit: "overlay" });
    expect(overlay).not.toContain("<figcaption");
    expect(overlay).toContain("Jeanne Dupont");
    const page = render({ credit: "page" });
    expect(page).not.toContain("Jeanne Dupont");
  });

  it("sans photo : repli ou rien", () => {
    expect(render({ photo: undefined })).toBe("");
    expect(render({ photo: undefined, fallback: createElement("p", null, "repli") })).toBe("<p>repli</p>");
  });
});

describe("<Photo phrasing>", () => {
  it("n'émet ni figure ni div (contenu valide dans un bouton ou un lien)", () => {
    const html = render({ phrasing: true, credit: "text" });
    expect(html).not.toContain("<figure");
    expect(html).not.toContain("<div");
    expect(html).not.toContain("<figcaption");
    expect(html).toContain("<span");
    expect(html).toContain("Photo : Jeanne Dupont / Unsplash");
  });
});
