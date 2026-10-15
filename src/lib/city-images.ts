import raw from "@/data/city-images.json";
import type { City } from "@/lib/cities";
import type { UnsplashPhoto } from "@/lib/unsplash";

// Les utilitaires (types, URL, ratios, crédits) vivent dans `unsplash.ts` et restent réexportés ici.
export * from "@/lib/unsplash";

/** Photo d'une ville (même forme que toute photo Unsplash sélectionnée). */
export type CityPhoto = UnsplashPhoto;

/** Photos Unsplash des villes, sélectionnées par `scripts/fetch-unsplash-images.py` (aucun appel API à l'exécution). */
const PHOTOS = (raw as { photos: Record<string, UnsplashPhoto> }).photos;

export const cityPhoto = (city: City): UnsplashPhoto | undefined => PHOTOS[city.slug];

/** Photos de villes déclarées, avec leur clé (slug). */
export const cityPhotoEntries = (): [string, UnsplashPhoto][] => Object.entries(PHOTOS);
