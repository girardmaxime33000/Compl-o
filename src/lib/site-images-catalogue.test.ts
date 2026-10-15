import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACTIVITIES } from "@/lib/activities";
import { GUIDES } from "@/lib/guides";
import { publishedUrbanActivities } from "@/lib/urban-activities";

/** Catalogue de requêtes du script `scripts/fetch-unsplash-images.py site` : doit couvrir exactement les emplacements du site. */
const CATALOGUE = JSON.parse(readFileSync(join(process.cwd(), "scripts", "site-images-catalogue.json"), "utf-8")) as Record<
  string,
  { query: string; orientation: string }
>;

describe("catalogue des photos du site (script de sélection)", () => {
  it("couvre l'accueil, le CTA final, le login, chaque activité, activité urbaine publiée et guide", () => {
    const expected = [
      "hero:home",
      "cta:final",
      "login",
      ...ACTIVITIES.map((a) => `activity:${a.id}`),
      ...publishedUrbanActivities().map((a) => `urban:${a.slug}`),
      ...GUIDES.map((g) => `guide:${g.slug}`),
    ].sort();
    expect(Object.keys(CATALOGUE).sort()).toEqual(expected);
  });

  it("chaque entrée a une requête non vide et une orientation valide", () => {
    for (const [key, spec] of Object.entries(CATALOGUE)) {
      expect(spec.query.length, key).toBeGreaterThan(2);
      expect(["landscape", "portrait", "squarish"], key).toContain(spec.orientation);
    }
  });
});
