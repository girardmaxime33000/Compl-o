import raw from "@/data/city-images.json";
import type { City } from "@/lib/cities";

/** Photos Unsplash des villes, sélectionnées par `scripts/fetch-city-images.py` (aucun appel API à l'exécution). */
export interface CityPhoto {
  id: string;
  /** URL de base images.unsplash.com (sans paramètres de taille). */
  raw: string;
  width: number;
  height: number;
  author: string;
  authorUrl: string;
  pageUrl: string;
  alt: string;
}

const PHOTOS = (raw as { photos: Record<string, CityPhoto> }).photos;

/** Paramètres de suivi exigés par les directives de l'API Unsplash sur les liens de crédit. */
const UTM = "utm_source=compleo&utm_medium=referral";

export const cityPhoto = (city: City): CityPhoto | undefined => PHOTOS[city.slug];

/** Les images restent servies par le CDN d'Unsplash (hotlink exigé), redimensionnées par ses paramètres. */
export function unsplashSrc(photo: Pick<CityPhoto, "raw">, width: number, quality = 70): string {
  const sep = photo.raw.includes("?") ? "&" : "?";
  return `${photo.raw}${sep}w=${width}&q=${quality}&fm=webp&fit=crop&auto=format`;
}

export const withUtm = (url: string) => `${url}${url.includes("?") ? "&" : "?"}${UTM}`;

export const UNSPLASH_URL = withUtm("https://unsplash.com");
