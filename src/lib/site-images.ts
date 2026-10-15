import raw from "@/data/site-images.json";
import type { UnsplashPhoto } from "@/lib/city-images";

/**
 * Clés des photos Unsplash hors villes : `hero:home`, `cta:final`, `login`, `activity:<id du catalogue>`,
 * `urban:<slug de l'activité urbaine>`, `guide:<slug du guide>`.
 * Le fichier JSON est généré par le script de sélection (lot V1) ou renseigné à la main au même format.
 */
export type SitePhotoKey = "hero:home" | "cta:final" | "login" | `activity:${string}` | `urban:${string}` | `guide:${string}`;

const PHOTOS = (raw as { photos: Record<string, UnsplashPhoto> }).photos;

/** Photo sélectionnée pour un emplacement, ou `undefined` tant qu'aucune n'a été choisie (le composant utilise alors son repli). */
export const sitePhoto = (key: SitePhotoKey): UnsplashPhoto | undefined => PHOTOS[key];

export const activityPhoto = (activityId: string) => sitePhoto(`activity:${activityId}`);
export const guidePhoto = (slug: string) => sitePhoto(`guide:${slug}`);
export const urbanPhoto = (slug: string) => sitePhoto(`urban:${slug}`);

/** Toutes les photos déclarées (pour la page de crédits). */
export const sitePhotoEntries = (): [string, UnsplashPhoto][] => Object.entries(PHOTOS);
