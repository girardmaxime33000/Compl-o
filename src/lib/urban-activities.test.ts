import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { ACTIVITIES, activitySlug } from "@/lib/activities";
import { buildLlmsTxt } from "@/lib/seo/llms";
import { absoluteUrl } from "@/lib/seo";
import { getFiscalParams, TAX_PARAMS } from "@/lib/tax";
import {
  emergingUrbanActivities, findPublishedUrbanActivity, publishedUrbanActivities, URBAN_ACTIVITIES,
} from "@/lib/urban-activities";
import {
  AD_LENGTH, CMA_NOTICE, cmaNotice, computeMonthlyNetIncome, hasSapConflict, renderAd, SAP_CONFLICT_MESSAGE, vatAlert,
} from "@/lib/urban-income";

const bySlug = (slug: string) => URBAN_ACTIVITIES.find((a) => a.slug === slug)!;

describe("catalogue urbain", () => {
  it("compte 7 fiches : 4 PUBLISHED et 3 EMERGING", () => {
    expect(URBAN_ACTIVITIES).toHaveLength(7);
    expect(publishedUrbanActivities()).toHaveLength(4);
    expect(emergingUrbanActivities()).toHaveLength(3);
  });

  it("slugs uniques et sans collision avec le catalogue existant", () => {
    const slugs = URBAN_ACTIVITIES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const existing = new Set(ACTIVITIES.map(activitySlug));
    for (const s of slugs) expect(existing.has(s)).toBe(false);
  });

  it("masque les fiches EMERGING côté public", () => {
    for (const a of emergingUrbanActivities()) expect(findPublishedUrbanActivity(a.slug)).toBeUndefined();
    expect(publishedUrbanActivities().every((a) => a.status === "PUBLISHED")).toBe(true);
  });

  it("fiches publiées complètes et tarifs cohérents", () => {
    for (const a of publishedUrbanActivities()) {
      expect(a.adTemplate && a.monthlyOperatingCosts && (a.effectiveHourlyRate || a.revenueOverride)).toBeTruthy();
      for (const p of a.pricing) expect(p.minEur).toBeLessThanOrEqual(p.maxEur);
      for (const e of a.equipment ?? []) expect(e.minEur).toBeLessThanOrEqual(e.maxEur);
    }
  });
});

describe("référencement", () => {
  it("sitemap et llms.txt exposent les fiches publiées, jamais les EMERGING", () => {
    const urls = new Set(sitemap().map((e) => e.url));
    const llms = buildLlmsTxt();
    for (const a of publishedUrbanActivities()) {
      expect(urls.has(absoluteUrl(`/activites/${a.slug}`))).toBe(true);
      expect(llms).toContain(`/activites/${a.slug}`);
    }
    for (const a of emergingUrbanActivities()) {
      expect(urls.has(absoluteUrl(`/activites/${a.slug}`))).toBe(false);
      expect(llms).not.toContain(a.slug);
    }
  });
});

describe("paramètres fiscaux", () => {
  it("reprennent les taux de TAX_PARAMS (source unique)", () => {
    const p = getFiscalParams(2026);
    expect(p.socialContributionRates.BIC_SERVICES).toBe(TAX_PARAMS.urssafRate.bic);
    expect(p.socialContributionRates.BNC_SSI).toBe(TAX_PARAMS.urssafRate.bnc);
    expect(p.vatFranchiseThresholdServices).toBe(TAX_PARAMS.vatThreshold);
  });
  it("refuse une année inconnue", () => {
    expect(() => getFiscalParams(2020)).toThrow();
  });
});

