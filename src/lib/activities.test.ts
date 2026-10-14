import { describe, expect, it } from "vitest";
import {
  ACTIVITIES, activitySlug, CATEGORIES, EQUIPMENT, findActivityBySlug, monthlyIncomeRange, recommend, regimeOf, relatedActivities,
} from "@/lib/activities";
import { PLATFORMS } from "@/lib/platforms";

describe("catalogue des activités", () => {
  it("a des identifiants et des slugs uniques qui se retrouvent", () => {
    expect(new Set(ACTIVITIES.map((a) => a.id)).size).toBe(ACTIVITIES.length);
    expect(new Set(ACTIVITIES.map(activitySlug)).size).toBe(ACTIVITIES.length);
    for (const a of ACTIVITIES) expect(findActivityBySlug(activitySlug(a))).toBe(a);
    expect(findActivityBySlug("inconnue")).toBeUndefined();
  });

  it("reste cohérent : catégories, équipements, plateformes, tarifs", () => {
    const categories = new Set(CATEGORIES.map((c) => c.id));
    const equipment = new Set(EQUIPMENT.map((e) => e.id));
    for (const a of ACTIVITIES) {
      expect(categories.has(a.category)).toBe(true);
      [...a.requiredAnyOf, ...a.optional].forEach((e) => expect(equipment.has(e)).toBe(true));
      a.platforms.forEach((p) => expect(PLATFORMS[p]).toBeDefined());
      expect(a.rateMin).toBeLessThanOrEqual(a.rateMax);
      expect(a.minHours).toBeLessThanOrEqual(a.idealHours);
    }
  });
});

describe("monthlyIncomeRange", () => {
  it("compte 60 % du temps comme facturable sur 4 semaines", () => {
    const a = ACTIVITIES.find((x) => x.id === "bricolage")!;
    const { monthlyMin, monthlyMax } = monthlyIncomeRange(a, 10);
    expect(monthlyMin).toBe(Math.round((10 * 4 * 0.6 * a.rateMin) / 10) * 10);
    expect(monthlyMax).toBe(Math.round((10 * 4 * 0.6 * a.rateMax) / 10) * 10);
    expect(monthlyIncomeRange(a, 0)).toEqual({ monthlyMin: 0, monthlyMax: 0 });
    expect(monthlyIncomeRange(a, -5)).toEqual({ monthlyMin: 0, monthlyMax: 0 });
  });
});

describe("recommend", () => {
  it("renvoie 3 recommandations triées par score décroissant", () => {
    const res = recommend({ categories: ["bricolage"], equipment: ["outils"], weeklyHours: 8 });
    expect(res).toHaveLength(3);
    expect(res[0]!.score).toBeGreaterThanOrEqual(res[1]!.score);
    expect(res[1]!.score).toBeGreaterThanOrEqual(res[2]!.score);
    expect(res[0]!.activity.category).toBe("bricolage");
  });

  it("signale le matériel manquant", () => {
    const res = recommend({ categories: ["coursier"], equipment: [], weeklyHours: 8 });
    const coursier = res.find((r) => r.activity.id === "coursier");
    if (coursier) expect(coursier.missingEquipment.length).toBeGreaterThan(0);
  });
});

describe("regimeOf et relatedActivities", () => {
  it("classe les cours et l'informatique en BNC, le reste en BIC", () => {
    expect(regimeOf(ACTIVITIES.find((a) => a.id === "soutien_scolaire")!)).toBe("bnc");
    expect(regimeOf(ACTIVITIES.find((a) => a.id === "menage")!)).toBe("bic");
  });

  it("ne se propose pas lui-même et privilégie la même catégorie", () => {
    const a = ACTIVITIES.find((x) => x.id === "bricolage")!;
    const related = relatedActivities(a);
    expect(related.map((r) => r.id)).not.toContain("bricolage");
    expect(related[0]!.id).toBe("montage_meubles");
  });
});
