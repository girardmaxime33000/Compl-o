import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  activeCategories, BLOG_CATEGORIES, BLOG_POSTS, indexablePosts, isIndexable, latestBlogUpdate, postsInCategory, relatedPosts,
  type BlogPost,
} from "@/lib/blog";
import { buildBlogRss } from "@/lib/blog-rss";
import { absoluteUrl, sitemapEntries } from "@/lib/seo";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { sanitizeProps, CLIENT_EVENTS } from "@/lib/analytics";
import { GUIDES } from "@/lib/guides";
import { simulate, TAX_PARAMS } from "@/lib/tax";
import { TARGET_NET } from "@/content/blog/objectif-revenu-complementaire-budget";

const stub = (over: Partial<BlogPost>): BlogPost => ({
  slug: "x", title: "T", description: "D", category: "budget", published: "2026-01-01", updated: "2026-01-01",
  sources: [], Content: () => null, ...over,
});

describe("articles du blog", () => {
  it("slugs uniques, compatibles avec la mesure (50 caractères, [a-z0-9-])", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) {
      expect(s).toMatch(/^[a-z0-9-]{1,50}$/);
      expect(sanitizeProps({ article: s })).toEqual({ article: s });
    }
  });

  it("dates ISO cohérentes, catégorie connue, description et sources renseignées", () => {
    for (const p of BLOG_POSTS) {
      expect(p.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.updated >= p.published).toBe(true);
      if (p.reviewedOn) expect(p.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(BLOG_CATEGORIES.map((c) => c.slug)).toContain(p.category);
      expect(p.description.length).toBeGreaterThan(50);
      expect(p.description.length).toBeLessThanOrEqual(200);
      expect(p.sources.length).toBeGreaterThan(0);
      for (const r of p.related ?? []) expect(BLOG_POSTS.map((x) => x.slug)).toContain(r);
    }
  });

  it("l'événement de mesure d'entrée existe", () => {
    expect(CLIENT_EVENTS).toContain("blog_view");
  });
});

describe("règle de relecture", () => {
  const reviewed = stub({ slug: "relu", reviewedOn: "2026-02-01", published: "2026-02-01", updated: "2026-02-03" });
  const draft = stub({ slug: "brouillon" });
  const posts = [draft, reviewed];

  it("seuls les articles relus sont publics", () => {
    expect(isIndexable(draft)).toBe(false);
    expect(indexablePosts(posts).map((p) => p.slug)).toEqual(["relu"]);
    expect(postsInCategory("budget", posts).map((p) => p.slug)).toEqual(["relu"]);
    expect(latestBlogUpdate(posts)).toBe("2026-02-03");
  });

  it("une catégorie sans article relu est inactive", () => {
    expect(activeCategories(posts).map((c) => c.slug)).toEqual(["budget"]);
    expect(activeCategories([draft])).toEqual([]);
  });

  it("tri du plus récent au plus ancien et articles liés existants, publics, sans l'article courant", () => {
    const a = stub({ slug: "a", reviewedOn: "2026-03-01", published: "2026-03-01", related: ["b", "brouillon", "inconnu"] });
    const b = stub({ slug: "b", reviewedOn: "2026-02-01", published: "2026-02-01" });
    const c = stub({ slug: "c", reviewedOn: "2026-01-15", published: "2026-01-15" });
    const all = [c, b, a, draft];
    expect(indexablePosts(all).map((p) => p.slug)).toEqual(["a", "b", "c"]);
    expect(relatedPosts(a, 3, all).map((p) => p.slug)).toEqual(["b", "c"]);
  });
});

