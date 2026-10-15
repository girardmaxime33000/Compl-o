import { describe, expect, it } from "vitest";
import {
  articleJsonLd, breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, serializeJsonLd, softwareApplicationJsonLd,
  webApplicationJsonLd,
} from "@/lib/seo/jsonld";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const roundTrip = (data: Parameters<typeof serializeJsonLd>[0]) => JSON.parse(serializeJsonLd(data)) as Record<string, any>;

describe("builders JSON-LD", () => {
  it("Organization", () => {
    const o = roundTrip(organizationJsonLd());
    expect(o["@context"]).toBe("https://schema.org");
    expect(o["@type"]).toBe("Organization");
    expect(o.name).toBe("Compléo");
    expect(o.url).toMatch(/^https?:\/\//);
  });

  it("SoftwareApplication avec offres gratuite et payantes", () => {
    const s = roundTrip(softwareApplicationJsonLd());
    expect(s["@type"]).toBe("SoftwareApplication");
    expect(s.offers).toHaveLength(4);
    expect(s.offers[0]).toMatchObject({ price: "0", priceCurrency: "EUR" });
    expect(s.offers.map((o: { price: string }) => o.price)).toContain("69.99");
  });

  it("WebApplication gratuite", () => {
    const w = roundTrip(webApplicationJsonLd({ name: "Sim", description: "Desc", path: "/simulateur-micro-entrepreneur" }));
    expect(w["@type"]).toBe("WebApplication");
    expect(w.isAccessibleForFree).toBe(true);
    expect(w.url).toMatch(/\/simulateur-micro-entrepreneur$/);
  });

  it("BreadcrumbList : accueil en position 1, positions consécutives", () => {
    const b = roundTrip(breadcrumbJsonLd([{ name: "Activités", path: "/activites" }, { name: "Bricolage", path: "/activites/bricolage" }]));
    expect(b["@type"]).toBe("BreadcrumbList");
    expect(b.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2, 3]);
    expect(b.itemListElement[0].name).toBe("Accueil");
    expect(b.itemListElement[2].item).toMatch(/\/activites\/bricolage$/);
  });

  it("Article : champs requis, auteur et éditeur Organization", () => {
    const a = roundTrip(
      articleJsonLd({ title: "T", description: "D", path: "/guides/x", published: "2026-10-01", updated: "2026-10-15" }),
    );
    expect(a["@type"]).toBe("Article");
    expect(a.headline).toBe("T");
    expect(a.datePublished).toBe("2026-10-01");
    expect(a.dateModified).toBe("2026-10-15");
    expect(a.author).toMatchObject({ "@type": "Organization", name: "Compléo" });
    expect(a.publisher).toMatchObject({ "@type": "Organization", name: "Compléo" });
    expect(a.image).toMatch(/^https?:\/\/.+\/opengraph-image$/);
    expect(a.mainEntityOfPage["@id"]).toMatch(/\/guides\/x$/);
  });

  it("FAQPage : une Question avec acceptedAnswer par entrée", () => {
    const f = roundTrip(faqPageJsonLd([{ question: "Q1 ?", answer: "R1" }, { question: "Q2 ?", answer: "R2" }]));
    expect(f["@type"]).toBe("FAQPage");
    expect(f.mainEntity).toHaveLength(2);
    expect(f.mainEntity[1]).toEqual({ "@type": "Question", name: "Q2 ?", acceptedAnswer: { "@type": "Answer", text: "R2" } });
  });
});

describe("serializeJsonLd", () => {
  it("échappe « < » : aucune balise ne peut fermer le script", () => {
    const out = serializeJsonLd(faqPageJsonLd([{ question: "</script><script>alert(1)</script>", answer: "a < b" }]));
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
    expect(roundTrip(faqPageJsonLd([{ question: "a<b", answer: "x" }])).mainEntity[0].name).toBe("a<b");
  });

  it("échappe les séparateurs de ligne Unicode", () => {
    const out = serializeJsonLd(faqPageJsonLd([{ question: "a\u2028b\u2029c", answer: "x" }]));
    expect(out).not.toMatch(/[\u2028\u2029]/);
    expect(roundTrip(faqPageJsonLd([{ question: "a\u2028b", answer: "x" }])).mainEntity[0].name).toBe("a\u2028b");
  });
});
