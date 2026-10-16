/**
 * Identité visuelle de Compléo : symbole « C + » (un arc ouvert complété par un plus). Source unique de la géométrie,
 * reprise par le composant `LogoMark`, les cartes de partage, l'icône du site, les e-mails et les PDF.
 * Grille 120 × 120, symbole centré. Tracé reconstruit à partir du logo fourni par le propriétaire le 16 octobre 2026
 * (recouvrement de 98,3 % avec l'image d'origine). Les fichiers `public/logo/*.svg` et `src/app/icon.svg` reprennent
 * ces valeurs : `src/lib/brand.test.ts` vérifie qu'ils restent identiques.
 */
export const BRAND_BLUE = "#2563eb";
export const BRAND_NAVY = "#1e3a8a";
export const LOGO_VIEWBOX = "0 0 120 120";

export const LOGO_ARC = { d: "M99.17 39A42 42 0 1 0 99.17 81", strokeWidth: 16.43 } as const;
export const LOGO_PLUS = { d: "M48.46 60H77.14M62.8 45.66V74.34", strokeWidth: 10.79 } as const;
