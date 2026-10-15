import type { Metadata } from "next";
import { LEGAL } from "@/lib/legal";
import { ACTIVITIES, activitySlug } from "@/lib/activities";
import { activitiesForCity, CITIES, CITY_ACTIVITY_PAIRS, CITY_DATA, cityActivityPath, cityPath } from "@/lib/cities";
import { GUIDES, guidePath } from "@/lib/guides";

/** Pages publiques (fil d'Ariane). `indexable: false` : `noindex, follow` et absente du sitemap (pages légales). */
export const PUBLIC_PAGES = [
  { path: "/", name: "Accueil" },
  { path: "/simulateur-micro-entrepreneur", name: "Simulateur micro-entrepreneur" },
  { path: "/modele-facture-auto-entrepreneur", name: "Modèle de facture auto-entrepreneur" },
  { path: "/generateur-annonce", name: "Exemples d'annonces" },
  { path: "/activites", name: "Activités" },
  { path: "/guides", name: "Guides" },
  { path: "/pricing", name: "Tarifs" },
  { path: "/mentions-legales", name: "Mentions légales", indexable: false },
  { path: "/cgu", name: "CGU", indexable: false },
  { path: "/cgv", name: "CGV", indexable: false },
  { path: "/confidentialite", name: "Confidentialité", indexable: false },
] as const;

export interface SitemapEntry {
  path: string;
  /** Date ISO (AAAA-MM-JJ) de dernière modification réelle du contenu ou des données. */
  lastModified: string;
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Date de build : évaluée au build, pour les pages dont le contenu est dans le code. */
export const BUILD_DATE = isoDay(new Date());

/** Date de dernière modification du guide le plus récent. */
const latestGuideUpdate = () => GUIDES.map((g) => g.updated).sort().at(-1) ?? BUILD_DATE;

/**
 * Entrées du sitemap, chacune avec un `lastModified` réel :
 * - pages ville et hubs ville : date de téléchargement des données France Travail / INSEE ;
 * - guides : date de mise à jour du contenu ;
 * - pages statiques : date de build.
 */
export function sitemapEntries(): SitemapEntry[] {
  const dataDate = CITY_DATA.downloadedOn;
  return [
    ...PUBLIC_PAGES.filter((p) => !("indexable" in p && p.indexable === false)).map((p) => ({
      path: p.path,
      lastModified: p.path === "/guides" ? latestGuideUpdate() : BUILD_DATE,
    })),
    ...ACTIVITIES.map((a) => ({ path: `/activites/${activitySlug(a)}`, lastModified: BUILD_DATE })),
    ...GUIDES.map((g) => ({ path: guidePath(g), lastModified: g.updated })),
    ...CITIES.filter((c) => activitiesForCity(c).length > 0).map((c) => ({ path: cityPath(c), lastModified: dataDate })),
    ...CITY_ACTIVITY_PAIRS.map(({ city, activity }) => ({ path: cityActivityPath(city, activity), lastModified: dataDate })),
  ];
}

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

/** Pages privées : jamais de `Disallow` pour désindexer une page déjà crawlée, mais `noindex` (liens suivis). */
export const NOINDEX: Metadata = { robots: { index: false, follow: true } };

/** Métadonnées des pages légales : titre et description, `noindex, follow`, hors sitemap. */
export function legalMetadata(args: { title: string; description: string; path: string }): Metadata {
  return { ...pageMetadata(args), ...NOINDEX };
}

/** Bots d'IA de recherche et d'entraînement explicitement déclarés dans robots.txt. */
export const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"] as const;

/** Chemins privés ou techniques, interdits à tous les robots. */
export const DISALLOWED_PATHS = ["/dashboard", "/login", "/auth", "/onboarding", "/api"];
