/**
 * Utilitaires Unsplash purs (types, URL, ratios, crédits), sans donnée JSON : importables côté client sans alourdir le bundle.
 * Les photos des villes sont dans `city-images.ts`.
 */
/** Photo Unsplash sélectionnée par `scripts/fetch-unsplash-images.py` (aucun appel API à l'exécution). */
export interface UnsplashPhoto {
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

/** Paramètres de suivi exigés par les directives de l'API Unsplash sur les liens de crédit. */
const UTM = "utm_source=compleo&utm_medium=referral";

/** Les images restent servies par le CDN d'Unsplash (hotlink exigé), redimensionnées par ses paramètres. */
export function unsplashSrc(photo: Pick<UnsplashPhoto, "raw">, width: number, quality = 65, height?: number): string {
  const sep = photo.raw.includes("?") ? "&" : "?";
  return `${photo.raw}${sep}w=${width}${height ? `&h=${height}` : ""}&q=${quality}&fm=webp&fit=crop&auto=format`;
}

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
export const photoSrcSet = (photo: Pick<UnsplashPhoto, "raw">, ratio: number, widths: readonly number[] = PHOTO_WIDTHS) =>
  widths.map((w) => `${unsplashSrc(photo, w, 60, Math.round(w / ratio))} ${w}w`).join(", ");

/** `srcSet` du bandeau (compatibilité). */
export const bannerSrcSet = (photo: Pick<UnsplashPhoto, "raw">) => photoSrcSet(photo, BANNER_RATIO, BANNER_WIDTHS);

export const withUtm = (url: string) => `${url}${url.includes("?") ? "&" : "?"}${UTM}`;

export const UNSPLASH_URL = withUtm("https://unsplash.com");
