#!/usr/bin/env node
/**
 * Vérifie que les photos Unsplash référencées par le site répondent toujours (une photo retirée par son auteur casserait
 * l'image en production). Envoie une requête HEAD par photo vers images.unsplash.com ; aucune clé API n'est nécessaire.
 * À lancer chaque mois : `node scripts/check-photo-links.mjs`. Code de sortie 1 si une photo est indisponible.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = ["src/data/city-images.json", "src/data/site-images.json"];
let total = 0;
let broken = 0;

for (const f of files) {
  const photos = JSON.parse(readFileSync(join(root, f), "utf8")).photos ?? {};
  for (const [key, p] of Object.entries(photos)) {
    total += 1;
    const url = `${p.raw}${p.raw.includes("?") ? "&" : "?"}w=200&q=40&fm=webp`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok) {
        broken += 1;
        console.log(`INDISPONIBLE ${res.status} : ${f} > ${key} (${p.pageUrl})`);
      }
    } catch (e) {
      broken += 1;
      console.log(`ERREUR RÉSEAU : ${f} > ${key} (${e.message})`);
    }
  }
}
console.log(`${total} photos contrôlées, ${broken} en défaut.`);
process.exit(broken ? 1 : 0);
