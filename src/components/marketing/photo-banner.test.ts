import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PhotoBanner } from "@/components/marketing/photo-banner";
import type { UnsplashPhoto } from "@/lib/city-images";

const photo: UnsplashPhoto = {
  id: "b", raw: "https://images.unsplash.com/photo-7", width: 4000, height: 3000, color: "#223344",
  author: "Sam Petit", authorUrl: "https://unsplash.com/@sam", pageUrl: "https://unsplash.com/photos/b", alt: "x",
};
const banner = PhotoBanner as (props: { photo: UnsplashPhoto | undefined; children?: React.ReactNode }) => React.ReactElement;
const render = (p?: UnsplashPhoto) => renderToStaticMarkup(createElement(banner, { photo: p }, createElement("h2", null, "Titre")));

describe("<PhotoBanner>", () => {
  it("sans photo : cadre à bordure d'origine, texte aux couleurs du site", () => {
    const html = render();
    expect(html).not.toContain("<img");
    expect(html).toContain("border-primary/40");
    expect(html).not.toContain("text-white");
    expect(html).toContain("Titre");
  });

  it("avec photo : image décorative, voile sombre, couleur de fond, aucune pastille de crédit (crédit sur /credits-photos)", () => {
    const html = render(photo);
    expect(html).toContain('alt=""');
    expect(html).toContain("bg-slate-950/65");
    expect(html).not.toContain("Sam Petit");
    expect(html).toContain("background-color:#223344");
  });
});
