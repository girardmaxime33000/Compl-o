import { bannerSrcSet, BANNER_RATIO, BANNER_WIDTHS, cityPhoto, unsplashSrc, UNSPLASH_URL, withUtm } from "@/lib/city-images";
import type { City } from "@/lib/cities";
import { cn } from "@/lib/utils";

const FULL = 1280;

/** Photo Unsplash d'une ville avec crédit. Retourne null quand aucune photo n'a été sélectionnée. */
export function CityPhoto({ city, priority = false, className }: { city: City; priority?: boolean; className?: string }) {
  const photo = cityPhoto(city);
  if (!photo) return null;
  return (
    <figure className={cn("overflow-hidden rounded-2xl border bg-muted", className)}>
      {priority && <link rel="preconnect" href="https://images.unsplash.com" />}
      {/* <img> et non next/image : l'image reste servie, recadrée et redimensionnée par le CDN d'Unsplash (hotlink exigé par l'API). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={unsplashSrc(photo, FULL, 60, Math.round(FULL / BANNER_RATIO))}
        srcSet={bannerSrcSet(photo)}
        sizes="(min-width: 896px) 864px, 100vw"
        alt={`Vue de ${city.name}`}
        width={FULL}
        height={Math.round(FULL / BANNER_RATIO)}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="aspect-[2.5/1] w-full object-cover"
      />
      <figcaption className="px-3 py-1.5 text-xs text-muted-foreground">
        Photo :{" "}
        <a href={withUtm(photo.authorUrl)} className="underline" rel="noopener noreferrer">{photo.author}</a> sur{" "}
        <a href={UNSPLASH_URL} className="underline" rel="noopener noreferrer">Unsplash</a>
      </figcaption>
    </figure>
  );
}
