import { describe, expect, it } from "vitest";
import { ACTIVITIES, activitySlug } from "@/lib/activities";
import { CITIES } from "@/lib/cities";
import { GUIDES } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";
import { buildLlmsTxt } from "@/lib/seo/llms";

describe("llms.txt", () => {
  const txt = buildLlmsTxt();

  it("respecte la structure llmstxt.org : H1, citation, sections H2", () => {
    const lines = txt.split("\n");
    expect(lines[0]).toBe("# Compléo");
    expect(lines[2]?.startsWith("> ")).toBe(true);
    for (const h of ["## Outils", "## Guides", "## Activités", "## Villes", "## Optional"]) expect(txt).toContain(h);
  });

  it("liste chaque guide, activité et ville avec une URL absolue", () => {
    for (const g of GUIDES) expect(txt).toContain(`(${absoluteUrl(`/guides/${g.slug}`)})`);
    for (const a of ACTIVITIES) expect(txt).toContain(`(${absoluteUrl(`/activites/${activitySlug(a)}`)})`);
    for (const c of CITIES) expect(txt).toContain(`(${absoluteUrl(`/villes/${c.slug}`)})`);
  });

  it("chiffres lus dans tax.ts et offers.ts, mention d'estimation", () => {
    const plain = txt.replace(new RegExp("[\\u202f\\u00a0]", "g"), " ");
    expect(plain).toContain("25,6 %");
    expect(plain).toContain("37 500");
    expect(txt).toContain("69,99");
    expect(txt).toContain("sans garantie de revenu");
  });

  it("n'expose aucune page privée", () => {
    for (const p of ["/dashboard", "/login", "/onboarding", "/api"]) expect(txt).not.toContain(absoluteUrl(p));
  });
});
