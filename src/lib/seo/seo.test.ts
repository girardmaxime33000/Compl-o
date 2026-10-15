import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { ACTIVITIES, activitySlug } from "@/lib/activities";
import { CITIES, CITY_ACTIVITY_PAIRS, CITY_DATA, cityActivityPath, hasLocalData } from "@/lib/cities";
import { GUIDES } from "@/lib/guides";
import { AI_BOTS, absoluteUrl, DISALLOWED_PATHS, NOINDEX, sitemapEntries } from "@/lib/seo";

describe("sitemap", () => {
  const entries = sitemap();
  const byUrl = new Map(entries.map((e) => [e.url, e]));

  it("n'expose aucune priorité et une lastModified AAAA-MM-JJ pour chaque URL", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      expect(e).not.toHaveProperty("priority");
      expect(String(e.lastModified)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("URL uniques", () => {
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
  });

  it("pages ville : date de téléchargement des données", () => {
    for (const { city, activity } of CITY_ACTIVITY_PAIRS) {
      expect(byUrl.get(absoluteUrl(cityActivityPath(city, activity)))?.lastModified).toBe(CITY_DATA.downloadedOn);
    }
  });

  it("guides : date de mise à jour du contenu", () => {
    for (const g of GUIDES) {
      expect(byUrl.get(absoluteUrl(`/guides/${g.slug}`))?.lastModified).toBe(g.updated);
    }
  });

  it("exclut les couples activité × ville sans donnée locale", () => {
    for (const city of CITIES) {
      for (const a of ACTIVITIES) {
        const present = byUrl.has(absoluteUrl(cityActivityPath(city, a)));
        expect(present).toBe(hasLocalData(city, a));
      }
    }
  });

  it("exclut les pages légales (noindex) et inclut les hubs activité", () => {
    for (const p of ["/mentions-legales", "/cgu", "/cgv", "/confidentialite"]) {
      expect(byUrl.has(absoluteUrl(p))).toBe(false);
    }
    for (const a of ACTIVITIES) expect(byUrl.has(absoluteUrl(`/activites/${activitySlug(a)}`))).toBe(true);
    expect(sitemapEntries().every((e) => e.path.startsWith("/"))).toBe(true);
  });
});

describe("robots", () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];

  it("conserve les Disallow existants et la ligne Sitemap", () => {
    expect(DISALLOWED_PATHS).toEqual(["/dashboard", "/login", "/auth", "/onboarding", "/api"]);
    expect(r.sitemap).toBe(absoluteUrl("/sitemap.xml"));
    const star = rules.find((x) => x.userAgent === "*");
    expect(star?.allow).toBe("/");
    expect(star?.disallow).toEqual(DISALLOWED_PATHS);
  });

  it("déclare les bots d'IA avec la même politique que *", () => {
    const ai = rules.find((x) => Array.isArray(x.userAgent));
    expect(ai?.userAgent).toEqual([...AI_BOTS]);
    for (const bot of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"]) {
      expect(ai?.userAgent).toContain(bot);
    }
    expect(ai?.allow).toBe("/");
    expect(ai?.disallow).toEqual(DISALLOWED_PATHS);
  });
});

describe("noindex", () => {
  it("désindexe via les métadonnées (index false, follow true), jamais via Disallow", () => {
    expect(NOINDEX.robots).toEqual({ index: false, follow: true });
  });
});
