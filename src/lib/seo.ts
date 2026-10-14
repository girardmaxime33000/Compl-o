import type { Metadata } from "next";
import { LEGAL } from "@/lib/legal";

/** Prix Premium affiché dans le JSON-LD : à garder aligné avec la page /pricing et Stripe. */
export const PREMIUM_PRICE_EUR = "6.99";

/** Pages publiques indexables (sitemap + fil d'Ariane). */
export const PUBLIC_PAGES = [
  { path: "/", name: "Accueil", priority: 1 },
  { path: "/simulateur-micro-entrepreneur", name: "Simulateur micro-entrepreneur", priority: 0.9 },
  { path: "/modele-facture-auto-entrepreneur", name: "Modèle de facture auto-entrepreneur", priority: 0.8 },
  { path: "/generateur-annonce", name: "Exemples d'annonces", priority: 0.8 },
  { path: "/pricing", name: "Tarifs", priority: 0.7 },
  { path: "/mentions-legales", name: "Mentions légales", priority: 0.2 },
  { path: "/cgu", name: "CGU", priority: 0.2 },
  { path: "/cgv", name: "CGV", priority: 0.2 },
  { path: "/confidentialite", name: "Confidentialité", priority: 0.2 },
] as const;

export const absoluteUrl = (path: string) => `${LEGAL.siteUrl.replace(/\/$/, "")}${path === "/" ? "" : path}`;

/** Titre « Promesse | Compléo », description et canonical uniques par page. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const full = `${title} | ${LEGAL.siteName}`;
  return {
    title: full,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, type: "website", locale: "fr_FR", siteName: LEGAL.siteName },
  };
}

export const NOINDEX: Metadata = { robots: { index: false, follow: false } };
