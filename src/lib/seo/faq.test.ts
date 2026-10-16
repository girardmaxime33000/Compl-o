import { describe, expect, it } from "vitest";
import { ACTIVITIES } from "@/lib/activities";
import { CITY_ACTIVITY_PAIRS } from "@/lib/cities";
import { GENERATOR_PLATFORMS, MAX_PLATFORMS_PER_LISTING } from "@/lib/platforms";
import { activityFaq, cityActivityFaq, homeFaq, pricingFaq, simulatorFaq } from "@/lib/seo/faq";

describe("FAQ des pages ville", () => {
  it("3 à 5 questions, réponses non vides, ancrées sur la ville", () => {
    for (const { city, activity } of CITY_ACTIVITY_PAIRS) {
      const faq = cityActivityFaq(city, activity);
      expect(faq.length).toBeGreaterThanOrEqual(3);
      expect(faq.length).toBeLessThanOrEqual(5);
      for (const item of faq) {
        expect(item.question.endsWith("?")).toBe(true);
        expect(item.answer.length).toBeGreaterThan(40);
      }
      expect(faq.some((i) => i.question.includes(city.name))).toBe(true);
    }
  });

  it("contenu varié : aucune réponse identique d'une page à l'autre", () => {
    const seen = new Set<string>();
    let total = 0;
    for (const { city, activity } of CITY_ACTIVITY_PAIRS) {
      for (const item of cityActivityFaq(city, activity)) {
        seen.add(item.answer);
        total++;
      }
    }
    expect(seen.size).toBe(total);
  });

  it("les chiffres du marché local viennent des données de la ville", () => {
    const { city, activity } = CITY_ACTIVITY_PAIRS[0]!;
    const market = cityActivityFaq(city, activity).find((i) => i.question.includes("marché local"));
    expect(market?.answer).toContain(city.bassin);
    expect(market?.answer).toContain("emplois salariés");
  });
});

describe("autres FAQ", () => {
  it("accueil : 5 à 7 questions", () => {
    expect(homeFaq().length).toBeGreaterThanOrEqual(5);
    expect(homeFaq().length).toBeLessThanOrEqual(7);
  });
  it("accueil : sites et limites issus de platforms.ts, sans vocabulaire technique", () => {
    const text = homeFaq().map((i) => `${i.question} ${i.answer}`).join(" ");
    expect(text).toContain(`${GENERATOR_PLATFORMS.length} sites`);
    expect(text).toContain(`jusqu'à ${MAX_PLATFORMS_PER_LISTING}`);
    expect(text).toContain("Compléo ne publie rien à votre place");
    for (const jargon of ["BIC", "BNC", "micro-social", "franchise en base", "chiffre d'affaires", "cotisations"]) expect(text).not.toContain(jargon);
  });
  it("accueil : taux de charges issus de tax.ts, avec la réserve d'estimation", () => {
    const text = homeFaq().map((i) => i.answer).join(" ");
    expect(text).toContain("21,2 %");
    expect(text).toContain("sans garantie de revenu");
  });
  it("accueil : questions uniques et renvoi aux sources officielles", () => {
    const faq = homeFaq();
    expect(new Set(faq.map((i) => i.question)).size).toBe(faq.length);
    expect(faq.map((i) => i.answer).join(" ")).toContain("autoentrepreneur.urssaf.fr");
  });
  it("les réponses de prix reprennent offers.ts", () => {
    expect(pricingFaq().map((i) => i.answer).join(" ")).toContain("69,99");
    expect(homeFaq().map((i) => i.answer).join(" ")).toContain("4,99");
  });
  it("simulateur : taux issus de tax.ts", () => {
    expect(simulatorFaq().map((i) => i.answer).join(" ")).toContain("25,6 %");
  });
  it("hub activité : une FAQ par activité, questions uniques", () => {
    for (const a of ACTIVITIES) {
      const faq = activityFaq(a);
      expect(faq.length).toBeGreaterThanOrEqual(4);
      expect(new Set(faq.map((i) => i.question)).size).toBe(faq.length);
    }
  });
});