describe("R1 : net mensuel", () => {
  const expected: [string, number, number][] = [
    ["reparation-velo-trottinette-domicile", 500, 1620],
    ["home-organising-petits-logements", 600, 1820],
    ["conciergerie-quartier", 320, 1240],
    ["configuration-objets-connectes", 610, 1830],
  ];
  it.each(expected)("%s : valeurs attendues à ± 15 €", (slug, occasional, regular) => {
    const a = bySlug(slug);
    expect(Math.abs(computeMonthlyNetIncome(a, "OCCASIONAL").netIncome - occasional)).toBeLessThanOrEqual(15);
    expect(Math.abs(computeMonthlyNetIncome(a, "REGULAR").netIncome - regular)).toBeLessThanOrEqual(15);
  });

  it("décompose revenu, cotisations et charges", () => {
    const r = computeMonthlyNetIncome(bySlug("home-organising-petits-logements"), "OCCASIONAL");
    expect(r.billedHours).toBeCloseTo(4 * 4.33);
    expect(r.revenue).toBeCloseTo(4 * 4.33 * 50);
    expect(r.contributions).toBeCloseTo(r.revenue * (0.256 + 0.002));
    expect(r.netIncome).toBeCloseTo(r.revenue - r.contributions - 40);
  });

  it("arrondit l'affichage à la dizaine et garde la précision", () => {
    const r = computeMonthlyNetIncome(bySlug("reparation-velo-trottinette-domicile"), "OCCASIONAL");
    expect(r.netDisplay % 10).toBe(0);
    expect(r.netIncome).not.toBe(r.netDisplay);
    expect(Math.abs(r.netDisplay - r.netIncome)).toBeLessThanOrEqual(5);
  });

  it("revenueOverride : CA composite, pas de calcul horaire (conciergerie)", () => {
    const r = computeMonthlyNetIncome(bySlug("conciergerie-quartier"), "REGULAR");
    expect(r.revenue).toBe(1630);
    expect(r.billedHours).toBe(0);
    expect(r.composition).toContain("30 abonnements");
    expect(r.netIncome).toBeCloseTo(1630 * (1 - 0.212 - 0.001) - 40);
  });

  it("ACRE : coefficient 50 % avant le 1er juillet 2026, 75 % à partir de cette date, formation non réduite", () => {
    const a = bySlug("configuration-objets-connectes");
    const base = computeMonthlyNetIncome(a, "REGULAR");
    const before = computeMonthlyNetIncome(a, "REGULAR", { acre: { startDate: "2026-06-30" } });
    const after = computeMonthlyNetIncome(a, "REGULAR", { acre: { startDate: "2026-07-01" } });
    expect(before.contributions).toBeCloseTo(base.revenue * (0.256 * 0.5 + 0.002));
    expect(after.contributions).toBeCloseTo(base.revenue * (0.256 * 0.75 + 0.002));
    expect(before.netIncome).toBeGreaterThan(after.netIncome);
    expect(after.netIncome).toBeGreaterThan(base.netIncome);
  });

  it("ACRE sur CA composite", () => {
    const a = bySlug("conciergerie-quartier");
    const r = computeMonthlyNetIncome(a, "OCCASIONAL", { acre: { startDate: "2026-01-15" } });
    expect(r.contributions).toBeCloseTo(424 * (0.212 * 0.5 + 0.001));
  });

  it("refuse le calcul d'une fiche EMERGING incomplète", () => {
    expect(() => computeMonthlyNetIncome(bySlug("vente-seconde-main-pour-tiers"), "REGULAR")).toThrow();
  });
});

describe("R2 : alerte TVA", () => {
  const velo = bySlug("reparation-velo-trottinette-domicile");
  const organising = bySlug("home-organising-petits-logements");
  const iot = bySlug("configuration-objets-connectes");
  const concierge = bySlug("conciergerie-quartier");

  it("pas d'alerte pour une activité seule en profil Régulier (CA annuel < 90 % du seuil)", () => {
    for (const a of [velo, organising, iot]) expect(vatAlert([{ activity: a, profile: "REGULAR" }]).triggered).toBe(false);
  });

  it("alerte quand deux activités cumulées atteignent 90 % du seuil (33 750 €)", () => {
    const alert = vatAlert([{ activity: organising, profile: "REGULAR" }, { activity: iot, profile: "REGULAR" }]);
    expect(alert.annualServicesRevenue).toBeCloseTo(2 * 12 * 12 * 4.33 * 50);
    expect(alert.alertThreshold).toBeCloseTo(0.9 * 37500);
    expect(alert.triggered).toBe(true);
  });

  it("somme les CA composites et ignore la vente de marchandises", () => {
    expect(vatAlert([{ activity: concierge, profile: "REGULAR" }, { activity: concierge, profile: "REGULAR" }]).annualServicesRevenue).toBe(1630 * 24);
    const sales = { ...concierge, taxCategory: "BIC_SALES" as const };
    expect(vatAlert([{ activity: sales, profile: "REGULAR" }]).annualServicesRevenue).toBe(0);
  });

  it("le seuil d'avertissement est inclusif (≥ 90 % de 37 500 €)", () => {
    const at = (revenue: number) => ({
      ...concierge,
      revenueOverride: { OCCASIONAL: { revenue, composition: "test" }, REGULAR: { revenue, composition: "test" } },
    });
    expect(vatAlert([{ activity: at(2812.5), profile: "REGULAR" }]).triggered).toBe(true);
    expect(vatAlert([{ activity: at(2812.4), profile: "REGULAR" }]).triggered).toBe(false);
  });
});

