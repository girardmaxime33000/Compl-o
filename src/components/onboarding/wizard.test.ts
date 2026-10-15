import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OnboardingWizard, type ActivityPhotos } from "@/components/onboarding/wizard";
import { ToastProvider } from "@/components/ui/toast";
import { ACTIVITIES, CATEGORIES } from "@/lib/activities";
import type { UnsplashPhoto } from "@/lib/city-images";

const photo = (id: string): UnsplashPhoto => ({
  id, raw: `https://images.unsplash.com/photo-${id}`, width: 4000, height: 3000,
  author: `Auteur ${id}`, authorUrl: `https://unsplash.com/@${id}`, pageUrl: `https://unsplash.com/photos/${id}`, alt: "x",
});
const render = (photos?: ActivityPhotos) =>
  renderToStaticMarkup(createElement(ToastProvider, null, createElement(OnboardingWizard, { signedIn: false, photos })));

describe("<OnboardingWizard> étape 1", () => {
  it("sans photo : les puces textuelles d'origine, aucune image", () => {
    const html = render();
    expect(html).not.toContain("<img");
    for (const c of CATEGORIES) expect(html).toContain(c.label.replace("&", "&amp;").replace("'", "&#x27;"));
    expect(html).toContain("sm:grid-cols-2");
  });

  it("avec photos : une carte photo par domaine disposant d'une photo, les autres restent des puces", () => {
    const bricolage = ACTIVITIES.find((a) => a.category === "bricolage");
    if (!bricolage) throw new Error("catalogue sans bricolage");
    const html = render({ [bricolage.id]: photo("b") });
    expect(html.match(/<img/g)).toHaveLength(1);
    expect(html).toContain("sm:grid-cols-3");
    expect(html).toContain("Photo : Auteur b / Unsplash");
    expect(html).not.toContain("<figure");
    expect(html).toContain("Bricolage &amp; montage");
  });
});
