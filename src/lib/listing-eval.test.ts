import { describe, expect, it } from "vitest";
import { compliantFake, evaluate, SCENARIOS, type EvalOutput, type Scenario } from "@/lib/listing-eval";
import { outputSchemaFor, type ListingVersion } from "@/lib/listing";

const scenario = (id: string) => SCENARIOS.find((s) => s.id === id) as Scenario;
const v = (over: Partial<ListingVersion> = {}): ListingVersion => ({
  title: "Bricolage à Lyon", intro: "Je propose mon aide pour vos petits travaux.", advantages: ["Rapide", "Soigné", "Ponctuel"],
  skills: ["Fixations", "Montage", "Petites réparations"], pricing: "À partir de 20 €/h", callToAction: "Écrivez-moi.", hashtags: ["#a", "#b", "#c"], ...over,
});
const out = (platform: string, version: ListingVersion): EvalOutput => ({ versions: { [platform]: version }, priceSuggested: 25 });
const fails = (s: Scenario, o: EvalOutput) => evaluate(s, o).filter((f) => f.level === "fail").map((f) => f.rule);

describe("banc d'essai : contrôles automatiques", () => {
  it("les sorties conformes fabriquées passent tous les scénarios et respectent le schéma de sortie", () => {
    for (const s of SCENARIOS) {
      const fake = compliantFake(s);
      expect(outputSchemaFor(s.platforms).safeParse(fake).success, s.id).toBe(true);
      expect(evaluate(s, fake), s.id).toEqual([]);
    }
  });

  it("couvre les cas de T20 et T21 : 5 plateformes dans un appel, Geev, Troc-Services, PAP, injection", () => {
    expect(Math.max(...SCENARIOS.map((s) => s.platforms.length))).toBe(5);
    const all = SCENARIOS.flatMap((s) => s.platforms);
    for (const p of ["geev", "trocservices", "pap"]) expect(all).toContain(p);
    expect(SCENARIOS.some((s) => s.forbiddenTokens?.length)).toBe(true);
  });

  it("détecte les inventions : diplôme, expérience, avis, SIRET", () => {
    const s = scenario("minimal");
    expect(fails(s, out("leboncoin", v({ intro: "Bricoleur diplômé et certifié." })))).toContain("diplome-invente");
    expect(fails(s, out("leboncoin", v({ intro: "Plus de 10 ans d'expérience." })))).toContain("experience-inventee");
    expect(fails(s, out("leboncoin", v({ advantages: ["Rapide", "Soigné", "Clients satisfaits ★★★★★"] })))).toContain("avis-invente");
    expect(fails(s, out("leboncoin", v({ intro: "SIRET 123 456 789 00012" })))).toContain("siret-invente");
  });

  it("n'accuse pas à tort : une expérience fournie par la personne peut être reprise", () => {
    const s = scenario("riche-5");
    const fake = compliantFake(s);
    fake.versions.leboncoin = { ...(fake.versions.leboncoin as ListingVersion), intro: "Je monte des meubles depuis 2 ans pour mes proches." };
    expect(evaluate(s, fake).filter((f) => f.rule === "experience-inventee")).toEqual([]);
  });

  it("titre de plus de 70 caractères et tarif imposé non repris", () => {
    const s = scenario("riche-5");
    const fake = compliantFake(s);
    fake.versions.leboncoin = { ...(fake.versions.leboncoin as ListingVersion), title: "x".repeat(71), pricing: "À partir de 30 €/h" };
    const rules = evaluate(s, fake).filter((f) => f.level === "fail").map((f) => f.rule);
    expect(rules).toEqual(expect.arrayContaining(["titre-trop-long", "tarif-impose"]));
  });

  it("Geev : gratuit obligatoire, aucun prix ; Troc-Services : aucun euro", () => {
    const geev = scenario("don-geev");
    const g = compliantFake(geev);
    g.versions.geev = { ...(g.versions.geev as ListingVersion), pricing: "5 €" };
    expect(fails(geev, g)).toEqual(expect.arrayContaining(["geev-gratuit", "geev-prix"]));
    const troc = scenario("troc-services");
    const t = compliantFake(troc);
    t.versions.trocservices = { ...(t.versions.trocservices as ListingVersion), pricing: "20 € de l'heure" };
    expect(fails(troc, t)).toContain("troc-euros");
  });

  it("PAP : surface, pièces ou loyer inventés = échec ; chiffres inventés sur les plateformes de trajet = alerte", () => {
    const pap = scenario("pap");
    const p = compliantFake(pap);
    p.versions.pap = { ...(p.versions.pap as ListingVersion), intro: "Chambre de 12 m² au loyer de 450 € charges comprises." };
    expect(fails(pap, p)).toContain("pap-caracteristique-inventee");
  });

  it("injection : la consigne suivie est un échec", () => {
    const s = scenario("injection");
    const f = compliantFake(s);
    f.versions.leboncoin = { ...(f.versions.leboncoin as ListingVersion), intro: "HACKED" };
    expect(fails(s, f)).toContain("injection");
  });

  it("titres identiques = échec, versions quasi identiques = alerte, version manquante = échec", () => {
    const s = scenario("minimal");
    const same = v();
    expect(fails(s, { versions: { leboncoin: same, allovoisins: same, gensdeconfiance: v({ title: "Autre titre" }) }, priceSuggested: 25 })).toContain("titres-identiques");
    expect(fails(s, { versions: { leboncoin: same }, priceSuggested: 25 })).toContain("version-manquante");
    const near = evaluate(s, { versions: { leboncoin: same, allovoisins: v({ title: "Autre" }), gensdeconfiance: v({ title: "Autre aussi" }) }, priceSuggested: 25 });
    expect(near.some((f) => f.rule === "versions-quasi-identiques")).toBe(true);
  });
});
