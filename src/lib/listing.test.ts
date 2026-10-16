import { describe, expect, it } from "vitest";
import { GENERATOR_PLATFORMS, PLATFORM_GROUPS, PLATFORMS, publishSteps, suggestedPlatforms, MAX_PLATFORMS_PER_LISTING } from "@/lib/platforms";
import { CATEGORIES } from "@/lib/activities";
import { buildListingPrompt, formatListingBody, variantsOf } from "@/lib/listing";

describe("buildListingPrompt", () => {
  it("n'inclut que les informations fournies", () => {
    const prompt = buildListingPrompt({ service: "Bricolage", city: "Lyon" }, ["leboncoin", "allovoisins", "gensdeconfiance"]);
    expect(prompt).toContain("Service : Bricolage");
    expect(prompt).not.toContain("Expérience");
    expect(prompt).not.toContain("Tarif horaire");
  });

  it("couvre les trois plateformes", () => {
    const prompt = buildListingPrompt({ service: "Bricolage", city: "Lyon" }, ["leboncoin", "allovoisins", "gensdeconfiance"]);
    for (const label of ["LeBonCoin", "AlloVoisins", "GensDeConfiance"]) expect(prompt).toContain(label);
  });

  it("reprend les champs de personnalisation", () => {
    const prompt = buildListingPrompt({ service: "Cours", city: "Nantes", skills: "Maths", experience: "5 ans", availability: "Le soir", zone: "10 km", rate: 25, tone: "professionnel" }, ["yoojo"]);
    for (const text of ["Maths", "5 ans", "Le soir", "10 km", "25 €", "professionnel"]) expect(prompt).toContain(text);
  });
});

describe("formatListingBody", () => {
  it("préfixe les mots-clés par # et liste avantages et compétences", () => {
    const body = formatListingBody({ intro: "Salut", advantages: ["a"], skills: ["b"], pricing: "20 €/h", callToAction: "Appelez-moi", hashtags: ["x", "#y", "z"] });
    expect(body).toContain("• a");
    expect(body).toContain("• b");
    expect(body).toContain("#x #y #z");
  });
});

describe("variantsOf", () => {
  const base = { platform: "leboncoin" as const, title: "T", description: "D" };
  it("rend la version unique d'une ancienne annonce", () => {
    expect(variantsOf({ ...base, variants: null })).toEqual([base]);
  });
  it("rend les versions enregistrées", () => {
    const variants = [base, { platform: "allovoisins" as const, title: "T2", description: "D2" }];
    expect(variantsOf({ ...base, variants })).toEqual(variants);
  });
});

describe("catalogue de plateformes", () => {
  it("propose 21 sites, chacun dans un groupe affiché, sans doublon", () => {
    expect(GENERATOR_PLATFORMS).toHaveLength(21);
    expect(new Set(GENERATOR_PLATFORMS).size).toBe(21);
    const groups = PLATFORM_GROUPS.map((g) => g.id) as string[];
    for (const p of GENERATOR_PLATFORMS) expect(groups).toContain(PLATFORMS[p].group);
  });

  it("donne une consigne, un nom et trois étapes de publication à chaque site", () => {
    for (const p of GENERATOR_PLATFORMS) {
      expect(PLATFORMS[p].label.length).toBeGreaterThan(0);
      expect(PLATFORMS[p].hint.length).toBeGreaterThan(10);
      expect(publishSteps(p)).toHaveLength(3);
    }
  });

  it("n'utilise que des adresses https", () => {
    for (const p of GENERATOR_PLATFORMS) {
      const { url } = PLATFORMS[p];
      if (url) expect(url.startsWith("https://")).toBe(true);
    }
  });

  it("signale les sites qui ne sont pas des services", () => {
    for (const p of ["pap", "geev", "trocservices", "getaround", "jestocke", "ouistock", "blablacar"] as const) expect(PLATFORMS[p].note).toBeTruthy();
  });

  it("suggère pour chaque domaine du diagnostic des sites valides, dans la limite autorisée", () => {
    for (const c of CATEGORIES) {
      const suggested = suggestedPlatforms(c.id);
      expect(suggested.length).toBeGreaterThan(0);
      expect(suggested.length).toBeLessThanOrEqual(MAX_PLATFORMS_PER_LISTING);
      for (const p of suggested) expect(GENERATOR_PLATFORMS).toContain(p);
    }
    expect(suggestedPlatforms(undefined)).toEqual(["leboncoin", "allovoisins", "gensdeconfiance"]);
  });
});
