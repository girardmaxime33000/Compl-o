import type { ComponentType } from "react";
import { AnnoncesEfficaces } from "@/content/guides/annonces-efficaces";

export interface Guide {
  slug: string;
  title: string;
  description: string;
  /** Date de dernière mise à jour du contenu (ISO). */
  updated: string;
  Content: ComponentType;
}

/**
 * Guides publiés. Les guides fiscaux et sociaux (cumul chômage, TVA, plafonds, devis, retraités) ne sont publiés
 * qu'après vérification sur les sources officielles : voir TASKS.md, T13.
 */
export const GUIDES: Guide[] = [
  {
    slug: "annonces-efficaces",
    title: "Rédiger une annonce de services efficace",
    description:
      "Titre, contenu, tarif, photos, réactivité : les points qui rendent une annonce de services claire et crédible sur LeBonCoin, AlloVoisins ou GensDeConfiance.",
    updated: "2026-10-15",
    Content: AnnoncesEfficaces,
  },
];

export const findGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
export const guidePath = (g: Guide) => `/guides/${g.slug}`;
