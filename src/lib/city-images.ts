import raw from "@/data/city-images.json";
import type { City } from "@/lib/cities";

/** Photos Unsplash des villes, sélectionnées par `scripts/fetch-unsplash-images.py` (aucun appel API à l'exécution). */
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
  /** Couleur moyenne de l'image (fournie par l'API), utilisée comme fond avant chargement. Absente des anciennes entrées. */
  color?: string;
}

const PHOTOS = (raw as { photos: Record<string, CityPhoto> }).photos;

/** Paramètres de suivi exigés par les directives de l'API Unsplash sur les liens de crédit. */
const UTM = "utm_source=compleo&utm_medium=referral";

export const cityPhoto = (city: City): CityPhoto | undefined => PHOTOS[city.slug];

/** Les images restent servies par le CDN d'Unsplash (hotlink exigé), redimensionnées par ses paramètres. */
export function unsplashSrc(photo: Pick<CityPhoto, "raw">, width: number, quality = 65, height?: number): string {
  const sep = photo.raw.includes("?") ? "&" : "?";
  return `${photo.raw}${sep}w=${width}${height ? `&h=${height}` : ""}&q=${quality}&fm=webp&fit=crop&auto=format`;
}

/** Alias : le type décrit n'importe quelle photo Unsplash sélectionnée, pas seulement une ville. */
export type UnsplashPhoto = CityPhoto;

/** Formats de recadrage (largeur / hauteur). L'image est recadrée côté CDN à ce format (poids bien plus faible). */
export const PHOTO_RATIOS = {
  /** Bandeau de page (ville, activité). */
  banner: 2.5,
  /** Hero de l'accueil. */
  hero: 4 / 3,
  /** Carte. */
  card: 3 / 2,
  /** Tuile carrée. */
  tile: 1,
  /** Couverture de guide, vidéo. */
  wide: 16 / 9,
  /** Colonne latérale verticale. */
  portrait: 4 / 5,
} as const;
export type PhotoRatio = keyof typeof PHOTO_RATIOS;

export const BANNER_RATIO = PHOTO_RATIOS.banner;
export const BANNER_WIDTHS = [480, 720, 960, 1280] as const;
export const PHOTO_WIDTHS = [320, 480, 720, 960, 1280] as const;

/** `srcSet` : une taille par largeur d'écran, recadrée au format demandé. */
export const photoSrcSet = (photo: Pick<CityPhoto, "raw">, ratio: number, widths: readonly number[] = PHOTO_WIDTHS) =>
  widths.map((w) => `${unsplashSrc(photo, w, 60, Math.round(w / ratio))} ${w}w`).join(", ");

/** `srcSet` du bandeau (compatibilité). */
export const bannerSrcSet = (photo: Pick<CityPhoto, "raw">) => photoSrcSet(photo, BANNER_RATIO, BANNER_WIDTHS);

/** Photos de villes déclarées, avec leur clé (slug). */
export const cityPhotoEntries = (): [string, CityPhoto][] => Object.entries(PHOTOS);

export const withUtm = (url: string) => `${url}${url.includes("?") ? "&" : "?"}${UTM}`;

export const UNSPLASH_URL = withUtm("https://unsplash.com");
