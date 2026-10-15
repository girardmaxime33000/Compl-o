import type { ComponentType } from "react";
import { AnnoncesEfficaces } from "@/content/guides/annonces-efficaces";
import { CumulChomageMicroEntreprise } from "@/content/guides/cumul-chomage-micro-entreprise";
import { FranchiseTva } from "@/content/guides/franchise-tva-micro-entrepreneur";
import { PlafondsMicro2026 } from "@/content/guides/plafonds-micro-entreprise-2026";
import { PremierDevis } from "@/content/guides/premier-devis-micro-entrepreneur";
import { MicroEntrepriseRetraite } from "@/content/guides/micro-entreprise-retraite";

export interface Guide {
  slug: string;
  title: string;
  description: string;
  /** Date de première publication (ISO). */
  published: string;
  /** Date de dernière mise à jour du contenu (ISO). */
  updated: string;
  /** FAQ visible en fin de guide, reprise en `FAQPage` JSON-LD. Absente si le guide n'a pas de FAQ. */
  faq?: { question: string; answer: string }[];
  Content: ComponentType;
  /** Appel à l'action de fin de guide. Par défaut : simulateur public. */
  cta?: { title: string; text: string; label: string; href: string };
}

export const DEFAULT_CTA = {
  title: "Simulez votre revenu net",
  text: "Estimez vos cotisations, vos seuils et le cumul avec l'ARE, sans compte. Estimation indicative, ne constitue pas un conseil fiscal.",
  label: "Ouvrir le simulateur",
  href: "/simulateur-micro-entrepreneur",
};

/**
 * Guides publiés. Les guides fiscaux et sociaux citent les fiches officielles et lisent leurs chiffres dans tax.ts.
 */
export const GUIDES: Guide[] = [
  {
    slug: "annonces-efficaces",
    title: "Annonce de services efficace : trouver des clients près de chez vous",
    description:
      "Pour votre complément de salaire : titre, contenu, tarif, photos, réactivité, les points qui rendent une annonce de services claire et crédible sur LeBonCoin, AlloVoisins ou GensDeConfiance.",
    published: "2026-10-15",
    updated: "2026-10-15",
    Content: AnnoncesEfficaces,
    cta: {
      title: "Rédigez votre annonce",
      text: "Créez un compte gratuit pour générer une annonce adaptée à votre service et à votre ville.",
      label: "Générer mon annonce",
      href: "/login?next=/dashboard/listings",
    },
  },
  {
    slug: "cumul-chomage-micro-entreprise",
    title: "Complément de salaire et chômage : cumuler ARE et micro-entreprise (ARE ou Arce)",
    description:
      "Pour un complément de salaire pendant le chômage : comment l'ARE est réduite quand vous créez une micro-entreprise, abattements, plafond de 60 % des droits et alternative Arce.",
    published: "2026-10-15",
    updated: "2026-10-15",
    Content: CumulChomageMicroEntreprise,
  },
  {
    slug: "franchise-tva-micro-entrepreneur",
    title: "Franchise de TVA et complément de salaire : seuils 2026 et mention obligatoire",
    description:
      "Seuils de la franchise en base de TVA en 2026, mention 293 B, dépassement et prorata la première année.",
    published: "2026-10-15",
    updated: "2026-10-15",
    Content: FranchiseTva,
  },
  {
    slug: "plafonds-micro-entreprise-2026",
    title: "Plafonds et taux micro-entrepreneur 2026 : jusqu'où aller en complément de salaire",
    description:
      "Plafonds de chiffre d'affaires et taux de cotisations du régime micro-social en 2026, selon l'activité.",
    published: "2026-10-15",
    updated: "2026-10-15",
    Content: PlafondsMicro2026,
  },
  {
    slug: "premier-devis-micro-entrepreneur",
    title: "Premier devis d'une activité complémentaire : obligations et mentions",
    description:
      "Quand le devis est obligatoire, mentions à faire figurer, acompte ou arrhes, sanctions.",
    published: "2026-10-15",
    updated: "2026-10-15",
    Content: PremierDevis,
  },
  {
    slug: "micro-entreprise-retraite",
    title: "Retraite : un complément de revenu en micro-entreprise, conditions et cumul",
    description:
      "Conditions pour cumuler pension de retraite et micro-entreprise, plafonds, démarches auprès de la caisse de retraite.",
    published: "2026-10-15",
    updated: "2026-10-15",
    Content: MicroEntrepriseRetraite,
  },
];

export const findGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
export const guidePath = (g: Guide) => `/guides/${g.slug}`;
