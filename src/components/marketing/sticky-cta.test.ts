import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StickyCta } from "@/components/marketing/sticky-cta";

describe("<StickyCta>", () => {
  const html = renderToStaticMarkup(createElement(StickyCta));

  it("rendu serveur : masquée (hors écran, non atteignable) et réservée au mobile", () => {
    expect(html).toContain("translate-y-full");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
    expect(html.match(/md:hidden/g)?.length).toBe(2); // espace réservé + barre
  });

  it("pointe vers le diagnostic gratuit", () => {
    expect(html).toContain('href="/onboarding"');
    expect(html).toContain("Faire mon diagnostic gratuit");
  });

  it("tient compte de la zone de sécurité des iPhone", () => {
    expect(html).toContain("env(safe-area-inset-bottom)");
  });
});
