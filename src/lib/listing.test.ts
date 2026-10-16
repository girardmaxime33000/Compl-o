import { describe, expect, it } from "vitest";
import { buildListingPrompt, formatListingBody, variantsOf } from "@/lib/listing";

describe("buildListingPrompt", () => {
  it("n'inclut que les informations fournies", () => {
    const prompt = buildListingPrompt({ service: "Bricolage", city: "Lyon" });
    expect(prompt).toContain("Service : Bricolage");
    expect(prompt).not.toContain("Expérience");
    expect(prompt).not.toContain("Tarif horaire");
  });

  it("couvre les trois plateformes", () => {
    const prompt = buildListingPrompt({ service: "Bricolage", city: "Lyon" });
    for (const label of ["LeBonCoin", "AlloVoisins", "GensDeConfiance"]) expect(prompt).toContain(label);
  });

  it("reprend les champs de personnalisation", () => {
    const prompt = buildListingPrompt({ service: "Cours", city: "Nantes", skills: "Maths", experience: "5 ans", availability: "Le soir", zone: "10 km", rate: 25, tone: "professionnel" });
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