describe("R3 : exclusivité SAP", () => {
  const iot = bySlug("configuration-objets-connectes");
  const velo = bySlug("reparation-velo-trottinette-domicile");
  const organising = bySlug("home-organising-petits-logements");

  it("IT_ASSISTANCE + NONE déclenche le conflit", () => {
    expect(hasSapConflict([iot, velo])).toBe(true);
    expect(SAP_CONFLICT_MESSAGE).toContain("crédit d'impôt de 50 %");
  });
  it("pas de conflit si toutes éligibles ou toutes non éligibles", () => {
    expect(hasSapConflict([iot])).toBe(false);
    expect(hasSapConflict([velo, organising])).toBe(false);
    expect(hasSapConflict([])).toBe(false);
  });
  it("le segment {{sap}} est retiré en cas de conflit, même si le candidat est déclaré SAP", () => {
    const ad = renderAd(iot, { sapDeclared: true, selection: [iot, velo] });
    expect(ad.sapSegmentKept).toBe(false);
    expect(ad.text).not.toMatch(/crédit d'impôt|\{\{|\}\}/);
    expect(ad.text).toContain("45 € de l'heure.");
  });
});

describe("R4 : message CMA", () => {
  it("affiché uniquement pour la réparation de cycles", () => {
    expect(cmaNotice(bySlug("reparation-velo-trottinette-domicile"))).toBe(CMA_NOTICE);
    for (const a of URBAN_ACTIVITIES.filter((x) => x.slug !== "reparation-velo-trottinette-domicile")) expect(cmaNotice(a)).toBeNull();
  });
});

describe("R5 : annonces", () => {
  const values = { quartier: "Saint-Michel" };

  it("toutes les annonces publiées font 250 à 320 caractères, variables remplacées", () => {
    for (const a of publishedUrbanActivities()) {
      for (const sapDeclared of [false, true]) {
        const ad = renderAd(a, { values, sapDeclared });
        expect(ad.length).toBeGreaterThanOrEqual(AD_LENGTH.min);
        expect(ad.length).toBeLessThanOrEqual(AD_LENGTH.max);
        expect(ad.lengthOk).toBe(true);
        expect(ad.text).not.toMatch(/\[\w+\]|\{\{/);
      }
    }
  });

  it("segment SAP conservé uniquement si déclaré SAP, éligible et sans conflit", () => {
    const iot = bySlug("configuration-objets-connectes");
    const withSap = renderAd(iot, { sapDeclared: true });
    expect(withSap.sapSegmentKept).toBe(true);
    expect(withSap.text).toContain("soit 22,50 € après crédit d'impôt de 50 %");
    expect(renderAd(iot, { sapDeclared: false }).text).not.toContain("crédit d'impôt");
  });

  it("calcule le prix net SAP depuis le taux de crédit d'impôt", () => {
    const iot = bySlug("configuration-objets-connectes");
    expect(renderAd(iot, { sapDeclared: true, values: { prix_horaire: 60 } }).text).toContain("60 € de l'heure, soit 30 € après");
  });

  it("exige le quartier de l'annonce vélo", () => {
    expect(() => renderAd(bySlug("reparation-velo-trottinette-domicile"))).toThrow(/quartier/);
  });

  it("variables du modèle déclarées dans adTemplateVariables", () => {
    for (const a of publishedUrbanActivities()) {
      const used = [...a.adTemplate!.matchAll(/\[(\w+)\]/g)].map((m) => m[1]);
      expect(new Set(used)).toEqual(new Set(a.adTemplateVariables));
    }
  });
});
