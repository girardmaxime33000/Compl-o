import raw from "@/data/site-images.json";
import type { UnsplashPhoto } from "@/lib/city-images";

/** Clés des photos Unsplash hors villes. Le fichier JSON est généré par le script de sélection (lot V1). */
export type SitePhotoKey = "hero:home";

const PHOTOS = (raw as { photos: Partial<Record<SitePhotoKey, UnsplashPhoto>> }).photos;

/** Photo sélectionnée pour un emplacement, ou `undefined` tant qu'aucune n'a été choisie (le composant utilise alors son repli). */
export const sitePhoto = (key: SitePhotoKey): UnsplashPhoto | undefined => PHOTOS[key];