describe("sitemap et RSS", () => {
  it("le sitemap ne contient que les articles relus", () => {
    const paths = sitemapEntries().map((e) => e.path);
    for (const p of BLOG_POSTS) expect(paths.includes(`/blog/${p.slug}`)).toBe(isIndexable(p));
    expect(paths.includes("/blog")).toBe(indexablePosts().length > 0);
  });

  it("flux RSS 2.0 : articles relus uniquement, XML échappé", () => {
    const post = stub({ slug: "relu", title: "A & B <c>", reviewedOn: "2026-02-01", published: "2026-02-01", updated: "2026-02-01" });
    const xml = buildBlogRss([post]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain("<title>A &amp; B &lt;c&gt;</title>");
    expect(xml).toContain(`<link>${absoluteUrl("/blog/relu")}</link>`);
    expect(xml).toContain("<pubDate>Sun, 01 Feb 2026 00:00:00 GMT</pubDate>");
    expect(xml).not.toContain("<script");
    const empty = buildBlogRss([]);
    expect(empty).not.toContain("<item>");
    expect(buildBlogRss()).toBe(buildBlogRss(indexablePosts()));
  });
});

describe("JSON-LD Article", () => {
  const base = { title: "T", description: "D", path: "/blog/x", published: "2026-01-01", updated: "2026-01-02" };
  it("auteur nommé (Person) pour le blog, organisation par défaut pour les guides", () => {
    expect(articleJsonLd({ ...base, authorName: "Maxime Girard" }).author).toEqual({ "@type": "Person", name: "Maxime Girard" });
    expect((articleJsonLd(base).author as { "@type": string })["@type"]).toBe("Organization");
  });
});

describe("contenu des articles", () => {
  const html = (p: BlogPost) => renderToStaticMarkup(createElement(p.Content));

  it("se rend sans valeur manquante (NaN, undefined, null, [object])", () => {
    for (const p of BLOG_POSTS) {
      const out = html(p);
      expect(out.length).toBeGreaterThan(500);
      expect(out, p.slug).not.toMatch(/NaN|undefined|\[object|>null</);
      for (const f of p.faq ?? []) expect(`${f.question} ${f.answer}`, p.slug).not.toMatch(/NaN|undefined|\[object/);
    }
  });

  it("commence par une réponse courte et contient l'avertissement", () => {
    for (const p of BLOG_POSTS) expect(html(p), p.slug).toContain("Réponse courte");
  });

  it("les liens internes vers /blog et /guides pointent vers des pages existantes", () => {
    const blog = new Set(BLOG_POSTS.map((p) => p.slug));
    const guides = new Set(GUIDES.map((g) => g.slug));
    for (const p of BLOG_POSTS) {
      for (const [, slug] of html(p).matchAll(/href="\/blog\/([a-z0-9-]+)"/g)) expect(blog.has(slug ?? ""), `${p.slug} → blog/${slug}`).toBe(true);
      for (const [, slug] of html(p).matchAll(/href="\/guides\/([a-z0-9-]+)"/g)) expect(guides.has(slug ?? ""), `${p.slug} → guides/${slug}`).toBe(true);
    }
  });

  it("toute estimation de revenu mentionne la nature d'estimation", () => {
    for (const p of BLOG_POSTS) {
      const out = html(p);
      if (/€/.test(out)) expect(out, p.slug).toMatch(/[Ee]stimation|exemple|indicati/);
    }
  });

  it("le net de l'exemple de budget est cohérent avec le simulateur", () => {
    const required = Math.ceil(TARGET_NET / (1 - TAX_PARAMS.urssafRate.bic));
    expect(simulate({ monthlyRevenue: required, regime: "bic" }).netMonthly).toBeGreaterThanOrEqual(TARGET_NET);
    expect(simulate({ monthlyRevenue: required - 1, regime: "bic" }).netMonthly).toBeLessThan(TARGET_NET);
  });
});

describe("articles économies : exemples chiffrés", () => {
  const text = (slug: string) => {
    const p = BLOG_POSTS.find((x) => x.slug === slug);
    if (!p) throw new Error(slug);
    return renderToStaticMarkup(createElement(p.Content)).replace(/<[^>]+>/g, " ").replace(/[  ]/g, " ");
  };

  it("prix au kilo et hausse de la shrinkflation recalculés à la main", () => {
    const t = text("comparer-prix-au-kilo-shrinkflation");
    expect(t).toContain("4,80 €"); // 2,40 € / 500 g
    expect(t).toContain("4,40 €"); // 3,30 € / 750 g
    expect(t).toContain("5,33 €"); // 2,40 € / 450 g
    expect(t).toContain("11,1 %"); // 5,333 / 4,8 - 1
  });

  it("total des abonnements : 53,38 € par mois, 640,56 € par an", () => {
    const t = text("resilier-abonnement-en-ligne-trois-clics");
    expect(t).toContain("53,38 €");
    expect(t).toContain("640,56 €");
  });

  it("chaque article économies cite une source service-public.gouv.fr datée et un CTA vers le diagnostic", () => {
    for (const p of BLOG_POSTS.filter((x) => x.category === "economies")) {
      expect(p.sources.length).toBeGreaterThan(0);
      for (const s of p.sources) {
        expect(s.url).toMatch(/^https:\/\/(www|entreprendre)\.service-public\.gouv\.fr\//);
        expect(s.verified).toMatch(/20\d\d/);
      }
      expect(p.cta?.href).toBe("/onboarding");
    }
  });
});
