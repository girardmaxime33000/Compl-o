import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentCta } from "@/components/marketing/content-cta";

describe("<ContentCta>", () => {
  const html = renderToStaticMarkup(createElement(ContentCta));

  it("une seule action : le diagnostic gratuit", () => {
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('href="/onboarding"');
    expect(html).toContain("Faire mon diagnostic");
  });

  it("repère de navigation nommé et promesse conforme à l'onboarding (sans inscription ni carte)", () => {
    expect(html).toContain("<aside");
    expect(html).toContain('aria-label="Diagnostic gratuit"');
    expect(html).toContain("sans inscription ni carte bancaire");
  });
});
